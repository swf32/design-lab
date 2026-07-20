import { CircleUserBulk, FilmBulk, MapPinBulk, ShirtBulk, SparklesBulk } from '@klyp/icons/bulk'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { CdnImage } from '../CdnImage'
import './AssetMention.scss'

// =====================================================================
// AssetMention — Klyp brand organism (Phase 3 — Tailwind → SCSS migration)
// =====================================================================
//
// Asset Library `@`-mention picker. Renders as an absolute-positioned
// dropdown **inside** its parent container — drop it directly under a
// textarea inside a `position: relative` wrapper. Parent owns visibility
// (open/onOpenChange) and filtering. Keyboard nav: ArrowUp/Down, Enter to
// pick, Esc to close.
//
// This component is intentionally NOT a Popover/Portal — Base UI Popover
// can't anchor to a textarea, and absolute positioning under the textarea
// is the shape every modern AI-prompt input uses (Claude, ChatGPT, Mira).

export type AssetKind = 'character' | 'location' | 'outfit' | 'vibe' | 'scene'

export type AssetSuggestion = {
  id: string
  kind: AssetKind
  name: string
  /** Optional thumbnail URL. Falls back to kind-specific icon. */
  thumbnail?: string
  /** One-line description. */
  hint?: string
  /** Compact meta line shown under the name in the rich MentionPicker
   *  (e.g. "warrior · rogue"). Falls back to `hint` when absent. */
  meta?: string
  /** Usage count — number of scenes referencing this asset. Rendered as
   *  a small badge on the right side of the row in MentionPicker. */
  usageCount?: number
}

const kindMeta: Record<AssetKind, { icon: ReactNode; label: string }> = {
  character: { icon: <CircleUserBulk />, label: 'Characters' },
  location: { icon: <MapPinBulk />, label: 'Locations' },
  outfit: { icon: <ShirtBulk />, label: 'Outfits' },
  vibe: { icon: <SparklesBulk />, label: 'Vibes' },
  scene: { icon: <FilmBulk />, label: 'Scenes' },
}

type AssetMentionProps = {
  /** Open state — driven by '@' detection in the parent. */
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Suggestions (already filtered by parent based on '@'-query). */
  suggestions: AssetSuggestion[]
  /** Called when user picks an asset (click or Enter). */
  onPick: (asset: AssetSuggestion) => void
  /** Anchor side. `bottom` (default) renders below input, aligned left. */
  side?: 'top' | 'bottom'
  className?: string
}

export function AssetMention({
  open,
  onOpenChange,
  suggestions,
  onPick,
  side = 'bottom',
  className,
}: AssetMentionProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  // Reset active index when suggestions change
  useEffect(() => {
    setActiveIdx(0)
  }, [])

  // Global keyboard handling while open
  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onOpenChange(false)
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx((i) => Math.max(i - 1, 0))
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        const pick = suggestions[activeIdx]
        if (pick) {
          e.preventDefault()
          onPick(pick)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, activeIdx, suggestions, onOpenChange, onPick])

  if (!open || suggestions.length === 0) return null

  // Group by kind preserving discovery order
  const grouped = suggestions.reduce<Record<AssetKind, AssetSuggestion[]>>(
    (acc, s) => {
      acc[s.kind].push(s)
      return acc
    },
    { character: [], location: [], outfit: [], vibe: [], scene: [] },
  )

  const cls = typeof className === 'string' ? `klyp-AssetMention ${className}` : 'klyp-AssetMention'

  let runningIdx = 0
  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label="Asset suggestions"
      className={cls}
      data-side={side}
    >
      <div className="klyp-AssetMention__scroll">
        {(Object.keys(grouped) as AssetKind[]).map((kind) => {
          const items = grouped[kind]
          if (items.length === 0) return null
          return (
            <div key={kind} className="klyp-AssetMention__group" data-kind={kind}>
              <div className="klyp-AssetMention__groupLabel">{kindMeta[kind].label}</div>
              {items.map((asset) => {
                const idx = runningIdx++
                const isActive = idx === activeIdx
                return (
                  <button
                    key={asset.id}
                    type="button"
                    role="option"
                    aria-selected={isActive ? 'true' : 'false'}
                    data-active={isActive ? 'true' : undefined}
                    data-kind={kind}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onMouseDown={(e) => {
                      // Prevent textarea blur stealing the click
                      e.preventDefault()
                      onPick(asset)
                    }}
                    className="klyp-AssetMention__item"
                  >
                    <span aria-hidden className="klyp-AssetMention__thumb">
                      {asset.thumbnail ? (
                        <CdnImage src={asset.thumbnail} alt="" size="chip" />
                      ) : (
                        kindMeta[kind].icon
                      )}
                    </span>
                    <span className="klyp-AssetMention__text">
                      <span className="klyp-AssetMention__name">{asset.name}</span>
                      {asset.hint && <span className="klyp-AssetMention__hint">{asset.hint}</span>}
                    </span>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
