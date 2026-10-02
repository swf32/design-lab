import type { ComponentProps } from 'react'
import './WorkbenchLayout.scss'

export type WorkbenchLayoutProps = ComponentProps<'div'>
export type WorkbenchLayoutHeaderProps = ComponentProps<'div'>
export type WorkbenchLayoutRailProps = ComponentProps<'section'>
export type WorkbenchSectionProps = ComponentProps<'div'>
export type WorkbenchMarkdownProps = ComponentProps<'div'>
export type WorkbenchPropsTableProps = ComponentProps<'div'>

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

export function WorkbenchSection({ className, ...props }: WorkbenchSectionProps) {
  return (
    <div className={['dl-workbench-section', className].filter(Boolean).join(' ')} {...props} />
  )
}

export function WorkbenchMarkdown({ className, ...props }: WorkbenchMarkdownProps) {
  return (
    <div className={['dl-workbench-markdown', className].filter(Boolean).join(' ')} {...props} />
  )
}

export function WorkbenchPropsTable({ className, ...props }: WorkbenchPropsTableProps) {
  return (
    <div className={['dl-workbench-props-table', className].filter(Boolean).join(' ')} {...props} />
  )
}
