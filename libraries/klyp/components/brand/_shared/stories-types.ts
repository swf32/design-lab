import type { ComponentType, ReactElement } from 'react'

/**
 * CSF3-compatible Meta type. Replaces `Meta` from `@storybook/react-vite`
 * after the apps/docs (Storybook) workspace was removed in Phase 5.
 *
 * The catalog stories-loader at apps/web/src/lib/stories-loader.ts reads
 * the `default` export of each .stories.tsx file as a `StoryMeta` (broader
 * runtime contract). This type is a thin compile-time wrapper so .stories
 * files can keep their existing import shape.
 */
export interface Meta<TComponent = unknown> {
  component?: ComponentType<TComponent>
  title?: string
  parameters?: Record<string, unknown>
  args?: Partial<TComponent>
  argTypes?: Record<string, unknown>
  tags?: string[]
  decorators?: unknown
  play?: (context: unknown) => void | Promise<void>
}

/**
 * CSF3-compatible StoryObj type. `TMeta` parameter is unused for type
 * inference — most existing files declare stories with `StoryObj<typeof meta>`
 * and the inference resolves to a permissive shape. Keep it accepted but
 * non-restrictive so the catalog loader can render anything.
 */
export interface StoryObj<TMeta = unknown> {
  args?: TMeta extends Meta<infer A> ? Partial<A> : Record<string, unknown>
  render?: () => ReactElement
  parameters?: Record<string, unknown>
  name?: string
  play?: (context: unknown) => void | Promise<void>
}
