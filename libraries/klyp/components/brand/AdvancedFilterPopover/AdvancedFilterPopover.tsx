import './AdvancedFilterPopover.scss'

import { ChevronDownOutline, SettingsOutline } from '@klyp/icons/outline'
import { type ComponentType, type ReactNode, type SVGProps, useId } from 'react'
import {
  Button as RACButton,
  Dialog as RACDialog,
  DialogTrigger as RACDialogTrigger,
} from 'react-aria-components'
import { Popover } from '../Popover'
import { StatusDot } from '../StatusDot'

/**
 * `<AdvancedFilterPopover>` — extensible "more filters" popover. Trigger
 * = ghost icon-button (40×40, radius --r-chip) with a single accent dot
 * when any filter is active (no number — just a "has filters" cue).
 * Content = vertical stack of `(label, slot)` rows; the rows read as one
 * menu (section label + menu-row options), matching the DS DropdownMenu.
 *
 * Public API (compound children):
 *
 *   <AdvancedFilterPopover ariaLabel="Advanced filters" activeCount={2}>
 *     <AdvancedFilterPopover.Row label="Source">
 *       <Dropdown ... />
 *     </AdvancedFilterPopover.Row>
 *     <AdvancedFilterPopover.Row label="Style">
 *       <Dropdown ... />
 *     </AdvancedFilterPopover.Row>
 *   </AdvancedFilterPopover>
 *
 * The host owns the filter state. This component is presentational:
 *   - Trigger button + active dot (host computes the count; active = > 0)
 *   - Popover surface with stacked labelled slots
 *   - No filter logic, no submit/apply button (filters apply live as
 *     consumers change them — same pattern as the rest of Klyp).
 *
 * Architecture: RAC `<DialogTrigger>` + `<Button>` + `<Popover>`
 * + `<Dialog>`. Each `<AdvancedFilterPopover.Row>` is a simple
 * label + slot container — no marker pattern (rows render directly,
 * unlike LayoutDropdown.Option / TabSwitcher.Item which need parent
 * coordination).
 */

export type AdvancedFilterPopoverProps = {
  /** Screen-reader label for the trigger button and popover dialog. */
  ariaLabel: string
  /**
   * Count of currently active filters. When > 0 a single decorative
   * accent dot appears on the trigger — no number, just a "has filters"
   * cue (the exact count is noise here). Nothing renders when 0. Host
   * computes this from its own filter state; the trigger's aria-label
   * announces the active state, so the dot is purely decorative
   * (`aria-hidden`).
   */
  activeCount?: number
  /**
   * Trigger glyph. Default = `SettingsOutline` (Iconsax cog). Pass a
   * different Iconsax outline component to override. Ignored when
   * `triggerLabel` is set (the labelled pill has no leading glyph).
   */
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  /**
   * When set, the trigger renders as a labelled select-style pill (the
   * label text + a chevron) instead of the icon-only filter button — for
   * the desktop "Type" / "Source" multiselect pattern where each axis is
   * its own dropdown. The active dot still shows when `activeCount > 0`,
   * and because the label is static the trigger width never jumps.
   */
  triggerLabel?: ReactNode
  /** Popover surface variant. Default `'solid'`. */
  surface?: 'solid' | 'glass'
  /** Disable trigger + popover. */
  isDisabled?: boolean
  /** Extra className appended to the trigger button. */
  className?: string
  /**
   * Formats the visually-hidden announcement spoken when `activeCount`
   * changes. Defaults to English ("2 filters active"). Packages ship
   * EN-only strings — localized builds pass their own formatter.
   */
  formatActiveAnnouncement?: (count: number) => string
  /** Compound `<AdvancedFilterPopover.Row>` children (or arbitrary content). */
  children: ReactNode
}

export type AdvancedFilterPopoverRowProps = {
  /**
   * Label rendered above the slot. Omit for label-less rows where the
   * control inside is self-explanatory (e.g. iconOnly TabSwitcher for
   * View, short S/M/L chip row for Size).
   */
  label?: string
  /** Slot content — any control (Dropdown, Combobox, custom). */
  children: ReactNode
}

function AdvancedFilterPopoverRow({ label, children }: AdvancedFilterPopoverRowProps) {
  const labelId = useId()
  if (!label) {
    return <div className="klyp-AdvancedFilterPopover__row">{children}</div>
  }
  return (
    <div className="klyp-AdvancedFilterPopover__row">
      <div id={labelId} className="klyp-AdvancedFilterPopover__rowLabel">
        {label}
      </div>
      <div role="group" aria-labelledby={labelId} className="klyp-AdvancedFilterPopover__rowSlot">
        {children}
      </div>
    </div>
  )
}

function defaultActiveAnnouncement(count: number): string {
  return `${count} filters active`
}

function AdvancedFilterPopoverRoot({
  ariaLabel,
  activeCount = 0,
  triggerLabel,
  icon: Icon = SettingsOutline,
  surface = 'solid',
  isDisabled,
  className,
  formatActiveAnnouncement = defaultActiveAnnouncement,
  children,
}: AdvancedFilterPopoverProps) {
  const rootClass = ['klyp-AdvancedFilterPopover__trigger', className].filter(Boolean).join(' ')
  const hasActive = activeCount > 0
  const labelled = triggerLabel != null

  return (
    <RACDialogTrigger>
      <RACButton
        aria-label={hasActive ? `${ariaLabel} (${activeCount})` : ariaLabel}
        isDisabled={isDisabled}
        className={rootClass}
        data-active={hasActive ? 'true' : undefined}
        data-labelled={labelled ? 'true' : undefined}
      >
        {labelled ? (
          <span className="klyp-AdvancedFilterPopover__triggerLabel">{triggerLabel}</span>
        ) : (
          <span className="klyp-AdvancedFilterPopover__triggerIcon" aria-hidden>
            <Icon />
          </span>
        )}
        {labelled ? (
          <ChevronDownOutline className="klyp-AdvancedFilterPopover__triggerChevron" aria-hidden />
        ) : null}
        {hasActive ? (
          <span className="klyp-AdvancedFilterPopover__indicator" aria-hidden>
            <StatusDot tone="accent" size="sm" />
          </span>
        ) : null}
      </RACButton>
      {/* Live announcement of the active-filter count. Sits OUTSIDE the
          button on purpose: button children are presentational per ARIA,
          so a role="status" inside <button> is dropped from the a11y tree
          by spec (works in some browsers, silent in VoiceOver). The
          trigger's aria-label above covers focus/browse reading; this
          region covers on-the-fly count changes. */}
      <span className="klyp-AdvancedFilterPopover__srStatus" role="status" aria-live="polite">
        {hasActive ? formatActiveAnnouncement(activeCount) : ''}
      </span>
      <Popover surface={surface} className="klyp-AdvancedFilterPopover__popover">
        <RACDialog aria-label={ariaLabel} className="klyp-AdvancedFilterPopover__dialog">
          {children}
        </RACDialog>
      </Popover>
    </RACDialogTrigger>
  )
}

export const AdvancedFilterPopover = Object.assign(AdvancedFilterPopoverRoot, {
  Row: AdvancedFilterPopoverRow,
})

export default AdvancedFilterPopover
