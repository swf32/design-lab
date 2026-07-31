import './NavigationRegion.scss'
import type { ComponentProps } from 'react'
import { AppSidebar, type AppSidebarProps } from '../AppSidebar/AppSidebar'
import { DirectoryPanel, type DirectoryPanelProps } from '../DirectoryPanel/DirectoryPanel'

export type NavigationRegionProps<Id extends string = string> = Omit<
  ComponentProps<'aside'>,
  'children'
> & {
  sidebarProps: Omit<AppSidebarProps<Id>, 'expanded'>
  directoryProps: DirectoryPanelProps
  expanded?: boolean
  mobileOpen?: boolean
  mobileTitle: string
  mobileCloseLabel: string
  onMobileClose: () => void
}

export function NavigationRegion<Id extends string = string>({
  sidebarProps,
  directoryProps,
  expanded = false,
  mobileOpen = false,
  mobileTitle,
  mobileCloseLabel,
  onMobileClose,
  className,
  ...props
}: NavigationRegionProps<Id>) {
  return (
    <aside
      className={`dl-navigation-region${expanded ? ' is-expanded' : ''}${mobileOpen ? ' is-mobile-open' : ''}${className ? ` ${className}` : ''}`}
      {...props}
    >
      <header className="dl-navigation-region__mobile-header">
        <strong>{mobileTitle}</strong>
        <button type="button" id="design-lab-navigation-close" onClick={onMobileClose}>
          {mobileCloseLabel}
        </button>
      </header>
      <div className="dl-navigation-region__panes">
        <div className="dl-navigation-region__sidebar">
          <AppSidebar {...sidebarProps} expanded={expanded} />
        </div>
        <div className="dl-navigation-region__directory">
          <DirectoryPanel {...directoryProps} />
        </div>
      </div>
    </aside>
  )
}
