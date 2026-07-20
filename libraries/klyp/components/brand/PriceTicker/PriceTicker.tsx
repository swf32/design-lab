import { AnimatePresence, motion, type Transition, useReducedMotion } from 'motion/react'

import './PriceTicker.scss'

// =====================================================================
// PriceTicker — blur+Y crossfade animated price.
// =====================================================================
//
// Replaces PricingTierCard's home-grown `heldStrike` / `onTransitionEnd`
// machinery (2026-05-22). Motion v12 owns all timing.
//
//   • Strike chip (LEFT, struck-through `previousValue`) enters/exits via
//     AnimatePresence; root `layout` animates row width when it does.
//   • Live price digits crossfade per-value: old exits 140ms ease-in
//     (`opacity → 0`, `y → -4px`, `blur(0 → 2px)`), new enters 220ms with
//     Klyp signature easing in the reverse direction. Asymmetric per Emil:
//     "exit faster than enter" — глаз цепляется за то, что приходит.
//   • Width stability: visibility-hidden sizer span claims the new value's
//     width in flow; live `__current` overlays position-absolute. No layout
//     jitter from tabular-nums on digit-count change ($169 → $152.10).
//   • Reduced-motion: pure opacity 120ms, no transform / no blur.
//
// A11y: aria-live REMOVED from the live price (the page-level
// `__billingAnnouncer` in pricing-page.tsx is the single SR voice per
// toggle flip — otherwise a 4-card grid produced 5 announces per click).
// The visible motion.span text is still read by SR users when navigating
// over the card; the sizer is aria-hidden.

const KLYP_EASE = [0.16, 1, 0.3, 1] as const

// New value arriving — Klyp signature easing, 220ms (= --duration-normal).
const ENTER_TRANSITION: Transition = { duration: 0.22, ease: KLYP_EASE }

// Old value leaving — faster ease-in (Emil: exit faster than enter).
const EXIT_TRANSITION: Transition = { duration: 0.14, ease: [0.4, 0, 1, 1] }

// Layout — strike enter/exit pushes the row width; matches ENTER cadence.
const LAYOUT_TRANSITION: Transition = { duration: 0.22, ease: KLYP_EASE }

// Strike chip — slides in/out from the left at the layout cadence.
const STRIKE_TRANSITION: Transition = { duration: 0.22, ease: KLYP_EASE }

// Reduced-motion: pure opacity fade. Comprehension preserved, motion zero.
const REDUCED_TRANSITION: Transition = { duration: 0.12 }

export interface PriceTickerProps {
  /** Current price string, e.g. `'$26.10'`, `'€169'`. */
  value: string
  /**
   * Optional pre-discount / pre-toggle price. When set AND different from
   * `value`, renders as a struck-through chip to the LEFT of the live
   * digits. Pass `undefined` to suppress.
   */
  previousValue?: string
  /** Optional className appended to the root. */
  className?: string
}

export function PriceTicker({ value, previousValue, className }: PriceTickerProps) {
  const reduceMotion = useReducedMotion()
  const composed = ['klyp-PriceTicker', className].filter(Boolean).join(' ')
  const showStrike = Boolean(previousValue) && previousValue !== value

  // Strike chip enter/exit — slide in from the left, slide out to the left.
  const strikeInit = reduceMotion ? false : { opacity: 0, x: -8 }
  const strikeExit = reduceMotion ? undefined : { opacity: 0, x: -8 }

  // Live-price ENTER (new value arriving): blur in + down-translate to 0.
  const enterInit = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, filter: 'blur(2px)' }
  const enterAnim = reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }

  // Live-price EXIT (old value leaving): blur out + up-translate. Per-value
  // `transition` override so exit uses the fast ease-in while enter keeps
  // the Klyp easing.
  const liveExit = reduceMotion
    ? { opacity: 0, transition: { duration: 0 } }
    : { opacity: 0, y: -4, filter: 'blur(2px)', transition: EXIT_TRANSITION }

  return (
    <motion.span layout="position" className={composed} transition={{ layout: LAYOUT_TRANSITION }}>
      {/* `mode="popLayout"` — when the strike chip exits, Motion sets it to
       * position:absolute IMMEDIATELY so the live-price sibling can re-claim
       * the freed flex slot. Without popLayout the chip stays in flex flow
       * for the full exit duration (140ms+) and the live price teleports
       * left only after the chip unmounts. With popLayout: chip exits in
       * place visually while the live-price `__currentWrap` FLIP-translates
       * smoothly into the freed space, in parallel. Same physics for enter
       * (default sync mode is fine on enter — the chip mounts into its flex
       * slot and Motion sees the layout shift on currentWrap). */}
      <AnimatePresence initial={false} mode="popLayout">
        {showStrike && (
          <motion.span
            layout="position"
            className="klyp-PriceTicker__previous"
            initial={strikeInit}
            animate={{ opacity: 1, x: 0 }}
            exit={strikeExit}
            transition={{ ...STRIKE_TRANSITION, layout: LAYOUT_TRANSITION }}
            aria-label={`Original price ${previousValue}`}
          >
            {previousValue}
          </motion.span>
        )}
      </AnimatePresence>
      {/* `layout="position"` — when the strike chip enters/exits, this
       * wrap's flex position shifts (right when chip claims width, left
       * when chip vacates). Motion FLIP-translates the shift over the
       * LAYOUT_TRANSITION cadence so the live price smoothly slides
       * instead of teleporting. `="position"` (not boolean `layout`)
       * keeps it to translate-only — no scale distortion on the digits. */}
      <motion.span
        layout="position"
        className="klyp-PriceTicker__currentWrap"
        transition={{ layout: LAYOUT_TRANSITION }}
      >
        {/* Sizer in flow — claims width of the live value so the wrap
         * box stays the right size during the crossfade. Hidden from SR. */}
        <span className="klyp-PriceTicker__currentSizer" aria-hidden="true">
          {value}
        </span>
        <AnimatePresence initial={false}>
          <motion.span
            key={value}
            className="klyp-PriceTicker__current"
            initial={enterInit}
            animate={enterAnim}
            exit={liveExit}
            transition={reduceMotion ? REDUCED_TRANSITION : ENTER_TRANSITION}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </motion.span>
  )
}

export default PriceTicker
