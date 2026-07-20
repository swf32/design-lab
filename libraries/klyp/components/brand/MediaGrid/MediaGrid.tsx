import './MediaGrid.scss'

import {
  type CSSProperties,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { MediaCard } from '../MediaCard/MediaCard'
import { useInViewport } from './useInViewport'
import { type MasonryPosition, useMasonryLayout } from './useMasonryLayout'
import { useVisibleRange } from './useVisibleRange'

/**
 * `<MediaGrid>` — Magnific-style JS-driven absolute-position masonry for
 * variable-aspect media tiles (image / video poster / audio cover).
 *
 * Phase 2: + selection (controlled). Pass `selectedIds` + `onSelectionClick`
 * (or `selectionMode` to force checkboxes always-visible). Wire via
 * `useMediaGridSelection` for cmd/shift modifier semantics, or DIY.
 *
 * Anatomy:
 *   `.klyp-MediaGrid` (relative, height set inline via --klyp-grid-h)
 *   └ `.klyp-MediaGrid__item` (absolute + transform: translate3d, contain: size layout)
 *     └ `.klyp-MediaGrid__card` (interactive surface, selection ring on selected)
 *       ├ `<img>` full-bleed
 *       ├ `.klyp-MediaGrid__checkbox` (top-left, hover-revealed or always-on in selectionMode)
 *       └ `.klyp-MediaGrid__duration` permanent meta (bottom-left, video/audio only)
 *
 * Column count derives from container width via
 * `cols = floor((containerW + gap) / (minItemWidth + gap))` —
 * matches the `repeat(auto-fill, minmax(minItemWidth, 1fr))` formula
 * so Masonry and Grid modes stay visually consistent at the same size.
 */

export type MediaKind = 'image' | 'video' | 'audio' | '3d'

export type MediaGridItem = {
  /** Stable id used as React key and for selection. */
  id: string
  /** CDN preview URL (image: thumbnail, video: poster frame, audio: cover). */
  src: string
  /**
   * Optional video/audio source URL. When `kind === 'video'` AND `mediaUrl`
   * is set, the card renders a `<video preload="none">` that attaches its
   * src + autoplays when the item enters the viewport, and pauses when it
   * leaves. Without `mediaUrl` the card stays as a poster image with a
   * duration badge — useful when you don't want streaming bytes yet.
   */
  mediaUrl?: string
  /** Source dimensions — drives aspect-ratio packing. Fallback 4:3 if both omitted. */
  width: number
  height: number
  /** Discriminator for badge + media element switch. */
  kind?: MediaKind
  /** Alt text for accessibility. */
  alt?: string
  /** Pre-formatted duration label (e.g. "1:09"). Shown bottom-left for video/audio. */
  durationLabel?: string
}

export type MediaGridSelectionClick = {
  id: string
  meta: boolean
  shift: boolean
}

export type MediaGridViewMode = 'masonry' | 'grid'

export type MediaGridProps = {
  /** Items to render. */
  items: MediaGridItem[]
  /**
   * Layout mode.
   * - `masonry` (default) — JS-driven absolute positioning, variable item
   *   heights derived from item aspect ratio. Smooth repack via transform
   *   transition.
   * - `grid` — CSS Grid `repeat(auto-fill, minmax(minItemWidth, 1fr))`
   *   with forced 1:1 aspect on every item (object-cover crops). Items
   *   stay in source order; no JS layout math.
   *
   * Both modes share the same `minItemWidth` so column counts align.
   */
  viewMode?: MediaGridViewMode
  /** Target minimum item width — drives column count in both modes. Default 280px. */
  minItemWidth?: number
  /** Spacing between items, both axes. Default 8px. */
  gap?: number
  /**
   * DOM windowing (virtualization) for masonry mode. Default `true` — only
   * tiles inside the scroll viewport (+ buffer) are mounted, which keeps
   * /library smooth at N=200. Set `false` for small, non-scrolling hosts
   * (component-catalog previews, a fixed handful of tiles) where every tile
   * should mount deterministically regardless of scroll position: windowing on
   * a static grid that starts off-screen otherwise renders a blank box until it
   * scrolls into view. No effect in `grid` view (never windowed).
   */
  windowed?: boolean
  /**
   * Plain click (no modifiers) when NOT in selection mode — typically open
   * preview / detail. In selection mode, plain clicks toggle selection
   * instead and this handler is not called.
   */
  onItemClick?: (id: string) => void
  /**
   * Per-item overlay render slot. Receives the item AND a `state` object
   * describing hover/selection. Callers can skip mounting heavy overlay
   * subtrees (e.g. dropdown menus, RAC primitives) until the user actually
   * hovers the card — at N=200 items this difference is the gap between
   * lag and smooth. Return `null` to mount nothing.
   */
  renderOverlay?: (item: MediaGridItem, state: { hovered: boolean; selected: boolean }) => ReactNode
  /**
   * Video tile playback trigger, forwarded to every `<MediaCard>`.
   * `'hover'` (default) — attach + play only the hovered card (/library perf
   * mode); `'auto'` — clips loop while near the viewport and pause off-screen
   * (template/showcase grids).
   */
  videoPlayback?: 'hover' | 'auto'
  className?: string
  ref?: Ref<HTMLDivElement>

  // ─────────────────────── SELECTION ──────────────────────

  /**
   * Force checkboxes always-visible. When false / omitted, checkboxes
   * appear only on hover OR when `selectedIds` already has items.
   */
  selectionMode?: boolean
  /** Controlled selection. When omitted, no selection visuals render. */
  selectedIds?: ReadonlySet<string>
  /**
   * Called when user clicks an item (checkbox or card body) while selection
   * is active. Receives id + modifier-keys so the parent can route through
   * `useMediaGridSelection` for cmd-toggle / shift-range semantics.
   */
  onSelectionClick?: (click: MediaGridSelectionClick) => void

  // ─────────────────────── INFINITE SCROLL ──────────────────────

  /**
   * Fired when the bottom sentinel intersects the viewport (~600px before
   * the visible edge — see `loadMoreRootMargin`). Caller appends the next
   * page of items to the `items` array. Skipped when omitted.
   */
  onLoadMore?: () => void
  /** Whether more items remain — disables the sentinel when false. */
  hasMore?: boolean
  /** Root margin for the sentinel observer. Default `600px 0px` (start loading 600px before bottom). */
  loadMoreRootMargin?: string
}

export function MediaGrid({
  items,
  viewMode = 'masonry',
  minItemWidth = 280,
  gap = 8,
  windowed = true,
  onItemClick,
  renderOverlay,
  videoPlayback = 'hover',
  className,
  ref,
  selectionMode,
  selectedIds,
  onSelectionClick,
  onLoadMore,
  hasMore,
  loadMoreRootMargin = '600px 0px',
}: MediaGridProps) {
  const isMasonry = viewMode === 'masonry'

  // Run the layout hook only when masonry mode is active. In grid mode we
  // pass an empty array so the hook short-circuits — no wasted packing math.
  const { containerRef, layout } = useMasonryLayout(isMasonry ? items : [], {
    minItemWidth,
    gap,
  })

  // Position interning — reuse the previous frame's position object when
  // coords haven't changed for an id. Defeats the memo-bust pattern where
  // every Convex reactive tick rebuilds the items array, re-packs masonry,
  // and hands every `<MediaGridItem>` a freshly-allocated `position` object
  // that fails shallow-compare even though x/y/w/h are identical. With
  // interning, only items whose layout actually shifted re-render.
  const positionCacheRef = useRef<Map<string, MasonryPosition>>(new Map())
  const positionsById = useMemo(() => {
    const cache = positionCacheRef.current
    const next = new Map<string, MasonryPosition>()
    for (const p of layout.positions) {
      const prev = cache.get(p.id)
      if (prev && prev.x === p.x && prev.y === p.y && prev.w === p.w && prev.h === p.h) {
        next.set(p.id, prev)
      } else {
        next.set(p.id, p)
      }
    }
    positionCacheRef.current = next
    return next
  }, [layout.positions])

  // ── Virtualization (Magnific-style DOM windowing) ──────────────────────
  // Filter items in masonry mode to a buffer-padded slice around the visual
  // viewport. At N=200 items this drops mounted React fibers to ~20-40 and
  // drops `<img>` / `<video>` / overlay DOM nodes proportionally. The buffer
  // (~800px above + below) hides the windowing under normal scroll velocity.
  const visibleRange = useVisibleRange(containerRef, 800)
  const visibleItems = useMemo(() => {
    if (!isMasonry) return items
    // Windowing opt-out — render every tile (small / static / non-scrolling
    // hosts like catalog previews, where windowing would blank an off-screen grid).
    if (!windowed) return items
    if (!visibleRange.ready) return items
    const rangeStart = visibleRange.start
    const rangeEnd = visibleRange.end
    // When the grid sits entirely below the viewport (e.g. far down a long,
    // multi-instance page like the component catalog), the computed window
    // resolves to a range above the grid's own extent (rangeEnd < 0) and the
    // filter below would drop every tile — leaving a blank box that only fills
    // on scroll. Render all items instead: the grid is off-screen so the extra
    // nodes cost nothing, and they narrow back to the window the instant it
    // scrolls into view. (The scrolled-PAST case is left to the filter, which
    // correctly yields nothing.)
    if (rangeEnd < 0) return items
    return items.filter((item) => {
      const pos = positionsById.get(item.id)
      if (!pos) return false
      return pos.y + pos.h >= rangeStart && pos.y <= rangeEnd
    })
  }, [items, positionsById, visibleRange, isMasonry, windowed])

  const rootClass = typeof className === 'string' ? `klyp-MediaGrid ${className}` : 'klyp-MediaGrid'

  // Bridge JS-computed values into CSS via custom properties. In masonry mode
  // --klyp-grid-h gates container height (sum of tallest column). In grid mode
  // --klyp-grid-min-w gates `grid-template-columns: auto-fill minmax(...)`.
  const containerStyle = isMasonry
    ? ({
        '--klyp-grid-h': `${layout.containerHeight}px`,
        '--klyp-grid-gap': `${gap}px`,
      } as CSSProperties)
    : ({
        '--klyp-grid-min-w': `${minItemWidth}px`,
        '--klyp-grid-gap': `${gap}px`,
      } as CSSProperties)

  // Selection is "active" when caller wired up onSelectionClick AND either
  // selectionMode is forced on OR there's already at least one selected id.
  const selectionActive = Boolean(
    onSelectionClick && (selectionMode || (selectedIds && selectedIds.size > 0)),
  )

  // Hover tracking lets callers lazy-mount their `renderOverlay` subtree
  // only for the actively-hovered item — at N=200 items the difference
  // between mounting 200 RAC dropdown triggers and mounting 1 is the
  // entire perceived-perf budget. Single-id state means only the entering
  // + leaving items re-render (memo'd via primitive `isHovered` prop).
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const onItemEnter = useCallback((id: string) => setHoveredId(id), [])
  const onItemLeave = useCallback(
    (id: string) => setHoveredId((curr) => (curr === id ? null : curr)),
    [],
  )

  return (
    <div
      ref={(el) => {
        containerRef.current = el
        if (typeof ref === 'function') ref(el)
        else if (ref) ref.current = el
      }}
      className={rootClass}
      style={containerStyle}
      data-view={viewMode}
      data-cols={isMasonry ? layout.cols || undefined : undefined}
      data-selection-active={selectionActive || undefined}
    >
      {visibleItems.map((item) => {
        const pos = isMasonry ? (positionsById.get(item.id) ?? null) : null
        // Masonry needs a computed position to render. Grid mode renders in
        // source order with no JS positioning.
        if (isMasonry && !pos) return null
        const kind = item.kind ?? 'image'
        const itemStyle: CSSProperties | undefined = pos
          ? ({
              '--klyp-item-x': `${pos.x}px`,
              '--klyp-item-y': `${pos.y}px`,
              '--klyp-item-w': `${pos.w}px`,
              '--klyp-item-h': `${pos.h}px`,
            } as CSSProperties)
          : undefined
        return (
          <div
            key={item.id}
            className="klyp-MediaGrid__item"
            data-kind={kind}
            data-settled="true"
            data-selected={selectedIds?.has(item.id) || undefined}
            style={itemStyle}
          >
            <MediaCard
              item={item}
              isHovered={hoveredId === item.id}
              isSelected={selectedIds?.has(item.id) ?? false}
              selectionActive={selectionActive}
              onItemClick={onItemClick}
              onSelectionClick={onSelectionClick}
              onItemEnter={onItemEnter}
              onItemLeave={onItemLeave}
              renderOverlay={renderOverlay}
              videoPlayback={videoPlayback}
            />
          </div>
        )
      })}
      {onLoadMore && hasMore ? (
        <LoadMoreSentinel
          onLoadMore={onLoadMore}
          rootMargin={loadMoreRootMargin}
          isMasonry={isMasonry}
          containerHeight={layout.containerHeight}
        />
      ) : null}
    </div>
  )
}

// ============================================================================
//  Infinite-scroll sentinel
// ============================================================================

type LoadMoreSentinelProps = {
  onLoadMore: () => void
  rootMargin: string
  isMasonry: boolean
  containerHeight: number
}

function LoadMoreSentinel({
  onLoadMore,
  rootMargin,
  isMasonry,
  containerHeight,
}: LoadMoreSentinelProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const inView = useInViewport(sentinelRef, { rootMargin })

  // Avoid double-fires within the same intersection — track last "in-view"
  // edge with a ref so onLoadMore is called once per enter event. Caller is
  // responsible for not appending duplicates / handling its own loading flag.
  const firedRef = useRef(false)
  useEffect(() => {
    if (inView && !firedRef.current) {
      firedRef.current = true
      onLoadMore()
    } else if (!inView) {
      firedRef.current = false
    }
  }, [inView, onLoadMore])

  // In masonry mode, sentinel sits absolutely just under the tallest column.
  // In grid mode it's a normal flow item taking a full row.
  const style: CSSProperties = isMasonry
    ? {
        position: 'absolute',
        left: 0,
        right: 0,
        top: `${containerHeight}px`,
        height: 1,
      }
    : { gridColumn: '1 / -1', height: 1 }

  return <div ref={sentinelRef} className="klyp-MediaGrid__sentinel" aria-hidden style={style} />
}

// Card-internal rendering (media element, hover/selected ring, checkbox,
// duration badge, overlay slot) lives in `<MediaCard>` so it's copy-paste
// usable on its own. See packages/brand/src/MediaCard/MediaCard.tsx.
