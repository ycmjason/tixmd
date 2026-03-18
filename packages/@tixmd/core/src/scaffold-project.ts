import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { generateProjectMarkdown } from './generate-project-markdown.ts';
import type { ProjectConfig } from './schemas.ts';

export async function scaffoldProject({
  dir,
  title,
  body,
  config,
}: {
  dir: string;
  title: string;
  body: string;
  config: ProjectConfig;
}): Promise<void> {
  const tixmdDir = join(dir, '.tixmd');
  await mkdir(join(tixmdDir, 'tixs'), { recursive: true });
  const markdown = generateProjectMarkdown({ title, body, config });
  await writeFile(join(tixmdDir, 'project.md'), markdown, 'utf-8');
}
