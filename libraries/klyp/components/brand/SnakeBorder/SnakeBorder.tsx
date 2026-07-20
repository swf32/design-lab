import './SnakeBorder.scss'

import type { CSSProperties, ReactNode } from 'react'

// `settled` — a terminal, retired ring: no rotation animation, no glow filter,
// opacity 0. MediaFrame flips to it AFTER the reveal fade completes so the
// generating ring stops compositing over the now-playing media (see MediaFrame).
export type SnakeBorderState = 'idle' | 'ambient' | 'generating' | 'submit' | 'settled'

type SnakeBorderProps = {
  /** Animation state. Parent controls transitions. */
  state?: SnakeBorderState
  children: ReactNode
  className?: string

  /**
   * Snake color. Accepts any CSS color value.
   * Default: --gold-400.
   */
  color?: string

  /**
   * Override snake border width. Default: 2px.
   * Pass a CSS length string, e.g. "1px" or "3px".
   */
  borderWidth?: string

  /**
   * Duration of one full rotation. For `ambient` the default is 6s; for
   * `generating` it is `duration / 2.5` (faster arc) unless `intensity="bold"`
   * is set, where the raw `duration` drives the rotation (default 3.6s there).
   */
  duration?: string

  /**
   * Visual intensity of the `generating` head.
   *
   * - `'default'` (default) — the legacy thin ~50deg accent spike at `/2.5`
   *   speed, `glow` honoured only on `submit`. Every existing consumer
   *   (canvas nodes, ambient cards) keeps this look unchanged.
   * - `'bold'` — opt-in wide ~180deg cone with a white-hot core, `glow`
   *   honoured on `generating`, and the raw `duration` (default 3.6s) drives
   *   rotation. Used by the chat GeneratingFrame.
   */
  intensity?: 'default' | 'bold'

  /**
   * Conic gradient center position.
   * "50% 50%" = even perimeter distribution (default, good for cards/panels).
   * "50% 200%" = concentrated on bottom edge (good for inputs).
   */
  center?: `${string} ${string}`

  /**
   * Add a synced multi-layer drop-shadow halo that follows the snake shape.
   * Honoured on `ambient` always, and on `generating` only when
   * `intensity="bold"` (the `submit` burst has its own halo regardless).
   * Colour follows `color` / `--snake-color`. Off by default.
   */
  glow?: boolean
}

/**
 * Animated snake border — wraps any block with a Warm Gold conic-gradient ring.
 *
 * Usage:
 *   <SnakeBorder state={state}>
 *     <MyCard />
 *   </SnakeBorder>
 *
 * The wrapper adds `position: relative`. Pass className to adjust display,
 * sizing, or border-radius as needed. The ring inherits border-radius.
 *
 * Custom color example (AI blue):
 *   <SnakeBorder state="generating" color="#60a5fa">
 */
export function SnakeBorder({
  state = 'idle',
  children,
  className,
  color,
  borderWidth,
  duration,
  center,
  glow = false,
  intensity = 'default',
}: SnakeBorderProps) {
  const cssVars = {
    ...(color && { '--snake-color': color }),
    ...(borderWidth && { '--snake-width': borderWidth }),
    ...(duration && { '--snake-duration': duration }),
    ...(center && {
      '--snake-cx': center.split(' ')[0],
      '--snake-cy': center.split(' ')[1],
    }),
  } as CSSProperties

  // Note: the inner ring carries both `klyp-SnakeBorder__ring` (new BEM) and
  // `snake-ring` (legacy class). The old per-callsite `.media-skel-root`
  // override that relied on `snake-ring` was retired (its look is now the
  // opt-in `intensity="bold"` head); the legacy class is kept for any external
  // scoped override still targeting `snake-ring[data-state]`.
  const rootClass = ['klyp-SnakeBorder', className].filter(Boolean).join(' ')

  return (
    <div
      data-slot="snake-border"
      data-state={state === 'submit' ? 'submit' : undefined}
      className={rootClass}
      style={Object.keys(cssVars).length ? cssVars : undefined}
    >
      <div
        aria-hidden
        className="klyp-SnakeBorder__ring snake-ring"
        data-state={state}
        data-glow={glow ? 'true' : undefined}
        data-intensity={intensity === 'bold' ? 'bold' : undefined}
      />
      {children}
    </div>
  )
}
