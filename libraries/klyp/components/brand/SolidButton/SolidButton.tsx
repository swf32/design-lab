/**
 * `<SolidButton>` — flat solid-fill CTA. Used by Unreals brand as the
 * replacement render for `<MeshButton>` callsites (the MeshButton itself
 * brand-gates to this component when `VITE_BRAND !== 'klyp'`).
 *
 * Same RAC button under the hood + same size + busy + disabled props
 * as MeshButton's static mode, so a MeshButton-shaped invocation maps
 * 1:1. NO border, NO shadow, NO inset glow, NO blob mesh — solid fill
 * only.
 *
 * State machine (idle/processing/success/error) is intentionally NOT
 * supported here — Unreals callsites stay static. If a callsite passes
 * `state`, MeshButton's gate strips it before delegating, so callers
 * don't break (visual feedback degrades to busy/disabled only).
 */

import './SolidButton.scss'

import type { ComponentProps, CSSProperties, ReactNode } from 'react'
import { Button as RACButton } from 'react-aria-components'

export type SolidButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface SolidButtonProps
  extends Omit<ComponentProps<typeof RACButton>, 'children' | 'className' | 'style'> {
  size?: SolidButtonSize
  busy?: boolean
  /** Slot-based width: fill the section the button is placed in. */
  fill?: boolean
  className?: string
  children?: ReactNode
  style?: CSSProperties
}

export function SolidButton({
  size = 'md',
  busy = false,
  fill = false,
  className,
  children,
  style,
  ...rest
}: SolidButtonProps) {
  const composed = ['klyp-SolidButton', className].filter(Boolean).join(' ')
  return (
    <RACButton
      {...rest}
      data-size={size}
      data-busy={busy ? '' : undefined}
      data-fill={fill ? '' : undefined}
      className={composed}
      style={style}
    >
      <span className="klyp-SolidButton__content">{children}</span>
    </RACButton>
  )
}

export default SolidButton
