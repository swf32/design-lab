import type { PlaygroundControls } from '@design-lab/system/playground'

export type Project = {
  id: string
  name: string
  path: string
  kind: 'project' | 'library'
  schemaVersion: number
  createdAt: string
  available: boolean
  mode?: 'managed' | 'attach'
}

export type ProjectSetupMode = 'attach' | 'managed'
export type ProjectSetupPlan = {
  schemaVersion: number
  name: string
  mode: ProjectSetupMode
  scan: {
    suggestedName: string
    frameworks: string[]
    found: Record<string, { roots: number; files: number }>
    mounts: Record<
      string,
      Array<{
        path: string
        confidence: 'high' | 'medium' | 'low'
        evidence: string[]
        fileCount: number
        packageRoot: string
      }>
    >
    warnings: string[]
  }
  changes: {
    createDirectories: string[]
    createFiles: string[]
    updateFiles: string[]
    moveFiles: string[]
    deleteFiles: string[]
  }
  requiresConfirmation: true
}

export type ProjectTreeItem = {
  name: string
  path: string
  kind:
    | 'folder'
    | 'file'
    | 'component'
    | 'token-document'
    | 'token-group'
    | 'token'
    | 'asset'
    | 'wireframe'
    | 'page'
  level: number
  id?: string
  virtual?: boolean
  diagnostics?: number
}

type ApiError = { error?: { message?: string } }

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  const body = (await response.json()) as T & ApiError
  if (!response.ok)
    throw new Error(body.error?.message ?? `Request failed with status ${response.status}`)
  return body
}

export async function listProjects() {
  const result = await request<{ sources: Project[]; workspacePath: string }>('/api/sources')
  return { projects: result.sources, workspacePath: result.workspacePath }
}

export async function createProject(input: { name: string }) {
  return request<{ project: Project }>('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export async function scanProjectSetup(input: { name?: string; mode: ProjectSetupMode }) {
  const parameters = new URLSearchParams({ mode: input.mode })
  if (input.name?.trim()) parameters.set('name', input.name.trim())
  return request<ProjectSetupPlan>(`/api/onboarding/scan?${parameters}`)
}

export async function applyProjectSetup(input: {
  name: string
  mode: ProjectSetupMode
  confirmed: true
}) {
  return request<{ project: Project }>('/api/onboarding/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export type TokenNavigationView = 'tokens' | 'files'

export async function getProjectTree(
  projectId: string,
  moduleId: string,
  tokenView: TokenNavigationView = 'tokens',
) {
  return request<{ tree: ProjectTreeItem[] }>(
    `/api/sources/${encodeURIComponent(projectId)}/tree?module=${encodeURIComponent(moduleId)}&view=${encodeURIComponent(tokenView)}`,
  )
}

export type TokenValue =
  string | number | boolean | null | TokenValue[] | { [key: string]: TokenValue }
export type TokenDiagnostic = {
  code: string
  message: string
  file: string
  severity?: 'warning' | 'error'
  mode?: string
  path?: string
  reference?: string
}
export type TokenEntity = {
  id: string
  path: string
  type: string
  rawValue: TokenValue
  value: TokenValue
  mode: string
  rawValues: Record<string, TokenValue>
  values: Record<string, TokenValue>
  references: string[]
  referenceChains: Record<string, string[]>
  description: string | null
  aliases: string[]
  useWhen: string[]
  avoidWhen: string[]
  tags: string[]
  file: string
  format: 'design-lab' | 'dtcg'
  sourceLocation: { file: string; path: string }
  diagnostics: TokenDiagnostic[]
}
export type AssetEntity = {
  id: string
  name: string
  path: string
  directory: string
  extension: string
  type: 'icon' | 'image' | 'video' | 'other'
  previewUrl: string | null
}
export type PreviewMotion = {
  trigger: 'card-hover-focus'
  kind: 'state-transition' | 'reveal' | 'dismiss' | 'sequence'
  durationToken: string
  easingToken: string
  reducedMotion: 'static-baseline'
}
export type ComponentRelation = {
  id: string
  name: string
  directory: string
}
export type ComponentRelations = {
  uses: ComponentRelation[]
  usedBy: ComponentRelation[]
  examplesUse: ComponentRelation[]
  usedInExamplesBy: ComponentRelation[]
  diagnostics: Array<{
    code: string
    message: string
    component?: ComponentRelation
  }>
}
export type ComponentCapability =
  | 'catalog'
  | 'contract'
  | 'static-preview'
  | 'live-preview'
  | 'controls'
  | 'inspection'
  | 'composition'
  | 'capture'
  | 'handoff'
  | 'native-validation'
export type ComponentImplementation = {
  id: string
  familyId: string | null
  platform: string
  technology: string
  adapter: string
  locator:
    | { kind: 'file'; path: string }
    | { kind: 'external-url'; url: string }
    | { kind: 'manifest'; path: string }
  contract: {
    props: Record<string, unknown>
    events: Record<string, unknown>
    slots: Record<string, unknown>
  }
  capabilities: ComponentCapability[]
  evidence: {
    technology: 'authored' | 'derived'
    platform: 'authored' | 'derived'
    adapter: 'authored' | 'derived'
  }
  diagnostics: Array<{ code: string; message: string }>
}
export type ComponentHandoff = {
  componentId: string
  familyId: string | null
  platform: string
  technology: string
  path: string
  language: string
  source: string
  provenance: {
    kind: 'authored' | 'generated'
    generated: Record<string, unknown> | null
  }
  warnings: string[]
}
export type ManagedComponentRuntime = {
  url: string
  profile: {
    id: string
    technology: string
    adapter: string
    framework: { packageName: string; version: string; available: boolean }
    packageEnvironment: { root: string; manifestName: string; packageManager: string }
  }
  runtime: { status: string; origin: string }
  component: { id: string; name: string; directory: string }
  modes: string[]
  selectedMode: string
  stories: Array<{
    id: string
    kind?: string
    name: string
    description?: string
    examples?: Array<{ label: string; props: Record<string, unknown> }>
  }>
  playground: {
    description?: string
    defaultVariant: string
    variants: Array<{
      id: string
      name: string
      description?: string
      props?: Record<string, unknown>
    }>
    controls: PlaygroundControls
  } | null
}

export async function prepareComponentRuntime(
  sourceId: string,
  componentId: string,
  input: {
    view: 'info' | 'preview' | 'story' | 'playground' | 'draft'
    story?: string
    mode?: string
    args?: Record<string, unknown>
    variant?: string
    values?: Record<string, unknown>
  },
) {
  return request<ManagedComponentRuntime>(
    `/api/sources/${encodeURIComponent(sourceId)}/components/${componentId
      .split('/')
      .map(encodeURIComponent)
      .join('/')}/runtime`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  )
}
export type ModuleData =
  | {
      kind: 'tokens'
      files: string[]
      documents: Array<{
        file: string
        format: 'design-lab' | 'dtcg' | 'mixed' | 'unknown' | 'invalid'
        defaultMode: string
        explicitDefaultMode: boolean
        modes: string[]
        tokenCount: number
        diagnostics: TokenDiagnostic[]
      }>
      modes: string[]
      tokens: TokenEntity[]
      diagnostics: TokenDiagnostic[]
    }
  | { kind: 'palette'; modes: string[]; colors: TokenEntity[] }
  | {
      kind: 'fonts'
      modes: string[]
      typography: TokenEntity[]
      families: Array<{
        id: string
        name: string
        cssFamily: string
        source: string
        styles: Array<{ weight: number; style: string }>
      }>
    }
  | {
      kind: 'components'
      folders: string[]
      modes: string[]
      themeVariables: Record<string, Record<string, string | number>>
      families: Array<{
        id: string
        name: string
        implementations: Array<{
          id: string
          name: string
          platform: string
          technology: string
          adapter: string
          capabilities: ComponentCapability[]
        }>
      }>
      components: Array<{
        id: string
        sourceId?: string
        name: string
        platform: string
        technology: string
        adapter: string
        previewUrl?: string
        tagName?: string
        capabilities: ComponentCapability[]
        implementation: ComponentImplementation
        familyId: string | null
        entry?: string
        style?: string | null
        status?: string
        variants: string[]
        states?: string[]
        previewMotion?: PreviewMotion
        props?: Record<
          string,
          { type: string; default?: unknown; values?: string[]; required?: boolean; slot?: boolean }
        >
        docs?: string
        stories?: string
        preview?: string
        playground?: string | null
        changelog?: string
        documentation?: string | null
        changelogDocumentation?: string | null
        import: {
          symbol: string
          from: string
          statement: string
        } | null
        files: Array<{
          role: string
          path: string
        }>
        relations: ComponentRelations
        file: string
        manifestFile?: string | null
        sourcePath?: string | null
        discovery?: {
          kind: 'derived'
          evidence: string
          confidence: 'strong' | 'probable'
        }
        directory: string
      }>
    }
  | {
      kind: 'wireframes'
      folders: string[]
      modes: string[]
      themeVariables: Record<string, Record<string, string | number>>
      wireframes: Array<{
        schemaVersion: number
        id: string
        sourceId: string
        name: string
        status: 'draft' | 'review' | 'approved'
        description: string
        entry: string | null
        docs: string
        changelog: string
        defaultLayout: string
        defaultState: string
        layouts: Array<{
          id: string
          name: string
          description: string
          hypothesis: string
        }>
        controls: Array<
          | {
              id: string
              kind: 'radio'
              label: string
              description?: string
              visibleWhen?: { control: string; equals: string | number | boolean }
              options: Array<{ value: string; label: string; description?: string }>
            }
          | {
              id: string
              kind: 'boolean'
              label: string
              description?: string
              visibleWhen?: { control: string; equals: string | number | boolean }
            }
          | {
              id: string
              kind: 'range'
              label: string
              description?: string
              visibleWhen?: { control: string; equals: string | number | boolean }
              min: number
              max: number
              step: number
              unit?: string
            }
        >
        states: Array<{
          id: string
          name: string
          description: string
          values: Record<string, string | number | boolean>
        }>
        flow: {
          nodes: Array<{ id: string; state: string; x: number; y: number }>
          edges: Array<{
            id: string
            from: string
            to: string
            action: string
            label: string
          }>
        }
        directory: string
        file: string
        documentation: string | null
        changelogDocumentation: string | null
        diagnostics: Array<{ code: string; message: string }>
        files: Array<{ role: string; path: string }>
      }>
    }
  | {
      kind: 'pages'
      folders: string[]
      modes: string[]
      themeVariables: Record<string, Record<string, string | number>>
      pages: Array<{
        schemaVersion: number
        id: string
        sourceId: string
        name: string
        status: 'draft' | 'review' | 'approved'
        description: string
        entry: string | null
        docs: string
        changelog: string
        route?: string
        routeParams?: string[]
        mirroredRoute: string | null
        derivedFromWireframe?: {
          sourceId?: string
          wireframeId: string
          layoutId?: string
          stateId?: string
        }
        defaultState: string
        controls: Array<
          | {
              id: string
              kind: 'radio'
              label: string
              description?: string
              visibleWhen?: { control: string; equals: string | number | boolean }
              options: Array<{ value: string; label: string; description?: string }>
            }
          | {
              id: string
              kind: 'boolean'
              label: string
              description?: string
              visibleWhen?: { control: string; equals: string | number | boolean }
            }
          | {
              id: string
              kind: 'range'
              label: string
              description?: string
              visibleWhen?: { control: string; equals: string | number | boolean }
              min: number
              max: number
              step: number
              unit?: string
            }
        >
        states: Array<{
          id: string
          name: string
          description: string
          values: Record<string, string | number | boolean>
        }>
        flow: {
          nodes: Array<{ id: string; state: string; x: number; y: number }>
          edges: Array<{
            id: string
            from: string
            action: string
            label: string
            to:
              | {
                  kind: 'state'
                  stateId: string
                  condition?: { controlId: string; value: string | number | boolean }
                }
              | {
                  kind: 'page'
                  pageId: string
                  condition?: { controlId: string; value: string | number | boolean }
                }
          }>
        }
        diagnosticsAcknowledged: Array<{
          code: string
          entityRef?: string
          reason: string
          acknowledgedAt: string
        }>
        directory: string
        file: string
        documentation: string | null
        changelogDocumentation: string | null
        diagnostics: Array<{ code: string; message: string }>
        files: Array<{ role: string; path: string }>
      }>
      sitemap?: {
        nodes: Array<{
          id: string
          title: string
          description: string
          route: string | null
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
    }
  | { kind: 'assets'; folders: string[]; assets: AssetEntity[] }

export function getModuleData(sourceId: string, moduleId: string) {
  return request<ModuleData>(
    `/api/sources/${encodeURIComponent(sourceId)}/modules/${encodeURIComponent(moduleId)}`,
  )
}

export function getComponentHandoff(sourceId: string, componentId: string) {
  return request<ComponentHandoff>(
    `/api/sources/${encodeURIComponent(sourceId)}/components/${componentId
      .split('/')
      .map(encodeURIComponent)
      .join('/')}/handoff`,
  )
}

export async function patchEntityManifest(
  sourceId: string,
  moduleId: 'pages' | 'wireframes',
  directory: string,
  patch: { flow?: { nodes: Array<{ id: string; x: number; y: number }> } },
) {
  return request<{ moduleId: string; directory: string; file: string }>(
    `/api/sources/${encodeURIComponent(sourceId)}/${moduleId}/${directory
      .split('/')
      .map(encodeURIComponent)
      .join('/')}/manifest`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    },
  )
}

export type McpIntegrationInfo = {
  status: 'ready'
  transport: 'stdio'
  protocol: string
  server: { command: string; args: string[] }
  config: { mcpServers: Record<string, { command: string; args: string[] }> }
  cli: { command: string; examples: string[] }
  workflow: string[]
}

export function getMcpIntegration() {
  return request<McpIntegrationInfo>('/api/integrations/mcp')
}
