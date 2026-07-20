# Dialog — changelog

## 2026-07-02 20:01 — story coverage (controlled / no-✕ / non-dismissable) + width token

- Files: `Dialog.stories.tsx`, `Dialog.scss` (+ `tokens/semantic.tokens.json`)
- What: three new trigger-based stories — `Controlled (standalone)` (the
  `isOpen`/`onOpenChange` programmatic-mount mode LibraryPicker / sign-up-modal
  use), `Without close button` (`showCloseButton={false}`, footer owns closing
  via `DialogFooter showCloseButton`), `Non-dismissable` (`isDismissable={false}`,
  backdrop click blocked, ✕/Esc/DialogClose still work). The long-form story's
  raw `<input>` → `@klyp/ui` Input (showcase rule). `__content` desktop
  `max-width: 384px` hardcode → new `--modal-w-xs` token (24rem). Documented in
  the stories file why Dialog ships no playground `argTypes` (overlay family —
  Sheet / Modal precedent: bare root renders nothing inline; a controlled `open`
  control would strand the overlay).
- Why: pre-handoff audit before converting Dialog for the FE-team ui-kit —
  story coverage sat at ~60% of the public API, the raw input violated the
  showcase rule, and 384px was the last raw-px in Dialog.scss.

## 2026-06-26 09:52 — drop the `DefaultOpen` story (broke the catalog page)

- Files: `Dialog.stories.tsx`
- What: removed the `defaultOpen` story. The catalog renders every story inline on
  one page, so an auto-open dialog threw its fixed full-viewport overlay over the
  whole `/components/dialog` page — the catalog showed as a black/empty area.
- Why: overlay stories must open via a trigger button (Sheet does the same); there
  is no safe way to show an auto-open overlay inline. Added a comment so it's not
  re-introduced. All remaining Dialog stories are trigger-based.

## 2026-06-26 09:44 — pin header + footer while body scrolls

- Files: `Dialog.scss`
- What: `__header` and `__footer` are now `position: sticky` (top / bottom) with a
  `--color-bg-surface` background, so on tall content only the middle body scrolls —
  the title and the action buttons stay visible instead of scrolling away with it.
- Why: the 06-25 scroll fix scrolled the whole `__dialog` (header + footer included).
  Reachable but not ideal; pinning matches Modal / Geist sticky behaviour.

## 2026-06-26 09:38 — backdrop variants (blur default / opaque / transparent)

- Files: `Dialog.tsx`, `Dialog.scss`, `Dialog.stories.tsx`
- What: added `backdrop` prop on `DialogContent` (`'blur' | 'opaque' | 'transparent'`,
  default `'blur'`) written as `data-backdrop` on the overlay; `opaque` drops the
  blur, `transparent` removes the backdrop entirely. Added `Backdrop variants` story
  with one button per variant.
- Why: blur is fixed everywhere and is expensive over video / canvas; callsites had
  no way to opt out. Default stays `blur` so no existing dialog changes.

## 2026-06-25 15:17 — viewport-capped height + body scroll; drop dead legacy parts

- Files: `Dialog.tsx`, `Dialog.scss`, `Dialog.stories.tsx`, `index.ts`
- What: `__content` now caps at `max-height: calc(100svh - var(--space-32))` and
  the inner `__dialog` scrolls (`overflow-y:auto` + `min-height:0`); the absolute
  close ✕ stays pinned. Tall forms/lists no longer grow off-screen with an
  unreachable footer. The `__dialog` scroll area uses a slim scrollbar
  (transparent at rest, fades in on hover) instead of the chunky OS default.
  Removed dead `DialogPortal` (zero callers) and the legacy
  Base-UI `render` prop on `DialogClose` (never passed) + their barrel exports.
  Added `Scrollable · Tall content` / `Scrollable · Long form` stories as proof.
- Why: long-content dialogs overflowed the viewport with no scroll — a real
  break (a consumer, `generate-sheet`, was hand-rolling its own inner scroll).
  Scroll is default behaviour, not a prop: an off-screen footer is never wanted.

## 2026-06-24 12:07 — banded header / body / footer (consistency with Modal)

- Files: `Dialog.scss`, `Dialog.stories.tsx`
- What: promoted Modal's banded layout into the Dialog primitive base so the bare
  Dialog matches Modal. `__content` padding → 0, `__dialog` gap → 0; bands now
  self-pad: header `24/24/12` (title↔desc gap 4), footer `12/24/24` with NO
  divider line (was a hairline border-top + 16px bleed), and a loose-body rule
  (`__dialog > :not(header/footer/close/.klyp-Modal__body)`) gives stray body
  content the `12/24` band. Close inset `8 → 16`; the title reserves right space
  (`:has(> __close)`) so a long title can't run under the absolute ✕. Removed the
  story's manual `padding: 0 24px` body hack (the band owns it now).
- Why: design-lead — Dialog and Modal came out inconsistent; the bands were only
  Modal-level overrides. Modal's own header/footer overrides still win (it renders
  its close as a header flex-sibling), so Modal is visually unchanged.
- Verified: computed styles (content 0, header 24/24/12, footer 12/24/24 border-top
  0, close 16) + the loose-body rule live in the CSSOM (`12/24`).

## 2026-06-24 09:41 — close button size icon-sm → icon (32px)

- Files: `Dialog.tsx`
- What: the absolute close button is now `size="icon"` (32px box, 20px glyph)
  instead of `icon-sm` — the ✕ no longer crowds/overflows the button. (The brand
  `Modal` renders its own flex-sibling close; this affects raw `Dialog`
  consumers, kept consistent at 32px.)
- Why: design-lead — 32px close with the glyph squarely inside.

## 2026-06-24 09:05 — close button → secondary variant

- Files: `Dialog.tsx`
- What: the top-right ✕ close button rendered by `DialogContent`
  (`showCloseButton`) is now `variant="secondary"` (rounded-square icon button
  with a hairline border + surface fill) instead of `ghost`. Size unchanged
  (`icon-sm`).
- Why: design-lead — the modal close is "always a Secondary icon button" across
  the modal system; one place (the primitive) so every Dialog/Modal inherits it.
- Blast radius: shared `@klyp/ui` primitive — every Dialog/Modal close picks up
  the bordered secondary look. Intended systematization.
