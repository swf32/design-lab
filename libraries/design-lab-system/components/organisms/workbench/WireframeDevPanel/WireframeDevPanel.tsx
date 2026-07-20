import './WireframeDevPanel.scss'
import { useEffect, useId, useRef, type HTMLAttributes, type ReactNode } from 'react'
import { inspectionAttributes, slotAttributes } from '@design-lab/system/inspection'
import { CodeIcon } from '@design-lab/system/icons'
import { WorkbenchAction } from '../../../atoms/actions/WorkbenchAction/WorkbenchAction'

export type WireframeDevPanelProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  triggerLabel?: string
}

export function WireframeDevPanel({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  triggerLabel = 'Dev mode',
  className,
  ...props
}: WireframeDevPanelProps) {
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const wasOpen = useRef(open)

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) triggerRef.current?.focus()
      wasOpen.current = false
      return
    }
    wasOpen.current = true
    window.requestAnimationFrame(() => headingRef.current?.focus())
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target))
        onOpenChange(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('pointerdown', dismiss)
    window.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      window.removeEventListener('keydown', escape)
    }
  }, [open, onOpenChange])

  return (
    <div
      ref={rootRef}
      className={`dl-wireframe-dev-panel${open ? ' dl-wireframe-dev-panel--open' : ''}${className ? ` ${className}` : ''}`}
      {...inspectionAttributes('WireframeDevPanel', { open, triggerLabel })}
      {...props}
    >
      <WorkbenchAction
        ref={triggerRef}
        className="dl-wireframe-dev-panel__trigger"
        tone="dev"
        active={open}
        aria-controls={panelId}
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        icon={<CodeIcon size={18} aria-hidden="true" />}
      >
        {triggerLabel}
      </WorkbenchAction>
      {open && (
        <section
          id={panelId}
          className="dl-wireframe-dev-panel__surface"
          aria-label="Wireframe developer controls"
        >
          <header {...slotAttributes('header')}>
            <div>
              <h2 ref={headingRef} tabIndex={-1}>
                {title}
              </h2>
              {description && <p>{description}</p>}
            </div>
            <button type="button" onClick={() => onOpenChange(false)}>
              Done
            </button>
          </header>
          <div className="dl-wireframe-dev-panel__body" {...slotAttributes('content')}>
            {children}
          </div>
          {footer && <footer {...slotAttributes('footer')}>{footer}</footer>}
        </section>
      )}
    </div>
  )
}
