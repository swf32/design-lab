# ExpandingSearch — changelog

## 2026-06-17 16:03 — closed-square-36-to-40 (control-height baseline)

- What: collapsed/expanded toolbar height 36px → 40px (root + capsule); closed-square cap `max-width`/`min-width` 2.25rem → 2.5rem; glyph-centring `padding-inline-start` 8px → 10px, recomputed border-box: (40 − 2 − 18) / 2 = 10. Self-documenting comments refreshed to the new numbers.
- Why: DS-wide control-height baseline bump 36→40 (`control.size.lg`). The search chip shares the toolbar control height and the icon offset is derived from it, so the centring math was recomputed rather than blindly swapped.

## 2026-06-03 18:22 — visual QA fixes (review)

- What: ExpandingSearch.scss — (a) collapsed capsule `padding-inline-start` 9px → 8px; (b) added `min-width: 2.25rem` to the collapsed root (`&:not([data-open='true'])`).
- Why: (a) the 9px offset was computed as (36−18)/2 ignoring the capsule's 1px border-box borders, leaving the search icon ~2px right of centre when collapsed; correct centre is (36 − 2 − 18)/2 = 8px. (b) `max-width` only caps the upper bound, so with no free space the `flex: 1 1 auto` chip could fall below 36px and stop being square — `min-width` pins it to 36px (open state keeps `min-width: 0` to still shrink under narrow viewports).

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: added `aria-expanded={false}` to the `.klyp-ExpandingSearch__triggerOverlay` button in `ExpandingSearch.tsx`. The button is only mounted while the search is collapsed, so the static value reflects the collapsed state.
- Why: screen readers had no signal that the trigger expands into a search input; exposing `aria-expanded` announces the collapse/expand affordance.

## 2026-05-29 23:43 — leftward max-width expand, square-when-closed

- What: rebuilt the root as a `flex: 1 1 auto` item capped by an animated
  `max-width` (`2.25rem` closed → `100%` open), moved `data-open` to the root,
  removed the fixed open `width: clamp(240px,36cqi,480px)`, and pinned the
  magnifier with a constant 9px left offset (no per-state justify toggle) — so
  closed renders a true 36×36 square and open expands LEFTWARD on a single
  smooth `max-width` transition with no content "fly".
- Why: owner 2026-05-30 jank rebuild — closed state was a squished non-square
  rectangle and mid-animation the field flew sideways from the auto-margin
  reflow against the growing width.

## 2026-05-29 18:10 — restore focus to trigger on close

- What: closing the capsule (X or Escape) now returns focus to the
  trigger button instead of dropping it at the document root.
- Why: WIG focus-management gap flagged in the Library a11y review —
  keyboard users lost their place when collapsing search.

## 2026-05-29 22:38 — leftward-open, shrinkable, no sibling overlap

- What: search capsule now shrinks (min-width:0 on wrapper + max-width:100% on open capsule) and stays in-flow so it opens leftward without overlaying adjacent toolbar buttons; removed the unused `expandsOver` sibling-fade prop and all `data-search-open` plumbing — zero consumers were passing it.
- Why: Library toolbar redesign — search is the only flexible element; Create + filter stay fixed-width (owner request 2026-05-30).
