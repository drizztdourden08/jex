# Design System — Structure & Rules

The foundation for the app's UI is a set of design tokens plus a four-tier component
library. All code obeys @docs/contributing/coding-standards.md. For where UI fits in the
wider app, see @docs/architecture/overview.md. The **visual** language (the "Aurora"
glass look, colors, values) lives in the design tokens; this doc is about *structure
and discipline*, not the palette.

## Where things actually live

All UI lives under `src/renderer/src/ui/`. There is **no domain split** — the app is
small enough that the four tiers alone carry the structure:

- `design-system/` — reusable, app-agnostic: tokens + primitives + composites (`@ds/*`).
- `compounds/` — app-specific *presentational* units built from the design system (`@ui/*`).
- `views/` — pages / tab contents with logic + data (`@ui/*`).

Aliases: `@ds/*` → `ui/design-system/*`, `@ui/*` → `ui/*` (plus the existing
`@/*` → `src/renderer/src/`, `@shared/*` → `src/shared/`). Non-presentational renderer
code (`store/`, `lib/`, `hooks/`) and the `App.tsx` router stay at `src/renderer/src/`
root.

## Component taxonomy — four tiers

Every UI component is exactly one tier. Pick the tier first, then build it in the right
folder. The first three are bare and presentational: data comes in via props and
callbacks, with no access to stores or `window.api`. Only Views are wired to data.

| Tier | What it is | Domain-aware? | Logic/data? | Lives in | Examples |
|------|-----------|---------------|-------------|----------|----------|
| **Primitive** | Generic UI atom | ❌ generic | ❌ | `design-system/primitives/` | Box, Flex, Text, Button, Select, Toggle, Slider, Icon, Portal |
| **Composite** | Generic **structural** unit built from primitives | ❌ generic | ❌ | `design-system/composites/` | Card, Dialog, Overlay, Carousel, **FilterPanel**, **QueryBuilder** |
| **Compound** | App-specific **presentational** unit composed from primitives/composites | ✅ a concept | ❌ (data via props) | `compounds/` | GameCard, MediaCarousel, **LibraryFilters**, **GameQuery** |
| **View** | Page / tab content with business logic + data | ✅ | ✅ stores, `window.api` | `views/` | LibraryPage, GameDetailPage, CommandSurface, SettingsPage |

**Primitive** — a generic atom with no domain knowledge. Pure props in, events out,
reusable in any app. Raw HTML (lowercase JSX) is allowed **only** here.

**Composite** — a generic, reusable *structural* component built from primitives, still
domain-agnostic. A `<FilterPanel>` knows how to render facet sections, chips, and a
reset affordance, but knows **nothing** about games — it's driven entirely by props.
Often a small Facade over markup and tokens.

**Compound** — an app-specific presentational unit that *specializes* a composite or
composes primitives for a concrete concept. `<LibraryFilters>` feeds the generic
`<FilterPanel>` the library's facet set; `<GameCard>` lays out a `Game`. It takes a
domain prop but stays bare: it fetches nothing, owns no store, and fires callbacks up.
(Project meaning — a composed/specialized unit, NOT the React-Context "compound
components" pattern.)

**View** — the container, and the unit behind each **tab / page**. Owns state via
Zustand stores or `window.api` and passes data + callbacks down into the bare tiers.
It's the only tier with business logic, which lives in its `behavior/` hooks.

> **The filter/query case, concretely.** `FilterPanel` and `QueryBuilder` are **generic
> composites**. Each surface that needs them gets a **compound** specialization
> (`LibraryFilters`, `WishlistFilters`, `SearchFilters`, `GameQuery`). The **views**
> (`LibraryPage`, `WishlistPage`, `SearchPage`) own the data and render the compound.
> Filters are never a view.

> **Hard boundary:** primitives, composites, and compounds keep clear of stores,
> `window.api`, and navigation. Data flows in via props only. If a bare component needs
> to fetch or subscribe, it's really a View — move it.

### Choosing the tier

- Touches stores, `window.api`, or navigation, or owns state? → **View** (a tab/page).
- App-specific but purely presentational (specializes a composite, lays out a domain
  shape)? → **Compound**.
- Generic structural combo of primitives, domain-agnostic? → **Composite**.
- Generic single atom? → **Primitive**.

## Per-component structure (enforced by R12 structure-policy)

```
<tier>/<Name>/
├── <Name>.tsx          — one component, arrow fn, exports at end, ≤200 lines  ┐
├── <Name>.css          — scoped styles, tokens only, class names prefixed     │ ONLY
├── <Name>.type.ts      — <Name>Props etc. (exports at end)                    │ these
├── <Name>.constants.ts — static config (optional)                            │ at root
├── index.ts            — barrel (re-export only)                              ┘
├── behavior/           — hooks/handlers, one per file
└── sub-components/<Child>/  — children used only here (recursive: same shape)
```

Only `<Name>.{tsx,css,type.ts,constants.ts}` + `index.ts` at the root; only `behavior/`
and `sub-components/` subfolders (R12). A child used by exactly one component is a
`sub-component` of it — **not** a new top-level entry. Promote it to a primitive,
composite, or compound only when a *second* consumer appears (Rule of Two). A small
single-file component doesn't need a folder; don't over-split.

## Rules

**Tokens**

1. `ui/design-system/tokens/` (one concept file per category) is the single source of
   truth. Use `var(--token)` for color — no raw hex/named colors (R13-enforced); prefer tokens for sizing too.
2. For a new design value, add a token first, then use it.

**Components**

3. One component per folder; one thing per file; ≤200 lines; arrow fn; exports at end.
4. **Rule of two:** a UI pattern used 2+ times gets extracted to the right tier rather
   than copy-pasted. The second occurrence is the trigger.
5. Express variants via props and data-attributes/CSS, not duplicated components
   (`<Button variant="danger">`, not `DangerButton`).

**Styling**

6. Colocate CSS as `<Name>.css` with scoped, prefixed class names. There is **no**
   shared `styles/sections/` bucket — each component owns its CSS.
7. Reserve inline `style={{}}` for genuinely dynamic values (computed transforms,
   measured sizes).

**Boundaries**

8. `ui/design-system/` is domain-agnostic — it never imports from `compounds/` or
   `views/`. Compounds import `@ds/*`; views compose compounds + the design system.
9. Raw HTML (lowercase JSX) is allowed **only** in `primitives/`. Everywhere else
   compose `Box`/`Text`/`Flex`/`Button`/….

## Mechanical enforcement

| Rule | Tool | What it flags |
|------|------|---------------|
| **R11 no-raw-html** | ESLint (`local/no-raw-html`) | any lowercase JSX outside `primitives/` |
| **R12 structure-policy** | `scripts/checks/structure.mjs` | non-conforming files/subfolders in a component folder |
| **R13 token-policy** | stylelint | raw colors (hex/named/`rgb()`/`hsl()`) in `ui/**` CSS (`tokens/` exempt) — colors must be tokens |

Scripts: `npm run lint` (tsc + eslint, incl. R11) · `npm run lint:css` (R13) ·
`npm run check:structure` (R12) · `npm run verify` runs all three.

## Growing it

New UI need → pick the tier → check for an existing component to reuse → if none exists
and it's reusable, create it in the right tier folder (or as a `sub-component` if it's
used in one place) → wire data only at the View tier. Every change runs the
`coding-standards` checkup and is placed per @docs/architecture/overview.md.
