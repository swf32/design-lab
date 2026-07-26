import { createServer } from 'node:http'
import { readJson, sendBuffer, sendError, sendJson } from './lib/http.mjs'
import {
  createProject,
  getWorkspaceDirectory,
  listProjects,
  listSources,
  registerInstalledProject,
} from './services/projectRegistry.mjs'
import { getProjectTree } from './services/projectTree.mjs'
import { getModuleEntities } from './services/moduleEntities.mjs'
import { getAssetFile, getAssetPreview } from './services/assetFiles.mjs'
import { getIntegrationInfo } from './services/integrationInfo.mjs'
import { getAuthoredStyles } from './services/authoredStyles.mjs'
import { patchEntityManifest } from './services/manifestWrite.mjs'
import { getComponentHandoff } from './services/componentHandoff.mjs'
import { applySetupPlan, createSetupPlan } from './services/setupService.mjs'
import {
  closeComponentRuntimes,
  prepareComponentRuntime,
} from './services/componentRuntimeService.mjs'

let revision = 0
const apiPort = Number.parseInt(process.env.DESIGN_LAB_API_PORT ?? '4173', 10)

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
    if (request.method === 'GET' && url.pathname === '/api/onboarding/scan') {
      return sendJson(
        response,
        200,
        await createSetupPlan({
          root: getWorkspaceDirectory(),
          mode: url.searchParams.get('mode') ?? 'attach',
          name: url.searchParams.get('name') ?? undefined,
        }),
      )
    }
    if (request.method === 'POST' && url.pathname === '/api/onboarding/apply') {
      const input = await readJson(request)
      const result = await applySetupPlan({
        root: getWorkspaceDirectory(),
        mode: input.mode ?? 'attach',
        name: input.name,
        confirmed: input.confirmed === true,
      })
      const project = await registerInstalledProject({
        name: input.name,
        root: getWorkspaceDirectory(),
        mode: result.mode,
        source: result.source,
        configPath: result.configPath,
      })
      revision += 1
      return sendJson(response, 201, { ...result, project })
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
          { tokenView: url.searchParams.get('view') ?? 'tokens' },
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
          { tokenView: url.searchParams.get('view') ?? 'tokens' },
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
    const componentHandoffMatch = url.pathname.match(
      /^\/api\/sources\/([^/]+)\/components\/(.+)\/handoff$/,
    )
    if (request.method === 'GET' && componentHandoffMatch) {
      return sendJson(
        response,
        200,
        await getComponentHandoff(
          decodeURIComponent(componentHandoffMatch[1]),
          componentHandoffMatch[2].split('/').map(decodeURIComponent).join('/'),
        ),
      )
    }
    const componentRuntimeMatch = url.pathname.match(
      /^\/api\/sources\/([^/]+)\/components\/(.+)\/runtime$/,
    )
    if (request.method === 'POST' && componentRuntimeMatch) {
      const input = await readJson(request)
      return sendJson(
        response,
        200,
        await prepareComponentRuntime(
          decodeURIComponent(componentRuntimeMatch[1]),
          componentRuntimeMatch[2].split('/').map(decodeURIComponent).join('/'),
          input,
        ),
      )
    }
    const pageManifestMatch = url.pathname.match(/^\/api\/sources\/([^/]+)\/pages\/(.+)\/manifest$/)
    if (request.method === 'PATCH' && pageManifestMatch) {
      const result = await patchEntityManifest(
        decodeURIComponent(pageManifestMatch[1]),
        'pages',
        pageManifestMatch[2].split('/').map(decodeURIComponent).join('/'),
        await readJson(request),
      )
      revision += 1
      return sendJson(response, 200, result)
    }
    const wireframeManifestMatch = url.pathname.match(
      /^\/api\/sources\/([^/]+)\/wireframes\/(.+)\/manifest$/,
    )
    if (request.method === 'PATCH' && wireframeManifestMatch) {
      const result = await patchEntityManifest(
        decodeURIComponent(wireframeManifestMatch[1]),
        'wireframes',
        wireframeManifestMatch[2].split('/').map(decodeURIComponent).join('/'),
        await readJson(request),
      )
      revision += 1
      return sendJson(response, 200, result)
    }
    const sourceInspectionStylesMatch = url.pathname.match(
      /^\/api\/sources\/([^/]+)\/inspection\/styles$/,
    )
    if (request.method === 'GET' && sourceInspectionStylesMatch) {
      const sourceFile = url.searchParams.get('file')
      if (!sourceFile)
        return sendJson(response, 400, {
          error: { code: 'INSPECTION_FILE_REQUIRED', message: 'file is required' },
        })
      return sendJson(
        response,
        200,
        await getAuthoredStyles(decodeURIComponent(sourceInspectionStylesMatch[1]), sourceFile),
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

    if (!['GET', 'POST', 'PATCH'].includes(request.method ?? ''))
      return sendJson(response, 405, {
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' },
      })
    return sendJson(response, 404, { error: { code: 'NOT_FOUND', message: 'Not found' } })
  } catch (error) {
    return sendError(response, error)
  }
}).listen(apiPort, '127.0.0.1', () => {
  console.log(`Design Lab local API: http://127.0.0.1:${apiPort}`)
})

process.once('SIGINT', () => void closeComponentRuntimes().finally(() => process.exit(130)))
process.once('SIGTERM', () => void closeComponentRuntimes().finally(() => process.exit(143)))
