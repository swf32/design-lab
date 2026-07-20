import type { CSSProperties } from 'react'

export type DesignSystemThemeVariables = Record<string, Record<string, string | number>>

export function designSystemModeStyle(
  themeVariables: DesignSystemThemeVariables,
  mode: string,
): CSSProperties {
  const variables = themeVariables[mode] ?? {}
  const scoped: Record<string, string | number> = { ...variables }

  for (const [name, value] of Object.entries(variables)) {
    if (name.startsWith('--ds-')) scoped[`--${name.slice('--ds-'.length)}`] = value
  }

  return scoped as CSSProperties
}
