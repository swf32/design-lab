import { isValidElement, useEffect, useState, type ChangeEvent, type ComponentType, type CSSProperties, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import { useDesignLabI18n } from '@design-lab/system/i18n'
import {
  AppSidebar,
  AssetCard,
  Button,
  CanvasBackgroundControl,
  Checkbox,
  CodeBlock,
  ColorCard,
  ColorPicker,
  ComponentCard,
  ComponentThumbnail,
  ControlField,
  CreateProjectDialog,
  DirectoryPanel,
  IconButton,
  Input,
  ModuleHeader,
  SemanticTreeItem,
  SidebarTab,
  SourceSelect,
  TabSwitcher,
  StoryCanvas,
  WorkbenchPlayground,
  type ButtonProps,
  type CanvasMode,
  type DirectorySource,
  type DirectoryTreeItem,
  type InputSize,
  type InputVariant,
  type ModuleId,
  type TabSwitcherSize,
  type TabSwitcherVariant,
} from '@design-lab/system/components'
import { TokensIcon } from '@design-lab/system/icons'
import type { ModuleData } from '../../api/projects'

type ComponentEntity = Extract<ModuleData, {kind:'components'}>['components'][number]

type PreviewModule=Record<string,ComponentType>
const systemPreviewModules=import.meta.glob<PreviewModule>('../../../../libraries/design-lab-system/components/**/*.preview.tsx',{eager:true})

function DiscoveredComponentPreview({component,sourceId}:{component:ComponentEntity;sourceId:string}){
  if ((component.sourceId??sourceId)==='design-lab-system'&&component.preview){
    const suffix=`/components/${component.directory}/${component.preview}`
    const module=Object.entries(systemPreviewModules).find(([path])=>path.endsWith(suffix))?.[1]
    const Preview=module&&Object.values(module).find((value)=>typeof value==='function')
    if (Preview) return <Preview/>
  }
  return <ComponentThumbnail kind={component.id}/>
}

const markdownComponents: Components = {
  pre({children}) {
    if (!isValidElement<{className?:string;children?:ReactNode}>(children)) return <pre>{children}</pre>
    const language=children.props.className?.match(/language-([^\s]+)/)?.[1]??'text'
    const code=String(children.props.children??'').replace(/\n$/,'')
    return <CodeBlock code={code} language={language}/>
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

const directorySource:DirectorySource={id:'design-lab-system',name:'Design Lab System',path:'libraries/design-lab-system',available:true,kind:'library'}
const directoryTree:DirectoryTreeItem[]=[
  {name:'All',path:'__all__',kind:'folder',level:0,virtual:true},
  {name:'Components',path:'components',kind:'folder',level:0},
  {name:'Atoms',path:'components/atoms',kind:'folder',level:1},
  {name:'Button',path:'components/atoms/Button',kind:'component',level:2,id:'button'},
  {name:'Checkbox',path:'components/atoms/Checkbox',kind:'component',level:2,id:'checkbox'},
  {name:'Color Card',path:'components/atoms/ColorCard',kind:'component',level:2,id:'color-card'},
  {name:'Control Field',path:'components/atoms/ControlField',kind:'component',level:2,id:'control-field'},
  {name:'Icon Button',path:'components/atoms/IconButton',kind:'component',level:2,id:'icon-button'},
  {name:'Input',path:'components/atoms/Input',kind:'component',level:2,id:'input'},
  {name:'Semantic Tree Item',path:'components/atoms/SemanticTreeItem',kind:'component',level:2,id:'semantic-tree-item'},
  {name:'Sidebar Tab',path:'components/atoms/SidebarTab',kind:'component',level:2,id:'sidebar-tab'},
  {name:'Molecules',path:'components/molecules',kind:'folder',level:1},
  {name:'Canvas Background Control',path:'components/molecules/CanvasBackgroundControl',kind:'component',level:2,id:'canvas-background-control'},
  {name:'Asset Card',path:'components/molecules/AssetCard',kind:'component',level:2,id:'asset-card'},
  {name:'Code Block',path:'components/molecules/CodeBlock',kind:'component',level:2,id:'code-block'},
  {name:'Color Picker',path:'components/molecules/ColorPicker',kind:'component',level:2,id:'color-picker'},
  {name:'Component Card',path:'components/molecules/ComponentCard',kind:'component',level:2,id:'component-card'},
  {name:'Component Thumbnail',path:'components/molecules/ComponentThumbnail',kind:'component',level:2,id:'component-thumbnail'},
  {name:'Module Header',path:'components/molecules/ModuleHeader',kind:'component',level:2,id:'module-header'},
  {name:'Source Select',path:'components/molecules/SourceSelect',kind:'component',level:2,id:'source-select'},
  {name:'Story Canvas',path:'components/molecules/StoryCanvas',kind:'component',level:2,id:'story-canvas'},
  {name:'Tab Switcher',path:'components/molecules/TabSwitcher',kind:'component',level:2,id:'tab-switcher'},
  {name:'Organisms',path:'components/organisms',kind:'folder',level:1},
  {name:'Application Sidebar',path:'components/organisms/AppSidebar',kind:'component',level:2,id:'app-sidebar'},
  {name:'Create Project Dialog',path:'components/organisms/CreateProjectDialog',kind:'component',level:2,id:'create-project-dialog'},
  {name:'Directory Panel',path:'components/organisms/DirectoryPanel',kind:'component',level:2,id:'directory-panel'},
  {name:'Experimental',path:'components/experimental',kind:'folder',level:1},
  {name:'Inspector Property Row With Exceptionally Long Name',path:'components/experimental/InspectorPropertyRowWithExceptionallyLongName',kind:'component',level:2,id:'long-name'},
  {name:'Nested navigation',path:'components/experimental/navigation',kind:'folder',level:2},
  {name:'Layer visibility controller',path:'components/experimental/navigation/LayerVisibilityController',kind:'component',level:3,id:'layer-visibility'},
]

function DirectoryPanelDemo({dense=false,searchEnabled=true,coloringEnabled=true,actionsEnabled=true,defaultCollapsed=true}:{dense?:boolean;searchEnabled?:boolean;coloringEnabled?:boolean;actionsEnabled?:boolean;defaultCollapsed?:boolean}){
  const [selected,setSelected]=useState<string|null>('button')
  const [folder,setFolder]=useState('__all__')
  return <div className="story-directory-panel-frame"><DirectoryPanel isResizing={false} navigationWidth={292} minNavigationWidth={188} maxNavigationWidth={420} onResizeStart={()=>{}} onResizeKeyDown={()=>{}} projects={[directorySource]} activeProject={directorySource} activeModuleLabel="Components" tree={dense?directoryTree:directoryTree.slice(0,9)} treeLoading={false} onProjectChange={()=>{}} onCreateProject={()=>{}} selectedEntityId={selected} selectedFolderPath={folder} searchEnabled={searchEnabled} coloringEnabled={coloringEnabled} actionsEnabled={actionsEnabled} defaultCollapsed={defaultCollapsed} onTreeItemSelect={(item)=>{if(item.kind==='folder'){setFolder(item.path);setSelected(null)}else setSelected(item.id??null)}}/></div>
}

const demoSources:DirectorySource[]=[directorySource,{id:'aurora',name:'Aurora Commerce',path:'projects/aurora-commerce',available:true,kind:'project'},{id:'archive',name:'Archived Brand Kit',path:'libraries/archived-brand-kit',available:false,kind:'library'}]

function SourceSelectDemo(){
  const [activeId,setActiveId]=useState(directorySource.id)
  return <div className="story-source-select-frame"><SourceSelect sources={demoSources} activeSource={demoSources.find((source)=>source.id===activeId)??null} onChange={setActiveId} onCreateProject={()=>{}}/></div>
}

function SemanticTreeItemDemo({kind='component',active=false,level=1,coloringEnabled=true,actionsEnabled=true,color:initialColor=null}:{kind?:DirectoryTreeItem['kind'];active?:boolean;level?:number;coloringEnabled?:boolean;actionsEnabled?:boolean;color?:string|null}){
  const [selected,setSelected]=useState(active)
  const [expanded,setExpanded]=useState(true)
  const [color,setColor]=useState<string|null>(initialColor)
  const node:DirectoryTreeItem={name:kind==='folder'?'Molecules':kind==='token'?'color.accent.primary':kind==='asset'?'PaletteIcon.tsx':kind==='file'?'README.md':'Canvas Background Control',path:`demo/${kind}`,kind,level,id:`demo-${kind}`}
  return <div className="story-tree-row-frame" role="tree"><SemanticTreeItem node={node} active={selected} expanded={expanded} color={color} coloringEnabled={coloringEnabled} actionsEnabled={actionsEnabled} onColorChange={setColor} onSelect={()=>{if(kind==='folder')setExpanded((value)=>!value);else setSelected((value)=>!value)}}/></div>
}

function ControlFieldDemo(){
  const [name,setName]=useState('Design Lab System')
  return <div className="story-control-fields"><ControlField label="Name"><input value={name} onChange={(event)=>setName(event.target.value)}/></ControlField><ControlField label="Mode"><select defaultValue="dark"><option>dark</option><option>light</option></select></ControlField><ControlField label="Deprecated"><Checkbox size="small" aria-label="Deprecated"/></ControlField></div>
}

function CheckboxDemo(){
  const [checked,setChecked]=useState(true)
  return <Checkbox checked={checked} onChange={(event)=>setChecked(event.target.checked)} label="Include documentation" description="Keep README and usage guidance next to the component."/>
}

function WorkbenchPlaygroundDemo(){
  const [mode,setMode]=useState<CanvasMode>('dark-grid')
  const [color,setColor]=useState('#264653')
  return <div className="story-workbench-playground-frame"><WorkbenchPlayground mode={mode} color={color} onModeChange={setMode} onColorChange={setColor} controls={<aside className="workbench-controls"><h2>Props</h2><ControlField label="Full width"><Checkbox size="small" aria-label="Full width" defaultChecked/></ControlField></aside>}><Button variant="primary" fullWidth>Full-width specimen</Button></WorkbenchPlayground></div>
}

function StoryCanvasDemo(){return <div className="story-story-canvas-frame"><StoryCanvas title="Selection states" description="A focused scenario rendered by the production Story Canvas." meta="state"><div className="story-comparison"><Button>Default</Button><Button variant="primary">Selected</Button></div></StoryCanvas></div>}

function CreateProjectDialogDemo({busy=false,error=null,canClose=true,initialOpen=true}:{busy?:boolean;error?:string|null;canClose?:boolean;initialOpen?:boolean}){
  const [open,setOpen]=useState(initialOpen)
  return <div className="story-dialog-frame">{!open&&<Button variant="secondary" onClick={()=>setOpen(true)}>Open dialog</Button>}<CreateProjectDialog open={open} busy={busy} error={error} canClose={canClose} onClose={()=>setOpen(false)} onCreate={async()=>{}}/></div>
}

function TabSwitcherDemo({variant='segmented',size='medium',disabledLast=false}:{variant?:TabSwitcherVariant;size?:TabSwitcherSize;disabledLast?:boolean}) {
  const [value,setValue]=useState<'dark'|'light'>('dark')
  return <TabSwitcher ariaLabel="Example mode" variant={variant} size={size} value={value} onChange={setValue} options={[
    {value:'dark',label:variant==='toggle'?'◐':'Dark',accessibleLabel:'Dark'},
    {value:'light',label:variant==='toggle'?'☼':'Light',accessibleLabel:'Light',disabled:disabledLast},
  ]}/>
}

function realComponent(component: ComponentEntity, button: ButtonProps, focused: FocusedDemoState, setFocused: (next: FocusedDemoState) => void, canvasMode: CanvasMode, canvasColor: string, onCanvasModeChange: (mode:CanvasMode)=>void, onCanvasColorChange:(color:string)=>void, inputDemo?:ReactNode) {
  if (component.id === 'button') return <Button {...button}/>
  if (component.id === 'asset-card') return <div className="workbench-asset-card-frame"><AssetCard name="PaletteIcon.tsx" path="icons/PaletteIcon.tsx" kind="icon" extension="tsx" previewUrl="/api/sources/design-lab-system/asset-previews/icons/PaletteIcon.tsx"/></div>
  if (component.id === 'checkbox') return <CheckboxDemo/>
  if (component.id === 'input') return inputDemo ?? <Input label="Component name" placeholder="Button"/>
  if (component.id === 'icon-button') return <IconButton aria-label="Add">＋</IconButton>
  if (component.id === 'color-card') return <ColorCard name="accent.primary" value="#26d9c7"/>
  if (component.id === 'control-field') return <ControlFieldDemo/>
  if (component.id === 'semantic-tree-item') return <div className="story-tree-row-frame" role="tree"><SemanticTreeItem node={{name:'Molecules',path:'components/molecules',kind:'folder',level:1,id:'molecules'}} active={focused.semanticTreeActive} expanded={focused.semanticTreeExpanded} color={focused.semanticTreeColor} coloringEnabled={focused.semanticTreeColoring} actionsEnabled={focused.semanticTreeActions} onColorChange={(color)=>setFocused({...focused,semanticTreeColor:color})} onSelect={()=>setFocused({...focused,semanticTreeExpanded:!focused.semanticTreeExpanded})}/></div>
  if (component.id === 'component-card') return <div className="workbench-card-frame"><ComponentCard name="Button" entry="Button.tsx" meta="4 variants" selected={focused.cardSelected} preview={<ComponentThumbnail kind="button"/>} onClick={()=>setFocused({...focused,cardSelected:!focused.cardSelected})}/></div>
  if (component.id === 'component-thumbnail') return <ComponentThumbnail kind="sidebar-tab"/>
  if (component.id === 'module-header') return <div className="workbench-header-frame"><ModuleHeader eyebrow="Live inventory" title="Components" count={17}/></div>
  if (component.id === 'source-select') return <SourceSelectDemo/>
  if (component.id === 'story-canvas') return <StoryCanvasDemo/>
  if (component.id === 'canvas-background-control') return <CanvasBackgroundControl mode={canvasMode} color={canvasColor} onModeChange={onCanvasModeChange} onColorChange={onCanvasColorChange}/>
  if (component.id === 'code-block') return <div className="workbench-code-frame"><CodeBlock language="tsx" code={'const mode = "dark"\nsetTheme(mode)'}/></div>
  if (component.id === 'tab-switcher') return <TabSwitcherDemo/>
  if (component.id === 'sidebar-tab') return <div className={`workbench-sidebar-tab-frame${focused.sidebarTabExpanded?' is-expanded':''}`}><SidebarTab icon={TokensIcon} label="Tokens" active={focused.sidebarTabActive} expanded={focused.sidebarTabExpanded} onClick={()=>setFocused({...focused,sidebarTabActive:!focused.sidebarTabActive})}/></div>
  if (component.id === 'app-sidebar') return <div className="workbench-sidebar-frame"><AppSidebar active={focused.appSidebarActive} expanded={focused.appSidebarExpanded} onChange={(active)=>setFocused({...focused,appSidebarActive:active})}/></div>
  if (component.id === 'color-picker') return <ColorPicker label="Component icon color" value={focused.semanticTreeColor} onChange={(color)=>setFocused({...focused,semanticTreeColor:color})}/>
  if (component.id === 'directory-panel') return <DirectoryPanelDemo dense searchEnabled={focused.directorySearch} coloringEnabled={focused.directoryColoring} actionsEnabled={focused.directoryActions} defaultCollapsed={focused.directoryDefaultCollapsed}/>
  if (component.id === 'create-project-dialog') return <CreateProjectDialogDemo initialOpen={false}/>
  if (component.id === 'workbench-playground') return <WorkbenchPlaygroundDemo/>
  return <span className="workbench-placeholder">{component.name}<small>Real playground controls are not defined yet.</small></span>
}

function ButtonControls({ value, onChange }: { value: ButtonProps; onChange: (next: ButtonProps) => void }) {
  return <div className="workbench-controls">
    <h2>Props</h2>
    <ControlField label="Label"><input value={String(value.children)} onChange={(event)=>onChange({...value,children:event.target.value})}/></ControlField>
    <ControlField label="Variant"><select value={value.variant} onChange={(event)=>onChange({...value,variant:event.target.value as ButtonProps['variant']})}><option>primary</option><option>secondary</option><option>ghost</option><option>danger</option></select></ControlField>
    <ControlField label="Size"><select value={value.size} onChange={(event)=>onChange({...value,size:event.target.value as ButtonProps['size']})}><option>small</option><option>medium</option><option>large</option></select></ControlField>
    {(['disabled','loading','fullWidth'] as const).map((key)=><ControlField key={key} label={key}><Checkbox size="small" aria-label={key} checked={Boolean(value[key])} onChange={(event)=>onChange({...value,[key]:event.target.checked})}/></ControlField>)}
    <ControlField label="Leading slot"><Checkbox size="small" aria-label="Leading slot" checked={Boolean(value.leading)} onChange={(event)=>onChange({...value,leading:event.target.checked?'←':undefined})}/></ControlField>
    <ControlField label="Trailing slot"><Checkbox size="small" aria-label="Trailing slot" checked={Boolean(value.trailing)} onChange={(event)=>onChange({...value,trailing:event.target.checked?'→':undefined})}/></ControlField>
  </div>
}

type InputWorkbenchState = {label:string;value:string;placeholder:string;variant:InputVariant;size:InputSize;helperText:string;errorMessage:string;disabled:boolean;readOnly:boolean;fullWidth:boolean;showCount:boolean}

function InputControls({value,onChange}:{value:InputWorkbenchState;onChange:(next:InputWorkbenchState)=>void}) {
  return <div className="workbench-controls">
    <h2>Props</h2>
    <ControlField label="Label"><input value={value.label} onChange={(event)=>onChange({...value,label:event.target.value})}/></ControlField>
    <ControlField label="Value"><input value={value.value} onChange={(event)=>onChange({...value,value:event.target.value})}/></ControlField>
    <ControlField label="Variant"><select value={value.variant} onChange={(event)=>onChange({...value,variant:event.target.value as InputVariant})}><option>text</option><option>search</option><option>textarea</option></select></ControlField>
    <ControlField label="Size"><select value={value.size} onChange={(event)=>onChange({...value,size:event.target.value as InputSize})}><option>small</option><option>medium</option><option>large</option></select></ControlField>
    <ControlField label="Helper text"><input value={value.helperText} onChange={(event)=>onChange({...value,helperText:event.target.value})}/></ControlField>
    <ControlField label="Error message"><input value={value.errorMessage} onChange={(event)=>onChange({...value,errorMessage:event.target.value})}/></ControlField>
    {(['disabled','readOnly','fullWidth','showCount'] as const).map((key)=><ControlField key={key} label={key}><Checkbox size="small" aria-label={key} checked={value[key]} onChange={(event)=>onChange({...value,[key]:event.target.checked})}/></ControlField>)}
  </div>
}

function InputWorkbenchDemo({value,onChange}:{value:InputWorkbenchState;onChange:(next:InputWorkbenchState)=>void}) {
  const shared={label:value.label,value:value.value,onChange:(event:ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>onChange({...value,value:event.target.value}),placeholder:value.placeholder,size:value.size,helperText:value.helperText||undefined,errorMessage:value.errorMessage||undefined,disabled:value.disabled,readOnly:value.readOnly,fullWidth:value.fullWidth,showCount:value.showCount,maxLength:value.showCount?80:undefined}
  return value.variant==='textarea' ? <Input {...shared} variant="textarea"/> : <Input {...shared} variant={value.variant}/>
}

function Specimen({ label, children, grow = false }: { label: string; children: React.ReactNode; grow?: boolean }) {
  return <div className={`button-specimen${grow ? ' button-specimen--grow' : ''}`}><div>{children}</div><code>{label}</code></div>
}

function ButtonStories() {
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!loading) return
    const timer = window.setTimeout(() => setLoading(false), 2000)
    return () => window.clearTimeout(timer)
  }, [loading])

  return <div className="button-stories">
    <StoryCanvas title="Variants" description="One size, four levels of semantic emphasis." meta="variant">
      <div className="story-comparison">{(['primary','secondary','ghost','danger'] as const).map((variant)=><Specimen key={variant} label={variant}><Button variant={variant}>Button</Button></Specimen>)}</div>
    </StoryCanvas>
    <StoryCanvas title="Sizes" description="One variant, three density levels aligned on a shared baseline." meta="size">
      <div className="story-comparison story-comparison--baseline">{(['small','medium','large'] as const).map((size)=><Specimen key={size} label={size}><Button variant="primary" size={size}>Button</Button></Specimen>)}</div>
    </StoryCanvas>
    <StoryCanvas title="Full width" description="The intrinsic button is a reference; fullWidth fills the available container." meta="fullWidth">
      <div className="story-stack"><Specimen label="intrinsic"><Button variant="primary">Continue</Button></Specimen><Specimen label="fullWidth" grow><Button variant="primary" fullWidth>Continue</Button></Specimen></div>
    </StoryCanvas>
    <StoryCanvas title="Loading" description="Select Publish to enter the real loading state for two seconds." meta="loading">
      <div className="story-loading-demo"><Specimen label={loading?'loading':'ready'}><Button variant="primary" loading={loading} onClick={()=>setLoading(true)}>{loading?'Publishing':'Publish'}</Button></Specimen><div className="story-transition" aria-hidden="true"><span className={!loading?'is-active':''}>ready</span><i>→</i><span className={loading?'is-active':''}>loading · 2s</span><i>→</i><span>ready</span></div></div>
    </StoryCanvas>
    <StoryCanvas title="States and composition" description="Behavioral states and slot composition are shown separately from visual variants." meta="state · slots">
      <div className="story-comparison"><Specimen label="default"><Button>Default</Button></Specimen><Specimen label="disabled"><Button disabled>Disabled</Button></Specimen><Specimen label="leading"><Button leading="←">Previous</Button></Specimen><Specimen label="trailing"><Button trailing="→">Next</Button></Specimen></div>
    </StoryCanvas>
  </div>
}

function FocusedStories({ componentId }: { componentId:string }) {
  const [activeTab,setActiveTab]=useState<ModuleId>('components')
  const [expanded,setExpanded]=useState(false)
  const [canvasMode,setCanvasMode]=useState<CanvasMode>('dark-grid')
  const [canvasColor,setCanvasColor]=useState('#264653')
  const [selectedCard,setSelectedCard]=useState(false)
  const [search,setSearch]=useState('')
  const [description,setDescription]=useState('A compact action for creating a new project.')

  if (componentId==='input') return <div className="focused-stories">
    <StoryCanvas title="Control kinds" description="Single-line text, search, and multiline entry share one field anatomy." meta="variant · interactive"><div className="story-input-grid"><Input label="Component name" defaultValue="Button"/><Input variant="search" label="Search components" value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Search by name…"/><Input variant="textarea" label="Description" value={description} onChange={(event)=>setDescription(event.target.value)} rows={3}/></div></StoryCanvas>
    <StoryCanvas title="Density matrix" description="Every control kind is checked at every supported size." meta="variant × size"><div className="story-input-matrix">
      {(['small','medium','large'] as const).map((size)=><Specimen key={`text-${size}`} label={`text · ${size}`}><Input size={size} label="Text input" visuallyHideLabel placeholder="Enter a value…"/></Specimen>)}
      {(['small','medium','large'] as const).map((size)=><Specimen key={`search-${size}`} label={`search · ${size}`}><Input variant="search" size={size} label="Search input" visuallyHideLabel placeholder="Search…"/></Specimen>)}
      {(['small','medium','large'] as const).map((size)=><Specimen key={`textarea-${size}`} label={`textarea · ${size}`}><Input variant="textarea" size={size} label="Textarea" visuallyHideLabel placeholder="Write a note…" rows={2}/></Specimen>)}
    </div></StoryCanvas>
    <StoryCanvas title="Validation and availability" description="Errors explain recovery; read-only content stays selectable; disabled content is unavailable." meta="state"><div className="story-input-grid"><Input label="Package name" defaultValue="Design Lab" errorMessage="Use lowercase letters and hyphens only."/><Input label="Generated path" defaultValue="components/atoms/Input" readOnly helperText="This path follows the component contract."/><Input label="Archived value" defaultValue="LegacyInput" disabled/></div></StoryCanvas>
    <StoryCanvas title="Labels and supporting content" description="Descriptions, required status, and character counts remain associated with native controls." meta="accessibility"><div className="story-input-grid"><Input label="Display name" required placeholder="Input" helperText="Shown in the component catalog."/><Input variant="textarea" label="Summary" value={description} onChange={(event)=>setDescription(event.target.value)} maxLength={160} showCount/></div></StoryCanvas>
    <StoryCanvas title="Component creation form" description="Fields keep a clear vertical rhythm inside a representative creation flow." meta="context · interactive"><form className="story-input-form" onSubmit={(event)=>event.preventDefault()}><Input label="Component name" placeholder="Status badge" required/><Input label="Export name" startAdornment="@design-lab/" endAdornment=".tsx" defaultValue="StatusBadge"/><Input variant="search" label="Parent category" placeholder="Search atoms, molecules…"/><Input variant="textarea" label="Description" placeholder="Describe the component contract and intended use." rows={4} showCount maxLength={220}/><Button type="submit" variant="primary">Create component</Button></form></StoryCanvas>
  </div>

  if (componentId==='checkbox') return <div className="focused-stories">
    <StoryCanvas title="Selection states" description="Native semantics and token-driven visuals across every boolean state." meta="state · interactive"><div className="story-comparison"><Specimen label="unchecked"><Checkbox aria-label="Unchecked"/></Specimen><Specimen label="checked"><Checkbox aria-label="Checked" defaultChecked/></Specimen><Specimen label="indeterminate"><Checkbox aria-label="Indeterminate" indeterminate/></Specimen><Specimen label="disabled"><Checkbox aria-label="Disabled" disabled/></Specimen></div></StoryCanvas>
    <StoryCanvas title="Sizes" description="Compact inspector density and standard form density keep the same interaction contract." meta="size"><div className="story-comparison story-comparison--baseline"><Specimen label="small"><Checkbox size="small" label="Small" defaultChecked/></Specimen><Specimen label="medium"><Checkbox label="Medium" defaultChecked/></Specimen></div></StoryCanvas>
    <StoryCanvas title="Form composition" description="The complete label area toggles the control while supporting optional explanatory copy." meta="accessibility · interactive"><div className="story-checkbox-stack"><CheckboxDemo/><Checkbox label="Generate stories" description="Creates the adjacent story contract for the component."/><Checkbox label="Archived option" description="Unavailable controls remain legible." disabled/></div></StoryCanvas>
  </div>

  if (componentId==='asset-card') return <div className="focused-stories">
    <StoryCanvas title="Asset kinds" description="Icons, raster images, and videos share one filesystem-first card anatomy." meta="variant"><div className="story-asset-card-row"><AssetCard name="PaletteIcon.tsx" path="icons/PaletteIcon.tsx" kind="icon" extension="tsx" previewUrl="/api/sources/design-lab-system/asset-previews/icons/PaletteIcon.tsx"/><AssetCard name="coastal-cliffs.webp" path="images/stock/coastal-cliffs.webp" kind="image" extension="webp" previewUrl="/api/sources/design-lab-system/asset-previews/images/stock/coastal-cliffs.webp"/><AssetCard name="brand-loop.mp4" path="videos/brand-loop.mp4" kind="video" extension="mp4"/></div></StoryCanvas>
    <StoryCanvas title="Long paths" description="Nested identity clips inside the card without widening the catalog grid." meta="content-stress"><div className="story-asset-card-width"><AssetCard name="hero-product-composition-with-an-exceptionally-long-name.webp" path="images/campaigns/summer/launch/hero-product-composition-with-an-exceptionally-long-name.webp" kind="image" extension="webp"/></div></StoryCanvas>
  </div>

  if (componentId==='tab-switcher') return <div className="focused-stories">
    <StoryCanvas title="Visual variants" description="One selection contract adapts to text-led modes and a compact icon-led preference." meta="variant · interactive"><div className="story-comparison"><Specimen label="segmented"><TabSwitcherDemo/></Specimen><Specimen label="toggle"><TabSwitcherDemo variant="toggle"/></Specimen></div></StoryCanvas>
    <StoryCanvas title="Segmented sizes" description="Text-led segmented controls at both supported density levels." meta="size · segmented · interactive"><div className="story-comparison story-comparison--baseline"><Specimen label="small"><TabSwitcherDemo size="small"/></Specimen><Specimen label="medium"><TabSwitcherDemo size="medium"/></Specimen></div></StoryCanvas>
    <StoryCanvas title="Toggle sizes" description="The track, thumb, and option hit areas scale together." meta="size · toggle · interactive"><div className="story-comparison story-comparison--baseline"><Specimen label="small"><TabSwitcherDemo variant="toggle" size="small"/></Specimen><Specimen label="medium"><TabSwitcherDemo variant="toggle" size="medium"/></Specimen></div></StoryCanvas>
    <StoryCanvas title="Disabled option" description="An unavailable value remains visible and cannot replace the current selection." meta="state"><Specimen label="light disabled"><TabSwitcherDemo disabledLast/></Specimen></StoryCanvas>
  </div>

  if (componentId==='code-block') return <div className="focused-stories">
    <StoryCanvas title="Source languages" description="Language labels identify the snippet without changing source presentation." meta="context"><div className="story-stack"><CodeBlock language="tsx" code={'type Theme = "dark" | "light"\nconst theme: Theme = "dark"'}/><CodeBlock language="scss" code={'.theme-toggle {\n  color: var(--color-text-primary);\n}'}/></div></StoryCanvas>
    <StoryCanvas title="Copy source" description="Copy the complete snippet and observe the temporary confirmation state." meta="behavior · interactive"><CodeBlock language="tsx" code={'<TabSwitcher variant="toggle" size="small" />'}/></StoryCanvas>
    <StoryCanvas title="Long source" description="Long lines scroll inside the component instead of widening the documentation column." meta="context"><CodeBlock language="ts" code={'const resolvedDesignSystemMode = token.values[selectedDesignSystemMode] ?? token.value'}/></StoryCanvas>
  </div>

  if (componentId==='icon-button') return <div className="focused-stories">
    <StoryCanvas title="Interaction states" description="Default, disabled, and focused actions at the same 32px hit area." meta="state"><div className="story-comparison"><Specimen label="default"><IconButton aria-label="Add">＋</IconButton></Specimen><Specimen label="disabled"><IconButton aria-label="Add" disabled>＋</IconButton></Specimen><Specimen label="secondary action"><IconButton aria-label="Open source">↗</IconButton></Specimen></div></StoryCanvas>
    <StoryCanvas title="Toolbar context" description="Icon actions inside a compact workbench toolbar with real spacing." meta="context"><div className="story-icon-toolbar"><span>Source</span><IconButton aria-label="Copy link">⌁</IconButton><IconButton aria-label="Open source">↗</IconButton><IconButton aria-label="More actions">•••</IconButton></div></StoryCanvas>
  </div>

  if (componentId==='control-field') return <div className="focused-stories">
    <StoryCanvas title="Control types" description="Text, select, and boolean controls share one label and spacing contract." meta="variant · interactive"><ControlFieldDemo/></StoryCanvas>
    <StoryCanvas title="Disabled fields" description="Disabled native controls preserve label alignment and remain visibly unavailable." meta="state"><div className="story-control-fields"><ControlField label="Project name"><input value="Design Lab System" disabled readOnly/></ControlField><ControlField label="Mode"><select disabled defaultValue="dark"><option>dark</option></select></ControlField></div></StoryCanvas>
  </div>

  if (componentId==='semantic-tree-item') return <div className="focused-stories">
    <StoryCanvas title="Entity kinds" description="Folder, component, token, asset, and file rows use distinct code-native icons." meta="variant · interactive"><div className="story-tree-list"><SemanticTreeItemDemo kind="folder" level={0}/><SemanticTreeItemDemo kind="component"/><SemanticTreeItemDemo kind="token"/><SemanticTreeItemDemo kind="asset"/><SemanticTreeItemDemo kind="file"/></div></StoryCanvas>
    <StoryCanvas title="Nested selection" description="Long names, indentation, selection, and disclosure inside a realistic tree width." meta="context · interactive"><div className="story-tree-context"><SemanticTreeItemDemo kind="folder" level={0}/><SemanticTreeItemDemo kind="folder" level={1}/><SemanticTreeItemDemo kind="component" level={2} active/></div></StoryCanvas>
  </div>

  if (componentId==='component-thumbnail') return <div className="focused-stories">
    <StoryCanvas title="Known silhouettes" description="Recognition comes from the component kind while every illustration remains token-driven and non-interactive." meta="variant"><div className="story-thumbnail-row"><Specimen label="button"><ComponentThumbnail kind="button"/></Specimen><Specimen label="sidebar tab"><ComponentThumbnail kind="sidebar-tab"/></Specimen><Specimen label="component card"><ComponentThumbnail kind="component-card"/></Specimen></div></StoryCanvas>
    <StoryCanvas title="Unknown component" description="An automatically discovered kind without an authored preview receives a neutral fallback." meta="state"><ComponentThumbnail kind="custom-widget"/></StoryCanvas>
  </div>

  if (componentId==='module-header') return <div className="focused-stories">
    <StoryCanvas title="Module summary" description="Count and actions occupy the same trailing role without changing identity alignment." meta="variant"><div className="story-header-stack"><ModuleHeader eyebrow="Live inventory" title="Components" count={17}/><ModuleHeader eyebrow="Color tokens" title="Palette" actions={<TabSwitcherDemo size="small"/>}/></div></StoryCanvas>
    <StoryCanvas title="Workbench navigation" description="Back navigation and source metadata in the component-detail context." meta="context · interactive"><div className="story-header-stack"><ModuleHeader eyebrow="atoms/Button" title="Button" backLabel="Components" onBack={()=>{}} meta="Button.tsx"/></div></StoryCanvas>
  </div>

  if (componentId==='source-select') return <div className="focused-stories">
    <StoryCanvas title="Source menu" description="Open the production menu to compare a Library, a Project, and an unavailable source with realistic paths." meta="context · interactive"><SourceSelectDemo/></StoryCanvas>
    <StoryCanvas title="No active source" description="The empty selection directs the user toward project creation." meta="state"><div className="story-source-select-frame"><SourceSelect sources={[]} activeSource={null} onChange={()=>{}} onCreateProject={()=>{}}/></div></StoryCanvas>
  </div>

  if (componentId==='story-canvas') return <div className="focused-stories">
    <StoryCanvas title="Single specimen" description="A production Story Canvas containing one focused component specimen." meta="variant"><div className="story-story-canvas-frame"><StoryCanvas title="Loading" description="One behavior, one component, one stage." meta="behavior"><Button loading>Publishing</Button></StoryCanvas></div></StoryCanvas>
    <StoryCanvas title="Comparison content" description="Related values share a stage; unrelated axes remain separate stories." meta="variant"><StoryCanvasDemo/></StoryCanvas>
  </div>

  if (componentId==='create-project-dialog') return <div className="focused-stories">
    <StoryCanvas title="Required creation" description="The first-project flow cannot be dismissed and keeps the primary task explicit." meta="state · interactive"><CreateProjectDialogDemo canClose={false}/></StoryCanvas>
    <StoryCanvas title="Validation error" description="A concrete filesystem conflict remains adjacent to the form action." meta="state · interactive"><CreateProjectDialogDemo error="A directory with this name already exists."/></StoryCanvas>
    <StoryCanvas title="Busy submission" description="Inputs remain visible while creation is in progress and duplicate submission is disabled." meta="behavior"><CreateProjectDialogDemo busy/></StoryCanvas>
  </div>

  if (componentId==='sidebar-tab') return <div className="focused-stories">
    <StoryCanvas title="Selection states" description="Default and current-page treatment at the same collapsed width." meta="state">
      <div className="story-tab-states"><Specimen label="default"><div className="story-sidebar-tab-context"><SidebarTab icon={TokensIcon} label="Tokens"/></div></Specimen><Specimen label="active"><div className="story-sidebar-tab-context"><SidebarTab icon={TokensIcon} label="Tokens" active/></div></Specimen></div>
    </StoryCanvas>
    <StoryCanvas title="Inside application sidebar" description="Toggle disclosure and select a destination in the real clipping context. The active outline must remain complete on every side." meta="context · interactive">
      <div className={`story-navigation-shell${expanded?' is-expanded':''}`}><AppSidebar active={activeTab} expanded={expanded} onChange={setActiveTab}/><div className="story-directory-fixture"><button type="button" onClick={()=>setExpanded((value)=>!value)}>{expanded?'Collapse rail':'Expand rail'}</button><strong>{activeTab}</strong><span/><span/><span/></div></div>
    </StoryCanvas>
  </div>

  if (componentId==='app-sidebar') return <div className="focused-stories">
    <StoryCanvas title="Hover disclosure" description="Hover the production sidebar or use the fixture control to reveal labels." meta="behavior · interactive">
      <div className={`story-navigation-shell story-navigation-shell--solo${expanded?' is-expanded':''}`}><AppSidebar active={activeTab} expanded={expanded} onChange={setActiveTab}/><button className="story-disclosure-toggle" type="button" onClick={()=>setExpanded((value)=>!value)}>{expanded?'Show collapsed':'Hold expanded'}</button></div>
    </StoryCanvas>
    <StoryCanvas title="Shared navigation width" description="The rail and adjacent directory region divide one stable 340px navigation width." meta="integration · interactive">
      <div className={`story-navigation-shell${expanded?' is-expanded':''}`}><AppSidebar active={activeTab} expanded={expanded} onChange={setActiveTab}/><div className="story-directory-fixture"><button type="button" onClick={()=>setExpanded((value)=>!value)}>{expanded?'Collapse rail':'Expand rail'}</button><strong>Components</strong><span/><span/><span/><span/></div></div>
    </StoryCanvas>
  </div>

  if (componentId==='canvas-background-control') return <div className="focused-stories">
    <StoryCanvas title="Background modes" description="Switch between the two grid modes and a resolved solid color." meta="state · interactive"><CanvasBackgroundControl mode={canvasMode} color={canvasColor} onModeChange={setCanvasMode} onColorChange={setCanvasColor}/></StoryCanvas>
    <StoryCanvas title="Solid color picker" description="Choose a preset or enter a valid six-digit HEX value." meta="behavior · interactive"><div className="story-canvas-control-demo"><CanvasBackgroundControl mode="solid" color={canvasColor} onModeChange={setCanvasMode} onColorChange={setCanvasColor}/><code>{canvasColor}</code></div></StoryCanvas>
  </div>

  if (componentId==='component-card') return <div className="focused-stories">
    <StoryCanvas title="Selection" description="Select the inventory entry and inspect its persistent selected treatment." meta="state · interactive"><div className="story-card-width"><ComponentCard name="Button" entry="Button.tsx" meta="4 variants" selected={selectedCard} preview={<ComponentThumbnail kind="button"/>} onClick={()=>setSelectedCard((value)=>!value)}/></div></StoryCanvas>
    <StoryCanvas title="Animated preview trigger" description="Hover or keyboard-focus the real card to transition its opted-in illustrative preview." meta="behavior · interactive"><div className="story-card-width"><ComponentCard name="State Controller" entry="StateController.tsx" meta="animated preview" previewAnimated preview={<div className="component-card-motion-fixture" data-preview-motion="state-transition"><i/><i/></div>}/></div></StoryCanvas>
    <StoryCanvas title="Catalog row" description="Real cards at catalog density with different preview silhouettes and metadata lengths." meta="context"><div className="story-catalog-row"><ComponentCard name="Sidebar Tab" entry="SidebarTab.tsx" meta="2 states" preview={<ComponentThumbnail kind="sidebar-tab"/>}/><ComponentCard name="Canvas Background Control" entry="CanvasBackgroundControl.tsx" meta="3 modes" preview={<ComponentThumbnail kind="canvas-background-control"/>}/></div></StoryCanvas>
  </div>

  if (componentId==='color-card') return <div className="focused-stories">
    <StoryCanvas title="Semantic roles" description="Compare resolved colors without turning token roles into component variants." meta="context"><div className="story-color-grid"><ColorCard name="accent.primary" value="#26d9c7"/><ColorCard name="surface.raised" value="#20201f"/><ColorCard name="status.danger" value="#ff7b72"/></div></StoryCanvas>
    <StoryCanvas title="Long token paths" description="Names and resolved values remain readable without changing grid geometry." meta="layout"><div className="story-color-grid"><ColorCard name="component.sidebar.active.border" value="#ffffff66"/><ColorCard name="component.canvas.grid.background" value="#111111"/></div></StoryCanvas>
  </div>

  if (componentId==='directory-panel') return <div className="focused-stories">
    <StoryCanvas title="Representative project tree" description="A plausible component library with categories, selection, and folder disclosure." meta="context · interactive"><DirectoryPanelDemo/></StoryCanvas>
    <StoryCanvas title="Dense project tree" description="Enough realistic entities, nesting, and label variation to force tree-only scrolling. The source header and filesystem footer must remain fixed." meta="content-stress · interactive"><DirectoryPanelDemo dense/></StoryCanvas>
    <StoryCanvas title="Quiet navigation contract" description="Every optional affordance can be disabled without changing the semantic tree data." meta="behavior · interactive"><DirectoryPanelDemo dense searchEnabled={false} coloringEnabled={false} actionsEnabled={false} defaultCollapsed={false}/></StoryCanvas>
  </div>

  if (componentId==='color-picker') return <div className="focused-stories">
    <StoryCanvas title="Color override" description="Choose a preset, use the spectrum input, enter a HEX value, or return to the semantic default." meta="behavior · interactive"><ColorPicker label="Entity icon color" defaultValue="#8b5cf6"/></StoryCanvas>
    <StoryCanvas title="Inside semantic tree" description="The entity icon itself becomes the picker trigger while label selection remains independent." meta="integration · interactive"><SemanticTreeItemDemo color="#14b8a6"/></StoryCanvas>
  </div>

  if (componentId==='workbench-playground') return <div className="focused-stories">
    <StoryCanvas title="Safe full-width canvas" description="The specimen fills the Canvas content box while comfortable padding protects every edge." meta="layout · integration"><WorkbenchPlaygroundDemo/></StoryCanvas>
    <StoryCanvas title="Background ownership" description="The production Playground owns the shared dark grid, light grid, and solid background control." meta="state · interactive"><WorkbenchPlaygroundDemo/></StoryCanvas>
  </div>

  return null
}

function ComponentWorkbench({ component, onBack, canvasMode, canvasColor, onCanvasModeChange, onCanvasColorChange }: { component: ComponentEntity; onBack: () => void; canvasMode:CanvasMode; canvasColor:string; onCanvasModeChange:(mode:CanvasMode)=>void; onCanvasColorChange:(color:string)=>void }) {
  const {t}=useDesignLabI18n()
  const [buttonProps, setButtonProps] = useState<ButtonProps>({variant:'primary',size:'medium',children:'Create project'})
  const [inputProps,setInputProps]=useState<InputWorkbenchState>({label:'Component name',value:'Input',placeholder:'Enter a component name',variant:'text',size:'medium',helperText:'Used for the component folder and catalog label.',errorMessage:'',disabled:false,readOnly:false,fullWidth:false,showCount:false})
  const [clicks, setClicks] = useState(0)
  const [tabSwitcherVariant,setTabSwitcherVariant]=useState<TabSwitcherVariant>('segmented')
  const [tabSwitcherSize,setTabSwitcherSize]=useState<TabSwitcherSize>('medium')
  const [focused,setFocused]=useState<FocusedDemoState>({sidebarTabActive:true,sidebarTabExpanded:false,appSidebarActive:'components',appSidebarExpanded:false,cardSelected:false,semanticTreeActive:true,semanticTreeExpanded:false,semanticTreeColoring:true,semanticTreeActions:true,semanticTreeColor:'#8b5cf6',directorySearch:true,directoryColoring:true,directoryActions:true,directoryDefaultCollapsed:true})
  const canvasStyle = ({'--canvas-solid':canvasColor} as CSSProperties)
  const liveButtonProps = component.id === 'button' ? {...buttonProps,onClick:()=>setClicks((value)=>value+1)} : buttonProps
  const hasFocusedStories=['button','input','checkbox','asset-card','icon-button','sidebar-tab','color-card','color-picker','control-field','semantic-tree-item','canvas-background-control','code-block','component-card','component-thumbnail','module-header','source-select','story-canvas','tab-switcher','app-sidebar','create-project-dialog','directory-panel','workbench-playground'].includes(component.id)
  const inputDemo=<InputWorkbenchDemo value={inputProps} onChange={setInputProps}/>

  const focusedControls = component.id==='sidebar-tab' ? <aside className="workbench-controls"><h2>{t('workbench.props')}</h2><ControlField label="Active"><Checkbox size="small" aria-label="Active" checked={focused.sidebarTabActive} onChange={(event)=>setFocused({...focused,sidebarTabActive:event.target.checked})}/></ControlField><ControlField label="Expanded context"><Checkbox size="small" aria-label="Expanded context" checked={focused.sidebarTabExpanded} onChange={(event)=>setFocused({...focused,sidebarTabExpanded:event.target.checked})}/></ControlField></aside>
    : component.id==='app-sidebar' ? <aside className="workbench-controls"><h2>{t('workbench.props')}</h2><ControlField label="Expanded"><Checkbox size="small" aria-label="Expanded" checked={focused.appSidebarExpanded} onChange={(event)=>setFocused({...focused,appSidebarExpanded:event.target.checked})}/></ControlField><ControlField label="Active module"><select value={focused.appSidebarActive} onChange={(event)=>setFocused({...focused,appSidebarActive:event.target.value as ModuleId})}><option value="components">components</option><option value="palette">palette</option><option value="tokens">tokens</option></select></ControlField></aside>
    : component.id==='component-card' ? <aside className="workbench-controls"><h2>{t('workbench.props')}</h2><ControlField label="Selected"><Checkbox size="small" aria-label="Selected" checked={focused.cardSelected} onChange={(event)=>setFocused({...focused,cardSelected:event.target.checked})}/></ControlField></aside>
    : component.id==='checkbox' ? <aside className="workbench-controls"><h2>{t('workbench.props')}</h2><p>Toggle the production Checkbox. Stories compare sizes, native states, and complete label composition.</p></aside>
    : component.id==='asset-card' ? <aside className="workbench-controls"><h2>{t('workbench.props')}</h2><p>The card presents a discovered filesystem entity. Image stories may receive a safe local preview URL.</p></aside>
    : component.id==='workbench-playground' ? <aside className="workbench-controls"><h2>{t('workbench.props')}</h2><p>This page is itself rendered inside the production Workbench Playground; the specimen demonstrates nested composition and safe width.</p></aside>
    : component.id==='color-card' ? <aside className="workbench-controls"><h2>{t('workbench.props')}</h2><p>The playground uses a semantic token name and resolved color value.</p></aside>
    : component.id==='canvas-background-control' ? <aside className="workbench-controls"><h2>{t('workbench.props')}</h2><p>Use the production control directly on the Canvas. Its changes update the shared Workbench background.</p></aside>
    : component.id==='directory-panel' ? <aside className="workbench-controls"><h2>{t('workbench.props')}</h2>{([['Search','directorySearch'],['Icon coloring','directoryColoring'],['Item actions','directoryActions'],['Default collapsed','directoryDefaultCollapsed']] as const).map(([label,key])=><ControlField key={key} label={label}><Checkbox size="small" aria-label={label} checked={focused[key]} onChange={(event)=>setFocused({...focused,[key]:event.target.checked})}/></ControlField>)}</aside>
    : component.id==='icon-button' ? <aside className="workbench-controls"><h2>{t('workbench.props')}</h2><p>The Playground uses a native button action with an accessible name and a compact icon slot.</p></aside>
    : component.id==='control-field' ? <aside className="workbench-controls"><h2>{t('workbench.props')}</h2><p>Edit the production text, select, and boolean controls to verify their shared label contract.</p></aside>
    : component.id==='semantic-tree-item' ? <aside className="workbench-controls"><h2>{t('workbench.props')}</h2>{([['Active','semanticTreeActive'],['Expanded','semanticTreeExpanded'],['Icon coloring','semanticTreeColoring'],['Item actions','semanticTreeActions']] as const).map(([label,key])=><ControlField key={key} label={label}><Checkbox size="small" aria-label={label} checked={focused[key]} onChange={(event)=>setFocused({...focused,[key]:event.target.checked})}/></ControlField>)}</aside>
    : component.id==='color-picker' ? <aside className="workbench-controls"><h2>{t('workbench.props')}</h2><p>Open the production picker, change the spectrum or HEX value, choose a preset, and reset the semantic override.</p></aside>
    : component.id==='component-thumbnail' ? <aside className="workbench-controls"><h2>{t('workbench.props')}</h2><p>The Playground shows an authored kind silhouette; stories compare known kinds and the generic fallback.</p></aside>
    : component.id==='module-header' ? <aside className="workbench-controls"><h2>{t('workbench.props')}</h2><p>The current specimen uses the module-summary composition with a real count.</p></aside>
    : component.id==='source-select' ? <aside className="workbench-controls"><h2>{t('workbench.props')}</h2><p>Open the menu and switch between realistic Library and Project sources.</p></aside>
    : component.id==='story-canvas' ? <aside className="workbench-controls"><h2>{t('workbench.props')}</h2><p>The Playground renders a production Story Canvas with real Button specimens.</p></aside>
    : component.id==='create-project-dialog' ? <aside className="workbench-controls"><h2>{t('workbench.props')}</h2><p>Open the dialog, enter a project name, submit, dismiss, and inspect the focused state.</p></aside>
    : component.id==='tab-switcher' ? <aside className="workbench-controls"><h2>{t('workbench.props')}</h2><ControlField label="Variant"><select value={tabSwitcherVariant} onChange={(event)=>setTabSwitcherVariant(event.target.value as TabSwitcherVariant)}><option>segmented</option><option>toggle</option></select></ControlField><ControlField label="Size"><select value={tabSwitcherSize} onChange={(event)=>setTabSwitcherSize(event.target.value as TabSwitcherSize)}><option>small</option><option>medium</option></select></ControlField></aside>
    : component.id==='code-block' ? <aside className="workbench-controls"><h2>{t('workbench.props')}</h2><p>The Markdown renderer supplies fenced source, language, and the copy action to this production component.</p></aside>
    : <aside className="workbench-controls"><h2>{t('workbench.props')}</h2><p>{t('workbench.controlsMissing')}</p></aside>

  return <div className={`workbench workbench--canvas-${canvasMode}`} style={canvasStyle}>
    <div className="workbench__top"><ModuleHeader eyebrow={component.directory} title={component.name} backLabel={t('workbench.back')} onBack={onBack} meta={component.entry}/></div>
    <WorkbenchPlayground mode={canvasMode} color={canvasColor} onModeChange={onCanvasModeChange} onColorChange={onCanvasColorChange} label={t('workbench.playground')} controls={component.id === 'button' ? <ButtonControls value={buttonProps} onChange={setButtonProps}/> : component.id==='input' ? <InputControls value={inputProps} onChange={setInputProps}/> : focusedControls} eventLog={component.id==='button'?`onClick · ${clicks}`:undefined}>
        {component.id==='tab-switcher'?<TabSwitcherDemo variant={tabSwitcherVariant} size={tabSwitcherSize}/>:realComponent(component, liveButtonProps, focused, setFocused, canvasMode, canvasColor, onCanvasModeChange, onCanvasColorChange, inputDemo)}
    </WorkbenchPlayground>
    <section className="workbench__rail">
      {component.id==='button' ? <ButtonStories/> : hasFocusedStories ? <FocusedStories componentId={component.id}/> : <StoryCanvas title="Variants" description="Available component variants."><div className="story-comparison">{component.variants.map((variant)=><Specimen key={variant} label={variant}>{realComponent(component,buttonProps,focused,setFocused,canvasMode,canvasColor,onCanvasModeChange,onCanvasColorChange)}</Specimen>)}</div></StoryCanvas>}
      {component.props&&<div className="workbench-section"><span>{t('workbench.propsApi')}</span><div className="workbench__props-table"><div className="workbench__props-head"><strong>{t('workbench.name')}</strong><strong>{t('workbench.type')}</strong><strong>{t('workbench.default')}</strong></div>{Object.entries(component.props).map(([name,definition])=><div key={name}><code>{name}</code><span>{definition.type}{definition.values?` · ${definition.values.join(' | ')}`:''}</span><small>{definition.default===undefined?'—':String(definition.default)}</small></div>)}</div></div>}
      <div className="workbench-section"><span>{t('workbench.documentation')}</span><div className="workbench-markdown"><ReactMarkdown components={markdownComponents}>{component.documentation??'Documentation has not been written yet.'}</ReactMarkdown></div></div>
      {component.changelogDocumentation&&<div className="workbench-section"><span>{t('workbench.changelog')}</span><div className="workbench-markdown workbench-markdown--changelog"><ReactMarkdown components={markdownComponents}>{component.changelogDocumentation}</ReactMarkdown></div></div>}
      <footer>{component.preview&&<code>{component.preview}</code>}{component.stories&&<code>{component.stories}</code>}{component.changelog&&<code>{component.changelog}</code>}</footer>
    </section>
  </div>
}

function Catalog({ data, sourceId, folderPath, onSelectEntity }: { data: Extract<ModuleData,{kind:'components'}>; sourceId:string; folderPath:string; onSelectEntity:(id:string)=>void }) {
  const groups = new Map<string, ComponentEntity[]>()
  const components=folderPath==='__all__'?data.components:data.components.filter((component)=>component.directory===folderPath||component.directory.startsWith(`${folderPath}/`))
  for (const component of components) {
    const group = component.directory.split('/')[0] || 'components'
    groups.set(group,[...(groups.get(group)??[]),component])
  }
  const title=folderPath==='__all__'?'Components':folderPath.split('/').at(-1)??'Components'
  return <div className="module-page"><ModuleHeader eyebrow="Live inventory · Components" title={title} count={components.length}/>{components.length?<div className="component-groups">{[...groups.entries()].map(([name,components])=><section className="component-group" key={name}><header><h2>{name}</h2><span>{components.length}</span></header><div className="component-grid">{components.map((component)=><ComponentCard key={component.id} name={component.name} entry={component.entry} meta={`${component.variants.length} variants`} preview={<DiscoveredComponentPreview component={component} sourceId={sourceId}/>} previewAnimated={Boolean(component.previewMotion)} onClick={()=>onSelectEntity(component.id)}/>)}</div></section>)}</div>:<div className="module-filter-empty"><strong>No components in this folder</strong><span>Choose All or another folder in the Directory Panel.</span></div>}</div>
}

function AssetsCatalog({data,folderPath,selectedEntityId,onSelectEntity}:{data:Extract<ModuleData,{kind:'assets'}>;folderPath:string;selectedEntityId:string|null;onSelectEntity:(id:string)=>void}) {
  const assets=folderPath==='__all__'?data.assets:data.assets.filter((asset)=>asset.directory===folderPath||asset.directory.startsWith(`${folderPath}/`))
  const groups=new Map<string,typeof assets>()
  for(const asset of assets){const group=asset.directory||'Unsorted';groups.set(group,[...(groups.get(group)??[]),asset])}
  const title=folderPath==='__all__'?'Assets':folderPath.split('/').at(-1)??'Assets'
  return <div className="module-page"><ModuleHeader eyebrow="Filesystem inventory · Assets" title={title} count={assets.length}/>{assets.length?<div className="asset-groups">{[...groups.entries()].map(([name,items])=><section className="asset-group" key={name}><header><h2>{name}</h2><span>{items.length}</span></header><div className="asset-grid">{items.map((asset)=><AssetCard key={asset.id} name={asset.name} path={asset.path} kind={asset.type} extension={asset.extension} previewUrl={asset.previewUrl} selected={asset.id===selectedEntityId} onClick={()=>onSelectEntity(asset.id)}/>)}</div></section>)}</div>:<div className="module-filter-empty"><strong>No assets in this folder</strong><span>Add files to this canonical directory or choose All.</span></div>}</div>
}

export function ModuleView({ data, loading, sourceId, selectedEntityId, selectedFolderPath, onSelectEntity, interfaceTheme, canvasMode, canvasColor, onCanvasModeChange, onCanvasColorChange }: { data: ModuleData | null; loading: boolean; sourceId:string; selectedEntityId: string | null; selectedFolderPath:string; onSelectEntity: (id: string | null) => void; interfaceTheme:'dark'|'light'; canvasMode:CanvasMode; canvasColor:string; onCanvasModeChange:(mode:CanvasMode)=>void; onCanvasColorChange:(color:string)=>void }) {
  const {t}=useDesignLabI18n()
  const modes=data&&'modes' in data?data.modes:[]
  const [previewMode,setPreviewMode]=useState<string>(interfaceTheme)
  useEffect(()=>{if(modes.length&&!modes.includes(previewMode))setPreviewMode(modes[0])},[modes.join('|'),previewMode])
  if (loading) return <div className="module-state">{t('status.loading')}</div>
  if (!data) return <div className="module-state">{t('status.unavailable')}</div>
  const modeActions=modes.length>1?<TabSwitcher ariaLabel="Design-system mode" options={modes.map((mode)=>({value:mode,label:mode}))} value={previewMode} onChange={setPreviewMode}/>:undefined
  if (data.kind==='tokens') {const prefix=selectedFolderPath==='__all__'?'':selectedFolderPath.replaceAll('/','.');const tokens=prefix?data.tokens.filter((token)=>token.path===prefix||token.path.startsWith(`${prefix}.`)):data.tokens;const title=prefix?selectedFolderPath.split('/').at(-1)??'Tokens':'Tokens';return <div className="module-page"><ModuleHeader eyebrow="Token registry" title={title} count={tokens.length} actions={modeActions}/>{tokens.length?<div className="token-table"><div className="token-row token-row--head"><strong>Token</strong><strong>Type</strong><strong>Value · {previewMode}</strong></div>{tokens.map((token)=>{const value=token.values[previewMode]??token.value;return <button type="button" className={`token-row${token.id===selectedEntityId?' token-row--selected':''}`} aria-current={token.id===selectedEntityId?'page':undefined} key={`${token.file}:${token.path}`} onClick={()=>onSelectEntity(token.id)}><code>{token.path}</code><span>{token.type}</span><div className="token-value">{token.type==='color'&&<i className="token-value__swatch" style={{background:String(value)}}/>}<strong>{String(value)}</strong></div></button>})}</div>:<div className="module-filter-empty"><strong>No tokens in this group</strong><span>Choose All or another token group.</span></div>}</div>}
  if (data.kind==='palette') return <div className="module-page"><ModuleHeader eyebrow="Color tokens" title="Palette" count={data.colors.length} actions={modeActions}/><div className="palette-grid">{data.colors.map((color)=><ColorCard key={color.path} name={color.path.replace(/^color\./,'')} value={String(color.values[previewMode]??color.value)}/>)}</div></div>
  if (data.kind==='fonts') {const typography=Object.fromEntries(data.typography.map((token)=>[token.path,token.values[previewMode]??token.value]));return <div className="module-page"><ModuleHeader eyebrow="Type registry" title="Fonts" count={data.families.length} actions={modeActions}/><div className="font-list">{data.families.map((family)=><article className="font-card" key={family.id} style={{fontFamily:String(typography['typography.interface.family']??family.cssFamily)}}><span>{family.source} · {previewMode}</span><h2 style={{fontWeight:Number(typography['typography.heading.weight']??600)}}>{family.name}</h2><p style={{fontSize:String(typography['typography.body.size']??'42px'),lineHeight:Number(typography['typography.body.line-height']??1.5)}}>Hamburgefontsiv 012345</p><div className="font-mode-values">{data.typography.map((token)=><div key={token.id}><code>{token.path}</code><strong>{String(token.values[previewMode]??token.value)}</strong></div>)}</div><footer>{family.styles.map((style)=><code key={`${style.weight}-${style.style}`}>{style.weight} {style.style}</code>)}</footer></article>)}</div></div>}
  if (data.kind==='assets') return <AssetsCatalog data={data} folderPath={selectedFolderPath} selectedEntityId={selectedEntityId} onSelectEntity={onSelectEntity}/>
  if (data.kind==='components') {
    const selected=data.components.find((item)=>item.id===selectedEntityId)
    return selected?<ComponentWorkbench component={selected} onBack={()=>onSelectEntity(null)} canvasMode={canvasMode} canvasColor={canvasColor} onCanvasModeChange={onCanvasModeChange} onCanvasColorChange={onCanvasColorChange}/>:<Catalog data={data} sourceId={sourceId} folderPath={selectedFolderPath} onSelectEntity={onSelectEntity}/>
  }
  return <div className="module-state">{t('status.noEntities')}</div>
}
