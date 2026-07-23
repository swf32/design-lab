export const SITEMAP_NODE_WIDTH = 280
export const SITEMAP_NODE_HEIGHT = 140
export const SITEMAP_NODE_GAP_X = 80
export const SITEMAP_NODE_GAP_Y = 48

export type PageSitemapSource = {
  id: string
  name: string
  description?: string
  route?: string
  directory?: string
  flow?: {
    edges?: Array<{
      id: string
      action?: string
      label?: string
      to?: {
        kind?: string
        pageId?: string
        condition?: { controlId: string; value: string | number | boolean }
      }
    }>
  }
}

export type PageSitemap = {
  nodes: Array<{
    id: string
    title: string
    description: string
    route: string | null
    directory: string
    x: number
    y: number
  }>
  edges: Array<{
    id: string
    from: string
    to: string
    label: string
    action?: string
  }>
}

/** Folder-scoped site map: All = every Page; a folder prefix keeps only Pages under it. */
export function buildPageSitemap(pages: PageSitemapSource[]): PageSitemap {
  const pageIds = new Set(pages.map((page) => page.id))
  const nodes = pages.map((page) => ({
    id: page.id,
    title: page.name,
    description: page.description ?? '',
    route: page.route ?? null,
    directory: page.directory ?? '',
    x: 0,
    y: 0,
  }))

  const edgeMap = new Map<string, PageSitemap['edges'][number]>()
  for (const page of pages) {
    for (const edge of page.flow?.edges ?? []) {
      if (edge.to?.kind !== 'page' || !edge.to.pageId) continue
      if (!pageIds.has(edge.to.pageId)) continue
      const key = `${page.id}->${edge.to.pageId}`
      const label = edge.to.condition
        ? `${edge.label ?? ''} · if ${edge.to.condition.controlId}=${String(edge.to.condition.value)}`
        : (edge.label ?? '')
      const existing = edgeMap.get(key)
      if (existing) existing.label = `${existing.label}; ${label}`
      else
        edgeMap.set(key, {
          id: edge.id,
          from: page.id,
          to: edge.to.pageId,
          label,
          ...(edge.action ? { action: edge.action } : {}),
        })
    }
  }

  layoutSitemapNodes(nodes, [...edgeMap.values()])
  return { nodes, edges: [...edgeMap.values()] }
}

function layoutSitemapNodes(nodes: PageSitemap['nodes'], edges: PageSitemap['edges']) {
  if (!nodes.length) return nodes

  const outgoing = new Map(nodes.map((node) => [node.id, [] as string[]]))
  const indegree = new Map(nodes.map((node) => [node.id, 0]))
  for (const edge of edges) {
    if (!outgoing.has(edge.from) || !indegree.has(edge.to)) continue
    outgoing.get(edge.from)!.push(edge.to)
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1)
  }

  const layer = new Map<string, number>()
  let frontier = nodes.filter((node) => (indegree.get(node.id) ?? 0) === 0).map((node) => node.id)
  if (!frontier.length && nodes.length) {
    const root =
      nodes.find((node) => node.route === '/') ??
      [...nodes].sort((first, second) => first.id.localeCompare(second.id))[0]
    indegree.set(root.id, 0)
    frontier = [root.id]
  }
  let depth = 0
  let placed = 0
  while (frontier.length) {
    for (const id of frontier) layer.set(id, depth)
    placed += frontier.length
    const next: string[] = []
    for (const id of frontier) {
      for (const target of outgoing.get(id) ?? []) {
        if (layer.has(target)) continue
        const remaining = (indegree.get(target) ?? 1) - 1
        indegree.set(target, remaining)
        if (remaining <= 0 && !layer.has(target)) next.push(target)
      }
    }
    frontier = [...new Set(next)]
    depth += 1
  }
  if (placed < nodes.length) {
    for (const node of nodes) if (!layer.has(node.id)) layer.set(node.id, depth)
  }

  const byLayer = new Map<number, typeof nodes>()
  for (const node of nodes) {
    const level = layer.get(node.id) ?? 0
    if (!byLayer.has(level)) byLayer.set(level, [])
    byLayer.get(level)!.push(node)
  }

  for (const [level, layerNodes] of [...byLayer.entries()].sort(
    (first, second) => first[0] - second[0],
  )) {
    layerNodes
      .sort((first, second) => first.title.localeCompare(second.title))
      .forEach((node, index) => {
        node.x = 80 + level * (SITEMAP_NODE_WIDTH + SITEMAP_NODE_GAP_X)
        node.y = 80 + index * (SITEMAP_NODE_HEIGHT + SITEMAP_NODE_GAP_Y)
      })
  }

  return nodes
}
