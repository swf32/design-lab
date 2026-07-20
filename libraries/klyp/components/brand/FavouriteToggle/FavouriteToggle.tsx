import './FavouriteToggle.scss'

import { HeartFillOutline, HeartOutline } from '@klyp/icons/outline'
import { ToggleButton } from 'react-aria-components'

import { useBrand } from '../_brand-context'

/**
 * `<FavouriteToggle>` — favourite affordance for Library v2 media cards.
 * Lives in the top-right action row (next to the overflow menu) since
 * `2026-05-25` — moved out of top-left to free that corner for the
 * MediaGrid selection checkbox. Persistent at rest when active, hover-
 * revealed otherwise (positioning + reveal owned by the host overlay).
 *
 * Tier: brand atom (Tier 4). Wraps React Aria `<ToggleButton>` so the
 * pressed state, keyboard activation (Space/Enter), and `aria-pressed`
 * come for free. Visual: small glass pill hosting an Iconsax heart glyph
 * — outline when off, filled (bold) gold when active.
 */

export type FavouriteToggleProps = {
  /** Current state — pressed = favourited. */
  isFavourite: boolean
  /** Toggle handler. The next state is passed in case the consumer wants
   *  it without a follow-up state read. */
  onToggle: (next: boolean) => void
  /** Optional aria-label override. Defaults to "Add to favourites" / "Remove
   *  from favourites" by state. */
  label?: string
  /** Forwarded to the root button for callsite-specific extras (e.g.
   *  marking the toggle as the persistent hot-zone in tests). */
  className?: string
}

export function FavouriteToggle({ isFavourite, onToggle, label, className }: FavouriteToggleProps) {
  const { brandId } = useBrand()
  const ADD_FAV = brandId === 'unreals' ? 'В избранное' : 'Add to favourites'
  const REMOVE_FAV = brandId === 'unreals' ? 'Убрать из избранного' : 'Remove from favourites'
  const ariaLabel = label ?? (isFavourite ? REMOVE_FAV : ADD_FAV)
  const Icon = isFavourite ? HeartFillOutline : HeartOutline
  return (
    <ToggleButton
      isSelected={isFavourite}
      onChange={onToggle}
      aria-label={ariaLabel}
      className={
        typeof className === 'string' ? `klyp-FavouriteToggle ${className}` : 'klyp-FavouriteToggle'
      }
    >
      <Icon className="klyp-FavouriteToggle__icon" width={16} height={16} />
    </ToggleButton>
  )
}

export default FavouriteToggle
