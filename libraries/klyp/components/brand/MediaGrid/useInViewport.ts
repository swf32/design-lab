import { type RefObject, useEffect, useState } from 'react'

export type UseInViewportOptions = {
  /** IntersectionObserver root margin — expand viewport to start loading earlier. Default `200px 0px`. */
  rootMargin?: string
  /** Intersection threshold (0..1). Default `0.1` — 10% visible flips to true. */
  threshold?: number
  /** Optional scroll container to observe within. Default = viewport. */
  root?: Element | null
  /** If true, fires `true` only once and stays true. Useful for lazy-load. */
  once?: boolean
}

/**
 * Returns `true` when `ref.current` enters the viewport (or `root` element).
 *
 * Used in `<MediaGrid>` for:
 *   - lazy `<video>` source attachment (set src only when intersecting)
 *   - auto play/pause based on visibility
 *   - infinite-scroll sentinel detection
 */
export function useInViewport(ref: RefObject<Element | null>, options: UseInViewportOptions = {}) {
  const { rootMargin = '200px 0px', threshold = 0.1, root = null, once = false } = options
  const [inViewport, setInViewport] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInViewport(true)
            if (once) observer.disconnect()
          } else if (!once) {
            setInViewport(false)
          }
        }
      },
      { rootMargin, threshold, root },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, rootMargin, threshold, root, once])

  return inViewport
}
