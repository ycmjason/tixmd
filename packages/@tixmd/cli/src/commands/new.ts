import { access, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { deriveTicketId, generateTicketMarkdown } from '@tixmd/core';
import { findTixmdDir } from '../find-tixmd-dir.ts';

export async function newCommand({
  title,
  body,
  labels,
  dependencies,
}: {
  title: string;
  body: string;
  labels: string[];
  dependencies: string[];
}): Promise<void> {
  const tixmdDir = await findTixmdDir(process.cwd());
  const id = deriveTicketId(title);
  const filePath = join(tixmdDir, 'tixs', `${id}.md`);

  try {
    await access(filePath);
    console.error(`Ticket "${id}" already exists at ${filePath}`);
    process.exitCode = 1;
    return;
  } catch {
    // File doesn't exist — good, proceed
  }

  const created = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const markdown = generateTicketMarkdown({ title, body, labels, dependencies, created });

  await writeFile(filePath, markdown, 'utf-8');
  console.log(`Created ticket: ${id}`);
}
