import './Carousel.scss'

import { ArrowLeftOutline, ArrowRightOutline, PlayOutline, StopOutline } from '@klyp/icons'
import { Button } from '@klyp/ui/Button'
import { useReducedMotion } from 'motion/react'
import {
  Children,
  type ComponentProps,
  cloneElement,
  isValidElement,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

// =====================================================================
// Carousel — Klyp brand molecule
// =====================================================================
//
// Generic, presentational horizontal carousel (extracted from the academy
// Featured / "Continue reading" shelf). Takes a `title` + arbitrary card
// children.
//
// Behaviour:
//  - seamless infinite loop: children are tripled and the index resets across
//    the middle copy on transition end (or on the next frame under
//    reduced-motion, where the CSS transition never fires), so cards repeat
//    when they run out;
//  - auto-advance left every `autoplayMs` (default 3s); pauses while hovered
//    or focused, while the user has explicitly paused via the rotation-control
//    button, and is fully disabled under `prefers-reduced-motion`;
//  - smooth movement via the `--duration-slow` / `--easing-emphasis` tokens;
//  - prev / next arrows + a Play/Pause rotation control (always enabled — they
//    wrap).
//
// Accessibility (WAI-ARIA APG carousel pattern):
//  - the section is `aria-roledescription="carousel"` (only in loop mode);
//  - each slide is a `role="group"` / `aria-roledescription="slide"` with an
//    "N of M" label;
//  - the two off-screen tripled copies are `inert` + `aria-hidden` so AT and
//    Tab only ever reach the visible (centered) copy — no 3× duplication, no
//    off-screen focus traps;
//  - a visible, keyboard-reachable Play/Pause button satisfies WCAG 2.2.2
//    (Pause, Stop, Hide); hover/focus pause is an enhancement on top;
//  - the live region announces manual paging (`aria-live="polite"`) but stays
//    silent (`"off"`) while autoplay is running, so it never spams.
//
// With `loopThreshold` cards or fewer the loop is meaningless (it would just
// repeat the same card), so the component renders a plain responsive row with
// no track translate, no autoplay, and no arrows.

export interface CarouselProps extends Omit<ComponentProps<'section'>, 'title'> {
  /** Section heading shown above the track. */
  title: ReactNode
  /** Card children — each becomes one slide. */
  children: ReactNode
  /** Auto-advance interval in ms. Default 3000. Ignored under reduced motion. */
  autoplayMs?: number
  /** Disable auto-advance entirely (manual paging only). Default false. */
  autoplay?: boolean
  /**
   * How many cards are visible per view in loop mode (drives `grid-auto-columns`
   * via the `--klyp-carousel-per-view` custom property). Default 2.
   */
  perView?: number
  /**
   * Minimum cards required before the infinite loop + autoplay + arrows engage.
   * At or below this count the cards render as a static responsive row.
   * Default 2.
   */
  loopThreshold?: number
  /** Accessible label for the previous-page button. Default "Previous". */
  prevLabel?: string
  /** Accessible label for the next-page button. Default "Next". */
  nextLabel?: string
  /** Accessible label for the rotation control while playing. Default "Pause automatic slides". */
  pauseLabel?: string
  /** Accessible label for the rotation control while paused. Default "Play automatic slides". */
  playLabel?: string
  /** React 19 ref-as-prop. */
  ref?: Ref<HTMLElement>
}

export function Carousel({
  title,
  children,
  autoplayMs = 3000,
  autoplay = true,
  perView = 2,
  loopThreshold = 2,
  prevLabel = 'Previous',
  nextLabel = 'Next',
  pauseLabel = 'Pause automatic slides',
  playLabel = 'Play automatic slides',
  className,
  style,
  ...props
}: CarouselProps) {
  const cards = Children.toArray(children).filter(isValidElement)
  const n = cards.length
  // Only loop (triple + autoplay + arrows) when there are more cards than fit
  // in one view. With few cards a loop just shows the same card twice — render
  // them as a plain row instead.
  const loop = n > loopThreshold
  const trackRef = useRef<HTMLUListElement>(null)
  const [step, setStep] = useState(0)
  const [index, setIndex] = useState(n) // start in the middle copy
  const [animate, setAnimate] = useState(true)
  // Hover / focus pause (enhancement) and the explicit user rotation-control
  // pause (WCAG 2.2.2). Either one stops the timer.
  const [hoverPaused, setHoverPaused] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const reduce = useReducedMotion()
  const titleId = useId()

  const paused = hoverPaused || userPaused
  // Autoplay is actually running only when none of the disabling conditions
  // apply. Drives the live region politeness (silent while auto-rotating).
  const autoRotating = autoplay && !paused && !reduce && n > 0 && loop
  // Live region: announce manual paging, but stay silent ('off') while autoplay
  // runs so it never spams the screen reader; absent in static (non-loop) mode.
  const liveRegion: 'off' | 'polite' | undefined = loop
    ? autoRotating
      ? 'off'
      : 'polite'
    : undefined

  // Measure one slide + the real column gap (no magic numbers) so the px
  // translate stays exact across the fluid breakpoints. The first track child
  // is the slide <li> wrapper, which is the grid item we translate by.
  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    const measure = () => {
      const first = track.children[0] as HTMLElement | undefined
      if (!first) return
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0
      // Fractional width (not rounded offsetWidth) so the px translate matches
      // the %-derived grid pitch exactly — no drift / right-clip at odd widths.
      setStep(first.getBoundingClientRect().width + gap)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    return () => ro.disconnect()
  }, [])

  // Seamless reset: after a move into an outer copy, snap (no transition) back
  // into the middle copy.
  const normalize = useCallback(() => {
    setIndex((i) => {
      if (i >= 2 * n) {
        setAnimate(false)
        return i - n
      }
      if (i < n) {
        setAnimate(false)
        return i + n
      }
      return i
    })
  }, [n])

  // Re-enable the transition on the frame after a snap.
  useEffect(() => {
    if (animate) return
    const id = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(id)
  }, [animate])

  // Reduced-motion (and any non-animating) path: the CSS transition never
  // fires, so `onTransitionEnd` never runs — drive the seamless wrap from a
  // layout effect on the next frame after the index changes. Without this,
  // arrows under prefers-reduced-motion would walk the index past the tripled
  // bounds and reveal empty track. (When `animate` is true the transition runs
  // and `onTransitionEnd` handles the snap; we skip here to avoid double-resets.)
  // biome-ignore lint/correctness/useExhaustiveDependencies: `index` is an intentional re-run trigger — re-check the seamless wrap when the index lands under reduced motion (arrow paging); not read directly in the effect body.
  useLayoutEffect(() => {
    if (!loop || animate) return
    const id = requestAnimationFrame(() => normalize())
    return () => cancelAnimationFrame(id)
  }, [loop, animate, index, normalize])

  const go = useCallback(
    (dir: 1 | -1) => {
      // Under reduced motion keep the transition off so the move is instant and
      // the layout-effect wrap (above) — not onTransitionEnd — does the reset.
      setAnimate(!reduce)
      setIndex((i) => i + dir)
    },
    [reduce],
  )

  // Auto-advance left every `autoplayMs`; paused on hover / focus, when the
  // user pauses via the rotation control, under reduced motion, and when
  // autoplay is turned off.
  useEffect(() => {
    if (!autoRotating) return
    const id = setInterval(() => go(1), autoplayMs)
    return () => clearInterval(id)
  }, [autoRotating, autoplayMs, go])

  // Triple the children for the seamless loop. Key off each child's own key
  // (stable) + the copy index — never the array position. Static mode renders
  // them once.
  //
  // Each slide is wrapped in a <li> so the <ul> only ever contains valid list
  // children (raw <div> children would be invalid HTML and collapse list
  // semantics). In loop mode the two non-centered copies are marked
  // inert + aria-hidden so AT and Tab only reach the visible copy.
  const activeCopy = n > 0 ? Math.floor(index / n) : 0

  const slides: ReactNode[] = loop
    ? [0, 1, 2].flatMap((copy) => {
        const hidden = copy !== activeCopy
        return cards.map((card, slideIdx) => (
          <li
            key={`${copy}-${String(card.key)}`}
            className="klyp-Carousel__slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${slideIdx + 1} of ${n}`}
            aria-hidden={hidden || undefined}
            // `inert` removes the copy from the tab order + AT tree entirely.
            inert={hidden || undefined}
          >
            {cloneElement(card)}
          </li>
        ))
      })
    : cards.map((card) => (
        <li key={String(card.key)} className="klyp-Carousel__slide" role="presentation">
          {cloneElement(card)}
        </li>
      ))

  const composedClassName =
    typeof className === 'string' && className.length > 0
      ? `klyp-Carousel ${className}`
      : 'klyp-Carousel'

  return (
    <section
      className={composedClassName}
      data-slot="carousel"
      data-static={loop ? undefined : true}
      aria-roledescription={loop ? 'carousel' : undefined}
      aria-labelledby={titleId}
      style={{ ['--klyp-carousel-per-view' as string]: perView, ...style }}
      {...props}
    >
      <h2 id={titleId} className="klyp-Carousel__title">
        {title}
      </h2>

      <div
        className="klyp-Carousel__viewport"
        aria-live={liveRegion}
        onMouseEnter={() => setHoverPaused(true)}
        onMouseLeave={() => setHoverPaused(false)}
        onFocusCapture={() => setHoverPaused(true)}
        onBlurCapture={() => setHoverPaused(false)}
      >
        <ul
          ref={trackRef}
          className="klyp-Carousel__track"
          style={
            loop
              ? {
                  transform: `translateX(${-index * step}px)`,
                  transition: animate ? undefined : 'none',
                }
              : undefined
          }
          onTransitionEnd={loop ? normalize : undefined}
        >
          {slides}
        </ul>
      </div>

      {loop && (
        <div className="klyp-Carousel__nav">
          <Button
            variant="outline"
            size="icon"
            iconLeft={ArrowLeftOutline}
            aria-label={prevLabel}
            onPress={() => go(-1)}
          />
          {/* Rotation control — WCAG 2.2.2 (Pause, Stop, Hide) + APG carousel.
              Hidden under reduced motion, where autoplay never runs anyway. */}
          {autoplay && !reduce && (
            <Button
              variant="outline"
              size="icon"
              iconLeft={userPaused ? PlayOutline : StopOutline}
              aria-label={userPaused ? playLabel : pauseLabel}
              aria-pressed={userPaused}
              onPress={() => setUserPaused((p) => !p)}
            />
          )}
          <Button
            variant="outline"
            size="icon"
            iconLeft={ArrowRightOutline}
            aria-label={nextLabel}
            onPress={() => go(1)}
          />
        </div>
      )}
    </section>
  )
}

export default Carousel
