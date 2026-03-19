import { describe, expect, test } from 'vitest';
import { parseCriteria, parseTicketContent, parseTitle } from './parse-ticket-content.ts';

describe('parseTitle', () => {
  test('extracts H1 from body', () => {
    expect(parseTitle('# My Title\n\nSome body')).toBe('My Title');
  });

  test('throws if no H1 found', () => {
    expect(() => parseTitle('No title here')).toThrow('Ticket must have an H1 title');
  });

  test('extracts first H1 only', () => {
    expect(parseTitle('# First\n# Second')).toBe('First');
  });
});

describe('parseCriteria', () => {
  test('extracts unchecked criteria', () => {
    expect(parseCriteria('- [ ] Do something')).toEqual([{ checked: false, text: 'Do something' }]);
  });

  test('extracts checked criteria', () => {
    expect(parseCriteria('- [x] Done thing')).toEqual([{ checked: true, text: 'Done thing' }]);
  });

  test('handles uppercase X', () => {
    expect(parseCriteria('- [X] Done thing')).toEqual([{ checked: true, text: 'Done thing' }]);
  });

  test('extracts mixed criteria', () => {
    const body = `## Acceptance criteria

- [x] First thing
- [ ] Second thing
- [x] Third thing`;

    expect(parseCriteria(body)).toEqual([
      { checked: true, text: 'First thing' },
      { checked: false, text: 'Second thing' },
      { checked: true, text: 'Third thing' },
    ]);
  });

  test('returns empty array when no criteria', () => {
    expect(parseCriteria('Just some text\nNo criteria here')).toEqual([]);
  });
});

describe('parseTicketContent', () => {
  test('parses ticket with frontmatter', () => {
    const content = `---
labels: [auth, ux]
dependencies: [setup-auth]
created: 2026-03-15T14:30:00Z
---

# Fix login redirect bug

Some description.

## Acceptance criteria

- [ ] First criterion
- [x] Second criterion`;

    const result = parseTicketContent(content);

    expect(result.frontmatter).toEqual({
      labels: ['auth', 'ux'],
      dependencies: ['setup-auth'],
      created: '2026-03-15T14:30:00Z',
      groomed_tickets: [],
    });
    expect(result.title).toBe('Fix login redirect bug');
    expect(result.criteria).toEqual([
      { checked: false, text: 'First criterion' },
      { checked: true, text: 'Second criterion' },
    ]);
  });

  test('parses spike ticket without frontmatter', () => {
    const content = `# Explore authentication options

What auth provider should we use?

## Questions to answer

- OAuth vs magic link?`;

    const result = parseTicketContent(content);

    expect(result.frontmatter).toEqual({
      labels: [],
      dependencies: [],
      groomed_tickets: [],
    });
    expect(result.title).toBe('Explore authentication options');
    expect(result.criteria).toEqual([]);
  });

  test('parses ticket with empty frontmatter', () => {
    const content = `---
---

# Minimal ticket

## Acceptance criteria

- [ ] Only criterion`;

    const result = parseTicketContent(content);

    expect(result.frontmatter).toEqual({
      labels: [],
      dependencies: [],
      groomed_tickets: [],
    });
    expect(result.title).toBe('Minimal ticket');
    expect(result.criteria).toEqual([{ checked: false, text: 'Only criterion' }]);
  });
});
