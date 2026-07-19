import { createServer } from 'node:http'
import { readJson, sendBuffer, sendError, sendJson } from './lib/http.mjs'
import { createProject, listProjects, listSources } from './services/projectRegistry.mjs'
import { getProjectTree } from './services/projectTree.mjs'
import { getModuleEntities } from './services/moduleEntities.mjs'
import { getAssetFile, getAssetPreview } from './services/assetFiles.mjs'
import { getIntegrationInfo } from './services/integrationInfo.mjs'

let revision = 0

createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost')
  try {
    if (request.method === 'GET' && url.pathname === '/api/health') {
      return sendJson(response, 200, { status: 'ok', runtime: 'node', revision })
    }
    if (request.method === 'GET' && url.pathname === '/api/projects') {
      return sendJson(response, 200, await listProjects())
    }
    if (request.method === 'GET' && url.pathname === '/api/sources') {
      return sendJson(response, 200, await listSources())
    }
    if (request.method === 'GET' && url.pathname === '/api/integrations/mcp') {
      return sendJson(response, 200, getIntegrationInfo())
    }
    if (request.method === 'POST' && url.pathname === '/api/projects') {
      const project = await createProject(await readJson(request))
      revision += 1
      return sendJson(response, 201, { project })
    }

    const treeMatch = url.pathname.match(/^\/api\/projects\/([^/]+)\/tree$/)
    if (request.method === 'GET' && treeMatch) {
      return sendJson(
        response,
        200,
        await getProjectTree(
          decodeURIComponent(treeMatch[1]),
          url.searchParams.get('module') ?? 'home',
        ),
      )
    }
    const sourceTreeMatch = url.pathname.match(/^\/api\/sources\/([^/]+)\/tree$/)
    if (request.method === 'GET' && sourceTreeMatch) {
      return sendJson(
        response,
        200,
        await getProjectTree(
          decodeURIComponent(sourceTreeMatch[1]),
          url.searchParams.get('module') ?? 'home',
        ),
      )
    }
    const sourceModuleMatch = url.pathname.match(/^\/api\/sources\/([^/]+)\/modules\/([^/]+)$/)
    if (request.method === 'GET' && sourceModuleMatch) {
      return sendJson(
        response,
        200,
        await getModuleEntities(
          decodeURIComponent(sourceModuleMatch[1]),
          decodeURIComponent(sourceModuleMatch[2]),
        ),
      )
    }
    const sourceAssetMatch = url.pathname.match(/^\/api\/sources\/([^/]+)\/assets\/(.+)$/)
    if (request.method === 'GET' && sourceAssetMatch) {
      const asset = await getAssetFile(
        decodeURIComponent(sourceAssetMatch[1]),
        sourceAssetMatch[2].split('/').map(decodeURIComponent).join('/'),
      )
      return sendBuffer(response, 200, asset.body, asset.contentType)
    }
    const sourceAssetPreviewMatch = url.pathname.match(
      /^\/api\/sources\/([^/]+)\/asset-previews\/(.+)$/,
    )
    if (request.method === 'GET' && sourceAssetPreviewMatch) {
      const asset = await getAssetPreview(
        decodeURIComponent(sourceAssetPreviewMatch[1]),
        sourceAssetPreviewMatch[2].split('/').map(decodeURIComponent).join('/'),
      )
      return sendBuffer(response, 200, asset.body, asset.contentType)
    }

    if (request.method === 'GET' && url.pathname === '/api/entities') {
      const projectId = url.searchParams.get('projectId')
      const moduleId = url.searchParams.get('module') ?? 'components'
      if (!projectId)
        return sendJson(response, 400, {
          error: { code: 'PROJECT_REQUIRED', message: 'projectId is required' },
        })
      const result = await getProjectTree(projectId, moduleId)
      return sendJson(response, 200, { revision, entities: result.tree })
    }

    if (!['GET', 'POST'].includes(request.method ?? ''))
      return sendJson(response, 405, {
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' },
      })
    return sendJson(response, 404, { error: { code: 'NOT_FOUND', message: 'Not found' } })
  } catch (error) {
    return sendError(response, error)
  }
}).listen(4173, '127.0.0.1', () => {
  console.log('Design Lab local API: http://127.0.0.1:4173')
})
