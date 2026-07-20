# Avatar — changelog

## 2026-06-26 07:13 — storybook-controls contract

- What: added `args` + `argTypes` over REAL props only (size / shape → select,
  loading → boolean) per the FE-team Storybook convention; `children` supplied
  as a default `<AvatarFallback>` ReactNode arg (not a control — raw text would
  render unstyled). No bespoke `Playground` story, no virtual args.
- Why: makes Avatar the reference example for the catalog ComponentPlayground
  and matches the FE team's convention doc (Default-style playground driven by
  native Controls) so designer + frontender see the same mental model — no
  visual / API change to the component itself.

## 2026-06-16 12:00 — handoff hardening

- What: (1) `Avatar/index.ts` now re-exports the `AvatarShape` and
  `AvatarBadgeTone` types (were defined in `Avatar.tsx` but missing from the
  barrel). (2) `Avatar.scss` — the reduced-motion skeleton fallback now uses
  `opacity: var(--opacity-70)` instead of the hardcoded `0.7`. No API,
  markup, or visual change.
- Why: handoff readiness. A frontender using the `shape`/`tone` props needs
  those union types importable from `@klyp/ui` — without the re-export they
  could not annotate their own wrappers and would re-type the unions by eye.
  The hardcoded `0.7` bypassed the semantic opacity token (Fix #2 of the
  pilot bar — semantic token, not a raw step).

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: AvatarBadge (packages/ui/src/Avatar/Avatar.tsx) now exposes an
  accessible status name. Added a tone → text mapping
  (online→Online, busy→Busy, away→Away, offline→Offline); when such a tone
  is present, the badge gets role="img" and aria-label. The default
  tone="accent" stays without a label (semantically empty, decorative).
  Callers can override via aria-label/role in props — the public API and
  markup are unchanged.
- Why: an empty span badge without text was not announced by screen
  readers, and blind users could not tell a person's status
  (online/busy/away/offline).

## 2026-05-17 01:54 — fix loading / image-error / badge clipping

- What: (1) skeleton pulse cadence aligned with Skeleton primitive
  (~1.6s opacity pulse) so loading no longer flashes; (2) AvatarImage
  effect loop fixed — `status` removed from deps, broken-src no longer
  re-mounts the img in a tight loop (visible mercaние on
  ImageLoadError story); (3) `overflow: hidden` dropped from
  `.klyp-Avatar` so AvatarBadge sits ON the rim instead of being
  clipped inside the circle. Image/fallback still round themselves via
  `border-radius: inherit`.
- Why: regressions surfaced on /components/avatar after the
  stable-readiness state additions (2026-05-17 00:47). All three were
  visual / behaviour bugs in stories added that day.

## 2026-05-17 01:00 — promote-to-stable

- What: Status flipped `beta` → `stable` in components-registry.ts; states audit confirmed full coverage.
- Why: Referenced as part of the /referrals catalog wave 2026-05-17.

## 2026-05-17 00:47 — stable-readiness states

- What: added xs / xl size tiers, square shape variant, loading skeleton,
  status-badge tones (online / busy / away / offline), plus stories for
  image-load-error fallback, image+initials, group with overflow count.
- Why: status will be promoted to stable; covers UX states real consumers
  hit on /referrals and elsewhere. All additions are opt-in props with
  defaults that preserve current behavior.
