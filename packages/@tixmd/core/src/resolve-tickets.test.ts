import { describe, expect, test } from 'vitest';
import type { ParsedTicketContent } from './parse-ticket-content.ts';
import { type RawTicket, resolveTickets } from './resolve-tickets.ts';

function makeRaw(
  id: string,
  overrides: Partial<ParsedTicketContent> = {},
  updated?: Date,
): RawTicket {
  return {
    id,
    updated,
    parsed: {
      frontmatter: { labels: [], dependencies: [], ...overrides.frontmatter },
      body: overrides.body ?? '',
      title: overrides.title ?? id,
      criteria: overrides.criteria ?? [],
    },
  };
}

describe('resolveTickets', () => {
  test('spike: no criteria', () => {
    const tickets = resolveTickets([makeRaw('spike-auth')]);
    expect(tickets[0]?.status).toBe('spike');
  });

  test('ready: has criteria, nothing checked, no deps', () => {
    const tickets = resolveTickets([
      makeRaw('task-1', {
        criteria: [
          { checked: false, text: 'Do A' },
          { checked: false, text: 'Do B' },
        ],
      }),
    ]);
    expect(tickets[0]?.status).toBe('ready');
    expect(tickets[0]?.progress).toEqual({ checked: 0, total: 2 });
  });

  test('doing: some criteria checked', () => {
    const tickets = resolveTickets([
      makeRaw('task-1', {
        criteria: [
          { checked: true, text: 'Do A' },
          { checked: false, text: 'Do B' },
        ],
      }),
    ]);
    expect(tickets[0]?.status).toBe('doing');
    expect(tickets[0]?.progress).toEqual({ checked: 1, total: 2 });
  });

  test('done: all criteria checked', () => {
    const tickets = resolveTickets([
      makeRaw('task-1', {
        criteria: [
          { checked: true, text: 'Do A' },
          { checked: true, text: 'Do B' },
        ],
      }),
    ]);
    expect(tickets[0]?.status).toBe('done');
  });

  test('blocked: has criteria but depends on non-done ticket', () => {
    const tickets = resolveTickets([
      makeRaw('dep-1', {
        criteria: [{ checked: false, text: 'Not done yet' }],
      }),
      makeRaw('task-1', {
        frontmatter: { labels: [], dependencies: ['dep-1'] },
        criteria: [{ checked: false, text: 'Do A' }],
      }),
    ]);
    expect(tickets[1]?.status).toBe('blocked');
  });

  test('ready when dependency is done', () => {
    const tickets = resolveTickets([
      makeRaw('dep-1', {
        criteria: [{ checked: true, text: 'All done' }],
      }),
      makeRaw('task-1', {
        frontmatter: { labels: [], dependencies: ['dep-1'] },
        criteria: [{ checked: false, text: 'Do A' }],
      }),
    ]);
    expect(tickets[1]?.status).toBe('ready');
  });

  test('blocked when depending on missing ticket', () => {
    const tickets = resolveTickets([
      makeRaw('task-1', {
        frontmatter: { labels: [], dependencies: ['nonexistent'] },
        criteria: [{ checked: false, text: 'Do A' }],
      }),
    ]);
    expect(tickets[0]?.status).toBe('blocked');
  });

  test('computes blocks (inverse of dependencies)', () => {
    const tickets = resolveTickets([
      makeRaw('dep-1', {
        criteria: [{ checked: false, text: 'Something' }],
      }),
      makeRaw('task-a', {
        frontmatter: { labels: [], dependencies: ['dep-1'] },
        criteria: [{ checked: false, text: 'Do A' }],
      }),
      makeRaw('task-b', {
        frontmatter: { labels: [], dependencies: ['dep-1'] },
        criteria: [{ checked: false, text: 'Do B' }],
      }),
    ]);
    expect(tickets[0]?.blocks).toEqual(['task-a', 'task-b']);
    expect(tickets[1]?.blocks).toEqual([]);
  });

  test('preserves metadata fields', () => {
    const updated = new Date('2026-03-15T10:00:00Z');
    const tickets = resolveTickets([
      makeRaw(
        'task-1',
        {
          frontmatter: {
            labels: ['auth', 'ux'],
            dependencies: [],
            created: '2026-03-15T14:30:00Z',
          },
          title: 'Fix login bug',
          criteria: [{ checked: false, text: 'Do it' }],
          body: 'Some body',
        },
        updated,
      ),
    ]);
    expect(tickets[0]).toMatchObject({
      id: 'task-1',
      title: 'Fix login bug',
      labels: ['auth', 'ux'],
      created: '2026-03-15T14:30:00Z',
      updated,
      body: 'Some body',
    });
  });
});
