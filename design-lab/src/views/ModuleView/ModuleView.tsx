import './ModuleView.scss'
import {
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
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
  ComponentReferenceFiles,
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
import { CardsViewIcon, CopyIcon, ListViewIcon } from '@design-lab/system/icons'
import {
  getComponentHandoff,
  type ComponentHandoff,
  type ManagedComponentRuntime,
  type ModuleData,
} from '../../api/projects'
import type { PlaygroundControls, PlaygroundValues } from '@design-lab/system/playground'
import { TypedPlaygroundControls } from '../../components/TypedPlaygroundControls/TypedPlaygroundControls'
import { ManagedRuntimeFrame } from '../../components/ManagedRuntimeFrame/ManagedRuntimeFrame'
import {
  playgroundModuleFor,
  previewComponentFor,
  storySourceFor,
  storyModuleFor,
  type ComponentEntity,
  type StoryDefinition,
  type StoryExample,
  type StoryModule,
} from '../../componentRuntime'
import { wireframeRendererFor } from '../../wireframes/registry'
import { pageRendererFor } from '../../pages/registry'
import { designSystemModeStyle } from '../../designSystemMode'
import { buildPageSitemap } from '../../lib/pageSitemap'
import { componentPresentation } from '../../componentPresentation'

type PageEntity = Extract<ModuleData, { kind: 'pages' }>['pages'][number]
type ComponentFamily = Extract<ModuleData, { kind: 'components' }>['families'][number]
type CatalogLayout = 'cards' | 'list'
const pageStatusColors: Record<PageEntity['status'], ChipColor> = {
  draft: 'warning',
  review: 'accent',
  approved: 'success',
}

async function copyPlainText(value: string) {
  if (navigator.clipboard?.writeText && window.isSecureContext)
    try {
      await navigator.clipboard.writeText(value)
      return true
    } catch {
      // Fall through to the selection-based copy path.
    }
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.append(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  return copied
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
    width: '34%',
  },
  {
    id: 'technology',
    header: 'Technology',
    cell: (component) => `${component.technology} · ${component.platform}`,
    sortValue: (component) => `${component.platform}:${component.technology}`,
    width: '18%',
  },
  {
    id: 'category',
    header: 'Category',
    cell: (component) => component.directory.split('/').slice(0, -1).join(' / ') || 'Root',
    sortValue: (component) => component.directory,
    width: '24%',
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
  mode,
  themeVariables,
}: {
  component: ComponentEntity
  sourceId: string
  mode: string
  themeVariables: Record<string, Record<string, string | number>>
}) {
  if (component.technology === 'vue')
    return (
      <ManagedRuntimeFrame
        sourceId={sourceId}
        componentId={component.id}
        view="preview"
        mode={mode}
        title={`${component.name} catalog preview`}
        className="managed-runtime-frame--catalog"
      />
    )
  const Preview = previewComponentFor(component, sourceId)
  if (Preview)
    return (
      <div style={designSystemModeStyle(themeVariables, mode)}>
        <Preview />
      </div>
    )
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
// across unrelated sources because ids are unique only
// within one Library, not across sources. Story and Playground modules now resolve independently
// through the shared filesystem-keyed runtime.
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

function DiscoveredComponentStories({
  component,
  canvasMode,
  canvasColor,
  onCanvasModeChange,
  onCanvasColorChange,
  productModes,
  productMode,
  onProductModeChange,
  themeVariables,
}: {
  component: ComponentEntity
  canvasMode: CanvasMode
  canvasColor: string
  onCanvasModeChange: (mode: CanvasMode) => void
  onCanvasColorChange: (color: string) => void
  productModes: string[]
  productMode: string
  onProductModeChange: (mode: string) => void
  themeVariables: Record<string, Record<string, string | number>>
}) {
  const module = storyModuleFor(component)
  if (!module?.stories?.length || !module.renderStoryExample) return null

  const renderedStories = module.stories.map((story) => ({
    story,
    examples: (story.examples ?? []).map((example) => ({
      example,
      node: module.renderStoryExample?.(example, story),
    })),
  }))

  return (
    <div className="focused-stories">
      {renderedStories.map(({ story, examples }) => (
        <StoryCanvas
          key={story.id}
          title={story.name}
          description={story.description}
          meta={[story.kind ?? 'context', story.interactive && 'interactive']
            .filter(Boolean)
            .join(' · ')}
          canvasMode={canvasMode}
          canvasColor={canvasColor}
          onCanvasModeChange={onCanvasModeChange}
          onCanvasColorChange={onCanvasColorChange}
          themes={productModes}
          theme={productMode}
          onThemeChange={onProductModeChange}
          source={
            storySourceFor(
              component,
              story,
              examples.map(({ node }) => node),
              module.__designLabStoryImports ?? [],
            ) ?? undefined
          }
        >
          <div
            className="story-comparison"
            style={designSystemModeStyle(themeVariables, productMode)}
          >
            {examples.map(({ example, node }, index) => (
              <Specimen key={`${story.id}:${example.label}:${index}`} label={example.label}>
                {node}
              </Specimen>
            ))}
          </div>
        </StoryCanvas>
      ))}
    </div>
  )
}

function productionPlaygroundSetup(component: ComponentEntity, seed: StoryExample) {
  const controls: PlaygroundControls = {}
  const values: PlaygroundValues = {}
  for (const [name, definition] of Object.entries(component.props ?? {})) {
    const seedValue = seed.props[name]
    const fallback =
      seedValue ??
      definition.default ??
      (name === 'label' ? seed.label : undefined) ??
      definition.values?.[0]
    if (definition.values?.length) {
      controls[name] = {
        kind: 'enum',
        label: name,
        defaultValue: String(fallback ?? definition.values[0]),
        options: definition.values.map((value) => ({ value, label: value })),
      }
      values[name] = controls[name].defaultValue
      continue
    }
    if (definition.type.toLowerCase() === 'boolean') {
      controls[name] = {
        kind: 'boolean',
        label: name,
        defaultValue: Boolean(fallback),
      }
      values[name] = controls[name].defaultValue
      continue
    }
    if (typeof fallback === 'string') {
      controls[name] = {
        kind: 'string',
        label: name,
        defaultValue: fallback,
      }
      values[name] = fallback
    }
  }
  return { controls, values }
}

function vuePropName(name: string) {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

function vuePropSource(name: string, value: unknown) {
  const attribute = vuePropName(name)
  if (value === true) return attribute
  if (typeof value === 'string' && !value.includes('\n'))
    return `${attribute}=${JSON.stringify(value)}`
  const expression = JSON.stringify(value ?? null).replaceAll("'", "\\'")
  return `:${attribute}='${expression}'`
}

function vueStorySource(
  component: ComponentEntity,
  story: ManagedComponentRuntime['stories'][number],
) {
  const componentImport = component.import
  if (!componentImport?.statement) return undefined
  const symbol = componentImport.symbol
  const examples = (story.examples ?? []).map((example) => {
    const props = Object.entries(example.props ?? {}).map(([name, value]) =>
      vuePropSource(name, value),
    )
    return `  <${symbol}${props.length ? ` ${props.join(' ')}` : ''} />`
  })
  if (!examples.length) return undefined
  return `<script setup lang="ts">\n${componentImport.statement}\n</script>\n\n<template>\n${examples.join('\n')}\n</template>`
}

function ProductionComponentPlayground({
  component,
  canvasMode,
  canvasColor,
  onCanvasModeChange,
  onCanvasColorChange,
  productMode,
  productModes,
  onProductModeChange,
  themeVariables,
}: {
  component: ComponentEntity
  canvasMode: CanvasMode
  canvasColor: string
  onCanvasModeChange: (mode: CanvasMode) => void
  onCanvasColorChange: (color: string) => void
  productMode: string
  productModes: string[]
  onProductModeChange: (mode: string) => void
  themeVariables: Record<string, Record<string, string | number>>
}) {
  const { t } = useDesignLabI18n()
  const module = storyModuleFor(component)
  const story = module?.stories?.find((item) => item.examples?.length)
  const seed = story?.examples?.[0]
  const setup = seed ? productionPlaygroundSetup(component, seed) : null
  if (
    !module?.renderStoryExample ||
    !story ||
    !seed ||
    !setup ||
    !Object.keys(setup.controls).length
  )
    return (
      <div className="workbench-playground-empty">
        <span>{t('workbench.componentPlayground')}</span>
        <p>{t('workbench.noEditableProps')}</p>
      </div>
    )

  return (
    <LoadedProductionComponentPlayground
      key={`${component.sourceId}:${component.id}`}
      component={component}
      module={module}
      story={story}
      seed={seed}
      setup={setup}
      canvasMode={canvasMode}
      canvasColor={canvasColor}
      onCanvasModeChange={onCanvasModeChange}
      onCanvasColorChange={onCanvasColorChange}
      productMode={productMode}
      productModes={productModes}
      onProductModeChange={onProductModeChange}
      themeVariables={themeVariables}
    />
  )
}

function LoadedProductionComponentPlayground({
  component,
  module,
  story,
  seed,
  setup,
  canvasMode,
  canvasColor,
  onCanvasModeChange,
  onCanvasColorChange,
  productMode,
  productModes,
  onProductModeChange,
  themeVariables,
}: {
  component: ComponentEntity
  module: StoryModule
  story: StoryDefinition
  seed: StoryExample
  setup: ReturnType<typeof productionPlaygroundSetup>
  canvasMode: CanvasMode
  canvasColor: string
  onCanvasModeChange: (mode: CanvasMode) => void
  onCanvasColorChange: (color: string) => void
  productMode: string
  productModes: string[]
  onProductModeChange: (mode: string) => void
  themeVariables: Record<string, Record<string, string | number>>
}) {
  const { t } = useDesignLabI18n()
  const [values, setValues] = useState(setup.values)
  const specimenStyle = designSystemModeStyle(themeVariables, productMode)
  const exampleProps = { ...seed.props, ...values }
  const exampleLabel = String(values.label ?? exampleProps.children ?? seed.label)

  return (
    <WorkbenchPlayground
      mode={canvasMode}
      color={canvasColor}
      onModeChange={onCanvasModeChange}
      onColorChange={onCanvasColorChange}
      themes={productModes}
      theme={productMode}
      onThemeChange={onProductModeChange}
      controlsPosition="end"
      label={t('workbench.componentPlayground')}
      controls={
        <div className="inline-playground-controls">
          <TypedPlaygroundControls
            component={component}
            controls={setup.controls}
            values={values}
            onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
            heading={t('workbench.props')}
          />
        </div>
      }
    >
      <div className="inline-playground-specimen" style={specimenStyle}>
        {module.renderStoryExample?.({ ...seed, label: exampleLabel, props: exampleProps }, story)}
      </div>
    </WorkbenchPlayground>
  )
}

function ManagedComponentWorkbench({
  component,
  sourceId,
  family,
  onBack,
  onOpenPlayground,
  onSelectComponent,
  canvasMode,
  canvasColor,
  onCanvasModeChange,
  onCanvasColorChange,
  productMode,
  productModes,
  onProductModeChange,
}: {
  component: ComponentEntity
  sourceId: string
  family?: ComponentFamily
  onBack: () => void
  onOpenPlayground: (mode?: string) => void
  onSelectComponent: (id: string) => void
  canvasMode: CanvasMode
  canvasColor: string
  onCanvasModeChange: (mode: CanvasMode) => void
  onCanvasColorChange: (color: string) => void
  productMode: string
  productModes: string[]
  onProductModeChange: (mode: string) => void
}) {
  const { t } = useDesignLabI18n()
  const [runtime, setRuntime] = useState<ManagedComponentRuntime | null>(null)
  const story = runtime?.stories.find((item) => item.examples?.length)
  const seed = story?.examples?.[0]
  const setup = seed ? productionPlaygroundSetup(component, seed) : null
  const [values, setValues] = useState<PlaygroundValues>({})
  useEffect(() => {
    if (setup) setValues(setup.values)
  }, [component.id, runtime?.profile.id])
  const canvasStyle = { '--canvas-solid': canvasColor } as CSSProperties

  return (
    <div className={`workbench workbench--canvas-${canvasMode}`} style={canvasStyle}>
      <div className="workbench__top">
        <ModuleHeader
          eyebrow={component.directory}
          title={component.name}
          backLabel={t('workbench.back')}
          onBack={onBack}
          meta={`${component.entry} · Vue ${runtime?.profile.framework.version ?? ''}`}
          actions={
            runtime?.playground ? (
              <Button
                type="button"
                variant="primary"
                size="small"
                onClick={() => onOpenPlayground(productMode)}
              >
                {t('workbench.openWireframePlayground')}
              </Button>
            ) : undefined
          }
        />
      </div>
      <ComponentFamilyNavigation
        family={family}
        activeId={component.id}
        onSelect={onSelectComponent}
      />
      <ComponentReferencePanel
        importStatement={component.import?.statement ?? ''}
        importLanguage="vue"
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
        themes={productModes}
        theme={productMode}
        onThemeChange={onProductModeChange}
        controlsPosition="end"
        label={t('workbench.componentPlayground')}
        controls={
          setup && Object.keys(setup.controls).length ? (
            <div className="inline-playground-controls">
              <TypedPlaygroundControls
                component={component}
                controls={setup.controls}
                values={values}
                onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
                heading={t('workbench.props')}
              />
            </div>
          ) : undefined
        }
      >
        <ManagedRuntimeFrame
          sourceId={sourceId}
          componentId={component.id}
          view="playground"
          mode={productMode}
          args={values}
          title={`${component.name} production Playground`}
          className="managed-runtime-frame--playground"
          onRuntime={setRuntime}
        />
      </WorkbenchPlayground>
      <section className="workbench__rail">
        {runtime?.stories.map((item) => (
          <StoryCanvas
            key={item.id}
            title={item.name}
            description={item.description}
            meta={item.kind ?? 'context'}
            canvasMode={canvasMode}
            canvasColor={canvasColor}
            onCanvasModeChange={onCanvasModeChange}
            onCanvasColorChange={onCanvasColorChange}
            themes={productModes}
            theme={productMode}
            onThemeChange={onProductModeChange}
            source={vueStorySource(component, item)}
            sourceLanguage="vue"
          >
            <ManagedRuntimeFrame
              sourceId={sourceId}
              componentId={component.id}
              view="story"
              story={item.id}
              mode={productMode}
              title={`${component.name}: ${item.name}`}
              className="managed-runtime-frame--story"
            />
          </StoryCanvas>
        ))}
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
        <ComponentReferenceFiles files={component.files} />
      </section>
    </div>
  )
}

function ComponentWorkbench({
  component,
  family,
  onBack,
  onOpenPlayground,
  onSelectComponent,
  canvasMode,
  canvasColor,
  onCanvasModeChange,
  onCanvasColorChange,
  productMode,
  productModes,
  onProductModeChange,
  themeVariables,
}: {
  component: ComponentEntity
  family?: ComponentFamily
  onBack: () => void
  onOpenPlayground: (mode?: string) => void
  onSelectComponent: (id: string) => void
  canvasMode: CanvasMode
  canvasColor: string
  onCanvasModeChange: (mode: CanvasMode) => void
  onCanvasColorChange: (color: string) => void
  productMode: string
  productModes: string[]
  onProductModeChange: (mode: string) => void
  themeVariables: Record<string, Record<string, string | number>>
}) {
  const { t } = useDesignLabI18n()
  const canvasStyle = { '--canvas-solid': canvasColor } as CSSProperties
  const playgroundModule = playgroundModuleFor(component)
  const hasWireframePlayground = Boolean(
    playgroundModule && Object.keys(playgroundModule.playground.controls).length,
  )

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
            hasWireframePlayground ? (
              <Button
                type="button"
                variant="primary"
                size="small"
                onClick={() => onOpenPlayground(productMode)}
              >
                {t('workbench.openWireframePlayground')}
              </Button>
            ) : undefined
          }
        />
      </div>
      <ComponentFamilyNavigation
        family={family}
        activeId={component.id}
        onSelect={onSelectComponent}
      />
      <ComponentReferencePanel
        importStatement={component.import?.statement ?? ''}
        uses={component.relations.uses}
        usedBy={component.relations.usedBy}
        examplesUse={component.relations.examplesUse}
        usedInExamplesBy={component.relations.usedInExamplesBy}
        diagnostics={component.relations.diagnostics}
        onSelectRelation={(relation) => onSelectComponent(relation.id)}
      />
      <ProductionComponentPlayground
        component={component}
        canvasMode={canvasMode}
        canvasColor={canvasColor}
        onCanvasModeChange={onCanvasModeChange}
        onCanvasColorChange={onCanvasColorChange}
        productMode={productMode}
        productModes={productModes}
        onProductModeChange={onProductModeChange}
        themeVariables={themeVariables}
      />
      <section className="workbench__rail">
        <DiscoveredComponentStories
          component={component}
          canvasMode={canvasMode}
          canvasColor={canvasColor}
          onCanvasModeChange={onCanvasModeChange}
          onCanvasColorChange={onCanvasColorChange}
          productModes={productModes}
          productMode={productMode}
          onProductModeChange={onProductModeChange}
          themeVariables={themeVariables}
        />
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
        <ComponentReferenceFiles files={component.files} />
      </section>
    </div>
  )
}

function ComponentFamilyNavigation({
  family,
  activeId,
  onSelect,
}: {
  family?: ComponentFamily
  activeId: string
  onSelect: (id: string) => void
}) {
  if (!family || family.implementations.length < 2) return null
  return (
    <nav className="component-family-navigation" aria-label={`${family.name} implementations`}>
      <span>{family.name}</span>
      <div>
        {family.implementations.map((implementation) => (
          <Button
            key={implementation.id}
            type="button"
            variant={implementation.id === activeId ? 'primary' : 'ghost'}
            size="small"
            onClick={() => onSelect(implementation.id)}
          >
            {implementation.platform} · {implementation.technology}
          </Button>
        ))}
      </div>
    </nav>
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
  productMode,
  folderPath,
  onSelectEntity,
  layout,
  onLayoutChange,
}: {
  data: Extract<ModuleData, { kind: 'components' }>
  sourceId: string
  productMode: string
  folderPath: string
  onSelectEntity: (id: string) => void
  layout: CatalogLayout
  onLayoutChange: (layout: CatalogLayout) => void
}) {
  const catalogMode = data.modes.includes(productMode) ? productMode : data.defaultMode
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
                        meta={`${component.technology} · ${component.variants.length} variants`}
                        status={component.status}
                        preview={
                          <DiscoveredComponentPreview
                            component={component}
                            sourceId={sourceId}
                            mode={catalogMode}
                            themeVariables={data.themeVariables}
                          />
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
  sourceId,
  family,
  onBack,
  onOpenPlayground,
  onSelectComponent,
}: {
  component: ComponentEntity
  sourceId: string
  family?: ComponentFamily
  onBack: () => void
  onOpenPlayground: (mode?: string) => void
  onSelectComponent: (id: string) => void
}) {
  const { t } = useDesignLabI18n()
  const status = component.status ?? 'wireframe'
  const module = playgroundModuleFor(component)
  const presentation = componentPresentation(component)
  const hasPlaygroundControls = Boolean(module && Object.keys(module.playground.controls).length)
  const isWireframeConcept = component.status === 'wireframe' && Boolean(component.playground)
  const [handoff, setHandoff] = useState<ComponentHandoff | null>(null)
  const [handoffError, setHandoffError] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    setHandoff(null)
    setHandoffError(null)
    if (!component.capabilities.includes('handoff')) return () => undefined
    getComponentHandoff(sourceId, component.id)
      .then((result) => {
        if (!cancelled) setHandoff(result)
      })
      .catch((error: Error) => {
        if (!cancelled) setHandoffError(error.message)
      })
    return () => {
      cancelled = true
    }
  }, [component.id, component.capabilities, sourceId])
  return (
    <div className="workbench">
      <div className="workbench__top">
        <ModuleHeader
          eyebrow={component.directory}
          title={component.name}
          backLabel="Components"
          onBack={onBack}
          meta={`${component.technology} · ${component.platform}`}
          actions={
            hasPlaygroundControls ? (
              <Button type="button" variant="primary" onClick={() => onOpenPlayground()}>
                {t('workbench.openWireframePlayground')}
              </Button>
            ) : (
              <Chip color="warning" variant="soft">
                {status}
              </Chip>
            )
          }
        />
      </div>
      <ComponentFamilyNavigation
        family={family}
        activeId={component.id}
        onSelect={onSelectComponent}
      />
      {presentation.kind === 'external' && (
        <section
          className="component-external-preview"
          aria-label={`${component.name} live preview`}
        >
          <iframe
            src={presentation.url}
            title={`${component.name} live preview`}
            sandbox="allow-forms allow-modals allow-popups allow-scripts"
          />
        </section>
      )}
      <section className="workbench__rail">
        <div className="workbench-section">
          <span>Implementation</span>
          <div className="workbench-markdown">
            <p>
              {isWireframeConcept
                ? 'This Component is intentionally discoverable before a production entry exists. Its typed Playground is the review surface for choosing a direction.'
                : `Design Lab discovered this ${component.technology} implementation through ${component.discovery?.evidence ?? component.adapter}. Richer Workbench tools appear only when its adapter provides them.`}
            </p>
            <p>
              Adapter: <code>{component.adapter}</code>
            </p>
            <div className="component-capability-list" aria-label="Available capabilities">
              {component.capabilities.map((capability) => (
                <Chip key={capability} variant="soft">
                  {capability}
                </Chip>
              ))}
            </div>
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
        {handoff && (
          <div className="workbench-section">
            <span>Developer handoff · {handoff.path}</span>
            <CodeBlock code={handoff.source} language={handoff.language} />
            {handoff.warnings.map((warning) => (
              <p key={warning} className="component-handoff-warning">
                {warning}
              </p>
            ))}
          </div>
        )}
        {handoffError && (
          <div className="workbench-section">
            <span>Developer handoff</span>
            <p className="component-handoff-warning">{handoffError}</p>
          </div>
        )}
        <ComponentReferenceFiles files={component.files} />
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
  canvasMode: CanvasMode
  canvasColor: string
  onCanvasModeChange: (mode: CanvasMode) => void
  onCanvasColorChange: (color: string) => void
  onOpenPlayground: (mode?: string) => void
  onOpenPageReview: () => void
  onNavigateToPage?: (pageId: string) => void
}) {
  const { t } = useDesignLabI18n()
  const [pagesCatalogView, setPagesCatalogView] = useState<'catalog' | 'sitemap'>('catalog')
  const [catalogLayout, setCatalogLayout] = useState<CatalogLayout>('cards')
  const [copiedTokenPath, setCopiedTokenPath] = useState<string | null>(null)
  const copiedTokenTimeout = useRef<number | null>(null)
  const modes = data && 'modes' in data ? data.modes : []
  const defaultMode = data && 'defaultMode' in data ? data.defaultMode : (modes[0] ?? 'default')
  const [previewMode, setPreviewMode] = useState<string>('default')
  useEffect(() => setPreviewMode(defaultMode), [sourceId, defaultMode])
  useEffect(() => {
    if (modes.length && !modes.includes(previewMode)) setPreviewMode(defaultMode)
  }, [defaultMode, modes.join('|'), previewMode])
  useEffect(
    () => () => {
      if (copiedTokenTimeout.current !== null) window.clearTimeout(copiedTokenTimeout.current)
    },
    [],
  )
  const copyTokenPath = async (path: string) => {
    if (!(await copyPlainText(path))) return
    setCopiedTokenPath(path)
    if (copiedTokenTimeout.current !== null) window.clearTimeout(copiedTokenTimeout.current)
    copiedTokenTimeout.current = window.setTimeout(() => setCopiedTokenPath(null), 1600)
  }
  if (loading) return <div className="module-state">{t('status.loading')}</div>
  if (!data) return <div className="module-state">{t('status.unavailable')}</div>
  const modeActions =
    modes.length > 1 ? (
      <TabSwitcher
        ariaLabel="Design-system mode"
        options={modes.map((mode) => ({ value: mode, label: mode }))}
        value={previewMode}
        onChange={setPreviewMode}
        overflow="scroll"
      />
    ) : undefined
  if (data.kind === 'tokens') {
    const prefix = selectedFolderPath === '__all__' ? '' : selectedFolderPath
    const tokens = prefix
      ? data.tokens.filter((token) => {
          const logicalPath = `by-token/${token.path.replaceAll('.', '/')}`
          const filePath = `by-file/${token.file}/${token.path.replaceAll('.', '/')}`
          const navigationPath = prefix.startsWith('by-file/') ? filePath : logicalPath
          return navigationPath === prefix || navigationPath.startsWith(`${prefix}/`)
        })
      : data.tokens
    const title = prefix ? (selectedFolderPath.split('/').at(-1) ?? 'Tokens') : 'Tokens'
    const tokenRows = tokens.map((token) => ({
      id: `${token.id}::${token.file}`,
      path: token.path,
      file: token.file,
      type: token.type,
      value: String(token.values[previewMode] ?? token.value),
      description: token.description,
    }))
    const tokenColumns: TableColumn<(typeof tokenRows)[number]>[] = [
      {
        id: 'path',
        header: 'Token',
        cell: (token) => {
          const copied = copiedTokenPath === token.path
          return (
            <span className="token-table-identity">
              <button
                className={`token-table-copy${copied ? ' is-copied' : ''}`}
                type="button"
                aria-label={`${t(copied ? 'tokens.copied' : 'tokens.copy')}: ${token.path}`}
                title={t(copied ? 'tokens.copied' : 'tokens.copy')}
                onClick={() => void copyTokenPath(token.path)}
              >
                <CopyIcon size={11} aria-hidden="true" />
              </button>
              <code className="token-table-path">{token.path}</code>
            </span>
          )
        },
        sortValue: (token) => token.path,
        width: '28%',
        minWidth: 180,
      },
      {
        id: 'type',
        header: 'Type',
        cell: (token) => <span className="token-table-type">{token.type}</span>,
        sortValue: (token) => token.type,
        width: '12%',
        minWidth: 96,
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
        width: '18%',
        minWidth: 150,
      },
      {
        id: 'file',
        header: 'Stored in',
        cell: (token) => <code className="token-table-source">{token.file}</code>,
        sortValue: (token) => token.file,
        width: '20%',
        minWidth: 160,
      },
      {
        id: 'description',
        header: 'Comment',
        cell: (token) => (
          <span className="token-table-comment" title={token.description ?? undefined}>
            {token.description ?? '—'}
          </span>
        ),
        sortValue: (token) => token.description ?? '',
        width: '22%',
        minWidth: 180,
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
          <>
            <span className="token-table-copy-status" role="status" aria-live="polite">
              {copiedTokenPath ? `${t('tokens.copied')}: ${copiedTokenPath}` : ''}
            </span>
            <Table
              rows={tokenRows}
              columns={tokenColumns}
              getRowId={(token) => token.id}
              ariaLabel="Design tokens"
              striped
              defaultSort={{ columnId: 'path', direction: 'ascending' }}
              selectedRowId={selectedEntityId}
              onRowSelect={(token) => onSelectEntity(token.id)}
            />
          </>
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
    const selectedFamily = selected?.familyId
      ? data.families.find((family) => family.id === selected.familyId)
      : undefined
    const presentation = selected ? componentPresentation(selected) : null
    return selected && presentation?.kind === 'react' ? (
      <ComponentWorkbench
        component={selected}
        family={selectedFamily}
        onBack={onBack}
        onOpenPlayground={onOpenPlayground}
        onSelectComponent={onSelectEntity}
        canvasMode={canvasMode}
        canvasColor={canvasColor}
        onCanvasModeChange={onCanvasModeChange}
        onCanvasColorChange={onCanvasColorChange}
        productMode={previewMode}
        productModes={data.modes}
        onProductModeChange={setPreviewMode}
        themeVariables={data.themeVariables}
      />
    ) : selected && presentation?.kind === 'managed' ? (
      <ManagedComponentWorkbench
        component={selected}
        sourceId={sourceId}
        family={selectedFamily}
        onBack={onBack}
        onOpenPlayground={onOpenPlayground}
        onSelectComponent={onSelectEntity}
        canvasMode={canvasMode}
        canvasColor={canvasColor}
        onCanvasModeChange={onCanvasModeChange}
        onCanvasColorChange={onCanvasColorChange}
        productMode={previewMode}
        productModes={data.modes}
        onProductModeChange={setPreviewMode}
      />
    ) : selected ? (
      <ComponentConceptOverview
        component={selected}
        sourceId={sourceId}
        family={selectedFamily}
        onBack={onBack}
        onOpenPlayground={onOpenPlayground}
        onSelectComponent={onSelectEntity}
      />
    ) : (
      <Catalog
        data={data}
        sourceId={sourceId}
        productMode={previewMode}
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
