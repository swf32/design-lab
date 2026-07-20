import './ConversationHistory.scss'

import {
  AddOutline,
  CollapseIcon,
  type ConversationModality,
  PinIcon,
  SearchOutline,
} from '@klyp/icons'
import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { Input, Button as RACButton, SearchField } from 'react-aria-components'
import { ConversationRow, type ConversationRowLabels } from '../ConversationRow'
import { CONVERSATION_GROUP_ORDER, type ConversationGroupKey, groupOf } from './grouping'

/**
 * `<ConversationHistory>` — the chat-history panel UI SHELL. A collapsible
 * rail that lists conversations grouped by pinned + relative date, with
 * search, New chat, and per-row actions (Rename / Pin / Delete):
 *
 *   ┌──────────────────────────────┐
 *   │ Chats                     ⇤ │  ← header: title + collapse toggle
 *   │ [+] New chat                 │  ← 40×40 icon box + label
 *   │ [⌕] Search chats             │  ← search row (same icon box)
 *   │  📌 Pinned                   │  ← group header (24px icon column)
 *   │  ▣  Brand video ideas    ⋯  │  ← row: modality glyph + title + kebab
 *   │  Today                       │
 *   │  ◌  Logo explorations    ⋯  │  ← ◌ = spinner while status 'pending'
 *   │  Yesterday                   │
 *   │  ▤  Q3 campaign copy     ⋯  │
 *   └──────────────────────────────┘
 *
 * Collapsed (72px mini-rail): three left-aligned 40×40 icon-buttons stacked
 * top→bottom — [expand chevron] [New chat +] [Search ⌕] — the glass surface
 * drops and the list fades out. Icons keep the SAME left x in both states;
 * only the panel widens.
 *
 * Pure UI / presentational — NO backend, NO router. It manages its own light
 * demo state (items, selection, collapse, search query, inline rename) so the
 * shell is fully interactive in isolation: rename edits update the local list,
 * pin toggles re-bucket the row, delete removes it. In the app, the feature
 * wrapper (`features/chat/`) owns the real Convex-wired state and renders the
 * same anatomy. Two deliberate divergences from the feature version:
 *
 *   - The app's grid track owns the 280↔72px width morph; here the shell owns
 *     its own width (`--klyp-conversation-history-width`), so it collapses
 *     self-contained.
 *   - The app virtualises the list (GroupedVirtuoso); demo lists are short, so
 *     this shell renders a plain map with sticky group headers.
 *
 * Composed from: the shared `@klyp/brand` `ConversationRow` (rows — modality
 * glyph / spinner / kebab / inline rename), React Aria `Button` / `SearchField`,
 * and `@klyp/icons` glyphs (collapse + pinned-header pin). The same row the app
 * feature renders.
 */

// =====================================================================
// Labels — brand-agnostic copy via props, EN defaults
// =====================================================================

export interface ConversationHistoryLabels {
  /** Panel title. Also the `<nav>` aria-label. */
  title: string
  newChat: string
  search: string
  pinned: string
  today: string
  yesterday: string
  prev7: string
  prev30: string
  older: string
  /** Empty list (no items at all). */
  empty: string
  /** Search returned nothing. */
  noResults: string
  rename: string
  pin: string
  unpin: string
  delete: string
  collapse: string
  expand: string
  /** Spinner aria-label while a row's status is 'pending'. */
  generating: string
  /** Accessible name for a row's kebab trigger. */
  actionsFor: (title: string) => string
}

const DEFAULT_LABELS: ConversationHistoryLabels = {
  title: 'Chats',
  newChat: 'New chat',
  search: 'Search chats',
  pinned: 'Pinned',
  today: 'Today',
  yesterday: 'Yesterday',
  prev7: 'Previous 7 days',
  prev30: 'Previous 30 days',
  older: 'Older',
  empty: 'No chats yet',
  noResults: 'Nothing found',
  rename: 'Rename',
  pin: 'Pin',
  unpin: 'Unpin',
  delete: 'Delete',
  collapse: 'Collapse panel',
  expand: 'Expand panel',
  generating: 'Generating',
  actionsFor: (title: string) => `Actions for ${title}`,
}

// =====================================================================
// Data model (the pinned-sort + day-difference date buckets come from the
// shared `./grouping` helper, also consumed by the app feature)
// =====================================================================

// Modality union — single source is `@klyp/icons`; re-exported so the
// `@klyp/brand` public API surface stays unchanged.
export type { ConversationModality }

export interface ConversationHistoryItem {
  id: string
  title: string
  modality?: ConversationModality
  /** Epoch ms — drives the date grouping. */
  lastMessageAt: number
  /** Set = pinned section, sorted descending (most recently pinned first). */
  pinnedAt?: number
  /** `'pending'` shows a round spinner in the row's icon slot. */
  status?: 'pending' | 'done' | 'error'
}

interface ConversationSection {
  key: string
  label: string
  isPinned: boolean
  items: ConversationHistoryItem[]
}

/** Pinned (sorted by pinnedAt desc) first, then non-empty date buckets. */
function buildSections(
  items: ConversationHistoryItem[],
  labels: ConversationHistoryLabels,
): ConversationSection[] {
  const pinned = items
    .filter((c) => c.pinnedAt != null)
    .sort((a, b) => (b.pinnedAt ?? 0) - (a.pinnedAt ?? 0))

  const buckets: Record<ConversationGroupKey, ConversationHistoryItem[]> = {
    today: [],
    yesterday: [],
    prev7: [],
    prev30: [],
    older: [],
  }
  for (const c of items) {
    if (c.pinnedAt != null) continue
    buckets[groupOf(c.lastMessageAt)].push(c)
  }

  const out: ConversationSection[] = []
  if (pinned.length > 0)
    out.push({ key: 'pinned', label: labels.pinned, isPinned: true, items: pinned })
  for (const g of CONVERSATION_GROUP_ORDER) {
    if (buckets[g].length > 0)
      out.push({ key: g, label: labels[g], isPinned: false, items: buckets[g] })
  }
  return out
}

// =====================================================================
// Demo data (the app supplies real data; this keeps the shell standalone)
// =====================================================================

const HOUR = 3_600_000
const DAY = 86_400_000
const NOW = Date.now()

const DEMO_ITEMS: ConversationHistoryItem[] = [
  // 2 pinned
  {
    id: 'demo-brand-video',
    title: 'Brand video ideas',
    modality: 'video',
    lastMessageAt: NOW - 2 * DAY,
    pinnedAt: NOW - 1 * DAY,
  },
  {
    id: 'demo-moodboard',
    title: 'Moodboard for spring drop',
    modality: 'image',
    lastMessageAt: NOW - 9 * DAY,
    pinnedAt: NOW - 5 * DAY,
  },
  // today
  {
    id: 'demo-logo',
    title: 'Logo explorations',
    modality: 'image',
    lastMessageAt: NOW - 2 * HOUR,
    status: 'pending',
  },
  {
    id: 'demo-teaser',
    title: 'Teaser cut — 15s vertical',
    modality: 'video',
    lastMessageAt: NOW - 5 * HOUR,
  },
  // yesterday
  {
    id: 'demo-campaign',
    title: 'Q3 campaign copy',
    modality: 'text',
    lastMessageAt: NOW - 1 * DAY - 3 * HOUR,
  },
  // previous 7 days
  {
    id: 'demo-voiceover',
    title: 'Voiceover script draft',
    modality: 'audio',
    lastMessageAt: NOW - 4 * DAY,
  },
  {
    id: 'demo-thumbnails',
    title: 'Thumbnail variations',
    modality: 'image',
    lastMessageAt: NOW - 6 * DAY,
  },
  // older
  {
    id: 'demo-naming',
    title: 'Naming brainstorm',
    modality: 'text',
    lastMessageAt: NOW - 40 * DAY,
  },
]

// =====================================================================
// Props
// =====================================================================

export interface ConversationHistoryProps {
  /** Conversation list. Seeds internal demo state; defaults to a built-in
   * demo dataset. Pin / rename / delete mutate the internal copy. */
  items?: ConversationHistoryItem[]
  /** Active row id — re-syncs internal selection whenever it changes. */
  activeId?: string
  /** Start collapsed (72px mini-rail). The shell owns the 280↔72px width
   * morph here; in the app the layout grid owns it. */
  defaultCollapsed?: boolean
  /** Optional callbacks — internal demo state still updates without them. */
  onSelect?: (item: ConversationHistoryItem) => void
  onNewChat?: () => void
  onPin?: (item: ConversationHistoryItem, pinned: boolean) => void
  onRename?: (item: ConversationHistoryItem, title: string) => void
  onDelete?: (item: ConversationHistoryItem) => void
  labels?: Partial<ConversationHistoryLabels>
  className?: string
}

const C = 'klyp-ConversationHistory'

// =====================================================================
// Component
// =====================================================================

// 40×40 icon box with a 22px glyph — same geometry as the icon nav-rail's
// `klyp-SidebarRail__btn`, so the panel's controls line up beside it.
const ICON = 22
// The magnifier fills its viewBox edge-to-edge; 18px reads optically equal
// to the airy 22px plus/chevron. The 40×40 box is unchanged.
const SEARCH_ICON = 18
const ICO = `${C}__icoSlot`

export function ConversationHistory({
  items,
  activeId,
  defaultCollapsed = false,
  onSelect,
  onNewChat,
  onPin,
  onRename,
  onDelete,
  labels,
  className,
}: ConversationHistoryProps) {
  const t: ConversationHistoryLabels = { ...DEFAULT_LABELS, ...labels }
  // Subset of labels the shared row needs (brand-agnostic copy).
  const rowLabels: ConversationRowLabels = {
    rename: t.rename,
    pin: t.pin,
    unpin: t.unpin,
    delete: t.delete,
    generating: t.generating,
    actionsFor: t.actionsFor,
  }

  // Demo state — seeded from props; pin / rename / delete mutate the copy so
  // the shell stays interactive in isolation (Composer precedent).
  const [list, setList] = useState<ConversationHistoryItem[]>(() => items ?? DEMO_ITEMS)
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [query, setQuery] = useState('')
  const [renaming, setRenaming] = useState<{ id: string; text: string } | null>(null)

  // Selection — internal, but re-syncs when the `activeId` prop changes
  // (adjust-during-render pattern; no effect needed).
  const [selectedId, setSelectedId] = useState(activeId)
  const [prevActiveId, setPrevActiveId] = useState(activeId)
  if (activeId !== prevActiveId) {
    setPrevActiveId(activeId)
    setSelectedId(activeId)
  }

  // When the collapsed search icon-button expands the panel, the SearchField
  // doesn't exist yet at press time. Carry intent across the swap and focus
  // the real input once it mounts.
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [pendingSearchFocus, setPendingSearchFocus] = useState(false)
  useEffect(() => {
    if (!collapsed && pendingSearchFocus) {
      searchInputRef.current?.focus()
      setPendingSearchFocus(false)
    }
  }, [collapsed, pendingSearchFocus])

  // One-shot "appearance" gate — rows rise + fade in (staggered by index)
  // when the panel reveals (expand OR first paint while expanded). Arms for
  // ~600ms, then disarms so later list changes render plainly.
  const [appearing, setAppearing] = useState(false)
  const appearTimer = useRef<number | null>(null)
  useEffect(() => {
    if (collapsed) return
    setAppearing(true)
    if (appearTimer.current) window.clearTimeout(appearTimer.current)
    appearTimer.current = window.setTimeout(() => setAppearing(false), 600)
    return () => {
      if (appearTimer.current) window.clearTimeout(appearTimer.current)
    }
  }, [collapsed])

  const q = query.trim().toLowerCase()
  const filtered = q ? list.filter((c) => c.title.toLowerCase().includes(q)) : list
  const sections = buildSections(filtered, t)

  const handleSelect = (item: ConversationHistoryItem) => {
    setSelectedId(item.id)
    onSelect?.(item)
  }

  const handlePin = (item: ConversationHistoryItem) => {
    const pinned = item.pinnedAt == null
    setList((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, pinnedAt: pinned ? Date.now() : undefined } : c)),
    )
    onPin?.(item, pinned)
  }

  const startRename = (item: ConversationHistoryItem) =>
    setRenaming({ id: item.id, text: item.title })
  const changeRename = (text: string) => setRenaming((r) => (r ? { ...r, text } : r))
  const cancelRename = () => setRenaming(null)

  const commitRename = () => {
    if (!renaming) return
    const target = renaming
    setRenaming(null)
    const text = target.text.trim()
    if (!text) return
    const item = list.find((c) => c.id === target.id)
    setList((prev) => prev.map((c) => (c.id === target.id ? { ...c, title: text } : c)))
    if (item) onRename?.(item, text)
  }

  const handleDelete = (item: ConversationHistoryItem) => {
    setList((prev) => prev.filter((c) => c.id !== item.id))
    if (selectedId === item.id) setSelectedId(undefined)
    onDelete?.(item)
  }

  // Stagger index across ALL rendered rows (headers excluded), capped so deep
  // rows don't lag the reveal.
  let rowIndex = -1

  return (
    <nav
      className={[C, className].filter(Boolean).join(' ')}
      aria-label={t.title}
      data-collapsed={collapsed ? 'true' : undefined}
    >
      <div className={`${C}__header`}>
        {/* Title is plain text here — the app renders it as a link to the
         *  full-page Chats list. Hidden when collapsed (icons only). */}
        <span className={`${C}__title`}>{t.title}</span>
        <RACButton
          className={`${C}__iconBtn`}
          aria-label={collapsed ? t.expand : t.collapse}
          onPress={() => setCollapsed(!collapsed)}
        >
          <span className={ICO}>
            <CollapseIcon width={ICON} height={ICON} />
          </span>
        </RACButton>
      </div>

      <RACButton className={`${C}__newChat`} aria-label={t.newChat} onPress={() => onNewChat?.()}>
        <span className={ICO}>
          <AddOutline width={ICON} height={ICON} />
        </span>
        <span className={`${C}__newChatLabel`}>{t.newChat}</span>
      </RACButton>

      {/* Collapsed: search is the 3rd mini-rail icon-button — pressing it
       *  expands the panel and focuses the real field. Expanded: the live
       *  SearchField. The icon stays in the SAME fixed left slot as the New
       *  chat icon so nothing shifts horizontally on toggle. */}
      {collapsed ? (
        <RACButton
          className={`${C}__searchTrigger`}
          aria-label={t.search}
          onPress={() => {
            setCollapsed(false)
            setPendingSearchFocus(true)
          }}
        >
          <span className={ICO}>
            <SearchOutline width={SEARCH_ICON} height={SEARCH_ICON} />
          </span>
        </RACButton>
      ) : (
        <SearchField
          className={`${C}__search`}
          value={query}
          onChange={setQuery}
          aria-label={t.search}
        >
          <span className={ICO}>
            <SearchOutline width={SEARCH_ICON} height={SEARCH_ICON} aria-hidden />
          </span>
          <Input ref={searchInputRef} placeholder={t.search} />
        </SearchField>
      )}

      {/* List slot stays mounted in both states (owns the flex space + the
       *  fade); the rows render only while expanded. Plain map — the app
       *  virtualises (GroupedVirtuoso), demo lists are short. */}
      <div className={`${C}__scrollWrap`} data-appearing={appearing ? 'true' : undefined}>
        {collapsed ? null : sections.length === 0 ? (
          <p className={`${C}__empty`}>{q ? t.noResults : t.empty}</p>
        ) : (
          <div className={`${C}__scroll`}>
            {sections.map((section) => (
              <section className={`${C}__group`} key={section.key}>
                <div className={`${C}__groupHeader`}>
                  {/* Icon only for Pinned — date labels sit flush LEFT (Val
                   *  2026-06-11; the earlier empty-slot indent that aligned
                   *  headers with row titles read as misalignment). */}
                  {section.isPinned ? (
                    <span className={`${C}__groupIcon`} aria-hidden>
                      <PinIcon filled width={14} height={14} />
                    </span>
                  ) : null}
                  <span>{section.label}</span>
                </div>
                {section.items.map((item) => {
                  rowIndex += 1
                  return (
                    <div
                      className={`${C}__appearRow`}
                      key={item.id}
                      style={{ '--row-i': Math.min(rowIndex, 14) } as CSSProperties}
                    >
                      <ConversationRow
                        item={item}
                        active={item.id === selectedId}
                        isRenaming={renaming?.id === item.id}
                        renameText={renaming?.text ?? ''}
                        labels={rowLabels}
                        onSelect={handleSelect}
                        onStartRename={startRename}
                        onPin={handlePin}
                        onDelete={handleDelete}
                        onRenameChange={changeRename}
                        onRenameCommit={commitRename}
                        onRenameCancel={cancelRename}
                      />
                    </div>
                  )
                })}
              </section>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

export default ConversationHistory
