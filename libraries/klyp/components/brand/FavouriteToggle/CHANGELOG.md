# FavouriteToggle — changelog

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: In `FavouriteToggle.scss`, added a solid `background: var(--color-bg-surface)`
  fallback line immediately before each `background: color-mix(in oklab, …)` —
  once on the base `.klyp-FavouriteToggle` and once on `&[data-hovered]`
  (`var(--color-bg-surface-hover)`).
- Why: Safari 15–16.1 does not support `color-mix(in oklab, …)`, so the
  declaration was dropped and the toggle rendered with a transparent
  background, making the pill effectively disappear over cover images.
  Modern browsers override the fallback with the `color-mix` line.

## 2026-05-25 12:40 — heart-icon-top-right-row

- What: Iconsax `heart` (outline → bold on active) replaces the bookmark
  glyph. The toggle moved out of the top-left corner in Library cards into
  the top-right action row next to `<MediaCardActions>` — favourite stays
  the rightmost (corner) affordance, overflow menu sits to its left.
- Why: Bookmark in top-left collided with the `<MediaGrid>` selection
  checkbox — both anchored at `top:8px; left:8px` with overlapping glass
  pills. Heart also reads more universally as "favourite" than bookmark
  ("save for later").
