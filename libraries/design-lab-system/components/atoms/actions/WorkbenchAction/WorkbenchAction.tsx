import './WorkbenchAction.scss'
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { inspectionAttributes, slotAttributes } from '@design-lab/system/inspection'

export type WorkbenchActionTone = 'neutral' | 'inspect' | 'dev'

export type WorkbenchActionProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children: ReactNode
  icon?: ReactNode
  tone?: WorkbenchActionTone
  active?: boolean
}

export const WorkbenchAction = forwardRef<HTMLButtonElement, WorkbenchActionProps>(
  function WorkbenchAction(
    {
      children,
      icon,
      tone = 'neutral',
      active = false,
      className,
      disabled,
      type = 'button',
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={`dl-workbench-action dl-workbench-action--${tone}${active ? ' dl-workbench-action--active' : ''}${className ? ` ${className}` : ''}`}
        disabled={disabled}
        aria-pressed={active || undefined}
        {...inspectionAttributes('WorkbenchAction', {
          tone,
          active,
          disabled: Boolean(disabled),
          children: typeof children === 'string' ? children : undefined,
        })}
        {...props}
      >
        {icon != null && (
          <span className="dl-workbench-action__icon" {...slotAttributes('icon')}>
            {icon}
          </span>
        )}
        <span className="dl-workbench-action__label" {...slotAttributes('label')}>
          {children}
        </span>
      </button>
    )
  },
)
