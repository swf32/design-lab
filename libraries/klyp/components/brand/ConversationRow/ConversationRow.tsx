/**
 * ConversationRow — one row of a chat-history list: a leading modality glyph
 * (or a round spinner while a generation is pending) + a truncated title +
 * an optional relative-time column (full-page list) + a hover kebab
 * (Rename / Pin·Unpin / Delete). When `isRenaming`, the title swaps for an
 * inline rename field.
 *
 * Presentational + brand/router-agnostic by design: it owns NO data and NO
 * backend types. Consumers pass a generic `ConversationRowItem` + label strings
 * + callbacks. The Klyp app maps its Convex `Doc<'conversations'>` → item at the
 * call site (`apps/web/src/features/chat/components/conversation-row.tsx`); the
 * `ConversationHistory` shell passes its own demo items. One row source of truth
 * for both — they previously hand-maintained two copies of this anatomy.
 *
 * Row hierarchy rides the COLOUR channel (muted label → primary on hover /
 * focus / active), NOT whole-row opacity — see ConversationRow.scss.
 */

import './ConversationRow.scss'

import {
  type ConversationModality,
  EditPencilOutline,
  MoreHorizontalOutline,
  PinIcon,
  TrashOutline,
} from '@klyp/icons'
import { memo } from 'react'
import { Input, Button as RACButton, TextField } from 'react-aria-components'

import { Dropdown } from '../Dropdown'

const C = 'klyp-ConversationRow'

export type { ConversationModality }

/** Generic, backend-agnostic shape for one history entry. */
export interface ConversationRowItem {
  id: string
  title: string
  modality?: ConversationModality
  /** Epoch ms — fed to `formatTime` for the optional time column. */
  lastMessageAt: number
  /** Set = pinned (the kebab action reads "Unpin"). */
  pinnedAt?: number
  /** `'pending'` shows a round spinner in the icon slot. */
  status?: 'pending' | 'done' | 'error'
}

/** Brand-agnostic copy — injected so the host controls language (EN / RU). */
export interface ConversationRowLabels {
  rename: string
  pin: string
  unpin: string
  delete: string
  /** Spinner aria-label while `status === 'pending'`. */
  generating: string
  /** Accessible name for the kebab trigger. */
  actionsFor: (title: string) => string
}

export interface ConversationRowProps {
  item: ConversationRowItem
  active?: boolean
  isRenaming?: boolean
  renameText?: string
  /** Show the relative-time column on the right (full-page list); the
   *  sidebar/overlay omit it. Requires `formatTime`. */
  showTime?: boolean
  /** Show a small leading pin marker on pinned rows. Use ONLY on surfaces
   *  WITHOUT a "Pinned" group header (the desktop Recents sidebar) — the
   *  /chats page + mobile overlay already group pinned under a sticky header,
   *  so a per-row pin there would just duplicate it. */
  showPinMark?: boolean
  labels: ConversationRowLabels
  /** Formats `item.lastMessageAt` for the time column (only used when `showTime`). */
  formatTime?: (ms: number) => string
  onSelect: (item: ConversationRowItem) => void
  onStartRename: (item: ConversationRowItem) => void
  onPin: (item: ConversationRowItem) => void
  onDelete: (item: ConversationRowItem) => void
  onRenameChange: (text: string) => void
  onRenameCommit: () => void
  onRenameCancel: () => void
  className?: string
}

function ConversationRowImpl({
  item,
  active,
  isRenaming,
  renameText,
  showTime,
  showPinMark,
  labels: t,
  formatTime,
  onSelect,
  onStartRename,
  onPin,
  onDelete,
  onRenameChange,
  onRenameCommit,
  onRenameCancel,
  className,
}: ConversationRowProps) {
  const pending = item.status === 'pending'

  return (
    <div
      className={[C, className].filter(Boolean).join(' ')}
      data-active={active ? 'true' : undefined}
    >
      {isRenaming ? (
        <TextField
          className={`${C}__renameField`}
          aria-label={t.rename}
          value={renameText ?? ''}
          onChange={onRenameChange}
        >
          <Input
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                onRenameCommit()
              } else if (e.key === 'Escape') {
                onRenameCancel()
              }
            }}
            onBlur={onRenameCommit}
          />
        </TextField>
      ) : (
        <>
          {/* aria-current — without it the open chat is styling-only (data-active
           *  CSS); screen readers had no way to tell which row is active. */}
          <RACButton
            className={`${C}__main`}
            aria-current={active ? 'true' : undefined}
            onPress={() => onSelect(item)}
          >
            {/* Chat rows are TEXT-ONLY now (Val) — the modality glyph was
             *  removed (it still ships in @klyp/icons for the catalog/library).
             *  A small spinner is the ONLY leading mark, shown while a
             *  generation is in flight. */}
            {pending ? (
              <span className={`${C}__icon`} data-status={item.status}>
                <span className={`${C}__spinner`} role="img" aria-label={t.generating} />
              </span>
            ) : showPinMark && item.pinnedAt != null ? (
              // Leading pinned-marker — header-less surfaces only (sidebar).
              // Same filled glyph the "Pinned" group header uses elsewhere; the
              // spinner takes the slot while a generation is in flight.
              <span className={`${C}__pin`} aria-hidden>
                <PinIcon filled width={14} height={14} />
              </span>
            ) : null}
            <span className={`${C}__label`}>{item.title}</span>
            {showTime && formatTime ? (
              <span className={`${C}__time`}>{formatTime(item.lastMessageAt)}</span>
            ) : null}
          </RACButton>
          {/* Kebab overlays the row's right edge (swaps with the time column on
           *  hover) → Rename (inline) / Pin·Unpin / Delete. Migrated onto the
           *  unified @klyp/brand Dropdown (was ActionMenu) — gets the staggered
           *  reveal + one shared menu recipe. Separator sits ABOVE Delete; the
           *  `danger` variant paints it red. */}
          <Dropdown
            aria-label={t.actionsFor(item.title)}
            trigger={<MoreHorizontalOutline width={16} height={16} />}
            triggerProps={{
              className: `${C}__kebab`,
              'aria-label': t.actionsFor(item.title),
            }}
            className={`${C}__menu`}
            side="bottom"
            align="end"
            options={[
              {
                id: 'rename',
                label: t.rename,
                icon: <EditPencilOutline width={16} height={16} />,
              },
              {
                id: 'pin',
                // Outline pin in both states (no bulk/duotone, Val) — the
                // Pin ⇄ Unpin LABEL carries the state, not the glyph weight.
                label: item.pinnedAt != null ? t.unpin : t.pin,
                icon: <PinIcon width={16} height={16} />,
              },
              {
                id: 'delete',
                label: t.delete,
                icon: <TrashOutline width={16} height={16} />,
                variant: 'danger',
                separator: true,
              },
            ]}
            onAction={(id) => {
              if (id === 'rename') onStartRename(item)
              else if (id === 'pin') onPin(item)
              else if (id === 'delete') onDelete(item)
            }}
          />
        </>
      )}
    </div>
  )
}

// memo() — a chat-history list (sidebar Recents / mobile overlay / /chats) re-renders
// the row container often (virtualized scroll ticks, parent toggles, Convex query
// ticks). Shallow-compare skips rows whose props are unchanged. Relies on callers
// passing STABLE props (see the feature adapter's useMemo'd item + useCallback'd
// handlers, and useConversations' useCallback'd handlers) — otherwise memo is inert.
// Default shallow compare is correct here; do NOT add a custom comparator.
export const ConversationRow = memo(ConversationRowImpl)
export default ConversationRow
