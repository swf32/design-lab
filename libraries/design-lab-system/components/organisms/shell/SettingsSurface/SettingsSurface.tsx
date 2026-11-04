import type { ComponentProps } from 'react'
import './SettingsSurface.scss'

export type SettingsSurfaceProps = ComponentProps<'section'>

export function SettingsSurface({ className, ...props }: SettingsSurfaceProps) {
  return <section className={['settings-page', className].filter(Boolean).join(' ')} {...props} />
}
