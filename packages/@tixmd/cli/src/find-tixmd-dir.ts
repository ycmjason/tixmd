import { access } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export async function findTixmdDir(startFrom: string): Promise<string> {
  let current = startFrom;

  while (true) {
    const candidate = join(current, '.tixmd');
    try {
      await access(candidate);
      return candidate;
    } catch {
      const parent = dirname(current);
      if (parent === current) {
        throw new Error('Could not find .tixmd/ directory. Are you inside a tixmd project?');
      }
      current = parent;
    }
  }
}
