import './ApplicationFrame.scss'
import type { ComponentProps, CSSProperties, ReactNode } from 'react'
import { NavigationRegion, type NavigationRegionProps } from '../NavigationRegion/NavigationRegion'
import { WorkspaceSurface, type WorkspaceSurfaceProps } from '../WorkspaceSurface/WorkspaceSurface'

type ApplicationFrameStyle = CSSProperties & {
  '--navigation-width'?: string
}

export type ApplicationFrameProps<Id extends string = string> = Omit<
  ComponentProps<'main'>,
  'children'
> & {
  navigationProps: NavigationRegionProps<Id>
  workspaceProps: WorkspaceSurfaceProps
  overlays?: ReactNode
  navigationWidth: number | string
  resizing?: boolean
  mobileNavigationOpen?: boolean
  navigationDismissLabel: string
  onNavigationDismiss: () => void
}

export function ApplicationFrame<Id extends string = string>({
  navigationProps,
  workspaceProps,
  overlays,
  navigationWidth,
  resizing = false,
  mobileNavigationOpen = false,
  navigationDismissLabel,
  onNavigationDismiss,
  className,
  style,
  ...props
}: ApplicationFrameProps<Id>) {
  const frameStyle: ApplicationFrameStyle = {
    ...style,
    '--navigation-width':
      typeof navigationWidth === 'number' ? `${navigationWidth}px` : navigationWidth,
  }

  return (
    <main
      className={`dl-application-frame${resizing ? ' is-resizing' : ''}${mobileNavigationOpen ? ' is-navigation-open' : ''}${className ? ` ${className}` : ''}`}
      style={frameStyle}
      {...props}
    >
      <NavigationRegion {...navigationProps} />
      <button
        type="button"
        className="dl-application-frame__scrim"
        aria-label={navigationDismissLabel}
        aria-hidden={!mobileNavigationOpen}
        tabIndex={mobileNavigationOpen ? 0 : -1}
        onClick={onNavigationDismiss}
      />
      <WorkspaceSurface {...workspaceProps} />
      {overlays}
    </main>
  )
}
