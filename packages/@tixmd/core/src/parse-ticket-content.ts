import { test as hasFrontMatter } from '@std/front-matter';
import { extract } from '@std/front-matter/yaml';
import { type Criterion, type TicketFrontmatter, ticketFrontmatterSchema } from './schemas.ts';

export type ParsedTicketContent = {
  frontmatter: TicketFrontmatter;
  body: string;
  title: string;
  criteria: Criterion[];
};

export function parseCriteria(body: string): Criterion[] {
  return [...body.matchAll(/^[ \t]*- \[([ xX])\] (.+)$/gm)].map(match => ({
    checked: match[1] !== ' ',
    text: match[2]?.trim() ?? '',
  }));
}

export function parseTitle(body: string): string {
  const match = /^# (.+)$/m.exec(body);
  if (!match) {
    throw new Error('Ticket must have an H1 title');
  }
  return match[1]?.trim() ?? '';
}

function normalizeFrontmatterDates(attrs: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(attrs)) {
    normalized[key] = value instanceof Date ? value.toISOString().replace(/\.000Z$/, 'Z') : value;
  }
  return normalized;
}

export function parseTicketContent(content: string): ParsedTicketContent {
  let body: string;
  let frontmatter: TicketFrontmatter;

  if (hasFrontMatter(content)) {
    const extracted = extract(content);
    body = extracted.body;
    const normalized = normalizeFrontmatterDates(extracted.attrs as Record<string, unknown>);
    frontmatter = ticketFrontmatterSchema.parse(normalized);
  } else {
    body = content;
    frontmatter = ticketFrontmatterSchema.parse({});
  }

  return {
    frontmatter,
    body,
    title: parseTitle(body),
    criteria: parseCriteria(body),
  };
}
