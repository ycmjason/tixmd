import { stringify } from '@std/yaml';

export function generateTicketMarkdown({
  title,
  body,
  labels,
  dependencies,
  created,
}: {
  title: string;
  body: string;
  labels: string[];
  dependencies: string[];
  created: string;
}): string {
  const frontmatter: Record<string, unknown> = {};

  if (labels.length > 0) frontmatter.labels = labels;
  if (dependencies.length > 0) frontmatter.dependencies = dependencies;
  frontmatter.created = created;

  const yaml = stringify(frontmatter, { flowLevel: 1 }).trim();

  return `---\n${yaml}\n---\n\n# ${title}\n\n${body}\n`;
}
