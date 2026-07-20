import './InputGroup.scss'

import { Button, type ButtonProps } from '@klyp/ui/Button'
import { Input } from '@klyp/ui/Input'
import { Textarea } from '@klyp/ui/Textarea'
import type * as React from 'react'

// =====================================================================
// InputGroup — Klyp canonical compound primitive
//   (Phase 2 of React Aria migration)
// =====================================================================
//
// Architecture: see ../../../../MIGRATION-REACT-ARIA-2026-04-30.md §5/§6/§16
//
// Compound API mirrors the previous Tailwind/CVA implementation so the
// 3 existing importers (combobox, command, prompt-input) keep working
// without any prop changes:
//
//   <InputGroup>
//     <InputGroupAddon align="inline-start">...</InputGroupAddon>
//     <InputGroupInput placeholder="..." />
//     <InputGroupAddon align="inline-end">
//       <InputGroupButton size="icon-xs" variant="ghost">...</InputGroupButton>
//     </InputGroupAddon>
//   </InputGroup>
//
// Implementation rules (per migration plan):
//   - NO Tailwind / CVA / cn() — pure SCSS via data-attributes.
//   - Tokens via `var(--...)` only, no magic numbers.
//   - Variants live on data-attrs:
//       InputGroup       -> data-size="sm|md|lg" + data-variant="outline|filled|ghost"
//       InputGroupAddon  -> data-align="inline-start|inline-end|block-start|block-end"
//       InputGroupButton -> data-size="xs|sm|icon-xs|icon-sm"
//   - InputGroupAddon retains its click-to-focus-input behaviour from the
//     original implementation: clicking empty addon space focuses the
//     adjacent <input>, while clicks on inner buttons/links fall through.
//   - Size cascades to nested <Input>/<Textarea> via the SCSS selector
//     `.klyp-InputGroup[data-size='X'] > .klyp-Input` so callers don't
//     repeat the size prop on the child control.

// === InputGroup (root) =============================================
export type InputGroupSize = 'sm' | 'md' | 'lg'
export type InputGroupVariant = 'outline' | 'filled' | 'ghost'

export interface InputGroupProps extends React.ComponentProps<'div'> {
  /** Vertical scale of the group + cascading size for inner Input/Textarea. */
  size?: InputGroupSize
  /** Visual treatment of the shell (border, fill). */
  variant?: InputGroupVariant
}

export function InputGroup({
  className,
  size = 'md',
  variant = 'outline',
  ...props
}: InputGroupProps) {
  return (
    <div
      role="group"
      data-slot="input-group"
      data-size={size}
      data-variant={variant}
      {...props}
      className={
        typeof className === 'string' && className.length > 0
          ? `klyp-InputGroup ${className}`
          : 'klyp-InputGroup'
      }
    />
  )
}

// === InputGroupAddon ==============================================
export type InputGroupAddonAlign = 'inline-start' | 'inline-end' | 'block-start' | 'block-end'

export interface InputGroupAddonProps extends React.ComponentProps<'div'> {
  align?: InputGroupAddonAlign
}

export function InputGroupAddon({
  className,
  align = 'inline-start',
  onClick,
  ...props
}: InputGroupAddonProps) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      {...props}
      className={
        typeof className === 'string' && className.length > 0
          ? `klyp-InputGroup__addon ${className}`
          : 'klyp-InputGroup__addon'
      }
      onClick={(e) => {
        // Let inner interactive elements handle their own clicks: native
        // <button>, <a>, and anything with role="button" (e.g. ToolButton).
        if (!(e.target as HTMLElement).closest('button, a, [role="button"]')) {
          // Focus adjacent input when clicking decorative space of the addon.
          e.currentTarget.parentElement?.querySelector('input')?.focus()
        }
        onClick?.(e)
      }}
    />
  )
}

// === InputGroupButton =============================================
export type InputGroupButtonSize = 'xs' | 'sm' | 'icon-xs' | 'icon-sm'

export interface InputGroupButtonProps extends Omit<ButtonProps, 'size' | 'type'> {
  size?: InputGroupButtonSize
  type?: 'button' | 'submit' | 'reset'
}

export function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'xs',
  ...props
}: InputGroupButtonProps) {
  return (
    <Button
      type={type}
      variant={variant}
      // Map InputGroupButton sizes onto Button sizes — they share the same names.
      size={size}
      data-size={size}
      className={
        typeof className === 'string' && className.length > 0
          ? `klyp-InputGroup__button ${className}`
          : 'klyp-InputGroup__button'
      }
      {...props}
    />
  )
}

// === InputGroupText ===============================================
export type InputGroupTextProps = React.ComponentProps<'span'>

export function InputGroupText({ className, ...props }: InputGroupTextProps) {
  return (
    <span
      data-slot="input-group-text"
      {...props}
      className={
        typeof className === 'string' && className.length > 0
          ? `klyp-InputGroup__text ${className}`
          : 'klyp-InputGroup__text'
      }
    />
  )
}

// === InputGroupInput ==============================================
export type InputGroupInputProps = React.ComponentProps<typeof Input>

export function InputGroupInput({ className, ...props }: InputGroupInputProps) {
  return (
    <Input
      data-slot="input-group-control"
      {...props}
      className={
        typeof className === 'string' && className.length > 0
          ? `klyp-InputGroup__input ${className}`
          : 'klyp-InputGroup__input'
      }
    />
  )
}

// === InputGroupTextarea ===========================================
export type InputGroupTextareaProps = React.ComponentProps<typeof Textarea>

export function InputGroupTextarea({ className, ...props }: InputGroupTextareaProps) {
  return (
    <Textarea
      data-slot="input-group-control"
      {...props}
      className={
        typeof className === 'string' && className.length > 0
          ? `klyp-InputGroup__textarea ${className}`
          : 'klyp-InputGroup__textarea'
      }
    />
  )
}
