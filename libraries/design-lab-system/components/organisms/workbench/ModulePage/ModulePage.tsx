import './ModulePage.scss'
import type { ComponentProps } from 'react'

export type ModulePageVariant = 'scroll' | 'canvas'

export type ModulePageProps = ComponentProps<'div'> & {
  variant?: ModulePageVariant
}

export function ModulePage({ variant = 'scroll', className, ...props }: ModulePageProps) {
  return (
    <div
      className={`dl-module-page dl-module-page--${variant}${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}
