# Button

Primary action primitive. Use one primary Button per local decision area; use secondary and ghost variants for supporting actions.

## Variants

- `primary` — the main action in a local decision area;
- `secondary` — a neutral supporting action;
- `ghost` — an action with minimal visual weight;
- `danger` — an irreversible or destructive action.

## States and composition

Button supports small, medium and large sizes, disabled and loading states, full-width layout, and optional leading/trailing slots. While loading it becomes disabled and exposes `aria-busy`.

The illustrative catalog preview is deliberately separate from this implementation. Interactive validation happens in the Workbench Canvas.

## Wireframe Playground

The adjacent typed Playground compares three pre-production visual directions: animated mesh,
semantic solid, and transparent outline. Shared controls switch between square, soft, and maximum
pill corners, three sizes, intrinsic/full-width layout, disabled state, optional mesh motion, and a
Library icon composed through the named `leading` slot.

The mesh clips its moving blobs with both standard `mask-*` and Safari `-webkit-mask-*` declarations.
It also stops ambient motion when `prefers-reduced-motion` is enabled.
