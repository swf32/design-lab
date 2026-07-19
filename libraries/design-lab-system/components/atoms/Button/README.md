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
