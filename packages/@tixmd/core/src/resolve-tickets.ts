import type { ParsedTicketContent } from './parse-ticket-content.ts';
import type { Progress, Ticket, TicketStatus } from './schemas.ts';

export type RawTicket = {
  id: string;
  parsed: ParsedTicketContent;
  updated: Date | undefined;
};

function deriveProgress(parsed: ParsedTicketContent): Progress {
  const total = parsed.criteria.length;
  const checked = parsed.criteria.filter(c => c.checked).length;
  return { checked, total };
}

function deriveStatus({
  progress,
  dependenciesAllDone,
}: {
  progress: Progress;
  dependenciesAllDone: boolean;
}): TicketStatus {
  if (progress.total === 0) return 'spike';
  if (!dependenciesAllDone) return 'blocked';
  if (progress.checked === 0) return 'ready';
  if (progress.checked === progress.total) return 'done';
  return 'doing';
}

function computeBlocks(allTickets: RawTicket[]): Map<string, string[]> {
  const blocks = new Map<string, string[]>();
  for (const ticket of allTickets) {
    for (const dep of ticket.parsed.frontmatter.dependencies) {
      const existing = blocks.get(dep) ?? [];
      existing.push(ticket.id);
      blocks.set(dep, existing);
    }
  }
  return blocks;
}

export type ResolvedBoard = {
  tickets: Ticket[];
  warnings: string[];
};

export function resolveTickets(rawTickets: RawTicket[]): ResolvedBoard {
  const blocksMap = computeBlocks(rawTickets);
  const allIds = new Set(rawTickets.map(raw => raw.id));

  // Eagerly compute progress for all tickets, keyed by id
  const progressByTicket = Object.fromEntries(
    rawTickets.map(raw => [raw.id, deriveProgress(raw.parsed)] as const),
  );

  // Determine which tickets are done
  const doneSet = new Set(
    rawTickets
      .filter(raw => {
        const p = progressByTicket[raw.id];
        return p && p.total > 0 && p.checked === p.total;
      })
      .map(raw => raw.id),
  );

  const warnings: string[] = [];

  const tickets = rawTickets.map(raw => {
    for (const dep of raw.parsed.frontmatter.dependencies) {
      if (!allIds.has(dep)) {
        warnings.push(`Ticket "${raw.id}" depends on "${dep}", which does not exist.`);
      }
    }

    const progress = progressByTicket[raw.id] ?? { checked: 0, total: 0 };
    const dependenciesAllDone = raw.parsed.frontmatter.dependencies.every(dep => doneSet.has(dep));

    return {
      id: raw.id,
      title: raw.parsed.title,
      status: deriveStatus({ progress, dependenciesAllDone }),
      labels: raw.parsed.frontmatter.labels,
      dependencies: raw.parsed.frontmatter.dependencies,
      created: raw.parsed.frontmatter.created,
      updated: raw.updated,
      progress,
      criteria: raw.parsed.criteria,
      blocks: blocksMap.get(raw.id) ?? [],
      body: raw.parsed.body,
    };
  });

  return { tickets, warnings };
}
