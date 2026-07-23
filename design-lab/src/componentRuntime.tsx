import type { ComponentType, ReactNode } from 'react'
import type { ModuleData } from './api/projects'

export type ComponentEntity = Extract<ModuleData, { kind: 'components' }>['components'][number]

type PreviewModule = Record<string, ComponentType>
const previewModules = import.meta.glob<PreviewModule>(
  [
    '../../libraries/*/components/**/*.preview.tsx',
    // Runtime-incomplete libraries stay discoverable via scanners, but must not enter the Vite graph.
    '!../../libraries/klyp/components/**',
  ],
  { eager: true },
)

export type StoryExample = {
  label: string
  props: Record<string, unknown>
}

export type StoryDefinition = {
  id: string
  kind?: 'variant' | 'state' | 'behavior' | 'context' | 'integration' | 'accessibility'
  name: string
  description?: string
  interactive?: boolean
  examples?: StoryExample[]
}

export type StoryModule = {
  stories?: StoryDefinition[]
  renderStoryExample?: (example: StoryExample, story: StoryDefinition) => ReactNode
}

const storyModules = {
  ...import.meta.glob<StoryModule>(
    ['../../libraries/*/components/**/*.stories.{ts,tsx}', '!../../libraries/klyp/components/**'],
    { eager: true },
  ),
  // D-056: these are the Klyp stories whose runtime dependencies and Design Lab story contract
  // are currently supported. Keep this exception aligned with the normal Workbench runtime.
  ...import.meta.glob<StoryModule>(
    [
      '../../libraries/klyp/components/ui/Button/Button.stories.tsx',
      '../../libraries/klyp/components/brand/MeshButton/MeshButton.stories.tsx',
    ],
    { eager: true },
  ),
}

export function previewComponentFor(component: ComponentEntity, sourceId: string) {
  if (!component.preview) return null
  const suffix = `/libraries/${component.sourceId ?? sourceId}/components/${component.directory}/${component.preview}`
  const module = Object.entries(previewModules).find(([path]) => path.endsWith(suffix))?.[1]
  return module && Object.values(module).find((value) => typeof value === 'function')
}

export function storyModuleFor(component: ComponentEntity) {
  if (!component.stories) return null
  const suffix = `/libraries/${component.sourceId}/components/${component.directory}/${component.stories}`
  return Object.entries(storyModules).find(([path]) => path.endsWith(suffix))?.[1] ?? null
}

export function firstStoryExample(component: ComponentEntity) {
  const module = storyModuleFor(component)
  const story = module?.stories?.[0]
  const example = story?.examples?.[0]
  if (!module?.renderStoryExample || !story || !example) return null
  return module.renderStoryExample(example, story)
}
