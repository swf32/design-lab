import './Popover.scss'

import { motion, useReducedMotion } from 'motion/react'
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Popover as RACPopover, type PopoverProps as RACPopoverProps } from 'react-aria-components'

export interface PopoverProps extends Omit<RACPopoverProps, 'className' | 'children'> {
  /**
   * Background treatment.
   * - `solid` (default) — opaque surface, best for long lists where blur
   *   makes text harder to read (model pickers, history menus).
   * - `glass` — translucent + backdrop blur, for short hero-style popovers
   *   with mixed content (profile menu).
   */
  surface?: 'solid' | 'glass'
  /**
   * Custom thin scrollbar (visible on hover). Default `true`.
   * Disable for popovers that never overflow.
   */
  scrollbar?: boolean
  /**
   * Opt-in staggered child reveal. When `true`, the popover's DIRECT
   * children fade + rise in a quick cascade on open (mirrors the Dropdown
   * per-item stagger, but for a Popover's arbitrary children). Default
   * `false` — when the prop is absent NO `data-stagger` attribute is
   * emitted, so existing consumers render byte-for-byte unchanged.
   *
   * Reconcile note: under stagger the CONTAINER softens to an opacity-only
   * entrance and the CHILDREN carry the translate/scale, so the panel and
   * its rows read as ONE cascade rather than panel-scale fighting child-rise
   * (see Popover.scss). Children are not JS-index-injected, so the cascade
   * is driven by CSS `:nth-child` (capped at ~10 rows).
   */
  staggerChildren?: boolean
  /**
   * Opt-in smooth height morph. When `true`, the popover GLIDES between
   * content heights whenever its content changes height WHILE it stays open
   * (e.g. a settings panel whose body grows/shrinks as you switch modality
   * tabs) — instead of jumping to the new height. Default `false` — when the
   * prop is absent NO wrapper + NO `data-animate-height` attribute are
   * emitted, so existing consumers render byte-for-byte unchanged.
   *
   * Mechanism mirrors `Button`'s `animateWidth` (Button.tsx
   * `ButtonFluidStatic`) but on the HEIGHT axis: an inner box animates the
   * REAL `height` property (Motion `tween`, no spring/FLIP-scale so it can't
   * overshoot) to the natural content height that a nested measuring element
   * provides; measured in a `useLayoutEffect` after every render so the morph
   * starts the same frame the content commits. The RAC root keeps owning its
   * positioning — it just sizes to the box, so RAC repositions on the size
   * change (no fight). This is for content-driven height changes WHILE open,
   * NOT the open/close entrance (which the `klyp-Popover-in/out` keyframes
   * still own). `prefers-reduced-motion` → instant (same `useReducedMotion`
   * gate as Button). Composes with `staggerChildren` (see Popover.scss).
   */
  animateHeight?: boolean
  /**
   * Optional FIXED footer — rendered AFTER `children`, OUTSIDE the
   * `animateHeight` morph box. Use for a region that must stay PUT while the
   * morphing content above it grows/shrinks (e.g. a bottom modality tab bar in
   * a top-placed settings popover, which would otherwise drift as the panel
   * height changes). No effect on consumers that don't pass it.
   */
  footer?: ReactNode
  /** Extra className appended to the popover root for callsite tweaks. */
  className?: string
  children: ReactNode
}

// Height-morph transition for `animateHeight`. Mirrors Button's `WIDTH_MORPH`
// (Button.tsx) byte-for-byte in shape: a TWEEN on the real `height` property
// (NOT a spring, NOT a FLIP scale) — so the panel physically cannot overshoot
// or wobble, it eases to the new height and stops. Same proven timing/easing as
// Button's width morph so the two read as one motion language.
const HEIGHT_MORPH = { type: 'tween', duration: 0.16, ease: 'easeInOut' } as const

/**
 * Popover — shared popover chrome for BrandSelect / BrandMenu /
 * ad-hoc RAC trigger surfaces. Replaces the bare `<Popover>` import from
 * `react-aria-components`; one component owns radius, border, shadow,
 * entrance animation, optional glass blur, and custom scrollbar.
 *
 * Must be a direct child of an RAC trigger (`MenuTrigger`, `Select`,
 * `DialogTrigger`) so positioning + a11y wiring happens automatically.
 */
export function Popover({
  surface = 'solid',
  scrollbar = true,
  staggerChildren = false,
  animateHeight = false,
  className,
  children,
  footer,
  offset = 8,
  ...rest
}: PopoverProps) {
  return (
    <RACPopover
      {...rest}
      offset={offset}
      data-surface={surface}
      data-scrollbar={scrollbar ? 'true' : 'false'}
      // Emit the attr ONLY when on — keeps non-stagger consumers' DOM unchanged.
      data-stagger={staggerChildren ? 'true' : undefined}
      // Likewise opt-in: absent attr = byte-for-byte-unchanged DOM for everyone
      // who doesn't ask for the height morph.
      data-animate-height={animateHeight ? 'true' : undefined}
      className={['klyp-Popover', className].filter(Boolean).join(' ')}
    >
      {animateHeight ? <PopoverHeightMorph>{children}</PopoverHeightMorph> : children}
      {/* Optional FIXED footer — rendered AFTER the content, OUTSIDE the*/}
      {/* height-morph box, so it stays put while the morphing content above it*/}
      {/* grows/shrinks (e.g. a bottom tab bar in a top-placed settings popover).*/}
      {/* The RAC root is a flex column, so the footer pins to the bottom edge.*/}
      {footer}
    </RACPopover>
  )
}

// === Opt-in height morph ============================================
// Extracted so the DEFAULT (no animateHeight) path carries ZERO motion hooks
// and no measure-on-mount cost — mirrors how Button keeps `ButtonFluidStatic`
// off the static branch. An inner `__heightInner` element holds the content at
// its NATURAL height (its offsetHeight is the true target, independent of the
// box's animated height — the height-axis analogue of Button's max-content
// `__fluidContent`). After every render a `useLayoutEffect` (synchronous,
// pre-paint) measures it and animates the box's REAL `height` to it, so the
// morph starts the same frame the content commits (no lag). `initial={false}`
// → no mount animation: the box snaps to the first measured height under the
// entrance, then animates only on subsequent content-height changes.
// `prefers-reduced-motion` → instant (Motion `useReducedMotion`, same as
// Button's width morph).
function PopoverHeightMorph({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion()
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(undefined)
  // True when the latest height change came from the ResizeObserver — i.e. the
  // content is animating ITSELF (a DS Accordion expanding). Then the box SNAPS
  // to track it 1:1 (the content's own transition is the visible animation; a
  // second tween chasing it just lags = the "Advanced opens slowly / not native"
  // bug). The box TWEENS only on render-driven DISCRETE swaps (a modality
  // switch), which arrive through the layout effect with this flag false.
  const instantRef = useRef(false)

  // Re-measure after every render. A content SWAP (modality change) re-renders
  // with new children → tween to the new natural height (the glide).
  useLayoutEffect(() => {
    const inner = innerRef.current
    if (!inner) return
    instantRef.current = false
    setHeight(inner.offsetHeight)
  })

  // A ResizeObserver re-measures on ANY inner size change — not just on OUR
  // re-renders. Critical for content that grows via its OWN internal state
  // WITHOUT re-rendering the popover (a DS Accordion expanding, async data
  // arriving): the layout effect only fires on our renders, so without this the
  // box would freeze + CLIP the new content. Snapping (instantRef) makes the box
  // mirror the content's own animation frame-by-frame with no chase lag. Setting
  // the same height bails out, so no loop.
  useEffect(() => {
    const inner = innerRef.current
    if (!inner || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      instantRef.current = true
      setHeight(inner.offsetHeight)
    })
    ro.observe(inner)
    return () => ro.disconnect()
  }, [])

  // While the height is actively tweening the content is taller/shorter than
  // the box for up to ~160ms — the popover ROOT (overflow-y: auto) would grow
  // a transient scrollbar/gutter and the content would jump 6px (Val
  // 2026-07-03: "скроллбар на миллисекунду при переключении табов"). Stamp
  // `data-morphing` on the root for the tween's lifetime; Popover.scss clips
  // the root's overflow ONLY during that window. Imperative attribute (not
  // state) — no extra renders on every morph.
  const setMorphing = (on: boolean) => {
    const root = innerRef.current?.parentElement?.parentElement
    if (!root) return
    if (on) root.setAttribute('data-morphing', 'true')
    else root.removeAttribute('data-morphing')
  }

  return (
    <motion.div
      className="klyp-Popover__heightBox"
      animate={height != null ? { height } : undefined}
      initial={false}
      transition={reduceMotion || instantRef.current ? { duration: 0 } : { height: HEIGHT_MORPH }}
      onAnimationStart={() => setMorphing(true)}
      onAnimationComplete={() => setMorphing(false)}
    >
      <div ref={innerRef} className="klyp-Popover__heightInner">
        {children}
      </div>
    </motion.div>
  )
}

export default Popover
