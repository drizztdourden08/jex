#!/usr/bin/env node
// PostToolUse lint hook — runs ESLint on the file Claude just wrote/edited and
// surfaces violations of the coding standards (see docs/contributing/coding-standards.md).
//
// Reads the hook payload from stdin (JSON with tool_input.file_path), lints only
// *.ts/*.tsx, and prints any findings. It is intentionally NON-BLOCKING and
// degrades gracefully: if ESLint isn't installed yet, or anything goes wrong, it
// exits 0 with a hint rather than erroring on every edit.
//
// Monorepo-aware: the hook fires from the repo root, but eslint flat-config resolves
// from CWD — so we walk up from the edited file to the nearest dir holding an
// eslint.config.* and run ESLint there (resolving the eslint binary from that dir).

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const readStdin = async () => {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8');
};

const findConfigDir = (startDir) => {
  let dir = startDir;
  for (;;) {
    if (['eslint.config.mjs', 'eslint.config.js', 'eslint.config.cjs'].some((f) => existsSync(join(dir, f)))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
};

const main = async () => {
  let filePath = '';
  try {
    const raw = await readStdin();
    const payload = JSON.parse(raw || '{}');
    filePath = payload?.tool_input?.file_path || payload?.tool_input?.filePath || '';
  } catch {
    return; // no/garbled payload — nothing to lint
  }

  if (!filePath || !/\.(ts|tsx)$/.test(filePath) || !existsSync(filePath)) return;

  const configDir = findConfigDir(dirname(filePath));
  if (!configDir) return; // file isn't under a linted package

  // Resolve the eslint binary from the config dir (works regardless of hoist/CWD).
  let eslintBin;
  try {
    const requireFromConfig = createRequire(join(configDir, 'package.json'));
    eslintBin = join(dirname(requireFromConfig.resolve('eslint/package.json')), 'bin', 'eslint.js');
  } catch {
    console.log('coding-standards: eslint not installed — run `pnpm install` to enable the lint hook.');
    return;
  }

  const res = spawnSync(process.execPath, [eslintBin, '--format', 'stylish', filePath], {
    cwd: configDir,
    encoding: 'utf8',
  });

  const out = `${res.stdout || ''}${res.stderr || ''}`.trim();
  if (res.status && out) {
    console.log(`coding-standards — violations in ${filePath}:\n${out}\nFix these now (split if >200 lines, arrow fns, exports at end).`);
  }
};

main().catch(() => {});
