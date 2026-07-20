# Modal — changelog

## 2026-06-29 04:23 — modal-system-kinds-align-snap-sheet

- What: Expanded Modal into a full surface system: added `kind` ('modal'|'dialog'), `align` ('start'|'center'), `icon`, `footerAlign` ('start'|'end'|'split'), `isDismissable`, and `mobileSheet` ('auto'|'snap') props, with the 'snap' branch rendering a vaul Drawer bottom-sheet (50%/full detents, controlled-mode only) and new `headerMain`/`titleRow`/`titleIcon`/`illustration` header slots plus size/align/footer-align SCSS modifiers. Moved the close (XOutline) into the header flex row as `klyp-Modal__close` and switched the fallback footer button from `variant="outline"` to `variant="secondary"`.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-24 13:03 — body band padding 12 → 24 all round

- Files: `Modal.scss`
- What: `klyp-Modal__body` padding `12 24` → `24` (24px all round). Applies to
  every Modal body across the DS.
- Why: design-lead — more breathing room in modal bodies.

## 2026-06-24 11:03 — mobileSheet="snap" (vaul drag-to-snap bottom sheet)

- Files: `Modal.tsx`, `Modal.scss`, `Modal.stories.tsx`
- What: new `mobileSheet?: 'auto' | 'snap'` prop. `'auto'` (default) keeps the
  RAC Dialog CSS bottom-sheet (no change). `'snap'` renders a vaul Drawer on
  `≤639.98px` — drag handle, half/full detents ([0.5, 1]), drag-down-to-dismiss
  — reusing `klyp-Modal__content` so the banded header/body/footer styling
  applies (`--sheet` reshapes it into a bottom-anchored, top-rounded sheet;
  surface tokens mirror MobilePanelSheet). Title/description map to vaul's a11y
  slots; close + fallback footer button drive `onOpenChange(false)`. Snap
  requires CONTROLLED mode — with a `trigger` (uncontrolled) it falls back to
  `'auto'`. Desktop rendering is unchanged. New `SnapSheet` story.
- Why: design-lead — "модалка на мобиле либо обычная, либо снап". First step of
  folding the snap pattern into Modal (MobilePanelSheet consumers migrate later).
- Verified: desktop (1280px) → normal Dialog modal; mobile (390px) → vaul sheet
  (handle + overlay + bands, fixed bottom, 16px top radius). Drag/snap GESTURES
  need real-device QA (not testable via click-driven preview).

## 2026-06-24 10:09 — center close 24px inset · title-only header centers with close

- Files: `Modal.scss`
- What:
  - **Centered alert** (`align="center"`) close inset 16 → **24px** (top + right),
    matching the start-align header padding for a consistent edge gap.
  - **Title-only header** (no description): header `align-items: center` so the
    title sits on one line with the 40px close, not pinned to the top-left. A
    header WITH a description stays top-aligned (`:not(:has(.klyp-Dialog__description))`).
- Why: design-lead — consistent close inset across aligns; title vertically
  centered with the ✕ when there's no description.

## 2026-06-24 09:47 — close size → medium (matches footer controls)

- Files: `Modal.scss`
- What: dropped the forced 32px close override — the close is now the plain
  `size="icon"` (medium = `--control-size-md`, 40px), so it matches the footer's
  medium (`size="md"`) buttons. One consistent control size in the modal chrome.
- Why: design-lead — close + footer controls all medium.

## 2026-06-24 09:41 — close as flex sibling (32px) · solo action secondary

- Files: `Modal.tsx`, `Modal.scss`
- What (design-lead follow-up — the padding-reserve was fragile):
  - **Header is now a flex row** `[headerMain (title+desc column, flex:1,
    min-width:0)] [close]`. The Modal renders its **own** close as a real flex
    sibling (`showCloseButton={false}` on DialogContent) — so a long title wraps
    in its own column and can never run under the ✕ (Geist / Material pattern,
    replacing the absolute-close + padding-inline-end reserve).
  - **Close = fixed 32px** with a **20px** ✕ glyph (was overflowing the button).
  - Centered alerts keep the close out of flow (absolute top-right) so the
    centered column stays on the true axis.
  - **Footer rule clarified**: a single (solo) action uses `variant="secondary"`
    — the fallback Close is secondary.
- Why: design-lead — robust no-overlap close, correct 32px button, solo=secondary.

## 2026-06-24 09:22 — no divider lines · 4px title gap · close-clearance · footer rule

- Files: `Modal.scss`, `Modal.tsx`, `Modal.stories.tsx`
- What (design-lead follow-up):
  - **Removed the header & footer divider lines** — bands keep their padding,
    no hairlines (header `border-bottom` rule dropped; footer `border-top: 0`).
  - **Title ↔ description gap → 4px** (header `gap`).
  - **Close-clearance** — the title row reserves the absolute close button's
    footprint (`padding-inline-end: 40px`, symmetric for centered alerts), gated
    by `:has(.klyp-Dialog__close)` so body-less / closeless modals aren't
    indented. Fixes the title running under the ✕ (Radix / shadcn pattern).
  - **Footer rule** — primary action = `Button variant="primary"` (or
    `"destructive"`), secondary action = `Button variant="secondary"`. Stories +
    the fallback Close updated from `outline` → `secondary`.
- Why: design-lead — cleaner band chrome, no ✕ overlap, one footer-button rule.

## 2026-06-24 09:05 — banded header / body / footer + secondary close

- Files: `Modal.scss` (+ `@klyp/ui` Dialog close variant)
- What: header / body / footer are now full-width bands, each owning its
  padding + a hairline divider — the header mirrors the footer (design lead).
  - Content padding → 0; inner `__dialog` gap → 0 (bands sit flush).
  - **Header** band: `24 / 24 / 12` (top / sides / bottom) with a `border-bottom`
    divider — gated by `:has(.klyp-Modal__body)` so a body-less confirm/alert
    doesn't double the line against the footer's `border-top`.
  - **Body** band: `12 / 24` (block / inline).
  - **Footer** band: `12 / 24 / 24` (no more negative-margin bleed — content has
    no padding now).
  - **Close** button → DS `Button` `variant="secondary"` (rounded-square icon
    button) via the ui/Dialog primitive, nudged to `top/right: 20px` so it sits
    inside the header band beside the title.
- Why: design-lead — symmetric banded chrome (header == footer) matching the
  Figma modal set. Verified across with-body + body-less in /components.

## 2026-06-24 08:45 — modal system: kind / align / icon / footerAlign + tokenized widths

- Files: `Modal.tsx`, `Modal.scss`, `Modal.stories.tsx`, `packages/tokens/src/semantic.tokens.json`
- What: foundation of the modal system (design-lead).
  - **Tokenized widths** — `--modal-w-{dialog,sm,md,lg,xl,full}` + `--modal-h-full`
    (new `modal` group in semantic tokens; replaces the raw `28/32/42/56rem`
    literals). Scale: dialog 440 · sm 480 · md 560 · lg 720 · xl 920 · full ≤1080×≤720.
  - **`kind`** `'modal' | 'dialog'` — dialog = interruptive confirm/alert at
    `--modal-w-dialog` (size ignored).
  - **`align`** `'start' | 'center'` — center = alert layout (centered head + body).
  - **`icon`** — leading icon beside the title (start) or centered illustration
    above it (center).
  - **`footerAlign`** `'start' | 'end'(default) | 'split'` — split = equal-width
    buttons filling the row.
  - **`isDismissable`** passthrough.
  - Stories added: DialogKind, IconHeader, AlertCentered, FooterAlignment.
- Why: design-lead — unify modal sizing into one semantic scale + cover the real
  use-cases from the Figma set (title left/center, leading icon, centered alert,
  footer left/right/split). Backward-compatible: existing `size` / `footer` /
  `trigger` props unchanged. Verified in /components.

## 2026-06-05 — mobile-large-footer-buttons

- What: On the ≤639.98px bottom-sheet (same breakpoint as ui/Dialog's mobile sheet) footer action buttons now stretch full-width and floor to the comfortable touch target: `.klyp-Modal__content .klyp-Dialog__footer > * { width: 100%; min-height: var(--touch-target-comfort); }` (44px). `min-height` only raises the floor, so it wins over MeshButton's fixed 32/36px height and gives heightless ui/Button a definite size, without overriding each button's variant styling (works for Button / MeshButton / SolidButton). Desktop unchanged. Verified in catalog: 375px → footer `md` button 44px tall, full-width; 1280px → 34px, content-width, right-aligned row.
- Why: design review — footer buttons kept the consumer-passed `sm`/`md` size (~32–36px), too small a tap target for a primary action on a phone. The Modal can't change the `size` of arbitrary button children at the React level, so the large touch target is enforced via CSS, scoped to the brand Modal only.
