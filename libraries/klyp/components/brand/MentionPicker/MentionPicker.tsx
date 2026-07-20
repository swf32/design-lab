/**
 * MentionPicker — rich `@`-asset picker for plain-textarea inputs (the
 * PromptComposer textarea). Different from the existing `AssetMention`:
 *
 *   - Editable search input at the top (header tags the available kinds).
 *   - Group headers display kind label + suggestion count.
 *   - Each row optionally shows a small usage-count badge (e.g. "8 sc").
 *   - Footer with keyboard hints (⌘K browse all · ↵ insert · esc close).
 *
 * Position: absolute inside a `relative` parent. Caller wraps the textarea
 * in a `<div className="relative">` and renders this directly inside —
 * same shape as `AssetMention` to avoid Portal/anchor complexity.
 *
 * Keyboard nav: ArrowUp/Down/Enter/Tab to pick, Esc to close. Search input
 * does NOT steal arrow keys — they always navigate the list.
 */

import type { AssetKind, AssetSuggestion } from '@klyp/brand/AssetMention'
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'

import { useBrand } from '../_brand-context'

import './MentionPicker.scss'

const MP_COPY = {
  klyp: {
    pickerAria: 'Asset mention picker',
    placeholder: 'Characters, locations, props',
    noMatches: 'No matches',
    characters: 'Characters',
    locations: 'Locations',
    outfits: 'Outfits',
    vibes: 'Vibes',
    scenes: 'Scenes',
    browseAll: 'browse all',
    insert: 'insert',
    close: 'close',
    usageUnit: 'sc',
  },
  unreals: {
    pickerAria: 'Выбор упоминания ассета',
    placeholder: 'Персонажи, локации, реквизит',
    noMatches: 'Совпадений нет',
    characters: 'Персонажи',
    locations: 'Локации',
    outfits: 'Костюмы',
    vibes: 'Вайбы',
    scenes: 'Сцены',
    browseAll: 'все ассеты',
    insert: 'вставить',
    close: 'закрыть',
    usageUnit: 'сц',
  },
} as const

/** Resolved per-brand copy table. Both brand variants share one shape. */
type MentionCopy = (typeof MP_COPY)[keyof typeof MP_COPY]

// ── Kind metadata ─────────────────────────────────────────────────────────────
// Built from the runtime-resolved copy table inside the component body.

function makeKindMeta(mp: MentionCopy): Record<AssetKind, { label: string }> {
  return {
    character: { label: mp.characters },
    location: { label: mp.locations },
    outfit: { label: mp.outfits },
    vibe: { label: mp.vibes },
    scene: { label: mp.scenes },
  }
}

const KIND_ORDER: AssetKind[] = ['character', 'location', 'outfit', 'vibe', 'scene']

// ── Footer keycap ─────────────────────────────────────────────────────────────

function Keycap({ children }: { children: React.ReactNode }) {
  return <span className="klyp-MentionPicker__keycap">{children}</span>
}

// ── Props ─────────────────────────────────────────────────────────────────────

type Props = {
  /** Open state — driven by `@` detection in the parent textarea. */
  open: boolean
  onOpenChange: (open: boolean) => void

  /** Search query — what's typed after `@`. Editable in the search input too. */
  query: string
  onQueryChange: (q: string) => void

  /** Filtered suggestions — parent calls `useMentionPicker` with `query`. */
  suggestions: AssetSuggestion[]

  /** Click / Enter pick handler. */
  onPick: (asset: AssetSuggestion) => void

  /** ⌘K — opens full Library palette. */
  onBrowseAll?: () => void

  /** Anchor: bottom (default) renders below textarea, top renders above. */
  side?: 'top' | 'bottom'

  className?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MentionPicker({
  open,
  onOpenChange,
  query,
  onQueryChange,
  suggestions,
  onPick,
  onBrowseAll,
  side = 'top',
  className,
}: Props) {
  const { brandId } = useBrand()
  const _mp = MP_COPY[brandId]
  const KIND_META = useMemo(() => makeKindMeta(_mp), [_mp])

  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset cursor when suggestion list changes
  useEffect(() => {
    setActiveIdx(0)
  }, [])

  // Group + count
  const grouped = useMemo(() => {
    const map: Record<AssetKind, AssetSuggestion[]> = {
      character: [],
      location: [],
      outfit: [],
      vibe: [],
      scene: [],
    }
    for (const s of suggestions) map[s.kind].push(s)
    return map
  }, [suggestions])

  // Global keyboard nav while open. Search input doesn't capture arrows —
  // we listen on the document so navigation works whether textarea or input
  // has focus.
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
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (onBrowseAll) {
          e.preventDefault()
          onBrowseAll()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, activeIdx, suggestions, onOpenChange, onPick, onBrowseAll])

  // Stop the input from intercepting global Enter/Esc/Arrow events — handler
  // already runs on window. Search input only handles plain text + Backspace.
  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === 'Enter' ||
      e.key === 'Escape' ||
      e.key === 'ArrowUp' ||
      e.key === 'ArrowDown' ||
      e.key === 'Tab'
    ) {
      // Let the global window listener handle these.
      // (The window listener already stopped propagation, but text-input
      // would otherwise insert a newline on Enter.)
      e.preventDefault()
    }
  }

  if (!open) return null

  const totalCount = suggestions.length
  let runningIdx = 0

  const rootClassName = className ? `klyp-MentionPicker ${className}` : 'klyp-MentionPicker'

  return (
    <div role="listbox" aria-label={_mp.pickerAria} data-side={side} className={rootClassName}>
      {/* ── Search input ──────────────────────────────────────────────── */}
      <div className="klyp-MentionPicker__search">
        <div className="klyp-MentionPicker__searchRow">
          <span aria-hidden className="klyp-MentionPicker__searchAt">
            @
          </span>
          <span aria-hidden>·</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={_mp.placeholder}
            className="klyp-MentionPicker__searchInput"
          />
        </div>
      </div>

      {/* ── List body ─────────────────────────────────────────────────── */}
      <div className="klyp-MentionPicker__list">
        {totalCount === 0 ? (
          <div className="klyp-MentionPicker__empty">{_mp.noMatches}</div>
        ) : (
          KIND_ORDER.map((kind) => {
            const items = grouped[kind]
            if (items.length === 0) return null
            return (
              <div key={kind} className="klyp-MentionPicker__group">
                {/* Group header */}
                <div className="klyp-MentionPicker__groupHeader">
                  <span>{KIND_META[kind].label}</span>
                  <span aria-hidden>·</span>
                  <span>{items.length}</span>
                </div>
                {items.map((asset) => {
                  const idx = runningIdx++
                  const isActive = idx === activeIdx
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      role="option"
                      aria-selected={isActive ? 'true' : 'false'}
                      data-kind={asset.kind}
                      data-active={isActive ? 'true' : 'false'}
                      onMouseEnter={() => setActiveIdx(idx)}
                      onMouseDown={(e) => {
                        // Prevent textarea blur stealing the click
                        e.preventDefault()
                        onPick(asset)
                      }}
                      className="klyp-MentionPicker__item"
                    >
                      {/* Color dot per kind */}
                      <span aria-hidden className="klyp-MentionPicker__dot" />

                      {/* Thumbnail */}
                      <span aria-hidden className="klyp-MentionPicker__thumb">
                        {asset.thumbnail ? (
                          <img
                            src={asset.thumbnail}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                          />
                        ) : null}
                      </span>

                      {/* Name + meta */}
                      <span className="klyp-MentionPicker__text">
                        <span className="klyp-MentionPicker__name">{asset.name}</span>
                        {(asset.meta ?? asset.hint) && (
                          <span className="klyp-MentionPicker__hint">
                            {asset.meta ?? asset.hint}
                          </span>
                        )}
                      </span>

                      {/* Usage count badge */}
                      {typeof asset.usageCount === 'number' && (
                        <span className="klyp-MentionPicker__usage">
                          {asset.usageCount} {_mp.usageUnit}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })
        )}
      </div>

      {/* ── Footer hints ──────────────────────────────────────────────── */}
      <div className="klyp-MentionPicker__footer">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            onBrowseAll?.()
          }}
          disabled={!onBrowseAll}
          className="klyp-MentionPicker__browseAll"
        >
          <Keycap>⌘K</Keycap>
          <span>{_mp.browseAll}</span>
        </button>

        <div className="klyp-MentionPicker__hints">
          <span className="klyp-MentionPicker__hint-item">
            <Keycap>↵</Keycap>
            <span>{_mp.insert}</span>
          </span>
          <span aria-hidden>·</span>
          <span className="klyp-MentionPicker__hint-item">
            <Keycap>esc</Keycap>
            <span>{_mp.close}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
