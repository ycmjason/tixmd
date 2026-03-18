import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { scaffoldProject } from '@tixmd/core';

export async function initCommand({ title, body }: { title: string; body: string }): Promise<void> {
  const tixmdDir = join(process.cwd(), '.tixmd');

  try {
    await access(tixmdDir);
    console.error('.tixmd/ directory already exists');
    process.exitCode = 1;
    return;
  } catch {
    // Directory doesn't exist — good, proceed
  }

  await scaffoldProject({
    dir: process.cwd(),
    title,
    body,
    config: { done_retention_days: 7 },
  });

  console.log('Initialized tixmd project at .tixmd/');
}
