import { MagicStarOutline, TrashOutline } from '@klyp/icons/outline'
import { Button } from '@klyp/ui'

import { useBrand } from '../_brand-context'

import './CardActions.scss'

const CA_COPY = {
  klyp: {
    generatingAriaPrefix: (name: string) => `Generating AI cover for ${name}…`,
    generateAriaPrefix: (name: string) => `Generate AI cover for ${name}`,
    archive: (name: string) => `Archive ${name}`,
  },
  unreals: {
    generatingAriaPrefix: (name: string) => `Генерируем AI-обложку для ${name}…`,
    generateAriaPrefix: (name: string) => `Сгенерировать AI-обложку для ${name}`,
    archive: (name: string) => `Архивировать ${name}`,
  },
} as const

/**
 * `<CardActions>` — Tier 4 brand molecule for hover-revealed quick-actions
 * inside an `<AssetCard>` (slotted via `actionsSlot`).
 *
 * Renders two icon-buttons stacked top-right of the card:
 *   1. Generate AI Cover (✨ MagicStar) — triggers cover regeneration.
 *   2. Archive (🗑 Trash)               — soft-deletes the entity.
 *
 * Visibility rules (driven by SCSS):
 *   - Hidden by default, revealed on `:hover` / `:focus-within` of the card.
 *   - Always visible at 60% opacity on touch (`@media (hover: none)`).
 *   - Hidden entirely when card root has `data-selection-mode="true"`
 *     (selection mode replaces hover-actions with a checkbox overlay — Task 21).
 *   - Hidden on tiny cards (≤140px container width).
 *   - Honours `prefers-reduced-motion`.
 *
 * @see docs/superpowers/specs/2026-05-07-card-hover-actions-design.md §10
 */
export interface CardActionsProps {
  /** Entity name for aria-labels (e.g., "Pyramid Fall"). */
  entityName: string
  /** Click → archive (caller handles optimistic + toast Undo). */
  onArchive: () => void
  /** Click → trigger AI cover generation (caller handles loading state). */
  onGenerate: () => void
  /** When true, Generate button shows spinner + disabled. */
  coverLoading?: boolean
  /** Override label for the archive button (e.g., "Restore" on archived rows). */
  archiveLabel?: string
}

// Stop card click-through: the AssetCard root is itself a clickable
// <div role="button"> after the 8a3a7cb fix. Any press inside the slot
// would otherwise bubble up to handleRootClick → unwanted navigation.
//
// We stop only `click` (synthetic, bubble-phase) — that's enough to block
// AssetCard's onClick handler. Critically, we DO NOT stop pointer events:
// React Aria's `usePress` on the inner Button uses pointerdown/pointerup
// to detect the press; intercepting them at this wrapper would race with
// RAC's pointer-capture and silently kill onPress (root cause of the
// 2026-05-07 "no network request fires" bug — see audit-3 finding C-1).
const stopClick = (e: import('react').MouseEvent) => {
  e.stopPropagation()
}

export function CardActions(props: CardActionsProps) {
  const { brandId } = useBrand()
  const _ca = CA_COPY[brandId]
  const { entityName, onArchive, onGenerate, coverLoading, archiveLabel } = props
  return (
    <div className="klyp-brand-CardActions" onClick={stopClick}>
      <Button
        size="icon-xs"
        variant="outline"
        aria-label={
          coverLoading ? _ca.generatingAriaPrefix(entityName) : _ca.generateAriaPrefix(entityName)
        }
        onPress={onGenerate}
        isDisabled={coverLoading}
        data-cover-loading={coverLoading || undefined}
      >
        {coverLoading ? (
          <span className="klyp-brand-CardActions__spinner" aria-hidden="true" />
        ) : (
          <MagicStarOutline />
        )}
      </Button>
      <Button
        size="icon-xs"
        variant="outline"
        aria-label={archiveLabel ?? _ca.archive(entityName)}
        onPress={onArchive}
      >
        <TrashOutline />
      </Button>
    </div>
  )
}

export default CardActions
