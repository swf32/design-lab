export type Project = {
  id: string
  name: string
  path: string
  kind: 'project' | 'library'
  schemaVersion: number
  createdAt: string
  available: boolean
}

export type ProjectTreeItem = {
  name: string
  path: string
  kind: 'folder' | 'file' | 'component' | 'token' | 'asset' | 'wireframe'
  level: number
  id?: string
  virtual?: boolean
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

export async function getProjectTree(projectId: string, moduleId: string) {
  return request<{ tree: ProjectTreeItem[] }>(
    `/api/sources/${encodeURIComponent(projectId)}/tree?module=${encodeURIComponent(moduleId)}`,
  )
}

export type TokenEntity = {
  id: string
  path: string
  type: string
  value: string | number
  mode: string
  values: Record<string, string | number>
  description: string | null
  file: string
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
export type ModuleData =
  | { kind: 'tokens'; files: string[]; modes: string[]; tokens: TokenEntity[] }
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
      components: Array<{
        id: string
        sourceId?: string
        name: string
        entry?: string
        style?: string | null
        status?: string
        variants: string[]
        states?: string[]
        previewMotion?: PreviewMotion
        props?: Record<string, { type: string; default?: unknown; values?: string[] }>
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
        directory: string
      }>
    }
  | {
      kind: 'wireframes'
      folders: string[]
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
  | { kind: 'assets'; folders: string[]; assets: AssetEntity[] }

export function getModuleData(sourceId: string, moduleId: string) {
  return request<ModuleData>(
    `/api/sources/${encodeURIComponent(sourceId)}/modules/${encodeURIComponent(moduleId)}`,
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
