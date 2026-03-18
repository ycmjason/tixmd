import { describe, expect, test } from 'vitest';
import { generateTicketMarkdown } from './generate-ticket-markdown.ts';
import { parseTicketContent } from './parse-ticket-content.ts';

describe('generateTicketMarkdown', () => {
  test('generates full ticket with all fields', () => {
    const md = generateTicketMarkdown({
      title: 'Fix login bug',
      body: 'Users cannot log in.\n\n## Acceptance criteria\n\n- [ ] Login works\n- [ ] Tests pass',
      labels: ['auth', 'ux'],
      dependencies: ['setup-auth'],
      created: '2026-03-18T00:00:00Z',
    });

    const parsed = parseTicketContent(md);
    expect(parsed.title).toBe('Fix login bug');
    expect(parsed.frontmatter.labels).toEqual(['auth', 'ux']);
    expect(parsed.frontmatter.dependencies).toEqual(['setup-auth']);
    expect(parsed.frontmatter.created).toBe('2026-03-18T00:00:00Z');
    expect(parsed.criteria).toHaveLength(2);
  });

  test('omits empty labels and dependencies from frontmatter', () => {
    const md = generateTicketMarkdown({
      title: 'Spike: explore options',
      body: 'What approach should we take?',
      labels: [],
      dependencies: [],
      created: '2026-03-18T00:00:00Z',
    });

    expect(md).not.toContain('labels');
    expect(md).not.toContain('dependencies');
  });

  test('spike ticket with no criteria', () => {
    const md = generateTicketMarkdown({
      title: 'Spike: explore auth',
      body: 'What auth provider should we use?',
      labels: ['auth'],
      dependencies: [],
      created: '2026-03-18T00:00:00Z',
    });

    const parsed = parseTicketContent(md);
    expect(parsed.criteria).toHaveLength(0);
    expect(parsed.frontmatter.labels).toEqual(['auth']);
  });

  test('roundtrips through parseTicketContent', () => {
    const md = generateTicketMarkdown({
      title: 'Add user profiles',
      body: 'Allow users to edit their profiles.\n\n## Acceptance criteria\n\n- [ ] Profile page exists\n- [ ] User can update name',
      labels: ['feature'],
      dependencies: ['setup-db'],
      created: '2026-03-18T12:00:00Z',
    });

    const parsed = parseTicketContent(md);
    expect(parsed.title).toBe('Add user profiles');
    expect(parsed.frontmatter.labels).toEqual(['feature']);
    expect(parsed.frontmatter.dependencies).toEqual(['setup-db']);
    expect(parsed.criteria).toEqual([
      { checked: false, text: 'Profile page exists' },
      { checked: false, text: 'User can update name' },
    ]);
  });
});
