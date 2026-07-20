import './SearchField.scss'

import { SearchOutline, XOutline } from '@klyp/icons'
import type { Ref } from 'react'
import {
  Button as RACButton,
  Input as RACInput,
  SearchField as RACSearchField,
  type SearchFieldProps as RACSearchFieldProps,
} from 'react-aria-components'

// =====================================================================
// SearchField — Klyp canonical primitive (initial release 2026-05-25)
// =====================================================================
//
// Headless search-input primitive composed on top of React Aria
// Components `SearchField`. Ships three slots inside the RAC root:
//
//   [icon: SearchOutline] [input] [clear button]
//
// RAC gives us out-of-the-box semantics: `role="searchbox"`, ESC clears
// the value, `data-empty` on the root reflects whether the field has
// content (used to hide the clear button), `onClear` callback, etc. We
// stay faithful to the @klyp/ui pattern from Input.tsx — composed
// className, `data-size` + `data-variant` attributes the SCSS reads.
//
// Inherited from RAC (pass through `{...props}`, no extra wiring):
//   value / defaultValue / onChange  — controlled or uncontrolled value
//   onSubmit                         — fires on Enter (the search action)
//   onClear                          — fires on × / Escape
//   isInvalid / isDisabled / isReadOnly / name / form — standard field props
//
// NB: no `isLoading` here — none of the benchmarked DS (React Aria, Geist,
// Radix, HeroUI) expose a loading state on the search field itself; in-flight
// feedback is the consumer's concern (e.g. a spinner by the results list).
//
// First consumer (post-merge swap by team lead): the `/canvas` board
// hub search at apps/web/src/routes/canvas.index.tsx, replacing an
// inline Input + raw <svg> wrapper.

export type SearchFieldSize = 'sm' | 'md' | 'lg'
export type SearchFieldVariant = 'outline' | 'filled' | 'ghost'

export interface SearchFieldProps extends Omit<RACSearchFieldProps, 'className' | 'children'> {
  /**
   * Visual size of the control. Maps to `[data-size]` on the root.
   * Mirrors the Input primitive ramp (28 / 32 / 40 px).
   */
  size?: SearchFieldSize
  /**
   * Visual variant. `outline` is the historical look (1px border,
   * transparent bg). `filled` swaps the border for a surface fill;
   * `ghost` removes both — useful inside compound inputs.
   */
  variant?: SearchFieldVariant
  /**
   * Placeholder text shown when the field is empty. Defaults to
   * `Search` — English copy per CLAUDE.md user-facing-strings rule.
   */
  placeholder?: string
  /**
   * Optional extra className appended after `klyp-SearchField`.
   */
  className?: string
  /**
   * React 19 ref-as-prop. Targets the RAC root (`<div role="search">`).
   */
  ref?: Ref<HTMLDivElement>
  /**
   * Ref to the inner `<input>`. Use when the caller must focus the field
   * imperatively (e.g. after an async mount / panel expand — the chat
   * sidebar's collapsed→expanded search focus carry).
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * `aria-label` for the clear button. Override for non-English brands
   * (e.g. pass `'Очистить'` for Unreals). Defaults to `'Clear search'`.
   */
  clearAriaLabel?: string
}

export function SearchField({
  size = 'md',
  variant = 'outline',
  placeholder = 'Search',
  clearAriaLabel = 'Clear search',
  className,
  ref,
  inputRef,
  ...props
}: SearchFieldProps) {
  const composed =
    typeof className === 'string' && className.length > 0
      ? `klyp-SearchField ${className}`
      : 'klyp-SearchField'

  // RAC requires a labeled control. If the consumer didn't pass an
  // explicit `aria-label` / `aria-labelledby` AND didn't render a visible
  // `<Label>` child, fall back to the placeholder so the field stays
  // accessible by default. Consumer-provided labels always win because
  // `{...props}` is spread AFTER our fallback `aria-label`.
  const hasExplicitLabel =
    typeof props['aria-label'] === 'string' || typeof props['aria-labelledby'] === 'string'
  const ariaLabelFallback = hasExplicitLabel ? undefined : placeholder

  return (
    <RACSearchField
      ref={ref}
      aria-label={ariaLabelFallback}
      {...props}
      className={composed}
      data-size={size}
      data-variant={variant}
    >
      <span className="klyp-SearchField__icon" aria-hidden="true">
        <SearchOutline width={16} height={16} />
      </span>
      <RACInput ref={inputRef} className="klyp-SearchField__input" placeholder={placeholder} />
      <RACButton className="klyp-SearchField__clear" aria-label={clearAriaLabel}>
        <XOutline width={12} height={12} aria-hidden="true" />
      </RACButton>
    </RACSearchField>
  )
}

export default SearchField
