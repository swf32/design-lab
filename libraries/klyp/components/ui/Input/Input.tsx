import './Input.scss'

import { Input as RACInput, type InputProps as RACInputProps } from 'react-aria-components'

// =====================================================================
// Input — Klyp canonical primitive (Phase 2 of React Aria migration)
// =====================================================================
//
// Architecture: see ../../../../MIGRATION-REACT-ARIA-2026-04-30.md §5/§6/§16
//
// Backward-compat: existing importers use the legacy `<Input>` from
// `@/components/ui/input` which forwarded all native `<input>` props
// plus a custom `className`. We keep that contract so call-sites don't
// have to change during incremental migration.
//
// RAC `Input` is a thin styled native <input>, so it accepts every
// attribute a native input accepts (type, value, defaultValue, onChange,
// placeholder, name, autoComplete, ...). Focus / invalid / hover state
// is handled via native `:focus-visible` and `[aria-invalid='true']`
// in SCSS — RAC also sets data-* attrs but the native pseudo-classes
// are sufficient for a real <input>.
//
// 2026-05-17 — promoted beta → stable. Added `size` and `variant`
// design-system props. Native HTML `size` attr (number-of-characters
// width hint, rarely used on text inputs) is dropped from the public
// API to avoid a name clash; no production call-site relied on it.

export type InputSize = 'sm' | 'md' | 'lg'
export type InputVariant = 'outline' | 'filled' | 'ghost'

export interface InputProps extends Omit<RACInputProps, 'className' | 'size'> {
  /**
   * Visual size of the input. Maps to a `[data-size]` attribute the
   * SCSS reads. Default `md` preserves the existing baseline.
   */
  size?: InputSize
  /**
   * Visual variant. `outline` is the historical look (transparent bg,
   * 1px border). `filled` swaps the border for a surface fill;
   * `ghost` removes both, useful inside compound inputs.
   */
  variant?: InputVariant
  /**
   * Optional extra className appended after `klyp-Input`. Most call-sites
   * don't pass this — variants are handled inside SCSS — but kept for
   * backward compatibility with the previous Tailwind-based primitive.
   */
  className?: string
}

export function Input({ size = 'md', variant = 'outline', className, ...props }: InputProps) {
  const composed =
    typeof className === 'string' && className.length > 0 ? `klyp-Input ${className}` : 'klyp-Input'

  return <RACInput {...props} className={composed} data-size={size} data-variant={variant} />
}

export default Input
