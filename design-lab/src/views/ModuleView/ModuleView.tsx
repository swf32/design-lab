import './ModuleView.scss'
import {
  isValidElement,
  useEffect,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import { useDesignLabI18n } from '@design-lab/system/i18n'
import {
  AssetCard,
  Button,
  Chip,
  CodeBlock,
  ColorCard,
  ComponentCard,
  ComponentReferencePanel,
  ComponentThumbnail,
  ModuleHeader,
  TabSwitcher,
  StoryCanvas,
  WireframeCard,
  WireframeScreenPreview,
  WorkbenchPlayground,
  type CanvasMode,
  type ChipColor,
} from '@design-lab/system/components'
import type { ModuleData } from '../../api/projects'
import { wireframeRendererFor } from '../../wireframes/registry'
import { pageRendererFor } from '../../pages/registry'
import { designSystemModeStyle } from '../../designSystemMode'

type ComponentEntity = Extract<ModuleData, { kind: 'components' }>['components'][number]
type PageEntity = Extract<ModuleData, { kind: 'pages' }>['pages'][number]
const pageStatusColors: Record<PageEntity['status'], ChipColor> = {
  draft: 'warning',
  review: 'accent',
  approved: 'success',
}

type PreviewModule = Record<string, ComponentType>
const previewModules = import.meta.glob<PreviewModule>(
  [
    '../../../../libraries/*/components/**/*.preview.tsx',
    // Runtime-incomplete libraries stay discoverable via scanners, but must not enter the Vite graph.
    '!../../../../libraries/klyp/components/**',
  ],
  { eager: true },
)

type StoryExample = {
  label: string
  props: Record<string, unknown>
}
type StoryDefinition = {
  id: string
  kind?: 'variant' | 'state' | 'behavior' | 'context' | 'integration' | 'accessibility'
  name: string
  description?: string
  interactive?: boolean
  examples?: StoryExample[]
}
type StoryModule = {
  stories?: StoryDefinition[]
  renderStoryExample?: (example: StoryExample, story: StoryDefinition) => ReactNode
}
const storyModules = {
  ...import.meta.glob<StoryModule>(
    [
      '../../../../libraries/*/components/**/*.stories.{ts,tsx}',
      // Runtime-incomplete libraries stay discoverable via scanners, but must not enter the
      // Vite graph. Note: a glob negation excludes matches from the whole pattern set — it
      // cannot be selectively re-included by a later positive pattern in the SAME glob() call,
      // which is why the klyp exception below is a second, separate glob() call instead.
      '!../../../../libraries/klyp/components/**',
    ],
    { eager: true },
  ),
  // Scoped exception (see D-056 in docs/DECISIONS.md): Button and MeshButton are the only
  // Klyp components whose runtime deps (motion, react-aria-components, @klyp/icons alias) are
  // wired up, and whose Stories were rewritten to the Design Lab contract (Klyp's original
  // files were raw Storybook CSF, which this generic renderer cannot execute).
  ...import.meta.glob<StoryModule>(
    [
      '../../../../libraries/klyp/components/ui/Button/Button.stories.tsx',
      '../../../../libraries/klyp/components/brand/MeshButton/MeshButton.stories.tsx',
    ],
    { eager: true },
  ),
}

function DiscoveredComponentPreview({
  component,
  sourceId,
}: {
  component: ComponentEntity
  sourceId: string
}) {
  if (component.preview) {
    const suffix = `/libraries/${component.sourceId ?? sourceId}/components/${component.directory}/${component.preview}`
    const module = Object.entries(previewModules).find(([path]) => path.endsWith(suffix))?.[1]
    const Preview = module && Object.values(module).find((value) => typeof value === 'function')
    if (Preview) return <Preview />
  }
  return <ComponentThumbnail kind={component.id} />
}

const markdownComponents: Components = {
  pre({ children }) {
    if (!isValidElement<{ className?: string; children?: ReactNode }>(children))
      return <pre>{children}</pre>
    const language = children.props.className?.match(/language-([^\s]+)/)?.[1] ?? 'text'
    const code = String(children.props.children ?? '').replace(/\n$/, '')
    return <CodeBlock code={code} language={language} />
  },
}

// Design Lab has no hand-maintained per-id demo switch: a Component's own Stories are the
// canonical, discovery-driven specimen for its Workbench hero (`COMPONENT_RULES.md` — "Stories
// document focused behavior of an existing production implementation"). A hand-authored switch
// on `component.id` previously lived here and imported real @design-lab/system production
// components directly; it broke as soon as another Library shipped a same-named component
// (Klyp's own `button`/`input`/`checkbox`/`slider`/... collided) because ids are unique only
// within one Library, not across sources. See `storyModuleFor` / `firstStoryExample` below.
function storyModuleFor(component: ComponentEntity) {
  if (!component.stories) return null
  const suffix = `/libraries/${component.sourceId}/components/${component.directory}/${component.stories}`
  return Object.entries(storyModules).find(([path]) => path.endsWith(suffix))?.[1] ?? null
}

function firstStoryExample(component: ComponentEntity) {
  const module = storyModuleFor(component)
  const story = module?.stories?.[0]
  const example = story?.examples?.[0]
  if (!module?.renderStoryExample || !story || !example) return null
  return module.renderStoryExample(example, story)
}

function Specimen({
  label,
  children,
  grow = false,
}: {
  label: string
  children: React.ReactNode
  grow?: boolean
}) {
  return (
    <div className={`button-specimen${grow ? ' button-specimen--grow' : ''}`}>
      <div>{children}</div>
      <code>{label}</code>
    </div>
  )
}

function DiscoveredComponentStories({ component }: { component: ComponentEntity }) {
  if (!component.stories) return null
  const suffix = `/libraries/${component.sourceId}/components/${component.directory}/${component.stories}`
  const module = Object.entries(storyModules).find(([path]) => path.endsWith(suffix))?.[1]
  if (!module?.stories?.length || !module.renderStoryExample) return null

  return (
    <div className="focused-stories">
      {module.stories.map((story) => (
        <StoryCanvas
          key={story.id}
          title={story.name}
          description={story.description}
          meta={[story.kind ?? 'context', story.interactive && 'interactive']
            .filter(Boolean)
            .join(' · ')}
        >
          <div className="story-comparison">
            {(story.examples ?? []).map((example, index) => (
              <Specimen key={`${story.id}:${example.label}:${index}`} label={example.label}>
                {module.renderStoryExample?.(example, story)}
              </Specimen>
            ))}
          </div>
        </StoryCanvas>
      ))}
    </div>
  )
}

function ComponentWorkbench({
  component,
  onBack,
  onOpenPlayground,
  onSelectComponent,
  canvasMode,
  canvasColor,
  onCanvasModeChange,
  onCanvasColorChange,
}: {
  component: ComponentEntity
  onBack: () => void
  onOpenPlayground: () => void
  onSelectComponent: (id: string) => void
  canvasMode: CanvasMode
  canvasColor: string
  onCanvasModeChange: (mode: CanvasMode) => void
  onCanvasColorChange: (color: string) => void
}) {
  const { t } = useDesignLabI18n()
  const canvasStyle = { '--canvas-solid': canvasColor } as CSSProperties
  const heroSpecimen = firstStoryExample(component)

  return (
    <div className={`workbench workbench--canvas-${canvasMode}`} style={canvasStyle}>
      <div className="workbench__top">
        <ModuleHeader
          eyebrow={component.directory}
          title={component.name}
          backLabel={t('workbench.back')}
          onBack={onBack}
          meta={component.entry}
          actions={
            component.playground ? (
              <Button type="button" variant="primary" size="small" onClick={onOpenPlayground}>
                Open Playground
              </Button>
            ) : undefined
          }
        />
      </div>
      <ComponentReferencePanel
        importStatement={component.import?.statement ?? ''}
        files={component.files}
        uses={component.relations.uses}
        usedBy={component.relations.usedBy}
        examplesUse={component.relations.examplesUse}
        usedInExamplesBy={component.relations.usedInExamplesBy}
        diagnostics={component.relations.diagnostics}
        onSelectRelation={(relation) => onSelectComponent(relation.id)}
      />
      <WorkbenchPlayground
        mode={canvasMode}
        color={canvasColor}
        onModeChange={onCanvasModeChange}
        onColorChange={onCanvasColorChange}
        label={t('workbench.playground')}
        controls={null}
      >
        {heroSpecimen ?? (
          <span className="workbench-placeholder">
            {component.name}
            <small>{t('workbench.controlsMissing')}</small>
          </span>
        )}
      </WorkbenchPlayground>
      <section className="workbench__rail">
        <DiscoveredComponentStories component={component} />
        {component.props && (
          <div className="workbench-section">
            <span>{t('workbench.propsApi')}</span>
            <div className="workbench__props-table">
              <div className="workbench__props-head">
                <strong>{t('workbench.name')}</strong>
                <strong>{t('workbench.type')}</strong>
                <strong>{t('workbench.default')}</strong>
              </div>
              {Object.entries(component.props).map(([name, definition]) => (
                <div key={name}>
                  <code>{name}</code>
                  <span>
                    {definition.type}
                    {definition.values ? ` · ${definition.values.join(' | ')}` : ''}
                  </span>
                  <small>
                    {definition.default === undefined ? '—' : String(definition.default)}
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="workbench-section">
          <span>{t('workbench.documentation')}</span>
          <div className="workbench-markdown">
            <ReactMarkdown components={markdownComponents}>
              {component.documentation ?? 'Documentation has not been written yet.'}
            </ReactMarkdown>
          </div>
        </div>
        {component.changelogDocumentation && (
          <div className="workbench-section">
            <span>{t('workbench.changelog')}</span>
            <div className="workbench-markdown workbench-markdown--changelog">
              <ReactMarkdown components={markdownComponents}>
                {component.changelogDocumentation}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function Catalog({
  data,
  sourceId,
  folderPath,
  onSelectEntity,
}: {
  data: Extract<ModuleData, { kind: 'components' }>
  sourceId: string
  folderPath: string
  onSelectEntity: (id: string) => void
}) {
  const components =
    folderPath === '__all__'
      ? data.components
      : data.components.filter(
          (component) =>
            component.directory === folderPath || component.directory.startsWith(`${folderPath}/`),
        )
  const scope = folderPath === '__all__' ? [] : folderPath.split('/').filter(Boolean)
  const groupsByPath = new Map<string, ComponentEntity[]>()
  for (const component of components) {
    const category = component.directory.split('/').filter(Boolean).slice(0, -1)
    const categoryPath = category.join('/')
    groupsByPath.set(categoryPath, [...(groupsByPath.get(categoryPath) ?? []), component])
  }
  const groups = [...groupsByPath.entries()]
    .map(([path, groupedComponents]) => {
      const category = path.split('/').filter(Boolean)
      const relativeCategory = category.slice(scope.length)
      const labelParts = relativeCategory.length ? relativeCategory : category.slice(-1)
      return {
        path,
        label: labelParts.join(' / ') || 'Components',
        components: [...groupedComponents].sort((left, right) =>
          left.name.localeCompare(right.name),
        ),
      }
    })
    .sort((left, right) => left.path.localeCompare(right.path))
  const title =
    folderPath === '__all__' ? 'Components' : (folderPath.split('/').at(-1) ?? 'Components')
  return (
    <div className="module-page">
      <ModuleHeader eyebrow="Live inventory · Components" title={title} count={components.length} />
      {components.length ? (
        <div className="component-groups">
          {groups.map((group) => {
            const showHeader = groups.length > 1 || group.path !== folderPath
            return (
              <section className="component-group" key={group.path}>
                {showHeader && (
                  <header>
                    <h2>{group.label}</h2>
                    <span>{group.components.length}</span>
                  </header>
                )}
                <div className="component-grid">
                  {group.components.map((component) => (
                    <ComponentCard
                      key={component.id}
                      name={component.name}
                      entry={component.entry ?? ''}
                      meta={`${component.variants.length} variants`}
                      status={component.status}
                      preview={
                        <DiscoveredComponentPreview component={component} sourceId={sourceId} />
                      }
                      previewAnimated={Boolean(component.previewMotion)}
                      onClick={() => onSelectEntity(component.id)}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="module-filter-empty">
          <strong>No components in this folder</strong>
          <span>Choose All or another folder in the Directory Panel.</span>
        </div>
      )}
    </div>
  )
}

function ComponentConceptOverview({
  component,
  onBack,
  onOpenPlayground,
}: {
  component: ComponentEntity
  onBack: () => void
  onOpenPlayground: () => void
}) {
  const status = component.status ?? 'wireframe'
  return (
    <div className="workbench">
      <div className="workbench__top">
        <ModuleHeader
          eyebrow={component.directory}
          title={component.name}
          backLabel="Components"
          onBack={onBack}
          meta="Wireframe-only component"
          actions={
            component.playground ? (
              <Button type="button" variant="primary" onClick={onOpenPlayground}>
                Open Playground
              </Button>
            ) : (
              <Chip color="warning" variant="soft">
                {status}
              </Chip>
            )
          }
        />
      </div>
      <section className="workbench__rail">
        <div className="workbench-section">
          <span>Lifecycle</span>
          <div className="workbench-markdown">
            <p>
              This component is intentionally discoverable before a production entry exists. Its
              typed Playground is the review surface for choosing a direction.
            </p>
          </div>
        </div>
        <div className="workbench-section">
          <span>Documentation</span>
          <div className="workbench-markdown">
            <ReactMarkdown components={markdownComponents}>
              {component.documentation ?? 'Documentation has not been written yet.'}
            </ReactMarkdown>
          </div>
        </div>
      </section>
    </div>
  )
}

function AssetsCatalog({
  data,
  folderPath,
  selectedEntityId,
  onSelectEntity,
}: {
  data: Extract<ModuleData, { kind: 'assets' }>
  folderPath: string
  selectedEntityId: string | null
  onSelectEntity: (id: string) => void
}) {
  const assets =
    folderPath === '__all__'
      ? data.assets
      : data.assets.filter(
          (asset) => asset.directory === folderPath || asset.directory.startsWith(`${folderPath}/`),
        )
  const groups = new Map<string, typeof assets>()
  for (const asset of assets) {
    const group = asset.directory || 'Unsorted'
    groups.set(group, [...(groups.get(group) ?? []), asset])
  }
  const title = folderPath === '__all__' ? 'Assets' : (folderPath.split('/').at(-1) ?? 'Assets')
  return (
    <div className="module-page">
      <ModuleHeader eyebrow="Filesystem inventory · Assets" title={title} count={assets.length} />
      {assets.length ? (
        <div className="asset-groups">
          {[...groups.entries()].map(([name, items]) => (
            <section className="asset-group" key={name}>
              <header>
                <h2>{name}</h2>
                <span>{items.length}</span>
              </header>
              <div className="asset-grid">
                {items.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    name={asset.name}
                    path={asset.path}
                    kind={asset.type}
                    extension={asset.extension}
                    previewUrl={asset.previewUrl}
                    selected={asset.id === selectedEntityId}
                    onClick={() => onSelectEntity(asset.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="module-filter-empty">
          <strong>No assets in this folder</strong>
          <span>Add files to this canonical directory or choose All.</span>
        </div>
      )}
    </div>
  )
}

export function ModuleView({
  data,
  loading,
  sourceId,
  selectedEntityId,
  selectedFolderPath,
  onBack,
  onSelectEntity,
  interfaceTheme,
  canvasMode,
  canvasColor,
  onCanvasModeChange,
  onCanvasColorChange,
  onOpenPlayground,
  onOpenPageReview,
}: {
  data: ModuleData | null
  loading: boolean
  sourceId: string
  selectedEntityId: string | null
  selectedFolderPath: string
  onBack: () => void
  onSelectEntity: (id: string | null) => void
  interfaceTheme: 'dark' | 'light'
  canvasMode: CanvasMode
  canvasColor: string
  onCanvasModeChange: (mode: CanvasMode) => void
  onCanvasColorChange: (color: string) => void
  onOpenPlayground: () => void
  onOpenPageReview: () => void
}) {
  const { t } = useDesignLabI18n()
  const modes = data && 'modes' in data ? data.modes : []
  const [previewMode, setPreviewMode] = useState<string>(interfaceTheme)
  useEffect(() => {
    if (modes.length && !modes.includes(previewMode)) setPreviewMode(modes[0])
  }, [modes.join('|'), previewMode])
  if (loading) return <div className="module-state">{t('status.loading')}</div>
  if (!data) return <div className="module-state">{t('status.unavailable')}</div>
  const modeActions =
    modes.length > 1 ? (
      <TabSwitcher
        ariaLabel="Design-system mode"
        options={modes.map((mode) => ({ value: mode, label: mode }))}
        value={previewMode}
        onChange={setPreviewMode}
      />
    ) : undefined
  if (data.kind === 'tokens') {
    const prefix = selectedFolderPath === '__all__' ? '' : selectedFolderPath.replaceAll('/', '.')
    const tokens = prefix
      ? data.tokens.filter((token) => token.path === prefix || token.path.startsWith(`${prefix}.`))
      : data.tokens
    const title = prefix ? (selectedFolderPath.split('/').at(-1) ?? 'Tokens') : 'Tokens'
    return (
      <div className="module-page">
        <ModuleHeader
          eyebrow="Token registry"
          title={title}
          count={tokens.length}
          actions={modeActions}
        />
        {tokens.length ? (
          <div className="token-table">
            <div className="token-row token-row--head">
              <strong>Token</strong>
              <strong>Type</strong>
              <strong>Value · {previewMode}</strong>
            </div>
            {tokens.map((token) => {
              const value = token.values[previewMode] ?? token.value
              return (
                <button
                  type="button"
                  className={`token-row${token.id === selectedEntityId ? ' token-row--selected' : ''}`}
                  aria-current={token.id === selectedEntityId ? 'page' : undefined}
                  key={`${token.file}:${token.path}`}
                  onClick={() => onSelectEntity(token.id)}
                >
                  <code>{token.path}</code>
                  <span>{token.type}</span>
                  <div className="token-value">
                    {token.type === 'color' && (
                      <i className="token-value__swatch" style={{ background: String(value) }} />
                    )}
                    <strong>{String(value)}</strong>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="module-filter-empty">
            <strong>No tokens in this group</strong>
            <span>Choose All or another token group.</span>
          </div>
        )}
      </div>
    )
  }
  if (data.kind === 'palette')
    return (
      <div className="module-page">
        <ModuleHeader
          eyebrow="Color tokens"
          title="Palette"
          count={data.colors.length}
          actions={modeActions}
        />
        <div className="palette-grid">
          {data.colors.map((color) => (
            <ColorCard
              key={color.path}
              name={color.path.replace(/^color\./, '')}
              value={String(color.values[previewMode] ?? color.value)}
            />
          ))}
        </div>
      </div>
    )
  if (data.kind === 'fonts') {
    const typography = Object.fromEntries(
      data.typography.map((token) => [token.path, token.values[previewMode] ?? token.value]),
    )
    return (
      <div className="module-page">
        <ModuleHeader
          eyebrow="Type registry"
          title="Fonts"
          count={data.families.length}
          actions={modeActions}
        />
        <div className="font-list">
          {data.families.map((family) => (
            <article
              className="font-card"
              key={family.id}
              style={{
                fontFamily: String(typography['typography.interface.family'] ?? family.cssFamily),
              }}
            >
              <span>
                {family.source} · {previewMode}
              </span>
              <h2 style={{ fontWeight: Number(typography['typography.heading.weight'] ?? 600) }}>
                {family.name}
              </h2>
              <p
                style={{
                  fontSize: String(typography['typography.body.size'] ?? '42px'),
                  lineHeight: Number(typography['typography.body.line-height'] ?? 1.5),
                }}
              >
                Hamburgefontsiv 012345
              </p>
              <div className="font-mode-values">
                {data.typography.map((token) => (
                  <div key={token.id}>
                    <code>{token.path}</code>
                    <strong>{String(token.values[previewMode] ?? token.value)}</strong>
                  </div>
                ))}
              </div>
              <footer>
                {family.styles.map((style) => (
                  <code key={`${style.weight}-${style.style}`}>
                    {style.weight} {style.style}
                  </code>
                ))}
              </footer>
            </article>
          ))}
        </div>
      </div>
    )
  }
  if (data.kind === 'assets')
    return (
      <AssetsCatalog
        data={data}
        folderPath={selectedFolderPath}
        selectedEntityId={selectedEntityId}
        onSelectEntity={onSelectEntity}
      />
    )
  if (data.kind === 'wireframes') {
    const prefix = selectedFolderPath === '__all__' ? '' : selectedFolderPath
    const wireframes = prefix
      ? data.wireframes.filter(
          (wireframe) =>
            wireframe.directory === prefix || wireframe.directory.startsWith(`${prefix}/`),
        )
      : data.wireframes
    return (
      <div className="module-page">
        <ModuleHeader
          eyebrow="Page directions"
          title={prefix ? (prefix.split('/').at(-1) ?? 'Wireframes') : 'Wireframes'}
          count={wireframes.length}
        />
        {wireframes.length ? (
          <div className="wireframe-catalog">
            {wireframes.map((wireframe) => (
              <WireframeCatalogCard
                key={wireframe.id}
                wireframe={wireframe}
                mode={data.modes[0] ?? 'default'}
                themeVariables={data.themeVariables}
                onClick={() => onSelectEntity(wireframe.id)}
              />
            ))}
          </div>
        ) : (
          <div className="module-filter-empty">
            <strong>No Wireframes in this group</strong>
            <span>Choose All or add a canonical wireframe.json directory.</span>
          </div>
        )}
      </div>
    )
  }
  if (data.kind === 'pages') {
    const selected = data.pages.find((item) => item.id === selectedEntityId)
    if (selected)
      return (
        <PageOverview
          page={selected}
          pages={data.pages}
          onBack={onBack}
          onOpenReview={onOpenPageReview}
        />
      )
    const prefix = selectedFolderPath === '__all__' ? '' : selectedFolderPath
    const pages = prefix
      ? data.pages.filter(
          (page) => page.directory === prefix || page.directory.startsWith(`${prefix}/`),
        )
      : data.pages
    return (
      <div className="module-page">
        <ModuleHeader
          eyebrow="Production screens"
          title={prefix ? (prefix.split('/').at(-1) ?? 'Pages') : 'Pages'}
          count={pages.length}
        />
        {pages.length ? (
          <div className="page-catalog">
            {pages.map((page) => (
              <PageCatalogCard
                key={page.id}
                page={page}
                mode={data.modes[0] ?? 'default'}
                themeVariables={data.themeVariables}
                onClick={() => onSelectEntity(page.id)}
              />
            ))}
          </div>
        ) : (
          <div className="module-filter-empty">
            <strong>No Pages in this group</strong>
            <span>Choose All or add a canonical page.json directory.</span>
          </div>
        )}
      </div>
    )
  }
  if (data.kind === 'components') {
    const selected = data.components.find((item) => item.id === selectedEntityId)
    return selected?.entry ? (
      <ComponentWorkbench
        component={selected}
        onBack={onBack}
        onOpenPlayground={onOpenPlayground}
        onSelectComponent={onSelectEntity}
        canvasMode={canvasMode}
        canvasColor={canvasColor}
        onCanvasModeChange={onCanvasModeChange}
        onCanvasColorChange={onCanvasColorChange}
      />
    ) : selected ? (
      <ComponentConceptOverview
        component={selected}
        onBack={onBack}
        onOpenPlayground={onOpenPlayground}
      />
    ) : (
      <Catalog
        data={data}
        sourceId={sourceId}
        folderPath={selectedFolderPath}
        onSelectEntity={onSelectEntity}
      />
    )
  }
  return <div className="module-state">{t('status.noEntities')}</div>
}

function WireframeCatalogCard({
  wireframe,
  mode,
  themeVariables,
  onClick,
}: {
  wireframe: Extract<ModuleData, { kind: 'wireframes' }>['wireframes'][number]
  mode: string
  themeVariables: Extract<ModuleData, { kind: 'wireframes' }>['themeVariables']
  onClick: () => void
}) {
  const renderer = wireframeRendererFor(wireframe)
  const state =
    wireframe.states.find((item) => item.id === wireframe.defaultState) ?? wireframe.states[0]
  const rendered = renderer?.renderWireframe({
    layout: wireframe.defaultLayout,
    state: state?.id ?? null,
    values: { ...(state?.values ?? {}) },
    onAction: () => undefined,
  })
  const preview = rendered ? (
    <div style={designSystemModeStyle(themeVariables, mode)}>{rendered}</div>
  ) : null
  return (
    <WireframeCard
      name={wireframe.name}
      description={wireframe.description}
      status={wireframe.status}
      layoutCount={wireframe.layouts.length}
      stateCount={wireframe.states.length}
      transitionCount={wireframe.flow.edges.length}
      preview={preview ?? <div className="wireframe-catalog__missing">Renderer unavailable</div>}
      onClick={onClick}
    />
  )
}

// Pages are finalized, production-composed screens (PAGE_RULES.md) and are intentionally not
// presented through WireframeCard, whose own contract calls out final Pages as an avoidWhen case.
function PageCatalogCard({
  page,
  mode,
  themeVariables,
  onClick,
}: {
  page: PageEntity
  mode: string
  themeVariables: Extract<ModuleData, { kind: 'pages' }>['themeVariables']
  onClick: () => void
}) {
  const renderer = pageRendererFor(page)
  const state = page.states.find((item) => item.id === page.defaultState) ?? page.states[0]
  const rendered = renderer?.renderPage({
    state: state?.id ?? null,
    values: { ...(state?.values ?? {}) },
    onAction: () => undefined,
  })
  const preview = rendered ? (
    <div style={designSystemModeStyle(themeVariables, mode)}>{rendered}</div>
  ) : null
  return (
    <article className="page-catalog-card">
      <WireframeScreenPreview>
        {preview ?? <div className="page-catalog-card__missing">Renderer unavailable</div>}
      </WireframeScreenPreview>
      <button
        type="button"
        className="page-catalog-card__action"
        aria-label={`Open ${page.name} Page. ${page.description}`}
        onClick={onClick}
      />
      <footer className="page-catalog-card__footer">
        <strong>{page.name}</strong>
        <Chip size="small" color={pageStatusColors[page.status] ?? 'warning'} variant="soft">
          {page.status}
        </Chip>
      </footer>
    </article>
  )
}

// The Page card: an inline overview opened before full-screen review (PAGE_RULES.md "Routing and
// the Page card"). Diagnostics already acknowledged in `diagnosticsAcknowledged[]` stay visible,
// only dimmed — acknowledgement is an auditable manifest edit, never a silent client-side hide.
function PageOverview({
  page,
  pages,
  onBack,
  onOpenReview,
}: {
  page: PageEntity
  pages: PageEntity[]
  onBack: () => void
  onOpenReview: () => void
}) {
  const acknowledgedCodes = new Set(page.diagnosticsAcknowledged.map((item) => item.code))
  const describeTarget = (edge: PageEntity['flow']['edges'][number]) => {
    const to = edge.to
    if (to.kind === 'state') {
      const state = page.states.find((item) => item.id === to.stateId)
      return `Stays on ${page.name} · ${state?.name ?? to.stateId}`
    }
    const target = pages.find((item) => item.id === to.pageId)
    return `Exits to ${target?.name ?? to.pageId}`
  }
  return (
    <div className="workbench">
      <div className="workbench__top">
        <ModuleHeader
          eyebrow={page.directory}
          title={page.name}
          backLabel="Pages"
          onBack={onBack}
          meta={page.mirroredRoute ?? 'Filesystem-only route'}
          actions={
            <Button type="button" variant="primary" onClick={onOpenReview} disabled={!page.entry}>
              Open review
            </Button>
          }
        />
      </div>
      <section className="workbench__rail">
        <div className="workbench-section">
          <span>Status</span>
          <Chip size="small" color={pageStatusColors[page.status] ?? 'warning'} variant="soft">
            {page.status}
          </Chip>
        </div>
        <div className="workbench-section">
          <span>Description</span>
          <div className="workbench-markdown">
            <p>{page.description || 'No description has been written yet.'}</p>
          </div>
        </div>
        {page.derivedFromWireframe && (
          <div className="workbench-section">
            <span>Provenance</span>
            <div className="workbench-markdown">
              <p>Graduated from Wireframe &quot;{page.derivedFromWireframe.wireframeId}&quot;.</p>
            </div>
          </div>
        )}
        <div className="workbench-section">
          <span>Actions &amp; transitions</span>
          <div className="page-card-actions">
            {page.flow.edges.length ? (
              page.flow.edges.map((edge) => (
                <div key={edge.id} className="page-card-actions__item">
                  <strong>{edge.label}</strong>
                  <span>{describeTarget(edge)}</span>
                </div>
              ))
            ) : (
              <span>This Page has no authored flow transitions yet.</span>
            )}
          </div>
        </div>
        <div className="workbench-section">
          <span>Diagnostics</span>
          {page.diagnostics.length ? (
            <div className="page-card-diagnostics">
              {page.diagnostics.map((diagnostic, index) => (
                <div
                  key={`${diagnostic.code}-${index}`}
                  className={`page-card-diagnostic${acknowledgedCodes.has(diagnostic.code) ? ' page-card-diagnostic--acknowledged' : ''}`}
                >
                  <span>{diagnostic.message}</span>
                  <code>{diagnostic.code}</code>
                </div>
              ))}
            </div>
          ) : (
            <div className="workbench-markdown">
              <p>No diagnostics. This Page is ready for hand-off review.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
