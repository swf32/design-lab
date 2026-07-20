import './Command.scss'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@klyp/ui/Dialog'
import { Command as CommandPrimitive } from 'cmdk'
import type * as React from 'react'
import { type ComponentProps, type ComponentType, type SVGProps, useId } from 'react'

// =====================================================================
// Command — Klyp canonical primitive (Phase 2 of React Aria migration)
// =====================================================================
//
// This component intentionally KEEPS the cmdk library — it is the
// de-facto standard for command palettes (Linear, Vercel, Raycast).
// React Aria's <Autocomplete> is a different primitive and is NOT a
// 1:1 replacement. cmdk is composed with the already-migrated Dialog
// primitive so the surface stays consistent.
//
// Migration scope:
//   - Drop Tailwind utility classes — replaced with SCSS via BEM.
//   - Drop cn() — direct template-string class composition.
//   - Keep cmdk imports (CommandPrimitive.* sub-elements).
//   - CommandInput is a thin styled wrapper around cmdk's input (cmdk owns
//     filtering) with an OPTIONAL leading `icon` — off by default.
//   - Hook into cmdk's [data-selected] / [data-disabled] /
//     [cmdk-group-heading] data attributes for state styling.

// === Helper ==========================================================
function cls(base: string, extra?: string): string {
  return typeof extra === 'string' && extra.length > 0 ? `${base} ${extra}` : base
}

// === Command (root) ==================================================
function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive data-slot="command" className={cls('klyp-Command', className)} {...props} />
  )
}

// === CommandDialog ===================================================
function CommandDialog({
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
  className,
  showCloseButton = false,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, 'children'> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
  children: React.ReactNode
}) {
  // sr-only header must live INSIDE DialogContent: RAC wires the Heading
  // slot="title" to the dialog's aria-labelledby only from within the RAC
  // <Dialog>. Description has no RAC slot — wired by id ourselves.
  const descriptionId = useId()
  return (
    <Dialog {...props}>
      <DialogContent
        className={cls('klyp-Command__dialog', className)}
        showCloseButton={showCloseButton}
        aria-describedby={descriptionId}
      >
        <DialogHeader className="klyp-Command__sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription id={descriptionId}>{description}</DialogDescription>
        </DialogHeader>
        {/* cmdk root — provides the Command context that CommandInput /
            CommandList / CommandItem read for filtering + keyboard nav. Without
            it the palette renders but the input never filters the list. */}
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  )
}

// === CommandInput ====================================================
// The leading `icon` is OPTIONAL and OFF by default — a command palette
// ("Type a command…") is not a search box, so it ships icon-less. Consumers
// that genuinely search (e.g. a model picker) pass `icon={SearchOutline}`.
// Note: cmdk owns the actual <input> (it drives filtering), so this is a
// thin styled wrapper around CommandPrimitive.Input, NOT our <Input>.
// `trailing` renders INSIDE the input box after the field — clear buttons,
// kbd hints. Kept a plain slot so the primitive stays brand-free.
function CommandInput({
  className,
  icon: Icon,
  trailing,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input> & {
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  trailing?: React.ReactNode
}) {
  return (
    <div data-slot="command-input-wrapper" className="klyp-Command__input-wrapper">
      {Icon ? <Icon className="klyp-Command__input-icon" aria-hidden="true" /> : null}
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cls('klyp-Command__input', className)}
        {...props}
      />
      {trailing ? (
        <div data-slot="command-input-trailing" className="klyp-Command__input-trailing">
          {trailing}
        </div>
      ) : null}
    </div>
  )
}

// === CommandList =====================================================
// Plain function — ref arrives via props under React 19 and is forwarded
// by the spread (cmdk's List props already include RefAttributes).
function CommandList({ className, ...props }: ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cls('klyp-Command__list', className)}
      {...props}
    />
  )
}

// === CommandEmpty ====================================================
function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cls('klyp-Command__empty', className)}
      {...props}
    />
  )
}

// === CommandLoading ==================================================
// Styled cmdk `Command.Loading` — mount it while async results are in
// flight (cmdk gives it progressbar semantics; `label` is the aria-label).
// Consumers gate CommandEmpty on !loading to avoid a "No results" flash.
function CommandLoading({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Loading>) {
  return (
    <CommandPrimitive.Loading
      data-slot="command-loading"
      className={cls('klyp-Command__loading', className)}
      {...props}
    />
  )
}

// === CommandGroup ====================================================
function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cls('klyp-Command__group', className)}
      {...props}
    />
  )
}

// === CommandSeparator ================================================
function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cls('klyp-Command__separator', className)}
      {...props}
    />
  )
}

// === CommandItem =====================================================
function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cls('klyp-Command__item', className)}
      {...props}
    >
      {children}
    </CommandPrimitive.Item>
  )
}

// === CommandShortcut =================================================
function CommandShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="command-shortcut"
      className={cls('klyp-Command__shortcut', className)}
      {...props}
    />
  )
}

// === CommandFooter ===================================================
// Bottom hint band (border-top, muted, bleeds to the surface edges).
// Brand palettes fill it with <Kbd> hints; a plain div at this tier.
function CommandFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="command-footer" className={cls('klyp-Command__footer', className)} {...props} />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandLoading,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  CommandFooter,
}
