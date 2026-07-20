import './CheckboxGroup.scss'

import type { ReactNode } from 'react'
import {
  CheckboxGroup as RACCheckboxGroup,
  type CheckboxGroupProps as RACCheckboxGroupProps,
} from 'react-aria-components'

// =====================================================================
// CheckboxGroup — Klyp canonical primitive
// =====================================================================
//
// Compound component pattern (multi-select):
//
//   <CheckboxGroup value={array} onChange={setArray} layout="grid"
//                  aria-label="…">
//     <Checkbox value="a" data-variant="card">…</Checkbox>
//     <Checkbox value="b" data-variant="card">…</Checkbox>
//   </CheckboxGroup>
//
// `layout="grid"` arranges items in an auto-fit minmax grid (cards / tiles).
// `layout="rows"` stacks items in a vertical column (default RAC look).
//
// Selected state uses `--color-fg-primary` for borders / fills — NO Warm
// Gold (per onboarding mock visual contract).

export type CheckboxGroupLayout = 'grid' | 'rows'

export interface CheckboxGroupProps extends Omit<RACCheckboxGroupProps, 'children' | 'className'> {
  /** Layout mode for items. `grid` = auto-fit card grid; `rows` = stacked column. Default `rows`. */
  layout?: CheckboxGroupLayout
  /** Optional extra className appended after `klyp-CheckboxGroup`. */
  className?: string
  children?: ReactNode
}

export function CheckboxGroup({
  layout = 'rows',
  className,
  children,
  ...props
}: CheckboxGroupProps) {
  return (
    <RACCheckboxGroup
      {...props}
      className={
        typeof className === 'string' && className.length > 0
          ? `klyp-CheckboxGroup ${className}`
          : 'klyp-CheckboxGroup'
      }
      data-layout={layout}
    >
      {children}
    </RACCheckboxGroup>
  )
}
