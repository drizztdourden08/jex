// Root flat ESLint config (ESLint 9). Holds the shared CODE rules (arrow fns only,
// exports at end, max-lines 200, import type) and lints packages/* + plugins.
// apps/desktop has its own config that imports `codeConfig` from here and adds the
// renderer-only rules (R11 local/*, React hooks). eslint/typescript-eslint resolve
// from the hoisted root node_modules (node-linker=hoisted).

import tseslint from 'typescript-eslint';

const baseIgnores = [
  '**/node_modules/**',
  '**/out/**',
  '**/dist/**',
  '**/release/**',
  '**/public/**',
  '**/*.d.ts',
  '**/*.config.{js,ts,cjs,mjs}',
];

const codeRules = {
  'max-lines': ['error', { max: 200, skipBlankLines: false, skipComments: false }],
  'func-style': ['error', 'expression', { allowArrowFunctions: true }],
  'no-restricted-syntax': [
    'error',
    {
      selector: 'ExportNamedDeclaration[declaration]',
      message:
        'No inline export. Declare locally, then group `export { ... }` / `export type { ... }` at the END of the file.',
    },
  ],
  '@typescript-eslint/consistent-type-imports': [
    'error',
    { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
  ],
};

const codeConfig = {
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
  },
  plugins: { '@typescript-eslint': tseslint.plugin },
  rules: codeRules,
};

// Root run covers packages + plugins only; apps/desktop is linted by its own config.
const rootConfig = tseslint.config(
  { ignores: [...baseIgnores, 'apps/**', 'docs/**', 'scripts/**'] },
  codeConfig,
);

export { baseIgnores, codeConfig, codeRules };
export default rootConfig;
