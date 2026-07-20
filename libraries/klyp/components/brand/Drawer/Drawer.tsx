import './Drawer.scss'

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@klyp/ui/Sheet'
import type { ReactNode } from 'react'

// =====================================================================
// Drawer — Klyp brand wrapper (Phase 3 of Tailwind → SCSS migration)
// =====================================================================
//
// Slot-based slide-in panel. Built on the canonical <Sheet> primitive
// (React Aria Modal/Dialog) for proper portal/focus-trap/positioning.
// Sides: `right` (default, inspectors), `left` (nav drawers), `top`,
// `bottom` (mobile bottom-sheet w/ grab handle).
//
// Sheet already owns the slide animation, fixed positioning, surface,
// and side-data attributes. This wrapper adds Klyp-specific:
//   • bottom-side grab handle
//   • scrollable body region
//   • optional bordered footer
//   • header padding override (no bottom padding to hug body)
//   • viewport cap for top/bottom variants

export type DrawerSide = 'bottom' | 'right' | 'left' | 'top'

export type DrawerProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: ReactNode
  side?: DrawerSide
  title?: ReactNode
  description?: ReactNode
  footer?: ReactNode
  /** Additional class for the content panel. */
  className?: string
  children: ReactNode
}

export function Drawer({
  open,
  onOpenChange,
  trigger,
  side = 'right',
  title,
  description,
  footer,
  className,
  children,
}: DrawerProps) {
  const composedClassName =
    typeof className === 'string' ? `klyp-Drawer ${className}` : 'klyp-Drawer'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger render={<span className="klyp-Drawer__trigger">{trigger}</span>} />}
      <SheetContent side={side} className={composedClassName}>
        {(title || description) && (
          <SheetHeader className="klyp-Drawer__header" data-side={side}>
            {side === 'bottom' && <div aria-hidden className="klyp-Drawer__grab" />}
            {title && <SheetTitle className="klyp-Drawer__title">{title}</SheetTitle>}
            {description && (
              <SheetDescription className="klyp-Drawer__description">
                {description}
              </SheetDescription>
            )}
          </SheetHeader>
        )}
        <div className="klyp-Drawer__body">{children}</div>
        {footer && <footer className="klyp-Drawer__footer">{footer}</footer>}
      </SheetContent>
    </Sheet>
  )
}

Drawer.Trigger = SheetTrigger
Drawer.Close = SheetClose
