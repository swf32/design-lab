import { useEffect, useMemo, useRef, useState } from 'react'

export type MasonryItem = {
  id: string
  width: number
  height: number
}

export type MasonryPosition = {
  id: string
  x: number
  y: number
  w: number
  h: number
}

export type MasonryLayout = {
  positions: MasonryPosition[]
  containerHeight: number
  colWidth: number
  cols: number
}

const FALLBACK_ASPECT = 0.75

export function packMasonry<T extends MasonryItem>(
  items: T[],
  containerWidth: number,
  opts: { minItemWidth: number; gap: number },
): MasonryLayout {
  const { minItemWidth, gap } = opts

  if (containerWidth <= 0 || items.length === 0) {
    return { positions: [], containerHeight: 0, colWidth: 0, cols: 0 }
  }

  const cols = Math.max(1, Math.floor((containerWidth + gap) / (minItemWidth + gap)))
  const colWidth = (containerWidth - gap * (cols - 1)) / cols
  const colHeights: number[] = new Array(cols).fill(0)
  const positions: MasonryPosition[] = []

  for (const item of items) {
    const aspect = item.height && item.width ? item.height / item.width : FALLBACK_ASPECT
    const h = colWidth * aspect

    let shortestCol = 0
    for (let i = 1; i < cols; i++) {
      if (colHeights[i] < colHeights[shortestCol]) shortestCol = i
    }

    positions.push({
      id: item.id,
      x: shortestCol * (colWidth + gap),
      y: colHeights[shortestCol],
      w: colWidth,
      h,
    })

    colHeights[shortestCol] += h + gap
  }

  const containerHeight = Math.max(0, Math.max(...colHeights) - gap)
  return { positions, containerHeight, colWidth, cols }
}

export type UseMasonryLayoutOptions = {
  minItemWidth?: number
  gap?: number
}

export function useMasonryLayout<T extends MasonryItem>(
  items: T[],
  options: UseMasonryLayoutOptions = {},
) {
  const { minItemWidth = 280, gap = 8 } = options
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    let rafId: number | null = null
    let lastWidth = node.getBoundingClientRect().width
    setContainerWidth(lastWidth)

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const w =
        entry.contentRect?.width ?? (entry.target as HTMLElement).getBoundingClientRect().width
      if (Math.abs(w - lastWidth) <= 0.5) return
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        lastWidth = w
        setContainerWidth(w)
        rafId = null
      })
    })
    observer.observe(node)
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [])

  const layout = useMemo(
    () => packMasonry(items, containerWidth, { minItemWidth, gap }),
    [items, containerWidth, minItemWidth, gap],
  )

  return { containerRef, layout }
}
