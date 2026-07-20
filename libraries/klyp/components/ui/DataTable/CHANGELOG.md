# DataTable — changelog

## 2026-06-26 09:13 — playground-controls

- What: added meta args + argTypes (striped/stickyHeader/loading booleans, loadingRows range, ariaLabel text); columns/rows/rowKey/defaultSort supplied as default structural args (data-driven component).
- Why: playground-controls convention (.claude/rules/components.md).

## 2026-06-25 13:02 — cross-DS audit fixes: loading / empty-default / striped / sticky / center

- What: DataTable.tsx — added `loading?: boolean` + `loadingRows?: number`
  (default 5): body shows skeleton rows built from the `@klyp/ui` Skeleton
  primitive — one bar per cell so the column grid is preserved, pulse-wave
  staggered top-down via `--klyp-stagger-i`; bars mirror cell alignment;
  `aria-busy` on the table. Plus `striped?: boolean`
  (`data-striped` → even-row zebra), `stickyHeader?: boolean` (`data-sticky`
  → pinned `thead`). Reworked the empty state HeroUI-style: the header row
  now STAYS visible and the empty node renders in a cell spanning all
  columns; default (no `empty` prop) shows the new `DirectboxOutline` glyph
  + "No results found". `DataTableAlign` gained `'center'`. SortableTableHeader
  — `align` widened to include `'center'` (centers the label+indicator
  cluster). DataTable.scss — `data-align='center'`, zebra via the new
  `--alpha-white-02` primitive (below header 03 + hover 05 so it never reads
  as a header band or eats the hover step), sticky-header rule with an opaque
  surface bg (no row bleed-through), centered loading/empty state block.
  New primitive `--alpha-white-02` in primitives.css. New icon
  `DirectboxOutline` in @klyp/icons outline; the empty glyph is muted via
  WRAPPER `opacity` (var(--opacity-30)) + a solid `--color-fg-primary` on the
  svg — NOT an alpha color through currentColor (that doubles outline-stroke
  junctions), same pattern as @klyp/ui Button. Stories — added `EmptyDefault`,
  `Loading` (skeleton rows), `Striped`, `StickyHeader`, and `Alignment`
  (start / center / end side-by-side in one compact table so the difference
  is obvious — replaced the earlier center-only story).
- Why: cross-DS audit vs Radix / HeroUI / Geist / React Aria flagged the gaps —
  no loading state (consumers /assets·/library·/earnings are async), empty
  state dropped the whole table chrome (HeroUI keeps it), no zebra / sticky /
  center. All additive, defaults preserve the current look (striped/sticky off,
  center opt-in). Density/`size` was deliberately DEFERRED by the design lead
  (2026-06-25) — left as a future proposal, not built. Raw-`<table>`-vs-RAC and
  the adaptive-hide-vs-scroll question stay open for the lead.

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: DataTable.scss — row hover background bumped from `--alpha-white-03`
  to `--alpha-white-05` so hover no longer blends with the header background
  (`thead th` still stays at `--alpha-white-03`); added a `&__srStatus`
  (visually-hidden) class. DataTable.tsx — added a hidden
  `role="status" aria-live="polite"` region that, on `sort` change, gets the
  text "Sorted by {label} ascending/descending" (label is taken from the
  string `column.label`, otherwise from `key`).
- Why: 1.2 — row hover matched the header background, so interactivity was
  not readable; 3.1 — sort changes were not announced to the screen reader
  at all. Public API, geometry, and sorting logic were left untouched.

## 2026-05-17 02:30 — promote-to-stable + catalog entry

- What: status flipped `beta` → `stable` in components-registry.ts;
  entry visible at `/components/data-table`. Touched both
  stories-loader and source-loader docstrings to force Vite HMR to
  re-evaluate their `import.meta.glob` calls — without the touch, dev
  sessions that started before the DataTable folder was created kept
  rendering an empty Preview / "No changelog yet" because the cached
  glob result excluded the new files.
- Why: ready for /assets, /library, /earnings, /referrals consumers;
  no API change since the initial release this morning.

## 2026-05-17 02:14 — initial-release

- What: Generic sortable data-table primitive in @klyp/ui. Composes
  `SortableTableHeader` for column headers; adds `useSortedRows` cycle
  (asc → desc → none, exported standalone), motion-driven row reorder
  via `motion.tr layout="position"` (auto-disabled on
  `prefers-reduced-motion`), and adaptive column hiding via container
  query on the table's own inline-size (priority=3 hides < 600px,
  priority=2 hides < 480px).
- Why: Lifted from `apps/web/src/features/referrals/activity-ledger.tsx`
  so /assets, /library, /earnings, /referrals withdrawals, and any
  future admin tables can share the same chrome and interaction
  model. Earlier worker today (2026-05-17) lifted just the
  SortableTableHeader header; this completes the lift by packaging
  the surrounding table machinery as a single typed primitive.
