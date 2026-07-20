# ToolButton — changelog

## 2026-07-02 17:05 — add `outline` variant (border, no fill)

- What: new `outline` variant (6th) — solid's 1px `--color-border-subtle`
  border with a transparent bg at rest; hover lifts `--color-bg-surface` +
  brightens the border to `--color-border-default`, pressed sinks to
  surface-solid. Full opacity like solid (root dim would fade the border).
  Mirrors `Button[data-variant='outline']` on the icon-button tier. Added to
  the Variants story + playground options.
- Why: Val — the chat top-bar Back / New chat need a boxed-but-unfilled look
  (border, no fill) riding the transparent overlay; no existing variant
  combined a border with a transparent bg.

## 2026-07-02 16:40 — add `bare` variant

- What: new `bare` variant (5th) — NO background at any state; the base
  wrapper-opacity brighten (60 → 100) is the whole hover feedback. Added to
  the Variants story + playground options.
- Why: Val — the sidebar Chat-row quick actions (search / new-chat) needed
  an icon-only action with no wash (they ride an already-washed row); rather
  than keeping a one-off `SidebarRowAction` brand atom, the existing
  ToolButton grew the missing state and the one-off was deleted.

## 2026-06-28 16:07 — add `solid` variant

- What: new `solid` variant (4th, after ghost / subtle / danger) — a standalone
  boxed icon button: solid `--color-bg-surface-solid` fill + a 1px
  `--color-border-subtle` border at full opacity, hover lifts a tone + brightens
  the border, pressed sinks. Matches the composer footer controls (mic / model
  pill / +). `ToolButtonVariant` += `'solid'`; Variants story + `variant`
  argTypes (now 4 options → `select`) updated. Still tokens-only / pure-UI (no
  brand colours).
- Why: VoiceDictation's recording ✗ ✓ wanted a boxed look like the chat mic;
  that's now a canonical reusable variant instead of a per-component override.

## 2026-06-26 — renamed IconButton → ToolButton

- What: renamed the component, folder, files, `IconButtonProps`/`Size`/`Variant`
  types, `klyp-IconButton*` BEM classes, the `@klyp/ui/IconButton` subpath, and
  the catalog slug (`icon-button` → `tool-button`). All import sites updated.
- Why: "ToolButton" names the role (a toolbar action button) rather than the
  content; clearer intent and avoids confusion with generic icon-in-a-button.
- Note: entries below predate the rename and refer to it as `IconButton`.

## 2026-06-25 — isPending keeps focus (stop folding into isDisabled)

- What: `isPending` no longer maps to `isDisabled` — it routes through RAC's
  native `isPending` (sets `[data-pending]` + aria, blocks press) so the button
  stays focusable while busy. Dropped the now-dead `&[data-pending] &[data-disabled]
  {opacity:1}` SCSS workaround; pending keeps `opacity:1` directly for spinner
  legibility.
- Why: a disabled button leaves the focus order, so a spinner mid-action stole
  keyboard focus from the user. Same fix already landed in Button (`loading`).

## 2026-06-25 — States story: forced Hover column

- What: added a "Hover" cell to the `States` story. RAC owns `data-hovered`
  (strips any incoming one), so the SCSS hover rules now also match a custom
  `data-force-hover` attr that passes through, letting the hover surface render
  statically with no real pointer.
- Why: states story should display the hover surface alongside default/active/disabled.

## 2026-06-25 — rename IconActionButton → IconButton

- What: renamed the component (folder, files, exports, `IconButton*` types,
  `klyp-IconButton` BEM class, registry slug `icon-button`) and updated all
  consumers (Toolbar, CodeBlock, FloatingCodeBar, MessageActions, CanvasToolbar,
  message-bubble, ComponentPage, HandoffContent).
- Why: `IconButton` is the canonical name (it's the one referenced in the tier
  docs and the `BulkActionsBar` comments); the `Action` infix was redundant.

## 2026-06-22 12:39 — drop gold-mesh primary variant

- What: removed `variant='primary'` entirely (and its inlined goo-blob mesh +
  spinner-on-mesh styles). Variants are now `ghost` / `subtle` / `danger`.
  Normal hover stays a neutral surface one tone above the dark bg.
- Why: teamlead — MeshButton is a rare, pointed accent CTA; an icon action
  button must never carry the gold mesh. The DS teardown independently flagged
  the same thing (brand-specific animation living in a UI primitive, P2). No
  prod callsite used `variant='primary'`, so removal is non-breaking.

## 2026-06-22 10:26 — cross-DS rework: mesh primary, danger, two-axis icon, pending

- What: (1) `primary` variant now renders the gold goo-blob mesh surface
  (inlined from MeshButton) instead of the flat white→gold-hover fill the
  teamlead flagged as off-palette; pending primary keeps the live mesh (busy
  look, no dim/translucency). (2) New `danger` variant (red glyph + red hover
  wash) for destructive actions. (3) Two-axis sizing — `size` = container;
  glyph is a constant 16px by default, `iconSize="auto"` opts into the
  container-scaling ramp (16/20/24/28/32), `iconSize={n}` sets exact px. (4) `isPending` wires a CSS spinner + `[data-pending]` +
  `aria-busy` and blocks the press. (5) `isActive` exposed as a prop →
  `[data-active]` + `aria-pressed` (was styled but unsettable). (6) hardcoded
  `opacity 0.6/0.4` → `--opacity-60` / `--opacity-disabled`; `120ms` →
  `--duration-fast`. (7) per-size radius ramp mirroring Button (xs/sm 6px →
  md 10px → lg/xl 12px) for cross-component consistency. Stories reworked: a single `Sizing` matrix (container ↓ ×
  icon → — replaces the indistinguishable Sizes/IconScale pair), real
  `<Toolbar>` (was raw-div `ActionRow`), + `Pending` / `Confirm`; dropped the
  `WithOverlay` story. Examples use `FilterOutline` (primary) / `DangerOutline`
  (delete).
- Why: cross-DS audit vs Radix/HeroUI/Geist/RAC — primary colour fix + the
  conflated icon-size axis + dead `isPending`/`data-active` were the P0s.

## 2026-06-19 — handoff hardening (token-only)

- What: focus ring `outline: 1px solid var(--color-ring)` → `var(--bw-default)
  solid var(--color-ring)`. Value-identical (`--bw-default` is 1px) — token
  hygiene, no visual change.
- Why: handoff readiness — every value is a token (the last hardcoded px in the
  component).

## 2026-06-18 12:58 — full square size range (xs/sm/md/lg/xl)

- What: added square `data-size='xs'` (24) / `lg` (48) / `xl` (56) to the prior sm/md. Default stays sm (icon utility stays compact). Sizes story shows all five.
- Why: DS-wide button size scale extended — see `@klyp/tokens` CHANGELOG 2026-06-18.

## 2026-05-23 21:54 — route tooltip through @klyp/ui wrapper

- What: replace direct `react-aria-components` `Tooltip` /
  `TooltipTrigger` import with `Tooltip` / `TooltipContent` from
  `../Tooltip/Tooltip`. Behaviour identical (top placement, 400ms
  delay, label passthrough).
- Why: previously rendered an unstyled RAC tooltip — bypassed the
  brand-styled `klyp-Tooltip` SCSS (surface bg, border, animations,
  arrow). Single tooltip primitive across the system.

## 2026-06-26 09:12 — playground-controls

- What: added meta args + argTypes (variant, size, label, tooltip, isActive, isPending, isDisabled; className/style non-editable) for the catalog ComponentPlayground.
- Why: playground-controls convention (.claude/rules/components.md).
