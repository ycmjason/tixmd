import { startServer } from '@tixmd/web/server';
import { findTixmdDir } from '../find-tixmd-dir.ts';

export async function serveCommand({ port }: { port: number }): Promise<void> {
  const tixmdDir = await findTixmdDir(process.cwd());
  startServer({ tixmdDir, port });
}
