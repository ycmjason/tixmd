import { describe, expect, test } from 'vitest';
import { parseProjectConfig } from './parse-config.ts';

describe('parseProjectConfig', () => {
  test('parses config from frontmatter', () => {
    const content = `---
done_retention_days: 14
---

# My Project`;

    expect(parseProjectConfig(content)).toEqual({ done_retention_days: 14 });
  });

  test('returns defaults when no frontmatter', () => {
    expect(parseProjectConfig('# My Project')).toEqual({ done_retention_days: 7 });
  });

  test('returns defaults for empty frontmatter', () => {
    const content = `---
---

# My Project`;

    expect(parseProjectConfig(content)).toEqual({ done_retention_days: 7 });
  });
});
