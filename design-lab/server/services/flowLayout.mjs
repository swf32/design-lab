export const SITEMAP_NODE_WIDTH = 280
export const SITEMAP_NODE_HEIGHT = 140
export const SITEMAP_NODE_GAP_X = 80
export const SITEMAP_NODE_GAP_Y = 48

/**
 * Derived site-map from Page flow edges (kind: "page" only).
 * Cross-page graphs often contain cycles (Home ↔ Auth ↔ Account); layer assignment
 * must break cycles or nodes walk off to the right and the canvas looks empty.
 */
export function buildPageSitemap(pages) {
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

  const edgeMap = new Map()
  for (const page of pages) {
    for (const edge of page.flow?.edges ?? []) {
      if (edge.to?.kind !== 'page') continue
      if (!pageIds.has(edge.to.pageId)) continue
      const key = `${page.id}->${edge.to.pageId}`
      const label = edge.to.condition
        ? `${edge.label} · if ${edge.to.condition.controlId}=${String(edge.to.condition.value)}`
        : edge.label
      if (edgeMap.has(key)) {
        const existing = edgeMap.get(key)
        existing.label = `${existing.label}; ${label}`
      } else {
        edgeMap.set(key, {
          id: edge.id,
          from: page.id,
          to: edge.to.pageId,
          label,
          ...(edge.action ? { action: edge.action } : {}),
        })
      }
    }
  }

  layoutSitemapNodes(nodes, [...edgeMap.values()])
  return { nodes, edges: [...edgeMap.values()] }
}

export function layoutSitemapNodes(nodes, edges) {
  if (!nodes.length) return nodes

  const outgoing = new Map(nodes.map((node) => [node.id, []]))
  const indegree = new Map(nodes.map((node) => [node.id, 0]))
  for (const edge of edges) {
    if (!outgoing.has(edge.from) || !indegree.has(edge.to)) continue
    outgoing.get(edge.from).push(edge.to)
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1)
  }

  // Kahn topological layers; leftover cyclic nodes stay in the last column.
  // Pure cycles have no indegree-0 root — seed from `/` or the first id so the map stays readable.
  const layer = new Map()
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
    const next = []
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

  const byLayer = new Map()
  for (const node of nodes) {
    const level = layer.get(node.id) ?? 0
    if (!byLayer.has(level)) byLayer.set(level, [])
    byLayer.get(level).push(node)
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
