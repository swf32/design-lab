import './MediaCard.scss'

import { TickOutline } from '@klyp/icons/outline'
import { type MouseEvent, memo, type ReactNode, useEffect, useRef, useState } from 'react'

import { useBrand } from '../_brand-context'
import { buildSrcSet, buildTransformUrl } from '../CdnImage/cdn-url'
import type { MediaGridItem, MediaGridSelectionClick, MediaKind } from '../MediaGrid/MediaGrid'
import { useInViewport } from '../MediaGrid/useInViewport'

/**
 * `<MediaCard>` — single asset tile used by `<MediaGrid>` and copyable on
 * its own. Renders the media element (image / video poster with hover-play)
 * plus the selection checkbox, duration badge, hover/selected ring, and an
 * overlay slot for favourite / 3-dots actions.
 *
 * When wrapped by `<MediaGrid>`, hover state is controlled externally so the
 * grid can hover-attach video src for only the active card (perf at N=200).
 * In standalone use leave `isHovered` undefined — the card tracks its own
 * hover via `pointerEnter` / `pointerLeave`.
 *
 * Sizing: the card fills its parent (`width: 100%; height: 100%`). For
 * standalone use wrap in a sized container, e.g.
 * `<div style={{ width: 260, aspectRatio: '3/4' }}><MediaCard ... /></div>`.
 */
export type MediaCardProps = {
  item: MediaGridItem
  className?: string
  /** Controlled hover state (set by MediaGrid). Undefined = self-tracked. */
  isHovered?: boolean
  /** Currently selected. */
  isSelected?: boolean
  /** Selection mode is globally active — keeps checkbox visible at rest. */
  selectionActive?: boolean
  /** Plain click (no modifiers, no selection mode) — typically open detail. */
  onItemClick?: (id: string) => void
  /** Click in selection mode or with a modifier key. */
  onSelectionClick?: (click: MediaGridSelectionClick) => void
  /** Hover entered — fires alongside internal state. */
  onItemEnter?: (id: string) => void
  /** Hover left. */
  onItemLeave?: (id: string) => void
  /** Overlay slot — favourite toggle, 3-dots menu, custom badges. */
  renderOverlay?: (item: MediaGridItem, state: { hovered: boolean; selected: boolean }) => ReactNode
  /**
   * Video tile playback trigger. `'hover'` (default) attaches + plays the
   * clip only while the card is hovered — the /library perf mode. `'auto'`
   * plays whenever the tile is near the viewport (IntersectionObserver,
   * pauses off-screen) — for template/showcase grids where clips should
   * loop without interaction. Ignored for image tiles.
   */
  videoPlayback?: 'hover' | 'auto'
}

export const MediaCard = memo(function MediaCardImpl({
  item,
  className,
  isHovered: hoverProp,
  isSelected,
  selectionActive = false,
  onItemClick,
  onSelectionClick,
  onItemEnter,
  onItemLeave,
  renderOverlay,
  videoPlayback = 'hover',
}: MediaCardProps) {
  const [internalHover, setInternalHover] = useState(false)
  const hovered = hoverProp !== undefined ? hoverProp : internalHover
  const selected = !!isSelected
  const kind: MediaKind = item.kind ?? 'image'
  const interactive = Boolean(onItemClick) || Boolean(onSelectionClick)

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (selectionActive && onSelectionClick) {
      e.preventDefault()
      onSelectionClick({ id: item.id, meta: e.metaKey || e.ctrlKey, shift: e.shiftKey })
      return
    }
    if ((e.metaKey || e.ctrlKey || e.shiftKey) && onSelectionClick) {
      e.preventDefault()
      onSelectionClick({ id: item.id, meta: e.metaKey || e.ctrlKey, shift: e.shiftKey })
      return
    }
    if (onItemClick) {
      e.preventDefault()
      onItemClick(item.id)
    }
  }

  const handleKeyDown = (e: import('react').KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    if (selectionActive && onSelectionClick) {
      e.preventDefault()
      onSelectionClick({ id: item.id, meta: e.metaKey || e.ctrlKey, shift: e.shiftKey })
      return
    }
    if (onItemClick) {
      e.preventDefault()
      onItemClick(item.id)
    }
  }

  const handleCheckboxClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (!onSelectionClick) return
    onSelectionClick({ id: item.id, meta: e.metaKey || e.ctrlKey, shift: e.shiftKey })
  }

  const handlePointerEnter = () => {
    setInternalHover(true)
    onItemEnter?.(item.id)
  }
  const handlePointerLeave = () => {
    setInternalHover(false)
    onItemLeave?.(item.id)
  }

  const ariaPressed: 'true' | 'false' | undefined = selectionActive
    ? selected
      ? 'true'
      : 'false'
    : undefined

  const cardInterop = interactive
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        'aria-label': item.alt ?? `Asset ${item.id}`,
        'aria-pressed': ariaPressed,
      }
    : null

  const rootClass =
    typeof className === 'string' && className.length > 0
      ? `klyp-MediaCard ${className}`
      : 'klyp-MediaCard'

  return (
    <div
      className={rootClass}
      data-interactive={interactive || undefined}
      data-selected={selected || undefined}
      data-selection-active={selectionActive || undefined}
      data-hovered={hovered || undefined}
      data-kind={kind}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      {...(cardInterop ?? {})}
    >
      <MediaCardMedia item={item} kind={kind} isHovered={hovered} videoPlayback={videoPlayback} />
      {onSelectionClick && (selectionActive || hovered || selected) ? (
        <button
          type="button"
          className="klyp-MediaCard__checkbox"
          data-selected={selected || undefined}
          aria-label={selected ? 'Deselect item' : 'Select item'}
          aria-pressed={selected ? 'true' : 'false'}
          onClick={handleCheckboxClick}
        >
          <TickOutline width={14} height={14} />
        </button>
      ) : null}
      {item.durationLabel ? (
        <span className="klyp-MediaCard__duration">
          <span className="klyp-sr-only">Duration </span>
          {item.durationLabel}
        </span>
      ) : null}
      {renderOverlay ? renderOverlay(item, { hovered, selected }) : null}
    </div>
  )
})

export default MediaCard

const MediaCardMedia = memo(function MediaCardMediaImpl({
  item,
  kind,
  isHovered,
  videoPlayback,
}: {
  item: MediaGridItem
  kind: MediaKind
  isHovered: boolean
  videoPlayback: 'hover' | 'auto'
}) {
  // cdnBase from BrandProvider — empty string outside a provider (catalog /
  // tests), in which case the transform helpers return the raw URL, so this is
  // always safe. Called unconditionally (hooks rule) before the branch below.
  const { cdnBase } = useBrand()
  if (kind === 'video' && item.mediaUrl) {
    return (
      <MediaCardVideo
        item={item}
        isHovered={isHovered}
        cdnBase={cdnBase}
        playback={videoPlayback}
      />
    )
  }
  // Downscaled CDN thumbnail (grid width 640) instead of the full-res original.
  // Up to ~200 tiles decode at once, so a full-resolution poster per tile was
  // the /library "видосы очень долго прогружаются" cause.
  return (
    <img
      src={buildTransformUrl(item.src, cdnBase, 640)}
      srcSet={buildSrcSet(item.src, cdnBase, [640, 1280])}
      sizes="640px"
      alt={item.alt ?? ''}
      decoding="async"
      loading="lazy"
      className="klyp-MediaCard__image"
      draggable={false}
    />
  )
})

const MediaCardVideo = memo(function MediaCardVideoImpl({
  item,
  isHovered,
  cdnBase,
  playback,
}: {
  item: MediaGridItem
  isHovered: boolean
  cdnBase: string
  playback: 'hover' | 'auto'
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // 'auto' playback: loop whenever the tile is near the visual viewport and
  // pause off-screen — an IO with a small look-ahead margin, so scrolling
  // never runs every clip at once (the grid is windowed anyway).
  const inView = useInViewport(videoRef, { rootMargin: '200px 0px', threshold: 0.1 })
  const shouldPlay = playback === 'auto' ? inView : isHovered

  // A real poster (the image itself, or a stored/captured frame) keeps the tile
  // cheap: no src, preload="none", attach + play only on hover. A poster-LESS
  // video (e.g. a text-to-video whose frame was never captured) would otherwise
  // be a blank tile — an empty `poster=""` even resolves to the PAGE url. So we
  // instead give it its own src + preload="metadata" and let the browser paint
  // the clip's first frame as a stand-in poster. The grid is windowed, so this
  // loads metadata for the handful of on-screen clips, not the whole library.
  const posterSrc = item.src ? buildTransformUrl(item.src, cdnBase, 640) : undefined
  const showFirstFrame = !posterSrc && Boolean(item.mediaUrl)

  useEffect(() => {
    const node = videoRef.current
    if (!node) return
    if (shouldPlay) {
      if (!node.src && item.mediaUrl) node.src = item.mediaUrl
      const playPromise = node.play()
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {})
      }
    } else {
      node.pause()
    }
  }, [shouldPlay, item.mediaUrl])

  return (
    <video
      ref={videoRef}
      poster={posterSrc}
      src={showFirstFrame ? item.mediaUrl : undefined}
      muted
      loop
      playsInline
      preload={showFirstFrame ? 'metadata' : 'none'}
      controlsList="nodownload nofullscreen"
      className="klyp-MediaCard__video"
      draggable={false}
      aria-label={item.alt ?? `Video ${item.id}`}
    />
  )
})
