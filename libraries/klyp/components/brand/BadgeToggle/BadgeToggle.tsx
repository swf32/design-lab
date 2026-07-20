import type { BadgeIntent } from '@klyp/ui/Badge'
import type { ReactElement, ReactNode } from 'react'
import {
  ToggleButton as RACToggleButton,
  ToggleButtonGroup as RACToggleButtonGroup,
  type ToggleButtonProps as RACToggleButtonProps,
} from 'react-aria-components'
import './BadgeToggle.scss'

/**
 * BadgeToggle — interactive filter row with per-item color intent.
 *
 * Visual contract is borrowed from `<Badge>` (intent palette + subtle fill +
 * Geist sizing), behavior layer is RAC `ToggleButtonGroup` (single-select,
 * roving tabindex, arrow-key nav). Unlike `<ChipToggle>` which paints a single
 * gold gradient on the selected item, BadgeToggle keeps each item's
 * **own intent color** on the selected state — useful for category filters
 * where the kind itself carries semantic color (e.g. Library: blue=character,
 * green=location, amber=outfit, purple=vibe, red=script).
 *
 * Compound API mirrors `<ChipToggle>` / `<TabSwitcher>`:
 *
 *   <BadgeToggle value={filter} onValueChange={setFilter} ariaLabel="Filter">
 *     <BadgeToggle.Item value="all" intent="gold">All</BadgeToggle.Item>
 *     <BadgeToggle.Item value="character" intent="blue">Char</BadgeToggle.Item>
 *     <BadgeToggle.Item value="location" intent="green">Loc</BadgeToggle.Item>
 *   </BadgeToggle>
 *
 * Each item renders with a colored leading dot (`::before` pseudo, color
 * derived from `data-intent`) so the kind is glanceable even without label
 * reading. On select, the item's background fills with the same intent's
 * `--color-badge-{intent}-bg` token (subtle wash, not solid).
 *
 * Selection model is single-select. `disallowEmptySelection` is on by
 * default so one option always stays active — pass `allowEmpty` to relax.
 */

export type BadgeToggleSize = 'sm' | 'md'

type BadgeToggleProps = {
  value: string
  onValueChange: (next: string) => void
  ariaLabel: string
  size?: BadgeToggleSize
  /** Allow no selection. Default `false` (one item always active). */
  allowEmpty?: boolean
  /** Disable the whole group. */
  isDisabled?: boolean
  /**
   * Optional element rendered inside the same chip surface, immediately
   * before the toggle items. Use for a related but non-toggle control —
   * e.g. a scope dropdown (`<Button variant="ghost">All series ▾</Button>`)
   * that shares the filter rail with the kind chips. The element is laid
   * out as a peer in the same flex line; caller styles it to match the
   * toggle items. The `<ToggleButtonGroup>` inner div carries the
   * `role="radiogroup"` so screen readers still see exactly six radio
   * options — the leading element stays a plain button outside the group.
   */
  leading?: ReactNode
  className?: string
  children: ReactNode
}

type ItemProps = Omit<RACToggleButtonProps, 'id' | 'children'> & {
  value: string
  intent?: BadgeIntent
  children: ReactNode
}

function BadgeToggleRoot({
  value,
  onValueChange,
  ariaLabel,
  size = 'sm',
  allowEmpty = false,
  isDisabled,
  leading,
  className,
  children,
}: BadgeToggleProps): ReactElement {
  const rootClass = ['klyp-BadgeToggle', className].filter(Boolean).join(' ')

  return (
    <div className={rootClass} data-size={size}>
      {leading}
      <RACToggleButtonGroup
        selectionMode="single"
        selectedKeys={new Set([value])}
        onSelectionChange={(keys) => {
          const first = keys.values().next().value
          if (typeof first === 'string') onValueChange(first)
        }}
        disallowEmptySelection={!allowEmpty}
        isDisabled={isDisabled}
        aria-label={ariaLabel}
        className="klyp-BadgeToggle__group"
      >
        {children}
      </RACToggleButtonGroup>
    </div>
  )
}

function BadgeToggleItem({ value, intent = 'gray', className, children, ...rest }: ItemProps) {
  const itemClass =
    typeof className === 'function'
      ? className
      : ['klyp-BadgeToggle__item', className].filter(Boolean).join(' ')

  return (
    <RACToggleButton id={value} data-intent={intent} className={itemClass} {...rest}>
      <span aria-hidden className="klyp-BadgeToggle__dot" />
      <span className="klyp-BadgeToggle__label">{children}</span>
    </RACToggleButton>
  )
}

export const BadgeToggle = Object.assign(BadgeToggleRoot, { Item: BadgeToggleItem })
export type { BadgeToggleProps }

export default BadgeToggle
