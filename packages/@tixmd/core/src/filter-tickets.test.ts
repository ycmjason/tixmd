import { describe, expect, test } from 'vitest';
import { filterTickets } from './filter-tickets.ts';
import type { Ticket } from './schemas.ts';

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 'test',
    title: 'Test',
    status: 'ready',
    labels: [],
    dependencies: [],
    created: undefined,
    updated: undefined,
    progress: { checked: 0, total: 1 },
    criteria: [{ checked: false, text: 'Do it' }],
    blocks: [],
    body: '',
    ...overrides,
  };
}

describe('filterTickets', () => {
  test('returns all tickets when no filters', () => {
    const tickets = [makeTicket({ id: 'a' }), makeTicket({ id: 'b' })];
    expect(filterTickets({ tickets })).toHaveLength(2);
  });

  test('filters by status', () => {
    const tickets = [
      makeTicket({ id: 'a', status: 'ready' }),
      makeTicket({ id: 'b', status: 'doing' }),
      makeTicket({ id: 'c', status: 'ready' }),
    ];
    expect(filterTickets({ tickets, status: 'ready' }).map(t => t.id)).toEqual(['a', 'c']);
  });

  test('filters by labels (OR logic)', () => {
    const tickets = [
      makeTicket({ id: 'a', labels: ['auth'] }),
      makeTicket({ id: 'b', labels: ['ux'] }),
      makeTicket({ id: 'c', labels: ['auth', 'ux'] }),
    ];
    expect(filterTickets({ tickets, labels: ['ux'] }).map(t => t.id)).toEqual(['b', 'c']);
  });

  test('filters done tickets by retention', () => {
    const now = new Date('2026-03-17T00:00:00Z');
    const recentDone = makeTicket({
      id: 'recent',
      status: 'done',
      updated: new Date('2026-03-15T00:00:00Z'),
    });
    const oldDone = makeTicket({
      id: 'old',
      status: 'done',
      updated: new Date('2026-03-01T00:00:00Z'),
    });
    const readyTicket = makeTicket({ id: 'ready', status: 'ready' });

    const result = filterTickets({
      tickets: [recentDone, oldDone, readyTicket],
      doneRetentionDays: 7,
      now,
    });
    expect(result.map(t => t.id)).toEqual(['recent', 'ready']);
  });

  test('combines filters with AND logic', () => {
    const tickets = [
      makeTicket({ id: 'a', status: 'ready', labels: ['auth'] }),
      makeTicket({ id: 'b', status: 'doing', labels: ['auth'] }),
      makeTicket({ id: 'c', status: 'ready', labels: ['ux'] }),
    ];
    expect(filterTickets({ tickets, status: 'ready', labels: ['auth'] }).map(t => t.id)).toEqual([
      'a',
    ]);
  });
});
