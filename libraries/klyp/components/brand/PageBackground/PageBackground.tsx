import { motion, useReducedMotion } from 'motion/react'

import './PageBackground.scss'

/**
 * Ambient decorative layer for Story Mode (Episode editor).
 * Warm gold glows on cool canvas. Opt-in via AnimatePresence in __root.tsx —
 * enters with staggered fade (0.2s + 0.4s delays), exits as a single fade.
 * Respects `prefers-reduced-motion` — renders instantly without animation.
 */
export function PageBackground() {
  const reduce = useReducedMotion()

  // ease-out-expo — confident, non-bouncy deceleration (see animate skill).
  const easeOutExpo = [0.16, 1, 0.3, 1] as const
  const enter = (opacity: number, delay: number, duration: number) => ({
    initial: { opacity: 0 },
    animate: { opacity },
    exit: { opacity: 0 },
    transition: reduce ? { duration: 0 } : { duration, delay, ease: easeOutExpo },
  })

  return (
    <motion.div
      aria-hidden
      className="klyp-PageBackground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.45, ease: easeOutExpo }}
    >
      {/* Top-right gold-to-transparent radial glow — primary blob.
       * Per design lead 2026-05-06: target opacities reduced 25% across all four
       * layers (0.3 → 0.225, 0.125 → 0.094, 0.06 → 0.045, 0.25 → 0.188)
       * so the ambient layer recedes further behind content without
       * losing the warm-gold cue. */}
      <motion.div className="klyp-PageBackground__glowTopRight" {...enter(0.225, 0.2, 0.9)} />

      {/* Warm light sweep left — secondary blob, staggered */}
      <motion.div className="klyp-PageBackground__sweepLeft" {...enter(0.094, 0.4, 1.1)} />

      {/* Dot grid — 1px circle dots spaced at 24px. Layer opacity 0.045
       * (was 0.06; 25% reduction batch). User feedback 2026-04-28:
       * "сетку оставь такую, точки 1px". */}
      <motion.div className="klyp-PageBackground__dotGrid" {...enter(0.045, 0.1, 0.6)} />

      {/* Bottom "sun" — elliptical gold blob sinking below the viewport,
       * peeks out from under the prompt-input as a horizon glow.
       * User feedback 2026-04-28: "блоб снизу в 2 раза меньше" — 700×240
       * (was 1400×480). 3:1 ellipse, centred horizontally, sinks 15%
       * below the fold so only the upper crescent is visible. */}
      <motion.div className="klyp-PageBackground__sun" {...enter(0.188, 0.5, 1.0)} />
    </motion.div>
  )
}
