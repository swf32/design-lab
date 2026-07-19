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
  path: string
}

function decodeSegment(segment: string) {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

export function readAppRoute(pathname = window.location.pathname): AppRoute {
  const segments = pathname.split('/').filter(Boolean).map(decodeSegment)
  const module = MODULE_ID_SET.has(segments[0]) ? (segments[0] as ModuleId) : 'components'
  return { module, path: segments.slice(1).join('/') }
}

export function appRouteHref(module: ModuleId, path = '') {
  const suffix = path.split('/').filter(Boolean).map(encodeURIComponent).join('/')
  return suffix ? `/${module}/${suffix}` : `/${module}`
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
