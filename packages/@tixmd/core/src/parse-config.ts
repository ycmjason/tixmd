import { test as hasFrontMatter } from '@std/front-matter';
import { extract } from '@std/front-matter/yaml';
import { type ProjectConfig, projectConfigSchema } from './schemas.ts';

export function parseProjectConfig(content: string): ProjectConfig {
  if (!hasFrontMatter(content)) {
    return projectConfigSchema.parse({});
  }
  const { attrs } = extract(content);
  return projectConfigSchema.parse(attrs);
}
