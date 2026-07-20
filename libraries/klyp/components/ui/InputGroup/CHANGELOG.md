# InputGroup — changelog

## 2026-05-17 03:45 — promote-to-stable

- What: Promoted from `beta` to `stable`. Added 2 new props on root: `size?: 'sm' | 'md' | 'lg'` (default `md`) and `variant?: 'outline' | 'filled' | 'ghost'` (default `outline`). SCSS extended with hover state on root, 3 size selectors (cascade to child `Input`/`Textarea` via `[data-size='X'] > .klyp-Input` rules — no need for callers to repeat `size` prop on the child), 3 variant selectors. Extended `closest()` heuristic in `InputGroupAddon` onClick from `'button'` to `'button, a, [role="button"]'` so addon-with-IconButton or addon-with-anchor focus-redirects to the adjacent input correctly. Story file expanded from 1 to 10 stories (Default / Sizes / Variants / InlineAddons / BlockAddons / PrefixString / WithButton / Loading / Counter / Textarea).
- Why: Catalog reader had only one example (search-with-clear) — couldn't see the full slot-composition matrix the component supports (inline-start/end + block-start/end addons, prefix/suffix strings, sizes, variants). One-story shipment also violated `.claude/rules/components.md` ≥3 minimum, blocking stable promotion.

The 6-export compound shape (`InputGroup` / `InputGroupAddon` / `InputGroupButton` / `InputGroupText` / `InputGroupInput` / `InputGroupTextarea`) is unchanged — all existing consumers keep working.
