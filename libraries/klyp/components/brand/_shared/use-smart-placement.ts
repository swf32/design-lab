import { type RefObject, useLayoutEffect, useState } from 'react'

export type SmartPlacement =
  | 'top'
  | 'bottom'
  | 'top start'
  | 'top end'
  | 'bottom start'
  | 'bottom end'

/**
 * Pre-compute the best popover placement based on the trigger's position
 * in the viewport. RAC's `shouldFlip` only flips the MAIN axis (top↔bottom);
 * this hook adds CROSS-axis flip (start↔end) so a popover anchored near the
 * right edge of the screen grows leftward instead of clipping off-screen.
 *
 * Returns a value compatible with `<Popover placement={…}>` from
 * react-aria-components. Pair with `shouldFlip` (RAC default true) so the
 * main axis stays auto-handled.
 *
 * @param triggerRef  Ref to the trigger element (button / chip / avatar).
 * @param preferred   Preferred placement when there's room everywhere.
 * @param estimate    Rough popover dimensions for the space-check math.
 *                    Values within ±100px are fine — used only to decide
 *                    which side has "enough" room.
 * @param enabled     Skip computation entirely when false (saves listeners
 *                    for callsites that pin placement explicitly).
 */
export function useSmartPlacement(
  triggerRef: RefObject<HTMLElement | null>,
  preferred: SmartPlacement,
  estimate: { width: number; height: number },
  enabled: boolean,
): SmartPlacement {
  const [placement, setPlacement] = useState<SmartPlacement>(preferred)

  useLayoutEffect(() => {
    if (!enabled) return
    const el = triggerRef.current
    if (!el) return

    const compute = () => {
      const rect = el.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      const pad = 12

      const [prefSide, prefAlign = 'start'] = preferred.split(' ') as [
        'top' | 'bottom',
        'start' | 'end' | undefined,
      ]

      // Cross-axis: would `start` (popover anchored to trigger's left edge,
      // growing right) overflow the right viewport edge? If yes prefer `end`.
      const startOverflowsRight = rect.left + estimate.width + pad > vw
      const endOverflowsLeft = rect.right - estimate.width - pad < 0
      const align: 'start' | 'end' =
        startOverflowsRight && !endOverflowsLeft ? 'end' : startOverflowsRight ? prefAlign : 'start'

      // Main-axis: respect preferred unless less than half the popover fits.
      // RAC's `shouldFlip` will catch the rest, but pre-computing avoids a
      // one-frame flicker on first paint.
      const spaceBelow = vh - rect.bottom
      const spaceAbove = rect.top
      let side: 'top' | 'bottom' = prefSide
      if (prefSide === 'bottom' && spaceBelow < estimate.height / 2 && spaceAbove > spaceBelow) {
        side = 'top'
      } else if (
        prefSide === 'top' &&
        spaceAbove < estimate.height / 2 &&
        spaceBelow > spaceAbove
      ) {
        side = 'bottom'
      }

      const next: SmartPlacement = `${side} ${align}` as SmartPlacement
      setPlacement((prev) => (prev === next ? prev : next))
    }

    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(document.documentElement)
    window.addEventListener('scroll', compute, { passive: true, capture: true })
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', compute, true)
    }
  }, [triggerRef, preferred, estimate.width, estimate.height, enabled])

  return placement
}
