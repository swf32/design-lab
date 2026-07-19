import type { WireframeModule } from '@design-lab/system/wireframes'

type WireframeRendererLocator = {
  sourceId: string
  directory: string
  entry: string | null
}

const wireframeModules = import.meta.glob<WireframeModule>(
  '../../../libraries/*/wireframes/**/*.wireframe.tsx',
  { eager: true },
)

export function wireframeRendererFor(wireframe: WireframeRendererLocator) {
  if (!wireframe.entry) return null
  const suffix = `/libraries/${wireframe.sourceId}/wireframes/${wireframe.directory}/${wireframe.entry}`
  return Object.entries(wireframeModules).find(([path]) => path.endsWith(suffix))?.[1] ?? null
}
