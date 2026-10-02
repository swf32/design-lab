import type { ComponentProps } from 'react'
import './WorkbenchLayout.scss'

export type WorkbenchLayoutProps = ComponentProps<'div'>
export type WorkbenchLayoutHeaderProps = ComponentProps<'div'>
export type WorkbenchLayoutRailProps = ComponentProps<'section'>

export function WorkbenchLayout({ className, ...props }: WorkbenchLayoutProps) {
  return <div className={['dl-workbench-layout', className].filter(Boolean).join(' ')} {...props} />
}

export function WorkbenchLayoutHeader({ className, ...props }: WorkbenchLayoutHeaderProps) {
  return (
    <div
      className={['dl-workbench-layout__header', className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}

export function WorkbenchLayoutRail({ className, ...props }: WorkbenchLayoutRailProps) {
  return (
    <section
      className={['dl-workbench-layout__rail', className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}
