import { type RefObject, useEffect, useState } from 'react'

export type VisibleRange = {
  /** Container-local Y where the visible window starts (incl. buffer). */
  start: number
  /** Container-local Y where the visible window ends (incl. buffer). */
  end: number
  /** False on first paint before measurement — callers should render-all or skip-all accordingly. */
  ready: boolean
}

const FAR = Number.POSITIVE_INFINITY

/**
 * Tracks the slice of `containerRef` currently inside the visual viewport
 * (plus `buffer` on each side). Used by `<MediaGrid>` to skip mounting
 * items that are far off-screen — Magnific-style DOM-level virtualization.
 *
 * Implementation notes:
 *   - Single `scroll` listener on `window` (passive). `getBoundingClientRect`
 *     stays accurate regardless of which ancestor scrolls, so this catches
 *     both window-scroll and internal-`overflow: auto`-scroll cases.
 *   - One rAF-coalesced update per frame to keep cost flat under fast scroll.
 *   - Initial state has `ready: false` so callers can choose: render
 *     everything (safe but defeats virtualization on first paint) or render
 *     nothing (faster cold mount, brief flash). MediaGrid picks: render
 *     all on first paint, then narrow once measured.
 */
export function useVisibleRange(
  containerRef: RefObject<HTMLElement | null>,
  buffer: number = 600,
): VisibleRange {
  const [range, setRange] = useState<VisibleRange>({ start: -FAR, end: FAR, ready: false })

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    let rafId: number | null = null

    const measure = () => {
      rafId = null
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const viewportH = window.innerHeight || document.documentElement.clientHeight
      // rect.top is the container's top in viewport coords; negative once
      // scrolled past. -rect.top gives the container-local Y at viewport top.
      const start = -rect.top - buffer
      const end = -rect.top + viewportH + buffer
      setRange((prev) =>
        prev.ready && Math.abs(prev.start - start) < 4 && Math.abs(prev.end - end) < 4
          ? prev
          : { start, end, ready: true },
      )
    }

    const schedule = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(measure)
    }

    // First measurement after layout — defer one frame so masonry has packed.
    schedule()

    window.addEventListener('scroll', schedule, { passive: true, capture: true })
    window.addEventListener('resize', schedule, { passive: true })

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', schedule, { capture: true })
      window.removeEventListener('resize', schedule)
    }
  }, [containerRef, buffer])

  return range
}
