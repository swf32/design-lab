import type { PageModule } from '@design-lab/system/pages'

type PageRendererLocator = {
  sourceId: string
  directory: string
  entry: string | null
}

const pageModules = import.meta.glob<PageModule>('../../../libraries/*/pages/**/*.page.tsx', {
  eager: true,
})

export function pageRendererFor(page: PageRendererLocator) {
  if (!page.entry) return null
  const suffix = `/libraries/${page.sourceId}/pages/${page.directory}/${page.entry}`
  return Object.entries(pageModules).find(([path]) => path.endsWith(suffix))?.[1] ?? null
}
