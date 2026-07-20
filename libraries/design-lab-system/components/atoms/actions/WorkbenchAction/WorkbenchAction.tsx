import './WorkbenchAction.scss'
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

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
        {...props}
      >
        {icon != null && <span className="dl-workbench-action__icon">{icon}</span>}
        <span className="dl-workbench-action__label">{children}</span>
      </button>
    )
  },
)
