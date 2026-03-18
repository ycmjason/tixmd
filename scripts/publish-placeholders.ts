#!/usr/bin/env node

/**
 * Generates and publishes placeholder npm packages to prevent name squatting.
 * Each package just prints a message telling users to install @tixmd/cli.
 *
 * Usage: node scripts/publish-placeholders.ts [--dry-run]
 */

import { execSync } from 'node:child_process';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

const PLACEHOLDER_NAMES = ['tixmd', 'tixed', 'tikmd'];
const ROOT_NPMRC = join(import.meta.dirname, '..', '.npmrc');

const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: false },
  },
});

const dryRun = values['dry-run'];

for (const name of PLACEHOLDER_NAMES) {
  const dir = join(tmpdir(), `tixmd-placeholder-${name}`);
  mkdirSync(dir, { recursive: true });

  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify(
      {
        name,
        version: '1.0.0',
        type: 'module',
        license: 'MIT',
        description: `Placeholder — install @tixmd/cli instead.`,
        repository: {
          type: 'git',
          url: 'git+https://github.com/ycmjason/tixmd.git',
        },
        bin: { [name]: './bin.js' },
      },
      null,
      2,
    ),
  );

  writeFileSync(
    join(dir, 'bin.js'),
    [
      '#!/usr/bin/env node',
      `console.log('This package is a placeholder. Install @tixmd/cli instead:');`,
      `console.log('  npm install -g @tixmd/cli');`,
      'process.exitCode = 1;',
      '',
    ].join('\n'),
  );

  copyFileSync(ROOT_NPMRC, join(dir, '.npmrc'));

  if (dryRun) {
    console.log(`[dry-run] Would publish ${name} from ${dir}`);
    continue;
  }

  try {
    execSync('npm publish --access public --auth-type=web', { cwd: dir, stdio: 'inherit' });
    console.log(`Published ${name}`);
  } catch {
    console.log(`Skipped ${name} (already published or error)`);
  }
}
