import './RadioGroup.scss'

import type { ReactNode } from 'react'
import {
  Radio as RACRadio,
  RadioGroup as RACRadioGroup,
  type RadioGroupProps as RACRadioGroupProps,
  type RadioProps as RACRadioProps,
} from 'react-aria-components'

// =====================================================================
// RadioGroup — Klyp canonical primitive
// =====================================================================
//
// Compound component pattern:
//
//   <RadioGroup value={v} onChange={setV} layout="grid" aria-label="…">
//     <Radio value="solo">Solo</Radio>
//     <Radio value="team" data-variant="card">…</Radio>
//   </RadioGroup>
//
// `layout="grid"` arranges items in an auto-fit minmax grid (cards / tiles).
// `layout="rows"` stacks items in a vertical column (default RAC look).
//
// State styling lives in RadioGroup.scss and reads from RAC's auto-applied
// data-attributes ([data-selected], [data-hovered], [data-pressed],
// [data-focus-visible], [data-disabled]). Selected state uses
// `--color-fg-primary` for borders / fills — NO Warm Gold here per the
// onboarding mock visual contract.

export type RadioGroupLayout = 'grid' | 'rows'

export interface RadioGroupProps extends Omit<RACRadioGroupProps, 'children' | 'className'> {
  /** Layout mode for items. `grid` = auto-fit card grid; `rows` = stacked column. Default `rows`. */
  layout?: RadioGroupLayout
  /** Optional extra className appended after `klyp-RadioGroup`. */
  className?: string
  children?: ReactNode
}

export function RadioGroup({ layout = 'rows', className, children, ...props }: RadioGroupProps) {
  return (
    <RACRadioGroup
      {...props}
      className={
        typeof className === 'string' && className.length > 0
          ? `klyp-RadioGroup ${className}`
          : 'klyp-RadioGroup'
      }
      data-layout={layout}
    >
      {children}
    </RACRadioGroup>
  )
}

export interface RadioProps extends Omit<RACRadioProps, 'className'> {
  /**
   * Visual variant. `default` = inline radio + label row;
   * `card` = self-contained card (used with `<SelectableCard>` children
   * inside a grid layout); `menu-row` = compact DropdownMenu-style row
   * (radio molecule + label, hover-fill) for single-select menus/popovers.
   */
  'data-variant'?: 'default' | 'card' | 'menu-row'
  /** Optional extra className appended after `klyp-Radio`. */
  className?: string
}

export function Radio({ className, ...props }: RadioProps) {
  const variant = props['data-variant'] ?? 'default'
  return (
    <RACRadio
      {...props}
      data-variant={variant}
      className={
        typeof className === 'string' && className.length > 0
          ? `klyp-Radio ${className}`
          : 'klyp-Radio'
      }
    />
  )
}
