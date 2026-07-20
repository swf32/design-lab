import './Switch.scss'

import type { ReactNode } from 'react'
import { Switch as RACSwitch, type SwitchProps as RACSwitchProps } from 'react-aria-components'

// =====================================================================
// Switch — Klyp canonical primitive (Phase 2 of React Aria migration)
// =====================================================================
//
// Architecture: see ../../../../MIGRATION-REACT-ARIA-2026-04-30.md §5/§6/§16
//
// RAC Switch renders as <label> wrapping <input role="switch"> + children.
// We render a visual track+thumb span pair, then optional label children.
// State styling via data-* attributes set by RAC: [data-selected],
// [data-pressed], [data-hovered], [data-focus-visible], [data-disabled].
//
// Size scale is sm / md / lg. (The legacy `'default'` alias was removed
// 2026-06-25 — no consumer used it; a runtime fallback still maps any
// stray value to 'md' so an external caller can't crash.)

// === Public API types ===============================================
export type SwitchSize = 'sm' | 'md' | 'lg'

export interface SwitchProps extends Omit<RACSwitchProps, 'children'> {
  size?: SwitchSize
  /** Backward-compat alias for `isDisabled` (native HTML name). */
  disabled?: boolean
  /** Optional label rendered after the switch track. */
  children?: ReactNode
}

// === Internal mappings ==============================================
const SIZE_MAP: Record<SwitchSize, string> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
}

// === Component =====================================================
export function Switch({
  size = 'md',
  isDisabled,
  disabled,
  className,
  children,
  ...props
}: SwitchProps) {
  const s = SIZE_MAP[size] ?? 'md'
  const effectivelyDisabled = isDisabled || disabled

  return (
    <RACSwitch
      {...props}
      isDisabled={effectivelyDisabled || undefined}
      className={typeof className === 'string' ? `klyp-Switch ${className}` : 'klyp-Switch'}
      data-size={s}
    >
      <span className="klyp-Switch__track" aria-hidden="true">
        <span className="klyp-Switch__thumb" />
      </span>
      {children ? <span className="klyp-Switch__label">{children}</span> : null}
    </RACSwitch>
  )
}
