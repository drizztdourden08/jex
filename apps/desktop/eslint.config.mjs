// Flat ESLint config (ESLint 9). Enforces the project's hard coding standards
// mechanically — see docs/contributing/coding-standards.md. Scoped to OUR TypeScript
// (out/dist/release are build output; *.d.ts and config files are exempt).
//
// NOTE: existing monolithic files (e.g. src/main/index.ts, GameDetailPage.tsx) will
// report `max-lines` warnings here — that is expected and is the refactor backlog.
// Policy is "refactor when touched"; the PostToolUse hook
// (scripts/hooks/lint-changed.mjs) enforces on the file you actually edit.

import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

// ── R11: no raw HTML outside primitives (error — migration locked in Phase 7) ──
// Any lowercase JSX element is an intrinsic HTML tag; PascalCase = a component.
// Compose a design-system primitive (Box/Text/Flex/Button/…) instead. Scoped to the
// new `ui/` tree; the primitives/ override turns it off (raw HTML is allowed there).
const FORM_CONTROLS = new Set(['input', 'select', 'textarea']);
// SVG markup is not HTML and has no primitive equivalent — exempt it. (Icon/Svg/Mascot
// wrappers live in primitives/; the SVG content tags themselves are always allowed.)
const SVG_TAGS = new Set([
  'svg', 'path', 'circle', 'rect', 'line', 'g', 'defs', 'polygon', 'polyline', 'ellipse',
  'stop', 'linearGradient', 'radialGradient', 'use', 'clipPath', 'mask', 'pattern', 'tspan',
  'text', 'title', 'desc', 'marker', 'symbol', 'filter', 'feGaussianBlur', 'feOffset',
  'feBlend', 'feColorMatrix', 'feMerge', 'feMergeNode', 'feDropShadow', 'animate', 'animateTransform',
]);
const isLowerJsx = (node) =>
  node.name.type === 'JSXIdentifier' && /^[a-z]/.test(node.name.name);

const noRawHtml = {
  meta: { type: 'problem', docs: { description: 'No raw HTML elements outside primitives' }, schema: [] },
  create(context) {
    return {
      JSXOpeningElement(node) {
        // `webview` is an Electron custom element (not HTML, element-specific attrs) — exempt like SVG.
        const tag = node.name.name;
        if (!isLowerJsx(node) || FORM_CONTROLS.has(tag) || SVG_TAGS.has(tag) || tag === 'webview') return;
        context.report({
          node,
          message: `No raw <${node.name.name}> outside primitives — compose a design-system primitive (Box/Text/Flex/Button/…).`,
        });
      },
    };
  },
};

// ── Form controls outside primitives are a hard error from day one ──
const noRawFormControl = {
  meta: { type: 'problem', docs: { description: 'No raw form controls outside primitives' }, schema: [] },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (!isLowerJsx(node) || !FORM_CONTROLS.has(node.name.name)) return;
        context.report({
          node,
          message: `No raw <${node.name.name}> outside primitives — use the form primitive (Select/TextInput/Toggle/…).`,
        });
      },
    };
  },
};

// ── no `as="<tag>"` when a design-system primitive exists ──
// `<Box as="button">` (and friends) re-roll a primitive that already exists, which
// defeats the point of having primitives. Compose the primitive instead. Allowed
// inside primitives/ (they implement `as`). Ported from relic-of-the-past.
const AS_PRIMITIVE = {
  button: 'Button / IconButton',
  input: 'TextInput / NumberInput / Checkbox / RangeInput',
  select: 'Select',
  textarea: 'TextArea',
  img: 'Image',
};
const noAsElementWithPrimitive = {
  meta: { type: 'problem', docs: { description: 'No `as="<tag>"` when a design-system primitive exists' }, schema: [] },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name?.name !== 'as') return;
        const v = node.value;
        if (!v || v.type !== 'Literal' || typeof v.value !== 'string') return;
        const prim = AS_PRIMITIVE[v.value];
        if (prim) {
          context.report({ node, message: `No \`as="${v.value}"\` — a primitive exists; use ${prim} instead of re-rolling a raw <${v.value}>.` });
        }
      },
    };
  },
};

const local = {
  rules: {
    'no-raw-html': noRawHtml,
    'no-raw-form-control': noRawFormControl,
    'no-as-element-with-primitive': noAsElementWithPrimitive,
  },
};

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'out/**',
      'dist/**',
      'release/**',
      'public/**',
      'docs/**',
      'ai-eval/**',
      '**/*.d.ts',
      '**/*.config.{js,ts,cjs,mjs}',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooks,
    },
    rules: {
      // ── ≤200 lines per file (error — backlog is at zero; regressions are blocked) ──
      'max-lines': ['error', { max: 200, skipBlankLines: false, skipComments: false }],

      // ── Arrow functions only: no `function foo() {}` declarations ──
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],

      // ── Exports grouped at end: no inline `export const/function/type` ──
      // Re-exports in barrels (`export { X } from './X'`) have no `declaration`
      // node, so they are NOT flagged. `export default` is allowed.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportNamedDeclaration[declaration]',
          message:
            'No inline export. Declare locally, then group `export { ... }` / `export type { ... }` at the END of the file.',
        },
      ],

      // ── Type-only imports must use `import type` ──
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],

      // ── React hooks correctness ──
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  // ── R11 no-raw-html — scoped to the new ui/ tree (refactor-when-touched) ──
  {
    files: ['src/renderer/src/ui/**/*.tsx'],
    plugins: { local },
    rules: {
      // Locked to error in Phase 7 (raw-HTML backlog is zero; ui/ uses primitives).
      'local/no-raw-html': 'error',
      'local/no-raw-form-control': 'error',
      // Phase 8: locked to error — no Box as="button|input|select|textarea|img" (backlog is zero).
      'local/no-as-element-with-primitive': 'error',
    },
  },
  // Primitives are the one place raw HTML / `as` are allowed — turn the rules off there.
  {
    files: ['src/renderer/src/ui/design-system/primitives/**/*.tsx'],
    rules: {
      'local/no-raw-html': 'off',
      'local/no-raw-form-control': 'off',
      'local/no-as-element-with-primitive': 'off',
    },
  },
);
