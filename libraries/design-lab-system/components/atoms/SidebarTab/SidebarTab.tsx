import type { ComponentType } from 'react'
import type { IconProps } from '../../../assets/icons'

export type SidebarTabProps = {
  icon: ComponentType<IconProps>
  label: string
  active?: boolean
  expanded?: boolean
  onClick?: () => void
}

export function SidebarTab({ icon: Icon, label, active = false, expanded = false, onClick }: SidebarTabProps) {
  return (
    <button
      className={`sidebar-tab${active ? ' sidebar-tab--active' : ''}${expanded ? ' sidebar-tab--expanded' : ''}`}
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
    >
      <Icon className="sidebar-tab__icon" size={20}/>
      <span className="sidebar-tab__label">{label}</span>
    </button>
  )
}
