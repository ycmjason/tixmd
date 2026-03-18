import { stringify } from '@std/yaml';
import type { ProjectConfig } from './schemas.ts';

export function generateProjectMarkdown({
  title,
  body,
  config,
}: {
  title: string;
  body: string;
  config: ProjectConfig;
}): string {
  const yaml = stringify(config, { flowLevel: 1 }).trim();
  return `---\n${yaml}\n---\n\n# ${title}\n\n${body}\n`;
}
