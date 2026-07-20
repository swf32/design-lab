import type { ModuleId } from '@design-lab/system/components'
import type { ProjectTreeItem } from './api/projects'

const MODULE_IDS: ModuleId[] = [
  'home',
  'components',
  'wireframes',
  'pages',
  'assets',
  'palette',
  'tokens',
  'fonts',
]
const MODULE_ID_SET = new Set<string>(MODULE_IDS)

export type AppRoute = {
  module: ModuleId
  sourceId: string
  path: string
}

function decodeSegment(segment: string) {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

// Route shape is /<module>/<sourceId>/<path...>. sourceId identifies the active Project or
// Library so a copied link always reopens the same source, instead of whichever source happens
// to be active in the opening browser's local state.
export function readAppRoute(pathname = window.location.pathname): AppRoute {
  const segments = pathname.split('/').filter(Boolean).map(decodeSegment)
  const module = MODULE_ID_SET.has(segments[0]) ? (segments[0] as ModuleId) : 'components'
  return { module, sourceId: segments[1] ?? '', path: segments.slice(2).join('/') }
}

export function appRouteHref(module: ModuleId, sourceId: string, path = '') {
  const suffix = path.split('/').filter(Boolean).map(encodeURIComponent).join('/')
  const base = sourceId ? `/${module}/${encodeURIComponent(sourceId)}` : `/${module}`
  return suffix ? `${base}/${suffix}` : base
}

export function treeItemRoutePath(item: ProjectTreeItem) {
  if (item.virtual) return ''
  if (item.kind === 'token') return item.path.replaceAll('.', '/')
  if (item.kind === 'asset') return item.path.replace(/\.[^/.]+$/, '')
  return item.path
}

export function findRouteTreeItem(tree: ProjectTreeItem[], routePath: string) {
  const comparable = routePath.toLocaleLowerCase()
  return tree.find((item) => {
    const canonical = treeItemRoutePath(item)
    if (canonical.toLocaleLowerCase() === comparable) return true
    return item.kind === 'asset' && item.path.toLocaleLowerCase() === comparable
  })
}
