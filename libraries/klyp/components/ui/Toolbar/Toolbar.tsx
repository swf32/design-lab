/**
 * Toolbar — roving-focus action container. Built on RAC `Toolbar`.
 * Pair with `ToolButton` children to get keyboard-accessible
 * action rows. Optional `<Toolbar.Group>` subcomponent for visual
 * groupings with a divider between groups.
 *
 * Used by MessageActions (chat), CodeBlock action rail, etc.
 */

import './Toolbar.scss'

import type { ReactNode } from 'react'
import { Toolbar as RACToolbar, type ToolbarProps as RACToolbarProps } from 'react-aria-components'

export interface ToolbarProps extends Omit<RACToolbarProps, 'children'> {
  children: ReactNode
  className?: string
}

export function Toolbar({ children, className, ...rest }: ToolbarProps) {
  return (
    <RACToolbar {...rest} className={['klyp-Toolbar', className].filter(Boolean).join(' ')}>
      {children}
    </RACToolbar>
  )
}

interface ToolbarGroupProps {
  children: ReactNode
  className?: string
}

function ToolbarGroup({ children, className }: ToolbarGroupProps) {
  return (
    <div role="group" className={['klyp-Toolbar__group', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

Toolbar.Group = ToolbarGroup

export default Toolbar
