import './ModuleView.scss'
import { isValidElement, useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import { useDesignLabI18n } from '@design-lab/system/i18n'
import {
  AssetCard,
  Button,
  CatalogGroup,
  Chip,
  CodeBlock,
  ColorCard,
  ComponentCard,
  ComponentReferencePanel,
  ComponentThumbnail,
  ModuleHeader,
  ModulePage,
  TabSwitcher,
  Table,
  StoryCanvas,
  UserFlowCanvas,
  WireframeCard,
  WireframeScreenPreview,
  WorkbenchPlayground,
  type CanvasMode,
  type ChipColor,
  type TableColumn,
} from '@design-lab/system/components'
import { CardsViewIcon, ListViewIcon } from '@design-lab/system/icons'
import type { ModuleData } from '../../api/projects'
import {
  firstStoryExample,
  previewComponentFor,
  storyModuleFor,
  type ComponentEntity,
} from '../../componentRuntime'
import { wireframeRendererFor } from '../../wireframes/registry'
import { pageRendererFor } from '../../pages/registry'
import { designSystemModeStyle } from '../../designSystemMode'
import { buildPageSitemap } from '../../lib/pageSitemap'

type PageEntity = Extract<ModuleData, { kind: 'pages' }>['pages'][number]
type CatalogLayout = 'cards' | 'list'
const pageStatusColors: Record<PageEntity['status'], ChipColor> = {
  draft: 'warning',
  review: 'accent',
  approved: 'success',
}

const componentListColumns: TableColumn<ComponentEntity>[] = [
  {
    id: 'name',
    header: 'Component',
    cell: (component) => (
      <span className="catalog-list-identity">
        <strong>{component.name}</strong>
        <code>{component.entry ?? 'Playground only'}</code>
      </span>
    ),
    sortValue: (component) => component.name,
    width: '42%',
  },
  {
    id: 'category',
    header: 'Category',
    cell: (component) => component.directory.split('/').slice(0, -1).join(' / ') || 'Root',
    sortValue: (component) => component.directory,
    width: '30%',
  },
  {
    id: 'status',
    header: 'Status',
    cell: (component) => component.status ?? 'Unspecified',
    sortValue: (component) => component.status ?? '',
  },
  {
    id: 'variants',
    header: 'Variants',
    cell: (component) => component.variants.length,
    sortValue: (component) => component.variants.length,
    align: 'end',
  },
]

function DiscoveredComponentPreview({
  component,
  sourceId,
}: {
  component: ComponentEntity
  sourceId: string
}) {
  const Preview = previewComponentFor(component, sourceId)
  if (Preview) return <Preview />
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
  const module = storyModuleFor(component)
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

// Shared by Wireframes, Pages, and (implicitly) Components catalogs: groups entities by every
// directory segment above the entity's own folder, so e.g. atoms/actions/Button groups under
// "atoms / actions" the same way Components already do — Wireframes and Pages previously had no
// such grouping at all and rendered as one flat grid regardless of folder depth.
function groupByCategory<T>(items: T[], directoryOf: (item: T) => string, scopedPrefix: string) {
  const scope = scopedPrefix.split('/').filter(Boolean)
  const groupsByPath = new Map<string, T[]>()
  for (const item of items) {
    const category = directoryOf(item).split('/').filter(Boolean).slice(0, -1)
    const categoryPath = category.join('/')
    groupsByPath.set(categoryPath, [...(groupsByPath.get(categoryPath) ?? []), item])
  }
  return [...groupsByPath.entries()]
    .map(([path, groupedItems]) => {
      const category = path.split('/').filter(Boolean)
      const relativeCategory = category.slice(scope.length)
      const labelParts = relativeCategory.length ? relativeCategory : category.slice(-1)
      return { path, label: labelParts.join(' / ') || 'All', items: groupedItems }
    })
    .sort((left, right) => left.path.localeCompare(right.path))
}

function CatalogLayoutToggle({
  value,
  onChange,
}: {
  value: CatalogLayout
  onChange: (value: CatalogLayout) => void
}) {
  return (
    <TabSwitcher
      ariaLabel="Catalog layout"
      variant="segmented"
      size="small"
      iconSize={12}
      options={[
        {
          value: 'cards',
          icon: <CardsViewIcon />,
          accessibleLabel: 'Cards view',
        },
        {
          value: 'list',
          icon: <ListViewIcon />,
          accessibleLabel: 'List view',
        },
      ]}
      value={value}
      onChange={onChange}
    />
  )
}

function Catalog({
  data,
  sourceId,
  folderPath,
  onSelectEntity,
  layout,
  onLayoutChange,
}: {
  data: Extract<ModuleData, { kind: 'components' }>
  sourceId: string
  folderPath: string
  onSelectEntity: (id: string) => void
  layout: CatalogLayout
  onLayoutChange: (layout: CatalogLayout) => void
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
    <ModulePage>
      <ModuleHeader
        eyebrow="Live inventory · Components"
        title={title}
        count={components.length}
        actions={<CatalogLayoutToggle value={layout} onChange={onLayoutChange} />}
      />
      {components.length ? (
        <div className="component-groups">
          {groups.map((group) => {
            const showHeader = groups.length > 1 || group.path !== folderPath
            return (
              <CatalogGroup
                key={group.path}
                title={showHeader ? group.label : undefined}
                count={showHeader ? group.components.length : undefined}
              >
                {layout === 'cards' ? (
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
                ) : (
                  <Table<ComponentEntity>
                    rows={group.components}
                    columns={componentListColumns}
                    getRowId={(component) => component.id}
                    ariaLabel={`${group.label} components`}
                    density="compact"
                    defaultSort={{ columnId: 'name', direction: 'ascending' }}
                    onRowSelect={(component) => onSelectEntity(component.id)}
                  />
                )}
              </CatalogGroup>
            )
          })}
        </div>
      ) : (
        <div className="module-filter-empty">
          <strong>No components in this folder</strong>
          <span>Choose All or another folder in the Directory Panel.</span>
        </div>
      )}
    </ModulePage>
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
    <ModulePage>
      <ModuleHeader eyebrow="Filesystem inventory · Assets" title={title} count={assets.length} />
      {assets.length ? (
        <div className="asset-groups">
          {[...groups.entries()].map(([name, items]) => (
            <CatalogGroup key={name} title={name} count={items.length}>
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
            </CatalogGroup>
          ))}
        </div>
      ) : (
        <div className="module-filter-empty">
          <strong>No assets in this folder</strong>
          <span>Add files to this canonical directory or choose All.</span>
        </div>
      )}
    </ModulePage>
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
  onNavigateToPage,
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
  onNavigateToPage?: (pageId: string) => void
}) {
  const { t } = useDesignLabI18n()
  const [pagesCatalogView, setPagesCatalogView] = useState<'catalog' | 'sitemap'>('catalog')
  const [catalogLayout, setCatalogLayout] = useState<CatalogLayout>('cards')
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
    const tokenRows = tokens.map((token) => ({
      id: token.id,
      path: token.path,
      type: token.type,
      value: String(token.values[previewMode] ?? token.value),
    }))
    const tokenColumns: TableColumn<(typeof tokenRows)[number]>[] = [
      {
        id: 'path',
        header: 'Token',
        cell: (token) => <code className="token-table-path">{token.path}</code>,
        sortValue: (token) => token.path,
        width: '46%',
      },
      {
        id: 'type',
        header: 'Type',
        cell: (token) => <span className="token-table-type">{token.type}</span>,
        sortValue: (token) => token.type,
        width: '18%',
      },
      {
        id: 'value',
        header: `Value · ${previewMode}`,
        cell: (token) => (
          <span className="token-table-value">
            {token.type === 'color' && (
              <i
                className="token-table-swatch"
                style={{ background: token.value }}
                aria-hidden="true"
              />
            )}
            <strong>{token.value}</strong>
          </span>
        ),
        sortValue: (token) => token.value,
      },
    ]
    return (
      <ModulePage>
        <ModuleHeader
          eyebrow="Token registry"
          title={title}
          count={tokens.length}
          actions={modeActions}
        />
        {tokens.length ? (
          <Table
            rows={tokenRows}
            columns={tokenColumns}
            getRowId={(token) => token.id}
            ariaLabel="Design tokens"
            defaultSort={{ columnId: 'path', direction: 'ascending' }}
            selectedRowId={selectedEntityId}
            onRowSelect={(token) => onSelectEntity(token.id)}
          />
        ) : (
          <div className="module-filter-empty">
            <strong>No tokens in this group</strong>
            <span>Choose All or another token group.</span>
          </div>
        )}
      </ModulePage>
    )
  }
  if (data.kind === 'palette')
    return (
      <ModulePage>
        <ModuleHeader
          eyebrow="Color tokens"
          title="Palette"
          count={data.colors.length}
          actions={
            <>
              {modeActions}
              <CatalogLayoutToggle value={catalogLayout} onChange={setCatalogLayout} />
            </>
          }
        />
        {catalogLayout === 'cards' ? (
          <div className="palette-grid">
            {data.colors.map((color) => (
              <ColorCard
                key={color.path}
                name={color.path.replace(/^color\./, '')}
                value={String(color.values[previewMode] ?? color.value)}
              />
            ))}
          </div>
        ) : (
          <Table
            rows={data.colors}
            columns={[
              {
                id: 'color',
                header: 'Color',
                cell: (color) => (
                  <span className="palette-table-swatch-wrap">
                    <i
                      className="palette-table-swatch"
                      style={{
                        background: String(color.values[previewMode] ?? color.value),
                      }}
                      aria-hidden="true"
                    />
                    <strong>{color.path.replace(/^color\./, '')}</strong>
                  </span>
                ),
                sortValue: (color) => color.path,
                width: '52%',
              },
              {
                id: 'token',
                header: 'Token',
                cell: (color) => <code className="token-table-path">{color.path}</code>,
                sortValue: (color) => color.path,
              },
              {
                id: 'value',
                header: `Value · ${previewMode}`,
                cell: (color) => (
                  <strong className="palette-table-value">
                    {String(color.values[previewMode] ?? color.value)}
                  </strong>
                ),
                sortValue: (color) => String(color.values[previewMode] ?? color.value),
                align: 'end',
              },
            ]}
            getRowId={(color) => color.id}
            ariaLabel="Color palette"
            density="compact"
            defaultSort={{ columnId: 'color', direction: 'ascending' }}
          />
        )}
      </ModulePage>
    )
  if (data.kind === 'fonts') {
    const typography = Object.fromEntries(
      data.typography.map((token) => [token.path, token.values[previewMode] ?? token.value]),
    )
    return (
      <ModulePage>
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
      </ModulePage>
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
    const groups = groupByCategory(wireframes, (wireframe) => wireframe.directory, prefix)
    return (
      <ModulePage>
        <ModuleHeader
          eyebrow="Page directions"
          title={prefix ? (prefix.split('/').at(-1) ?? 'Wireframes') : 'Wireframes'}
          count={wireframes.length}
        />
        {wireframes.length ? (
          <div className="component-groups">
            {groups.map((group) => (
              <CatalogGroup
                key={group.path}
                title={groups.length > 1 ? group.label : undefined}
                count={groups.length > 1 ? group.items.length : undefined}
              >
                <div className="wireframe-catalog">
                  {group.items.map((wireframe) => (
                    <WireframeCatalogCard
                      key={wireframe.id}
                      wireframe={wireframe}
                      mode={data.modes[0] ?? 'default'}
                      themeVariables={data.themeVariables}
                      onClick={() => onSelectEntity(wireframe.id)}
                    />
                  ))}
                </div>
              </CatalogGroup>
            ))}
          </div>
        ) : (
          <div className="module-filter-empty">
            <strong>No Wireframes in this group</strong>
            <span>Choose All or add a canonical wireframe.json directory.</span>
          </div>
        )}
      </ModulePage>
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
    const groups = groupByCategory(pages, (page) => page.directory, prefix)
    const pagesViewToggle = (
      <TabSwitcher
        ariaLabel="Pages catalog view"
        options={[
          { value: 'catalog', label: 'Catalog' },
          { value: 'sitemap', label: 'Site map' },
        ]}
        value={pagesCatalogView}
        onChange={setPagesCatalogView}
      />
    )

    if (pagesCatalogView === 'sitemap') {
      const sitemap = buildPageSitemap(pages)
      const sitemapNodes = sitemap.nodes.map((node) => ({
        id: node.id,
        title: node.title,
        description: node.description,
        eyebrow: node.route ?? 'Page',
        preview: null,
        x: node.x,
        y: node.y,
      }))
      const folderLabel = prefix ? (prefix.split('/').at(-1) ?? prefix) : 'All Pages'
      return (
        <ModulePage variant="canvas">
          <ModuleHeader
            eyebrow={prefix ? `Folder · ${folderLabel}` : 'Site-wide navigation'}
            title={prefix ? `${folderLabel} site map` : 'Pages site map'}
            count={sitemap.nodes.length}
            actions={pagesViewToggle}
          />
          {sitemap.nodes.length ? (
            <UserFlowCanvas
              className="module-page__sitemap-canvas"
              variant="sitemap"
              nodes={sitemapNodes}
              edges={sitemap.edges}
              selectedId={selectedEntityId}
              onSelect={(pageId) => onSelectEntity(pageId)}
              onPreview={(pageId) => onNavigateToPage?.(pageId)}
            />
          ) : (
            <div className="module-filter-empty">
              <strong>No Pages in this site map</strong>
              <span>
                {prefix
                  ? 'This folder has no Pages yet, or none of them declare cross-Page flow edges.'
                  : 'Add Pages with cross-Page flow edges to see navigation here.'}
              </span>
            </div>
          )}
        </ModulePage>
      )
    }

    return (
      <ModulePage>
        <ModuleHeader
          eyebrow="Production screens"
          title={prefix ? (prefix.split('/').at(-1) ?? 'Pages') : 'Pages'}
          count={pages.length}
          actions={pagesViewToggle}
        />
        {pages.length ? (
          <div className="component-groups">
            {groups.map((group) => (
              <CatalogGroup
                key={group.path}
                title={groups.length > 1 ? group.label : undefined}
                count={groups.length > 1 ? group.items.length : undefined}
              >
                <div className="page-catalog">
                  {group.items.map((page) => (
                    <PageCatalogCard
                      key={page.id}
                      page={page}
                      mode={data.modes[0] ?? 'default'}
                      themeVariables={data.themeVariables}
                      onClick={() => onSelectEntity(page.id)}
                    />
                  ))}
                </div>
              </CatalogGroup>
            ))}
          </div>
        ) : (
          <div className="module-filter-empty">
            <strong>No Pages in this group</strong>
            <span>Choose All or add a canonical page.json directory.</span>
          </div>
        )}
      </ModulePage>
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
        layout={catalogLayout}
        onLayoutChange={setCatalogLayout}
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
