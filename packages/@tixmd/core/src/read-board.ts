import { execFile } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseProjectConfig } from './parse-config.ts';
import { parseTicketContent } from './parse-ticket-content.ts';
import { resolveTickets } from './resolve-tickets.ts';
import type { ProjectConfig, Ticket } from './schemas.ts';

export type Board = {
  config: ProjectConfig;
  tickets: Ticket[];
  warnings: string[];
};

function batchGitUpdatedDates({
  filePaths,
  cwd,
}: {
  filePaths: string[];
  cwd: string;
}): Promise<Map<string, Date>> {
  if (filePaths.length === 0) return Promise.resolve(new Map());

  return new Promise((resolve, reject) => {
    // Use git log with --format to get the last commit date for each file
    // We process all files in one git log call for efficiency
    const args = [
      'log',
      '--format=%H %aI',
      '--name-only',
      '--diff-filter=ACMR',
      '--',
      ...filePaths,
    ];

    execFile('git', args, { cwd, maxBuffer: 10 * 1024 * 1024 }, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }

      const dates = new Map<string, Date>();
      const lines = stdout.trim().split('\n');

      let currentDate: Date | undefined;
      for (const line of lines) {
        if (line === '') continue;

        // Lines matching commit format: "<hash> <ISO date>"
        const commitMatch = /^[0-9a-f]{40} (.+)$/.exec(line);
        if (commitMatch) {
          currentDate = new Date(commitMatch[1] ?? '');
          continue;
        }

        // File path line — only set if we haven't seen this file yet (first = most recent)
        if (currentDate && !dates.has(line)) {
          dates.set(line, currentDate);
        }
      }

      resolve(dates);
    });
  });
}

export async function readBoard({ tixmdDir }: { tixmdDir: string }): Promise<Board> {
  const tixsDir = join(tixmdDir, 'tixs');
  const projectPath = join(tixmdDir, 'project.md');

  // Read project config and ticket files in parallel
  const [projectContent, entries] = await Promise.all([
    readFile(projectPath, 'utf-8').catch(() => ''),
    readdir(tixsDir).catch(() => [] as string[]),
  ]);

  const config = parseProjectConfig(projectContent);

  const mdFiles = entries.filter(f => f.endsWith('.md'));

  // Read all ticket files in parallel
  const fileContents = await Promise.all(
    mdFiles.map(async filename => ({
      filename,
      content: await readFile(join(tixsDir, filename), 'utf-8'),
    })),
  );

  // Batch git log for updated dates
  const relativePaths = mdFiles.map(f => join('tixs', f));
  const gitDates = await batchGitUpdatedDates({ filePaths: relativePaths, cwd: tixmdDir });

  // Parse all tickets
  const rawTickets = fileContents.map(({ filename, content }) => ({
    id: filename.replace(/\.md$/, ''),
    parsed: parseTicketContent(content),
    updated: gitDates.get(join('tixs', filename)),
  }));

  const resolved = resolveTickets(rawTickets);

  return {
    config,
    tickets: resolved.tickets,
    warnings: resolved.warnings,
  };
}
