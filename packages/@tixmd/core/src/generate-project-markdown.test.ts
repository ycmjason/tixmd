import { describe, expect, test } from 'vitest';
import { generateProjectMarkdown } from './generate-project-markdown.ts';

describe('generateProjectMarkdown', () => {
  test('generates markdown with frontmatter, title, and body', () => {
    const result = generateProjectMarkdown({
      title: 'My Project',
      body: 'A cool project.',
      config: { done_retention_days: 7 },
    });

    expect(result).toBe('---\ndone_retention_days: 7\n---\n\n# My Project\n\nA cool project.\n');
  });

  test('includes custom config values', () => {
    const result = generateProjectMarkdown({
      title: 'Test',
      body: 'Description',
      config: { done_retention_days: 14 },
    });

    expect(result).toContain('done_retention_days: 14');
  });
});
