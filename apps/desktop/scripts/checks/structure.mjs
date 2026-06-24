// R12 structure-policy — checks the component-folder shape under src/renderer/src/ui/.
//
// A "component folder" is a directory <Name>/ that contains <Name>.tsx. Inside it:
//   • allowed root files:  <Name>.{tsx,css,type.ts,constants.ts,helpers.ts,icons.tsx} + index.ts
//   • allowed subfolders:  behavior/  sub-components/   (sub-components recurse, same shape)
// Anything else at a component root is flagged. Loose single-file components
// (a bare <Name>.tsx with no folder) are allowed and not flagged. tokens/ is skipped.
//
// Warn mode by default (exit 0); set STRUCTURE_STRICT=1 to exit non-zero on violations
// (flipped on in Phase 7 once the backlog is at zero).

import { readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const UI_ROOT = resolve('src/renderer/src/ui');
const ALLOWED_SUBFOLDERS = new Set(['behavior', 'sub-components']);
const violations = [];

const rootFileAllowed = (name, comp) => {
  if (name === 'index.ts') return true;
  const exts = ['tsx', 'css', 'type.ts', 'constants.ts', 'helpers.ts', 'icons.tsx'];
  return exts.some((ext) => name === `${comp}.${ext}`);
};

const dirs = (path) =>
  readdirSync(path, { withFileTypes: true }).filter((e) => e.isDirectory());
const files = (path) =>
  readdirSync(path, { withFileTypes: true }).filter((e) => e.isFile());

const checkComponentFolder = (path, name) => {
  for (const f of files(path)) {
    if (!rootFileAllowed(f.name, name)) {
      violations.push(`${join(path, f.name)} — unexpected file at component root of <${name}>`);
    }
  }
  for (const d of dirs(path)) {
    if (!ALLOWED_SUBFOLDERS.has(d.name)) {
      violations.push(`${join(path, d.name)}/ — unexpected subfolder in <${name}> (only behavior/ + sub-components/)`);
    }
    walk(join(path, d.name));
  }
};

const walk = (path) => {
  for (const d of dirs(path)) {
    if (d.name === 'tokens') continue;
    const childPath = join(path, d.name);
    if (existsSync(join(childPath, `${d.name}.tsx`))) {
      checkComponentFolder(childPath, d.name);
    } else {
      walk(childPath);
    }
  }
};

if (!existsSync(UI_ROOT) || !statSync(UI_ROOT).isDirectory()) {
  console.log('R12 structure-policy: src/renderer/src/ui/ does not exist yet — nothing to check.');
  process.exit(0);
}

walk(UI_ROOT);

if (violations.length === 0) {
  console.log('R12 structure-policy: 0 violations under src/renderer/src/ui/.');
  process.exit(0);
}

// Strict by default (Phase 7 lock-in; backlog is zero). Set STRUCTURE_STRICT=0 to soften.
const strict = process.env.STRUCTURE_STRICT !== '0';
console.log(`R12 structure-policy: ${violations.length} violation(s)${strict ? '' : ' (warn mode)'}:`);
for (const v of violations) console.log(`  • ${v}`);
process.exit(strict ? 1 : 0);
