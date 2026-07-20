import './MediaCardActions.scss'

import {
  DownloadOutline,
  HeartFillOutline,
  HeartOutline,
  MoreHorizontalOutline,
  RegenerateOutline,
  TrashOutline,
} from '@klyp/icons/outline'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@klyp/ui/DropdownMenu'

import { useBrand } from '../_brand-context'

const MCA_COPY = {
  klyp: {
    actionsFor: (name: string) => `Actions for ${name}`,
    addFav: 'Add to favourites',
    removeFav: 'Remove from favourites',
    saveToDevice: 'Save to device',
    restore: 'Restore',
    deleteForever: 'Delete forever',
    delete: 'Delete',
  },
  unreals: {
    actionsFor: (name: string) => `Действия для ${name}`,
    addFav: 'В избранное',
    removeFav: 'Убрать из избранного',
    saveToDevice: 'Сохранить на устройство',
    restore: 'Восстановить',
    deleteForever: 'Удалить навсегда',
    delete: 'Удалить',
  },
} as const

/**
 * `<MediaCardActions>` — Tier 4 brand molecule. Top-right overflow `⋮` menu
 * for the Library v2 media surface. Mirrors `<CardActions>` (Generate /
 * Archive) but for the media-file mental model: Save to device, Delete (+
 * Restore on Trash rows, + Delete forever as the destructive entry).
 *
 * Reuses `@klyp/ui/DropdownMenu` (React Aria Popover + Menu) so a11y comes
 * for free — Esc closes, arrow keys navigate, focus restores to the
 * trigger. Trigger stops click propagation so opening the menu doesn't
 * fire the parent `<AssetCard>`'s onClick.
 */

export type MediaCardActionsProps = {
  /** Entity name surfaced in aria-labels and confirm copy. */
  entityName: string
  /** Save to device — caller does the actual download (window.open / anchor). */
  onSaveToDevice: () => void
  /** Soft delete → move to Trash. Hidden when `inTrash`. */
  onDelete?: () => void
  /** Restore from Trash. Visible only when `inTrash`. */
  onRestore?: () => void
  /** Permanent delete (with confirm). Visible only when `inTrash` — destructive. */
  onPermanentDelete?: () => void
  /** Whether the host card is showing a trashed row. Drives item set. */
  inTrash?: boolean
  /** Current favourite state of the host entity. Drives the menu item label
   *  ("Add to favourites" ↔ "Remove from favourites") + heart fill. */
  isFavourite?: boolean
  /** Toggle favourite from inside the menu (mirrors the standalone
   *  `<FavouriteToggle>` on the card surface). The next state is passed
   *  in case the consumer wants it without a follow-up state read. */
  onToggleFavourite?: (next: boolean) => void
  /** Notified when the popover opens or closes — lets the host overlay
   *  stay mounted while the menu is open even if the user moves the
   *  pointer off the card (otherwise React-Aria's portal'd menu would
   *  unmount with the parent on the next hover-loss). */
  onOpenChange?: (open: boolean) => void
}

const stopClick = (e: import('react').MouseEvent) => {
  e.stopPropagation()
}

export function MediaCardActions({
  entityName,
  onSaveToDevice,
  onDelete,
  onRestore,
  onPermanentDelete,
  inTrash = false,
  isFavourite,
  onToggleFavourite,
  onOpenChange,
}: MediaCardActionsProps) {
  const { brandId } = useBrand()
  const _mca = MCA_COPY[brandId]
  return (
    <div className="klyp-brand-MediaCardActions" onClick={stopClick}>
      <DropdownMenu onOpenChange={onOpenChange}>
        <DropdownMenuTrigger
          className="klyp-brand-MediaCardActions__trigger"
          aria-label={_mca.actionsFor(entityName)}
        >
          <MoreHorizontalOutline />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={6} style={{ minWidth: '200px' }}>
          {onToggleFavourite ? (
            <DropdownMenuItem
              onClick={() => onToggleFavourite(!isFavourite)}
              style={{ gap: '8px' }}
            >
              {isFavourite ? (
                <HeartFillOutline className="klyp-brand-MediaCardActions__icon" />
              ) : (
                <HeartOutline className="klyp-brand-MediaCardActions__icon" />
              )}
              <span>{isFavourite ? _mca.removeFav : _mca.addFav}</span>
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuItem onClick={onSaveToDevice} style={{ gap: '8px' }}>
            <DownloadOutline className="klyp-brand-MediaCardActions__icon" />
            <span>{_mca.saveToDevice}</span>
          </DropdownMenuItem>

          {inTrash ? (
            <>
              {onRestore ? (
                <DropdownMenuItem onClick={onRestore} style={{ gap: '8px' }}>
                  <RestoreIcon className="klyp-brand-MediaCardActions__icon" />
                  <span>{_mca.restore}</span>
                </DropdownMenuItem>
              ) : null}
              {onPermanentDelete ? (
                <DropdownMenuItem
                  onClick={onPermanentDelete}
                  data-destructive
                  style={{ gap: '8px' }}
                >
                  <TrashOutline className="klyp-brand-MediaCardActions__icon" />
                  <span>{_mca.deleteForever}</span>
                </DropdownMenuItem>
              ) : null}
            </>
          ) : onDelete ? (
            <DropdownMenuItem onClick={onDelete} data-destructive style={{ gap: '8px' }}>
              <TrashOutline className="klyp-brand-MediaCardActions__icon" />
              <span>{_mca.delete}</span>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default MediaCardActions

/**
 * Inline "rotate-left" arrow for the Restore menu item. `@klyp/icons/outline`
 * doesn't carry a refresh / undo glyph that reads as "restore from trash";
 * we inline a 24-viewBox stroke matching the Iconsax weight. Swap when a
 * proper glyph lands.
 */
function RestoreIcon(props: import('react').SVGProps<SVGSVGElement>) {
  return <RegenerateOutline {...props} />
}
