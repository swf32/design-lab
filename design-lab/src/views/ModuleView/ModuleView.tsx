import './ModuleView.scss'
import {
  isValidElement,
  useEffect,
  useId,
  useState,
  type ChangeEvent,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import { useDesignLabI18n } from '@design-lab/system/i18n'
import {
  AppSidebar,
  AssetCard,
  Button,
  CanvasBackgroundControl,
  Checkbox,
  Chip,
  CodeBlock,
  ColorCard,
  ColorPicker,
  ComponentCard,
  ComponentReferencePanel,
  ComponentThumbnail,
  ControlField,
  CreateProjectDialog,
  DirectoryPanel,
  IconButton,
  Input,
  ModuleHeader,
  RadioButton,
  SemanticTreeItem,
  SidebarTab,
  Slider,
  SourceSelect,
  TabSwitcher,
  StoryCanvas,
  WireframeCard,
  WorkbenchPlayground,
  type ButtonProps,
  type CanvasMode,
  type DirectorySource,
  type DirectoryTreeItem,
  type InputSize,
  type InputVariant,
  type ModuleId,
  type RadioButtonColor,
  type RadioButtonSize,
  type SliderColor,
  type SliderSize,
  type TabSwitcherSize,
  type TabSwitcherVariant,
  type ChipColor,
  type ChipSize,
  type ChipVariant,
} from '@design-lab/system/components'
import { TokensIcon } from '@design-lab/system/icons'
import type { ModuleData } from '../../api/projects'
import { wireframeRendererFor } from '../../wireframes/registry'
import { designSystemModeStyle } from '../../designSystemMode'

type ComponentEntity = Extract<ModuleData, { kind: 'components' }>['components'][number]

type PreviewModule = Record<string, ComponentType>
const previewModules = import.meta.glob<PreviewModule>(
  '../../../../libraries/*/components/**/*.preview.tsx',
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
const storyModules = import.meta.glob<StoryModule>(
  '../../../../libraries/*/components/**/*.stories.{ts,tsx}',
  { eager: true },
)

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

type FocusedDemoState = {
  sidebarTabActive: boolean
  sidebarTabExpanded: boolean
  appSidebarActive: ModuleId
  appSidebarExpanded: boolean
  cardSelected: boolean
  semanticTreeActive: boolean
  semanticTreeExpanded: boolean
  semanticTreeColoring: boolean
  semanticTreeActions: boolean
  semanticTreeColor: string | null
  directorySearch: boolean
  directoryColoring: boolean
  directoryActions: boolean
  directoryDefaultCollapsed: boolean
}

const directorySource: DirectorySource = {
  id: 'example-system',
  name: 'Example System',
  path: 'projects/example-system',
  available: true,
  kind: 'project',
}
const directoryTree: DirectoryTreeItem[] = [
  { name: 'All', path: '__all__', kind: 'folder', level: 0, virtual: true },
  { name: 'Atoms', path: 'atoms', kind: 'folder', level: 0 },
  { name: 'Actions', path: 'atoms/actions', kind: 'folder', level: 1 },
  { name: 'Button', path: 'atoms/actions/Button', kind: 'component', level: 2, id: 'button' },
  {
    name: 'Icon Button',
    path: 'atoms/actions/IconButton',
    kind: 'component',
    level: 2,
    id: 'icon-button',
  },
  { name: 'Inputs', path: 'atoms/inputs', kind: 'folder', level: 1 },
  { name: 'Input', path: 'atoms/inputs/Input', kind: 'component', level: 2, id: 'input' },
  {
    name: 'Checkbox',
    path: 'atoms/inputs/Checkbox',
    kind: 'component',
    level: 2,
    id: 'checkbox',
  },
  { name: 'Molecules', path: 'molecules', kind: 'folder', level: 0 },
  { name: 'Navigation', path: 'molecules/navigation', kind: 'folder', level: 1 },
  {
    name: 'Breadcrumb',
    path: 'molecules/navigation/Breadcrumb',
    kind: 'component',
    level: 2,
    id: 'breadcrumb',
  },
  { name: 'Organisms', path: 'organisms', kind: 'folder', level: 0 },
  { name: 'Shell', path: 'organisms/shell', kind: 'folder', level: 1 },
  {
    name: 'Application Header',
    path: 'organisms/shell/ApplicationHeader',
    kind: 'component',
    level: 2,
    id: 'application-header',
  },
  { name: 'Experimental', path: 'experimental', kind: 'folder', level: 0 },
  {
    name: 'Inspector Property Row With Exceptionally Long Name',
    path: 'experimental/InspectorPropertyRowWithExceptionallyLongName',
    kind: 'component',
    level: 1,
    id: 'long-name',
  },
]

function DirectoryPanelDemo({
  dense = false,
  searchEnabled = true,
  coloringEnabled = true,
  actionsEnabled = true,
  defaultCollapsed = true,
}: {
  dense?: boolean
  searchEnabled?: boolean
  coloringEnabled?: boolean
  actionsEnabled?: boolean
  defaultCollapsed?: boolean
}) {
  const [selected, setSelected] = useState<string | null>('button')
  const [folder, setFolder] = useState('__all__')
  return (
    <div className="story-directory-panel-frame">
      <DirectoryPanel
        isResizing={false}
        navigationWidth={292}
        minNavigationWidth={188}
        maxNavigationWidth={420}
        onResizeStart={() => {}}
        onResizeKeyDown={() => {}}
        projects={[directorySource]}
        activeProject={directorySource}
        activeModuleLabel="Components"
        tree={dense ? directoryTree : directoryTree.slice(0, 9)}
        treeLoading={false}
        onProjectChange={() => {}}
        onCreateProject={() => {}}
        selectedEntityId={selected}
        selectedFolderPath={folder}
        searchEnabled={searchEnabled}
        coloringEnabled={coloringEnabled}
        actionsEnabled={actionsEnabled}
        defaultCollapsed={defaultCollapsed}
        onTreeItemSelect={(item) => {
          if (item.kind === 'folder') {
            setFolder(item.path)
            setSelected(null)
          } else setSelected(item.id ?? null)
        }}
      />
    </div>
  )
}

const demoSources: DirectorySource[] = [
  directorySource,
  {
    id: 'aurora',
    name: 'Aurora Commerce',
    path: 'projects/aurora-commerce',
    available: true,
    kind: 'project',
  },
  {
    id: 'archive',
    name: 'Archived Brand Kit',
    path: 'libraries/archived-brand-kit',
    available: false,
    kind: 'library',
  },
]

function SourceSelectDemo() {
  const [activeId, setActiveId] = useState(directorySource.id)
  return (
    <div className="story-source-select-frame">
      <SourceSelect
        sources={demoSources}
        activeSource={demoSources.find((source) => source.id === activeId) ?? null}
        onChange={setActiveId}
        onCreateProject={() => {}}
      />
    </div>
  )
}

function ControlFieldDemo() {
  const [name, setName] = useState('Design Lab System')
  return (
    <div className="story-control-fields">
      <ControlField label="Name">
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </ControlField>
      <ControlField label="Mode">
        <select defaultValue="dark">
          <option>dark</option>
          <option>light</option>
        </select>
      </ControlField>
      <ControlField label="Deprecated">
        <Checkbox size="small" aria-label="Deprecated" />
      </ControlField>
    </div>
  )
}

function CheckboxDemo() {
  const [checked, setChecked] = useState(true)
  return (
    <Checkbox
      checked={checked}
      onChange={(event) => setChecked(event.target.checked)}
      label="Include documentation"
      description="Keep README and usage guidance next to the component."
    />
  )
}

function RadioButtonDemo({
  value,
  onChange,
  color = 'accent',
  size = 'medium',
  disabled = false,
}: {
  value: string
  onChange: (value: string) => void
  color?: RadioButtonColor
  size?: RadioButtonSize
  disabled?: boolean
}) {
  const generatedName = useId()
  const groupName = `release-channel-${generatedName.replace(/:/g, '')}`

  return (
    <div className="story-radio-group" role="radiogroup" aria-label="Release channel">
      {[
        ['stable', 'Stable', 'Recommended for production projects.'],
        ['preview', 'Preview', 'Receive features before the stable channel.'],
        ['canary', 'Canary', 'Early changes may be incomplete.'],
      ].map(([option, label, description]) => (
        <RadioButton
          key={option}
          name={groupName}
          value={option}
          label={label}
          description={description}
          color={color}
          size={size}
          disabled={disabled && option === 'canary'}
          checked={value === option}
          onChange={() => onChange(option)}
        />
      ))}
    </div>
  )
}

function SliderDemo({
  value,
  onChange,
  color = 'accent',
  size = 'medium',
  disabled = false,
  showValue = true,
}: {
  value: number
  onChange: (value: number) => void
  color?: SliderColor
  size?: SliderSize
  disabled?: boolean
  showValue?: boolean
}) {
  return (
    <Slider
      label="Volume"
      value={value}
      onValueChange={onChange}
      color={color}
      size={size}
      disabled={disabled}
      showValue={showValue}
    />
  )
}

function WorkbenchPlaygroundDemo() {
  const [mode, setMode] = useState<CanvasMode>('dark-grid')
  const [color, setColor] = useState('#264653')
  return (
    <div className="story-workbench-playground-frame">
      <WorkbenchPlayground
        mode={mode}
        color={color}
        onModeChange={setMode}
        onColorChange={setColor}
        controls={
          <aside className="workbench-controls">
            <h2>Props</h2>
            <ControlField label="Full width">
              <Checkbox size="small" aria-label="Full width" defaultChecked />
            </ControlField>
          </aside>
        }
      >
        <Button variant="primary" fullWidth>
          Full-width specimen
        </Button>
      </WorkbenchPlayground>
    </div>
  )
}

function StoryCanvasDemo() {
  return (
    <div className="story-story-canvas-frame">
      <StoryCanvas
        title="Selection states"
        description="A focused scenario rendered by the production Story Canvas."
        meta="state"
      >
        <div className="story-comparison">
          <Button>Default</Button>
          <Button variant="primary">Selected</Button>
        </div>
      </StoryCanvas>
    </div>
  )
}

function CreateProjectDialogDemo({
  busy = false,
  error = null,
  canClose = true,
  initialOpen = true,
}: {
  busy?: boolean
  error?: string | null
  canClose?: boolean
  initialOpen?: boolean
}) {
  const [open, setOpen] = useState(initialOpen)
  return (
    <div className="story-dialog-frame">
      {!open && (
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Open dialog
        </Button>
      )}
      <CreateProjectDialog
        open={open}
        busy={busy}
        error={error}
        canClose={canClose}
        onClose={() => setOpen(false)}
        onCreate={async () => {}}
      />
    </div>
  )
}

function TabSwitcherDemo({
  variant = 'segmented',
  size = 'medium',
  disabledLast = false,
}: {
  variant?: TabSwitcherVariant
  size?: TabSwitcherSize
  disabledLast?: boolean
}) {
  const [value, setValue] = useState<'dark' | 'light'>('dark')
  return (
    <TabSwitcher
      ariaLabel="Example mode"
      variant={variant}
      size={size}
      value={value}
      onChange={setValue}
      options={[
        { value: 'dark', label: variant === 'toggle' ? '◐' : 'Dark', accessibleLabel: 'Dark' },
        {
          value: 'light',
          label: variant === 'toggle' ? '☼' : 'Light',
          accessibleLabel: 'Light',
          disabled: disabledLast,
        },
      ]}
    />
  )
}

function realComponent(
  component: ComponentEntity,
  button: ButtonProps,
  focused: FocusedDemoState,
  setFocused: (next: FocusedDemoState) => void,
  canvasMode: CanvasMode,
  canvasColor: string,
  onCanvasModeChange: (mode: CanvasMode) => void,
  onCanvasColorChange: (color: string) => void,
  inputDemo?: ReactNode,
  customDemo?: ReactNode,
) {
  if (customDemo) return customDemo
  if (component.id === 'button') return <Button {...button} />
  if (component.id === 'asset-card')
    return (
      <div className="workbench-asset-card-frame">
        <AssetCard
          name="PaletteIcon.tsx"
          path="icons/PaletteIcon.tsx"
          kind="icon"
          extension="tsx"
          previewUrl="/api/sources/design-lab-system/asset-previews/icons/PaletteIcon.tsx"
        />
      </div>
    )
  if (component.id === 'checkbox') return <CheckboxDemo />
  if (component.id === 'radio-button') return <RadioButtonDemo value="stable" onChange={() => {}} />
  if (component.id === 'slider') return <Slider label="Volume" defaultValue={52} />
  if (component.id === 'chip')
    return (
      <Chip color="success" variant="soft">
        Ready
      </Chip>
    )
  if (component.id === 'input')
    return inputDemo ?? <Input label="Component name" placeholder="Button" />
  if (component.id === 'icon-button') return <IconButton aria-label="Add">＋</IconButton>
  if (component.id === 'color-card') return <ColorCard name="accent.primary" value="#26d9c7" />
  if (component.id === 'control-field') return <ControlFieldDemo />
  if (component.id === 'semantic-tree-item')
    return (
      <div className="story-tree-row-frame" role="tree">
        <SemanticTreeItem
          node={{
            name: 'Molecules',
            path: 'molecules/workbench',
            kind: 'folder',
            level: 1,
            id: 'molecules',
          }}
          active={focused.semanticTreeActive}
          expanded={focused.semanticTreeExpanded}
          color={focused.semanticTreeColor}
          coloringEnabled={focused.semanticTreeColoring}
          actionsEnabled={focused.semanticTreeActions}
          onColorChange={(color) => setFocused({ ...focused, semanticTreeColor: color })}
          onSelect={() =>
            setFocused({ ...focused, semanticTreeExpanded: !focused.semanticTreeExpanded })
          }
        />
      </div>
    )
  if (component.id === 'component-card')
    return (
      <div className="workbench-card-frame">
        <ComponentCard
          name="Button"
          entry="Button.tsx"
          meta="4 variants"
          selected={focused.cardSelected}
          preview={<ComponentThumbnail kind="button" />}
          onClick={() => setFocused({ ...focused, cardSelected: !focused.cardSelected })}
        />
      </div>
    )
  if (component.id === 'component-thumbnail') return <ComponentThumbnail kind="sidebar-tab" />
  if (component.id === 'module-header')
    return (
      <div className="workbench-header-frame">
        <ModuleHeader eyebrow="Live inventory" title="Components" count={17} />
      </div>
    )
  if (component.id === 'source-select') return <SourceSelectDemo />
  if (component.id === 'story-canvas') return <StoryCanvasDemo />
  if (component.id === 'canvas-background-control')
    return (
      <CanvasBackgroundControl
        mode={canvasMode}
        color={canvasColor}
        onModeChange={onCanvasModeChange}
        onColorChange={onCanvasColorChange}
      />
    )
  if (component.id === 'code-block')
    return (
      <div className="workbench-code-frame">
        <CodeBlock language="tsx" code={'const mode = "dark"\nsetTheme(mode)'} />
      </div>
    )
  if (component.id === 'tab-switcher') return <TabSwitcherDemo />
  if (component.id === 'sidebar-tab')
    return (
      <div
        className={`workbench-sidebar-tab-frame${focused.sidebarTabExpanded ? ' is-expanded' : ''}`}
      >
        <SidebarTab
          icon={TokensIcon}
          label="Tokens"
          active={focused.sidebarTabActive}
          expanded={focused.sidebarTabExpanded}
          onClick={() => setFocused({ ...focused, sidebarTabActive: !focused.sidebarTabActive })}
        />
      </div>
    )
  if (component.id === 'app-sidebar')
    return (
      <div className="workbench-sidebar-frame">
        <AppSidebar
          active={focused.appSidebarActive}
          expanded={focused.appSidebarExpanded}
          onChange={(active) => setFocused({ ...focused, appSidebarActive: active })}
        />
      </div>
    )
  if (component.id === 'color-picker')
    return (
      <ColorPicker
        label="Component icon color"
        value={focused.semanticTreeColor}
        onChange={(color) => setFocused({ ...focused, semanticTreeColor: color })}
      />
    )
  if (component.id === 'directory-panel')
    return (
      <DirectoryPanelDemo
        dense
        searchEnabled={focused.directorySearch}
        coloringEnabled={focused.directoryColoring}
        actionsEnabled={focused.directoryActions}
        defaultCollapsed={focused.directoryDefaultCollapsed}
      />
    )
  if (component.id === 'create-project-dialog')
    return <CreateProjectDialogDemo initialOpen={false} />
  if (component.id === 'workbench-playground') return <WorkbenchPlaygroundDemo />
  return (
    <span className="workbench-placeholder">
      {component.name}
      <small>Real playground controls are not defined yet.</small>
    </span>
  )
}

function ButtonControls({
  value,
  onChange,
}: {
  value: ButtonProps
  onChange: (next: ButtonProps) => void
}) {
  return (
    <div className="workbench-controls">
      <h2>Props</h2>
      <ControlField label="Label">
        <input
          value={String(value.children)}
          onChange={(event) => onChange({ ...value, children: event.target.value })}
        />
      </ControlField>
      <ControlField label="Variant">
        <select
          value={value.variant}
          onChange={(event) =>
            onChange({ ...value, variant: event.target.value as ButtonProps['variant'] })
          }
        >
          <option>primary</option>
          <option>secondary</option>
          <option>ghost</option>
          <option>danger</option>
        </select>
      </ControlField>
      <ControlField label="Size">
        <select
          value={value.size}
          onChange={(event) =>
            onChange({ ...value, size: event.target.value as ButtonProps['size'] })
          }
        >
          <option>small</option>
          <option>medium</option>
          <option>large</option>
        </select>
      </ControlField>
      {(['disabled', 'loading', 'fullWidth'] as const).map((key) => (
        <ControlField key={key} label={key}>
          <Checkbox
            size="small"
            aria-label={key}
            checked={Boolean(value[key])}
            onChange={(event) => onChange({ ...value, [key]: event.target.checked })}
          />
        </ControlField>
      ))}
      <ControlField label="Leading slot">
        <Checkbox
          size="small"
          aria-label="Leading slot"
          checked={Boolean(value.leading)}
          onChange={(event) =>
            onChange({ ...value, leading: event.target.checked ? '←' : undefined })
          }
        />
      </ControlField>
      <ControlField label="Trailing slot">
        <Checkbox
          size="small"
          aria-label="Trailing slot"
          checked={Boolean(value.trailing)}
          onChange={(event) =>
            onChange({ ...value, trailing: event.target.checked ? '→' : undefined })
          }
        />
      </ControlField>
    </div>
  )
}

type InputWorkbenchState = {
  label: string
  value: string
  placeholder: string
  variant: InputVariant
  size: InputSize
  helperText: string
  errorMessage: string
  disabled: boolean
  readOnly: boolean
  fullWidth: boolean
  showCount: boolean
}

function InputControls({
  value,
  onChange,
}: {
  value: InputWorkbenchState
  onChange: (next: InputWorkbenchState) => void
}) {
  return (
    <div className="workbench-controls">
      <h2>Props</h2>
      <ControlField label="Label">
        <input
          value={value.label}
          onChange={(event) => onChange({ ...value, label: event.target.value })}
        />
      </ControlField>
      <ControlField label="Value">
        <input
          value={value.value}
          onChange={(event) => onChange({ ...value, value: event.target.value })}
        />
      </ControlField>
      <ControlField label="Variant">
        <select
          value={value.variant}
          onChange={(event) => onChange({ ...value, variant: event.target.value as InputVariant })}
        >
          <option>text</option>
          <option>search</option>
          <option>textarea</option>
        </select>
      </ControlField>
      <ControlField label="Size">
        <select
          value={value.size}
          onChange={(event) => onChange({ ...value, size: event.target.value as InputSize })}
        >
          <option>small</option>
          <option>medium</option>
          <option>large</option>
        </select>
      </ControlField>
      <ControlField label="Helper text">
        <input
          value={value.helperText}
          onChange={(event) => onChange({ ...value, helperText: event.target.value })}
        />
      </ControlField>
      <ControlField label="Error message">
        <input
          value={value.errorMessage}
          onChange={(event) => onChange({ ...value, errorMessage: event.target.value })}
        />
      </ControlField>
      {(['disabled', 'readOnly', 'fullWidth', 'showCount'] as const).map((key) => (
        <ControlField key={key} label={key}>
          <Checkbox
            size="small"
            aria-label={key}
            checked={value[key]}
            onChange={(event) => onChange({ ...value, [key]: event.target.checked })}
          />
        </ControlField>
      ))}
    </div>
  )
}

function InputWorkbenchDemo({
  value,
  onChange,
}: {
  value: InputWorkbenchState
  onChange: (next: InputWorkbenchState) => void
}) {
  const shared = {
    label: value.label,
    value: value.value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...value, value: event.target.value }),
    placeholder: value.placeholder,
    size: value.size,
    helperText: value.helperText || undefined,
    errorMessage: value.errorMessage || undefined,
    disabled: value.disabled,
    readOnly: value.readOnly,
    fullWidth: value.fullWidth,
    showCount: value.showCount,
    maxLength: value.showCount ? 80 : undefined,
  }
  return value.variant === 'textarea' ? (
    <Input {...shared} variant="textarea" />
  ) : (
    <Input {...shared} variant={value.variant} />
  )
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
  const [buttonProps, setButtonProps] = useState<ButtonProps>({
    variant: 'primary',
    size: 'medium',
    children: 'Create project',
  })
  const [inputProps, setInputProps] = useState<InputWorkbenchState>({
    label: 'Component name',
    value: 'Input',
    placeholder: 'Enter a component name',
    variant: 'text',
    size: 'medium',
    helperText: 'Used for the component folder and catalog label.',
    errorMessage: '',
    disabled: false,
    readOnly: false,
    fullWidth: false,
    showCount: false,
  })
  const [clicks, setClicks] = useState(0)
  const [tabSwitcherVariant, setTabSwitcherVariant] = useState<TabSwitcherVariant>('segmented')
  const [tabSwitcherSize, setTabSwitcherSize] = useState<TabSwitcherSize>('medium')
  const [radioValue, setRadioValue] = useState('stable')
  const [radioColor, setRadioColor] = useState<RadioButtonColor>('accent')
  const [radioSize, setRadioSize] = useState<RadioButtonSize>('medium')
  const [radioDisabled, setRadioDisabled] = useState(false)
  const [sliderValue, setSliderValue] = useState(52)
  const [sliderColor, setSliderColor] = useState<SliderColor>('accent')
  const [sliderSize, setSliderSize] = useState<SliderSize>('medium')
  const [sliderDisabled, setSliderDisabled] = useState(false)
  const [sliderShowValue, setSliderShowValue] = useState(true)
  const [chipColor, setChipColor] = useState<ChipColor>('success')
  const [chipVariant, setChipVariant] = useState<ChipVariant>('soft')
  const [chipSize, setChipSize] = useState<ChipSize>('medium')
  const [chipDisabled, setChipDisabled] = useState(false)
  const [focused, setFocused] = useState<FocusedDemoState>({
    sidebarTabActive: true,
    sidebarTabExpanded: false,
    appSidebarActive: 'components',
    appSidebarExpanded: false,
    cardSelected: false,
    semanticTreeActive: true,
    semanticTreeExpanded: false,
    semanticTreeColoring: true,
    semanticTreeActions: true,
    semanticTreeColor: '#8b5cf6',
    directorySearch: true,
    directoryColoring: true,
    directoryActions: true,
    directoryDefaultCollapsed: true,
  })
  const canvasStyle = { '--canvas-solid': canvasColor } as CSSProperties
  const liveButtonProps =
    component.id === 'button'
      ? { ...buttonProps, onClick: () => setClicks((value) => value + 1) }
      : buttonProps
  const inputDemo = <InputWorkbenchDemo value={inputProps} onChange={setInputProps} />
  const customDemo =
    component.id === 'radio-button' ? (
      <RadioButtonDemo
        value={radioValue}
        onChange={setRadioValue}
        color={radioColor}
        size={radioSize}
        disabled={radioDisabled}
      />
    ) : component.id === 'slider' ? (
      <SliderDemo
        value={sliderValue}
        onChange={setSliderValue}
        color={sliderColor}
        size={sliderSize}
        disabled={sliderDisabled}
        showValue={sliderShowValue}
      />
    ) : component.id === 'chip' ? (
      <Chip color={chipColor} variant={chipVariant} size={chipSize} disabled={chipDisabled}>
        Ready
      </Chip>
    ) : undefined
  const focusedControls =
    component.id === 'radio-button' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <ControlField label="Color">
          <select
            value={radioColor}
            onChange={(event) => setRadioColor(event.target.value as RadioButtonColor)}
          >
            <option>default</option>
            <option>accent</option>
            <option>success</option>
            <option>warning</option>
            <option>danger</option>
          </select>
        </ControlField>
        <ControlField label="Size">
          <select
            value={radioSize}
            onChange={(event) => setRadioSize(event.target.value as RadioButtonSize)}
          >
            <option>small</option>
            <option>medium</option>
            <option>large</option>
          </select>
        </ControlField>
        <ControlField label="Disabled">
          <Checkbox
            size="small"
            aria-label="Disabled"
            checked={radioDisabled}
            onChange={(event) => setRadioDisabled(event.target.checked)}
          />
        </ControlField>
      </aside>
    ) : component.id === 'slider' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <ControlField label="Value">
          <input
            type="number"
            min={0}
            max={100}
            value={sliderValue}
            onChange={(event) => setSliderValue(Number(event.target.value))}
          />
        </ControlField>
        <ControlField label="Color">
          <select
            value={sliderColor}
            onChange={(event) => setSliderColor(event.target.value as SliderColor)}
          >
            <option>default</option>
            <option>accent</option>
            <option>success</option>
            <option>warning</option>
            <option>danger</option>
          </select>
        </ControlField>
        <ControlField label="Size">
          <select
            value={sliderSize}
            onChange={(event) => setSliderSize(event.target.value as SliderSize)}
          >
            <option>small</option>
            <option>medium</option>
            <option>large</option>
          </select>
        </ControlField>
        <ControlField label="Show value">
          <Checkbox
            size="small"
            aria-label="Show value"
            checked={sliderShowValue}
            onChange={(event) => setSliderShowValue(event.target.checked)}
          />
        </ControlField>
        <ControlField label="Disabled">
          <Checkbox
            size="small"
            aria-label="Disabled"
            checked={sliderDisabled}
            onChange={(event) => setSliderDisabled(event.target.checked)}
          />
        </ControlField>
      </aside>
    ) : component.id === 'chip' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <ControlField label="Color">
          <select
            value={chipColor}
            onChange={(event) => setChipColor(event.target.value as ChipColor)}
          >
            <option>default</option>
            <option>accent</option>
            <option>success</option>
            <option>warning</option>
            <option>danger</option>
          </select>
        </ControlField>
        <ControlField label="Variant">
          <select
            value={chipVariant}
            onChange={(event) => setChipVariant(event.target.value as ChipVariant)}
          >
            <option>primary</option>
            <option>secondary</option>
            <option>tertiary</option>
            <option>soft</option>
          </select>
        </ControlField>
        <ControlField label="Size">
          <select
            value={chipSize}
            onChange={(event) => setChipSize(event.target.value as ChipSize)}
          >
            <option>small</option>
            <option>medium</option>
            <option>large</option>
          </select>
        </ControlField>
        <ControlField label="Disabled">
          <Checkbox
            size="small"
            aria-label="Disabled"
            checked={chipDisabled}
            onChange={(event) => setChipDisabled(event.target.checked)}
          />
        </ControlField>
      </aside>
    ) : component.id === 'sidebar-tab' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <ControlField label="Active">
          <Checkbox
            size="small"
            aria-label="Active"
            checked={focused.sidebarTabActive}
            onChange={(event) => setFocused({ ...focused, sidebarTabActive: event.target.checked })}
          />
        </ControlField>
        <ControlField label="Expanded context">
          <Checkbox
            size="small"
            aria-label="Expanded context"
            checked={focused.sidebarTabExpanded}
            onChange={(event) =>
              setFocused({ ...focused, sidebarTabExpanded: event.target.checked })
            }
          />
        </ControlField>
      </aside>
    ) : component.id === 'app-sidebar' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <ControlField label="Expanded">
          <Checkbox
            size="small"
            aria-label="Expanded"
            checked={focused.appSidebarExpanded}
            onChange={(event) =>
              setFocused({ ...focused, appSidebarExpanded: event.target.checked })
            }
          />
        </ControlField>
        <ControlField label="Active module">
          <select
            value={focused.appSidebarActive}
            onChange={(event) =>
              setFocused({ ...focused, appSidebarActive: event.target.value as ModuleId })
            }
          >
            <option value="components">components</option>
            <option value="palette">palette</option>
            <option value="tokens">tokens</option>
          </select>
        </ControlField>
      </aside>
    ) : component.id === 'component-card' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <ControlField label="Selected">
          <Checkbox
            size="small"
            aria-label="Selected"
            checked={focused.cardSelected}
            onChange={(event) => setFocused({ ...focused, cardSelected: event.target.checked })}
          />
        </ControlField>
      </aside>
    ) : component.id === 'checkbox' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <p>
          Toggle the production Checkbox. Stories compare sizes, native states, and complete label
          composition.
        </p>
      </aside>
    ) : component.id === 'asset-card' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <p>
          The card presents a discovered filesystem entity. Image stories may receive a safe local
          preview URL.
        </p>
      </aside>
    ) : component.id === 'workbench-playground' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <p>
          This page is itself rendered inside the production Workbench Playground; the specimen
          demonstrates nested composition and safe width.
        </p>
      </aside>
    ) : component.id === 'color-card' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <p>The playground uses a semantic token name and resolved color value.</p>
      </aside>
    ) : component.id === 'canvas-background-control' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <p>
          Use the production control directly on the Canvas. Its changes update the shared Workbench
          background.
        </p>
      </aside>
    ) : component.id === 'directory-panel' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        {(
          [
            ['Search', 'directorySearch'],
            ['Icon coloring', 'directoryColoring'],
            ['Item actions', 'directoryActions'],
            ['Default collapsed', 'directoryDefaultCollapsed'],
          ] as const
        ).map(([label, key]) => (
          <ControlField key={key} label={label}>
            <Checkbox
              size="small"
              aria-label={label}
              checked={focused[key]}
              onChange={(event) => setFocused({ ...focused, [key]: event.target.checked })}
            />
          </ControlField>
        ))}
      </aside>
    ) : component.id === 'icon-button' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <p>
          The Playground uses a native button action with an accessible name and a compact icon
          slot.
        </p>
      </aside>
    ) : component.id === 'control-field' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <p>
          Edit the production text, select, and boolean controls to verify their shared label
          contract.
        </p>
      </aside>
    ) : component.id === 'semantic-tree-item' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        {(
          [
            ['Active', 'semanticTreeActive'],
            ['Expanded', 'semanticTreeExpanded'],
            ['Icon coloring', 'semanticTreeColoring'],
            ['Item actions', 'semanticTreeActions'],
          ] as const
        ).map(([label, key]) => (
          <ControlField key={key} label={label}>
            <Checkbox
              size="small"
              aria-label={label}
              checked={focused[key]}
              onChange={(event) => setFocused({ ...focused, [key]: event.target.checked })}
            />
          </ControlField>
        ))}
      </aside>
    ) : component.id === 'color-picker' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <p>
          Open the production picker, change the spectrum or HEX value, choose a preset, and reset
          the semantic override.
        </p>
      </aside>
    ) : component.id === 'component-thumbnail' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <p>
          The Playground shows an authored kind silhouette; stories compare known kinds and the
          generic fallback.
        </p>
      </aside>
    ) : component.id === 'module-header' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <p>The current specimen uses the module-summary composition with a real count.</p>
      </aside>
    ) : component.id === 'source-select' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <p>Open the menu and switch between realistic Library and Project sources.</p>
      </aside>
    ) : component.id === 'story-canvas' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <p>The Playground renders a production Story Canvas with real Button specimens.</p>
      </aside>
    ) : component.id === 'create-project-dialog' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <p>
          Open the dialog, enter a project name, submit, dismiss, and inspect the focused state.
        </p>
      </aside>
    ) : component.id === 'tab-switcher' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <ControlField label="Variant">
          <select
            value={tabSwitcherVariant}
            onChange={(event) => setTabSwitcherVariant(event.target.value as TabSwitcherVariant)}
          >
            <option>segmented</option>
            <option>toggle</option>
          </select>
        </ControlField>
        <ControlField label="Size">
          <select
            value={tabSwitcherSize}
            onChange={(event) => setTabSwitcherSize(event.target.value as TabSwitcherSize)}
          >
            <option>small</option>
            <option>medium</option>
          </select>
        </ControlField>
      </aside>
    ) : component.id === 'code-block' ? (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <p>
          The Markdown renderer supplies fenced source, language, and the copy action to this
          production component.
        </p>
      </aside>
    ) : (
      <aside className="workbench-controls">
        <h2>{t('workbench.props')}</h2>
        <p>{t('workbench.controlsMissing')}</p>
      </aside>
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
        controls={
          component.id === 'button' ? (
            <ButtonControls value={buttonProps} onChange={setButtonProps} />
          ) : component.id === 'input' ? (
            <InputControls value={inputProps} onChange={setInputProps} />
          ) : (
            focusedControls
          )
        }
        eventLog={component.id === 'button' ? `onClick · ${clicks}` : undefined}
      >
        {component.id === 'tab-switcher' ? (
          <TabSwitcherDemo variant={tabSwitcherVariant} size={tabSwitcherSize} />
        ) : (
          realComponent(
            component,
            liveButtonProps,
            focused,
            setFocused,
            canvasMode,
            canvasColor,
            onCanvasModeChange,
            onCanvasColorChange,
            inputDemo,
            customDemo,
          )
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
