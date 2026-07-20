# VoiceDictation — changelog

## 2026-07-02 18:42 — cover ✗/✓ pin by CSS mirror, JS measurement removed

- What: in `cover` mode the ✗ ✓ cluster now lands EXACTLY on the mic / Send
  slots via pure CSS that mirrors the composer footer's own geometry (same
  `--control-size-md` 36px squares, the footer's `--space-8` gap instead of the
  bar's 6px, `border: 0` + `padding-right: 0` so ✓ pins flush to the footer's
  right edge = the Send slot). Deleted the press-time `measureMicSlot`
  getBoundingClientRect + `--vd-cover-pad-right` machinery entirely. The
  measured approach was systematically off — computed by hand from source:
  ✗ −1px (the face's 1px transparent border was unaccounted), ✓ −3px (border +
  the deliberate "a touch left" 6-vs-8 gap mismatch) — and drifted arbitrarily
  on window resize mid-recording (one-shot measure) or fell back to a 46px-off
  `--space-48` default when unmeasured (previews). The CSS mirror holds at any
  width and survives live resize. Contract documented on the `cover` prop: the
  mic must sit immediately before a square `--control-size-md` control at the
  end of the row (the composer footer does).
- Why: Val — the buttons still shifted when recording starts; mic must turn
  into ✗ and Send into ✓ IN PLACE, verified by computing every offset in code.

## 2026-06-30 00:04 — cover overlay bg → composer panel token

- What: the `cover`-mode recording overlay fill changed `--color-bg-canvas` (#121212) → `--color-bg-panel` (#181818) — the SAME token the composer chassis (PromptField) uses. The soundwave overlay now matches the composer surface exactly instead of reading as a darker "black" band.
- Why: Val — the soundwave background looked black / didn't match the composer; align it to the composer's bg token. (Token drift: the comment already said "the panel colour" but the value was never updated when `--color-bg-panel` was introduced 2026-06-29.)

## 2026-06-29 03:52 — mic-face resting border 5% → 3%

- What: collapsed mic `__face` resting `border` `var(--color-border-subtle)` (5%) → `var(--alpha-white-03)` (3%). Hover still → `--color-border-default` (10%); the recording bar (holding / toggle) stays border-less.
- Why: Val — match the Button resting-border quieting (3% alpha) on the composer mic button.

## 2026-06-29 02:41 — fix: recording bar never appeared (regression from the P1 leak fix)

- What: pressing the mic started capture but the recording bar never showed
  (status stuck on `requesting`). Root cause: the P1 mic-leak fix's `disposedRef`
  was set `true` by the unmount-effect cleanup but never reset on mount — under
  React StrictMode (dev, `main.tsx` wraps the app) the effect double-invokes
  (mount → cleanup → mount), so `disposedRef` latched `true` and every `start()`
  bailed right after `getUserMedia`. Fix: reset `disposedRef = false` in the
  mount-effect body, so it's only `true` after a real unmount.
- Why: regression I introduced in the prior audit P1 fix — caught it the moment
  Val hit it in /chat.

## 2026-06-29 00:58 — mic-button hover

- What: the collapsed mic button now lightens on hover (bg `--color-bg-surface-
  solid` → `--color-bg-surface-hover`, border `--color-border-subtle` →
  `--color-border-default`) like the other footer controls. Native `:hover`
  (the face is a plain div, not a RAC Button, so it has no `data-hovered`),
  scoped to exclude the recording bar (holding/toggle — stays box-less), the
  transcribing spinner, and the disabled state. Instant (no transition) so it
  never bleeds into the instant mic↔bar swap. Verified live: rest #222 →
  hover #2f2f2f, border 0.05 → 0.10.
- Why: Val — the voice-input button had no hover feedback.

## 2026-06-28 22:43 — stable + multi-agent audit fixes

- What: promoted to **stable** in the catalog registry (status beta→stable;
  summary trimmed to ≤80 chars + "pill"→"bar"). Fixed every confirmed finding
  from a 5-dimension multi-agent audit (DS / code / a11y / stories / polish,
  each adversarially verified):
  - **P1 — mic/resource leak:** `useAudioRecorder.start()` now guards a
    `disposedRef` right after `await getUserMedia`; an unmount while the
    permission prompt is open no longer lets a late grant start an
    un-releasable recording (OS mic stuck on + MediaStream/AudioContext/timer
    leak + phantom STT call ~2 min later).
  - **P2:** added story `argTypes` (the catalog Playground gated on it → no
    controls); `120ms` transition literals → `var(--duration-fast)`.
  - **P3:** dropped the permanently-false `aria-pressed` from the collapsed
    face; error message no longer announced twice (face label kept generic, the
    `role=alert` carries it); `permission` now announced via the live region
    (`requesting`); `transcribing` focus retargets the live `__face` (was a dead
    `.__cancel` selector); the swipe `armed` latch is cleared on tap→toggle;
    window pointerup/cancel listeners get an unmount cleanup; `outline-offset`
    `2px`→`var(--space-2)`; canvas `#ffffff` fallback → `white`. Added a `Cover`
    story. (Skipped: a cover-inset re-measure — the footer Spacer absorbs window
    resize so the mic slot doesn't actually drift; and an "invalid" multi-pointer
    finding the verifier refuted.)
- Why: Val — make the component canon-correct + thoroughly verified (code +
  visual + all rules, multi-agent) before promoting to stable so other FE devs
  can copy it cleanly.

## 2026-06-28 16:07 — toolbutton-solid + transcribe-spinner + swipe-bg

- What: (1) after ✓, the mic shows a spinner while transcription runs in the
  background (`transcribing` view → `<Spinner>` in the mic glyph + `aria-busy`),
  so there's feedback instead of a dead pause. (2) The swipe-armed state now
  lights up the control's BACKGROUND + border (not just a scale): red for ✗
  (cancel), gold for ✓ (done), via `[data-armed]`. (3) ✗ ✓ moved to ToolButton's
  new `solid` variant — the boxed surface + border + full-opacity chrome now
  comes from the variant, so VoiceDictation only keeps the brand specifics: the
  danger-red ✗ glyph and the gold/red armed highlight (gold can't live in
  pure-UI ToolButton). Verified the armed gold/red apply (transition-disabled
  read).
- Why: Val — show a loading state after ✓; highlight the ✗/✓ background on swipe;
  make the boxed buttons a proper ToolButton state rather than an override.

## 2026-06-28 01:35 — always-show-icons-swipe-to-act

- What: `holding` now renders the SAME `[ wave · timer · ✗ · ✓ ]` as `toggle` —
  the "Slide away to cancel" text is gone, so nothing shifts between the two
  states. During a hold, a swipe past the threshold arms an action by dominant
  axis (right / up → ✓ done, left / down → ✗ cancel); the armed icon pops
  (`scale 1.22`) and the release fires it (release with no swipe = done).
  Replaced the boolean `slideArmed`/`slideCancelRef` with a directional
  `armed`/`armedRef` (`'cancel' | 'done' | null`); removed the `__hint` element.
- Why: Val — don't show the slide-hint text on hold (it moved the layout); keep
  the icons visible always and let a swipe trigger ✗ or ✓.

- What: ✗ ✓ bumped from `size="sm"` (32px) to `size="md"` (40px) so they match
  the mic button exactly — 40×40, `--r-chip` corner, surface + border chrome at
  full opacity (overriding ToolButton's transparent base). The cover-overlay
  right inset retuned `--space-64` → `--space-48` for the wider controls so ✗
  still lands over the mic. Armed pop softened to `scale 1.1`.
- Why: Val — make ✗ ✓ the same size + border-radius as the chat mic/other 40px
  buttons.

- What: the cover-overlay right inset is now MEASURED, not a fixed token. At
  press time (`measureMicSlot` in onFacePointerDown / onFaceKeyDown — layout is
  settled then, unlike at mount where the model pill is still reflowing) the
  resting mic slot is read via `getBoundingClientRect` and the exact px is
  written to `--vd-cover-pad-right`, so ✗ lands EXACTLY over the mic (verified
  live: pad 54 → ✗ left 602 = mic left) regardless of the Send button's width.
  Replaced the mount-time `useLayoutEffect` + ResizeObserver (which missed the
  mic's position shift when the pill reflowed, leaving a ~3px drift).
- Why: Val — the mic still shifted; compute the position exactly so it doesn't.

## 2026-06-28 01:00 — no-box-running-waveform

- What: the recording bar lost its box — `holding`/`toggle` drop the surface +
  border so the waveform reads as "running" directly on the canvas; the `cover`
  overlay fills with `--color-bg-canvas` (the composer panel colour) so it
  blends seamlessly while still hiding the footer controls. The waveform itself
  is now a SCROLLING history (Claude-style): each ~55ms the loudest sample
  pushes in on the right and the bars slide left (older bars fade), instead of
  the old centred real-time pulse. Denser thin bars (pitch 7, 12–96 count). The
  catalog preview / reduced-motion shows a frozen `sampleAmp` silhouette.
- Why: Val — drop the background, make the wave "run" like the Claude composer.

- What: thinner waveform ticks (`BAR_DUTY` 0.6 → 0.42, ~30% thinner). In `cover`
  mode the ✗ ✓ cluster is inset off the right edge by `--space-64` (~the Send
  footprint, measured: footer 742 / Send 92 / mic centre 622) so ✗ stays put
  where the mic sat and ✓ lands a touch left of the composer edge.
- Why: Val — thinner ticks; keep the mic/✗ in place, ✓ slightly inset.
- Note: the `--space-64` inset is tuned to the current "Generate" button width;
  a very different Send label width would shift the ✗-over-mic alignment.

## 2026-06-28 00:44 — instant-swap-full-width-cover-bar

- What: dropped the morph/expand animation entirely (Motion `layout`/`width`/
  `AnimatePresence` all removed) — recording is now an INSTANT swap of the mic
  button ↔ a full-width recording bar. New bar order matches the Claude composer:
  `[ waveform (fills the left) · timer · ✗ · ✓ ]` — ✓ rightmost, ✗ to its left.
  New `cover` prop: while recording, the bar lifts into a full-width ABSOLUTE
  overlay over its (now `position:relative`) parent — wired in the chat composer
  so it covers the whole footer (Send hidden → can't be hit while dictating).
  New `closing` latch set on ✗/✓ so the bar collapses to the mic AT ONCE — fixes
  the flash of the gold `holding` dot that appeared on cancel. `transcribing` is
  now a collapsed (background) state — nothing pops up on ✓; the text just lands
  in the field when STT resolves. Removed the dot, the busy/spinner label, the
  `__pill` wrapper, and the `__micFace`→`__micGlyph` rename; ✗/✓ stay ToolButtons.
- Why: Val — the expand animation was disliked + buggy (jitter/ghost on close);
  the recording UI must take over the full prompt-input width and replace Generate
  so you can't accidentally send mid-dictation, with the wave on the left and
  ✗/✓ on the right. No animation — just a clean swap.

## 2026-06-27 23:30 — morph-mic-into-pill

- What: the mic is no longer a separate `@klyp/ui` Button beside the pill — it IS
  the collapsed state of ONE morphing `__face` element. The face animates its
  REAL `width` (40px square → `auto` / `100%`) with a fast eased-out non-linear
  curve (`0.24s` `cubic-bezier(0.16,1,0.3,1)`), so it grows straight out of the
  square (no thinning) and the canvas reflows DPR-crisp (an earlier Motion
  `layout` build animated via transform, which distorted the waveform and made
  the button thin before expanding — both fixed by animating width directly).
  `AnimatePresence` cross-fades the mic glyph ↔ pill content — the mic is an
  ABSOLUTE overlay (no `popLayout`) so the pill stays the single in-flow child:
  on close it shrinks WITH the face (clipped) instead of being popped to a
  fixed-width absolute "ghost" that jittered against the width spring. The chrome
  (surface + border + `--r-chip`) lives on the face so the button surface flows
  continuously into the pill. ✗ / ✓ stay square `ToolButton`s. The press gesture
  moved off the (unmounting) mic onto the stable face via native pointer events +
  a window pointer-up (hold-to-talk never loses its release mid-morph); keyboard
  Enter/Space = tap. `collapsed` faces are `role=button`, `expanded` `role=group`.
  Reduced-motion → instant. Removed the old `klyp-vd-in` entrance + the `__mic`
  Button.
- Why: Val — the mic button should visibly open into the pill (waveform · ✗ · ✓)
  with a quick non-linear animation and collapse back on ✓/cancel, as a single
  element — straight out of the square, waveform intact.

## 2026-06-27 21:54 — fluid-pill-adaptive-waveform

- What: new `fluid` prop — when set, the control fills its container width
  (`data-fluid` → root `display:flex; width:100%`, pill `flex:1`) and the
  waveform grows (`flex: 1 1 --space-96`). The waveform's bar COUNT is now
  dynamic — computed from the canvas width (~1 bar / `BAR_PITCH` 9px, clamped
  9–64, kept odd for a clean mirror centre) so a wide pill gets more bars at a
  constant density instead of a few stretched ones. `restHeights(bars)` replaces
  the fixed `REST_HEIGHTS`. Default (no prop) stays intrinsic width —
  composer-footer-safe. Adaptive story now renders the pill `fluid` at 280/600/
  1200 (verified: pill fills frame, wave 131→451→713px).
- Why: Val — the recording pill should be adaptive width (it was a fixed ~230px
  chunk); for the full-width "field-becomes-pill" surface the waveform must fill
  the row and stay dense at any width.

## 2026-06-27 20:56 — toolbutton-inner-controls-pill-as-button

- What: the pill's Cancel/Done now use `@klyp/ui` **ToolButton** (the DS icon-
  toolbar button) — Cancel = `danger` (red), Done = `ghost` (**neutral, no gold**),
  normal **6px** corners (reverted the fully-round override). The **mic stays a
  regular `@klyp/ui` Button** (`primary`, matches the attach `+`, 16px glyph) and
  expands into the pill on record. Pill made to read like a Button surface: clean
  even 1px border (`--bw-default`), **inner-highlight box-shadow removed**, radius
  `radius-full` → **`--r-chip` (10px)**, and `padding-inline` → **`--space-4`** so
  left/right matches the 4px top/bottom inset of the 32px inner controls. Focus
  management moved to `querySelector` (ToolButton doesn't forward a ref). Adaptive
  story frames clamp to `min(px,100%)` + `min-width:0` → no more card overflow.
- Why: Val — round inner buttons clashed with the round pill and the pill border/
  padding read uneven; ToolButton is the correct DS component for the in-pill icon
  actions, and the pill should look like a plain Button surface.

## 2026-06-27 16:09 — composer-consistency-and-pill-polish

- What: mic button `variant` ghost → **primary** so it matches the composer's
  attach `+` (filled `--color-bg-surface-solid` + subtle border) instead of
  floating as the only surfaceless control. Recording pill polished —
  `--radius-full` lozenge + raised solid surface + inner top-highlight, focal
  white timer (`--color-fg-primary`), chunkier waveform (BAR_COUNT 15→11, duty
  0.56, amplitude-driven brightness + edge falloff, stronger resting silhouette)
  and a `ResizeObserver` so the canvas stays crisp at every width.
- Why: live composer audit (Playwright + 3 design agents) — Val: the mic
  "looks inconsistent and shit". Root cause = ghost-vs-filled mismatch; the
  waveform read as a thin generic "barcode" and the pill melted into the footer.

- What: new `VoiceDictation` brand molecule — composer mic button + recording
  pill (live `<canvas>` waveform + tabular-nums timer + Cancel/Done) with a 6-state
  machine (idle / permission / holding / toggle / transcribing / error). Trigger is
  tap-toggle + hold-to-talk (decided by press duration). Ships `useAudioRecorder`
  (getUserMedia + MediaRecorder + AnalyserNode, levels read outside React). Reuses
  `@klyp/ui` Button + Spinner and `@klyp/icons` Microphone/MicrophoneSlash/Check/
  CloseCircle outline glyphs. Decoupled from the backend via `onTranscribe` /
  `onResult` props. Transcript is appended at the cursor — never auto-sent.
- Why: stakeholder wants the fastest, most convenient voice input — a permanent
  separate mic next to Generate (not "mic-becomes-send"), dictate-in-chunks then
  edit & send. Backed by ElevenLabs Scribe v2 (batch) via a lean Convex action.
- Tier: brand molecule (`packages/brand/src/VoiceDictation/`).
