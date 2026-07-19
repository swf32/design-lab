import { useEffect, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { AppSidebar, CreateProjectDialog, DirectoryPanel, TabSwitcher, type CanvasMode, type ModuleId } from '@design-lab/system/components'
import { useDesignLabI18n, type MessageKey } from '@design-lab/system/i18n'
import { ModuleView } from './components/ModuleView/ModuleView'
import { SettingsView } from './components/SettingsView/SettingsView'
import { Button, IconButton } from '@design-lab/system/components'
import { CodeIcon, LinkIcon, StarIcon } from '@design-lab/system/icons'
import { createProject, getModuleData, getProjectTree, listProjects, type ModuleData, type Project, type ProjectTreeItem } from './api/projects'
import { appRouteHref, findRouteTreeItem, readAppRoute, treeItemRoutePath } from './navigation'

const moduleMessageKeys: Record<ModuleId, MessageKey> = {
  home: 'module.home', components: 'module.components', wireframes: 'module.wireframes', pages: 'module.pages', assets: 'module.assets', palette: 'module.palette', tokens: 'module.tokens', fonts: 'module.fonts',
}

const NAVIGATION_WIDTH_KEY = 'design-lab:navigation-width'
const DEFAULT_NAVIGATION_WIDTH = 340
const MIN_NAVIGATION_WIDTH = 260
const MIN_WORKSPACE_WIDTH = 360
const ACTIVE_PROJECT_KEY = 'design-lab:active-project'
const THEME_KEY = 'design-lab:theme'
const CANVAS_MODE_KEY = 'design-lab:canvas-mode'
const CANVAS_COLOR_KEY = 'design-lab:canvas-color'
const ALL_FOLDER_PATH = '__all__'
type ThemeMode = 'dark' | 'light'
const initialRoute = readAppRoute()

function getInitialTheme(): ThemeMode { return localStorage.getItem(THEME_KEY)==='light'?'light':'dark' }
function getInitialCanvasMode(theme:ThemeMode):CanvasMode { const saved=localStorage.getItem(CANVAS_MODE_KEY); return saved==='dark-grid'||saved==='light-grid'||saved==='solid'?saved:(theme==='light'?'light-grid':'dark-grid') }

function clampNavigationWidth(value: number) {
  const max = Math.max(MIN_NAVIGATION_WIDTH, window.innerWidth - MIN_WORKSPACE_WIDTH)
  return Math.min(Math.max(value, MIN_NAVIGATION_WIDTH), max)
}

function getInitialNavigationWidth() {
  const saved = Number.parseInt(localStorage.getItem(NAVIGATION_WIDTH_KEY) ?? '', 10)
  return clampNavigationWidth(Number.isFinite(saved) ? saved : DEFAULT_NAVIGATION_WIDTH)
}

export default function App() {
  const {t,locale}=useDesignLabI18n()
  const [theme,setTheme]=useState<ThemeMode>(getInitialTheme)
  const [canvasMode,setCanvasMode]=useState<CanvasMode>(()=>getInitialCanvasMode(getInitialTheme()))
  const [canvasColor,setCanvasColor]=useState(localStorage.getItem(CANVAS_COLOR_KEY)??'#264653')
  const [active, setActive] = useState<ModuleId>(initialRoute.module)
  const [routePath, setRoutePath] = useState(initialRoute.path)
  const [navigationWidth, setNavigationWidth] = useState(getInitialNavigationWidth)
  const [isResizing, setIsResizing] = useState(false)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProjectId, setActiveProjectId] = useState(localStorage.getItem(ACTIVE_PROJECT_KEY) ?? '')
  const [tree, setTree] = useState<ProjectTreeItem[]>([])
  const [treeLoading, setTreeLoading] = useState(false)
  const [moduleData, setModuleData] = useState<ModuleData | null>(null)
  const [moduleLoading, setModuleLoading] = useState(false)
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)
  const [selectedFolderPath, setSelectedFolderPath] = useState(ALL_FOLDER_PATH)
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [projectCreating, setProjectCreating] = useState(false)
  const [projectError, setProjectError] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const maxNavigationWidth = Math.max(MIN_NAVIGATION_WIDTH, window.innerWidth - MIN_WORKSPACE_WIDTH)
  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null
  const directoryTree: ProjectTreeItem[] = ['components','assets','tokens'].includes(active)
    ? [{name:'All',path:ALL_FOLDER_PATH,kind:'folder',level:0,virtual:true},...tree]
    : tree
  const labels = Object.fromEntries(Object.entries(moduleMessageKeys).map(([key,message])=>[key,t(message)])) as Record<ModuleId,string>

  useEffect(()=>{ document.documentElement.dataset.theme=theme; localStorage.setItem(THEME_KEY,theme) },[theme])
  useEffect(()=>{ document.documentElement.lang=locale },[locale])
  useEffect(()=>{ localStorage.setItem(CANVAS_MODE_KEY,canvasMode); localStorage.setItem(CANVAS_COLOR_KEY,canvasColor) },[canvasMode,canvasColor])

  const navigate = (module: ModuleId, path = '', replace = false) => {
    const href = appRouteHref(module, path)
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== href) {
      window.history[replace ? 'replaceState' : 'pushState'](null, '', href)
    }
    setActive(module)
    setRoutePath(path)
  }

  useEffect(() => {
    const restoreRoute = () => {
      const route = readAppRoute()
      setActive(route.module)
      setRoutePath(route.path)
    }
    window.addEventListener('popstate', restoreRoute)
    return () => window.removeEventListener('popstate', restoreRoute)
  }, [])

  useEffect(() => {
    listProjects().then((result) => {
      setProjects(result.projects)
      const saved = result.projects.find((project) => project.id === activeProjectId && project.available)
      const next = saved ?? result.projects.find((project) => project.available) ?? null
      if (next) setActiveProjectId(next.id)
      else setProjectDialogOpen(true)
    }).catch((error: Error) => setProjectError(error.message))
  }, [])

  useEffect(() => {
    if (!activeProjectId) { setTree([]); return }
    localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId)
    setTree([])
    setTreeLoading(true)
    getProjectTree(activeProjectId, active)
      .then((result) => setTree(result.tree))
      .catch(() => setTree([]))
      .finally(() => setTreeLoading(false))
    setModuleLoading(true)
    getModuleData(activeProjectId, active).then(setModuleData).catch(() => setModuleData(null)).finally(() => setModuleLoading(false))
  }, [active, activeProjectId])

  useEffect(() => {
    if (treeLoading) return
    if (!routePath) {
      setSelectedEntityId(null)
      setSelectedFolderPath(ALL_FOLDER_PATH)
      return
    }
    const item = findRouteTreeItem(tree, routePath)
    if (!item) {
      setSelectedEntityId(null)
      setSelectedFolderPath(ALL_FOLDER_PATH)
      return
    }
    const canonicalPath = treeItemRoutePath(item)
    if (item.kind === 'folder') {
      setSelectedFolderPath(item.virtual ? ALL_FOLDER_PATH : item.path)
      setSelectedEntityId(null)
    } else {
      setSelectedEntityId(item.id ?? null)
      const parentPath = canonicalPath.split('/').slice(0, -1).join('/')
      setSelectedFolderPath(parentPath || ALL_FOLDER_PATH)
    }
    if (canonicalPath !== routePath) navigate(active, canonicalPath, true)
  }, [active, routePath, tree, treeLoading])

  useEffect(() => {
    localStorage.setItem(NAVIGATION_WIDTH_KEY, String(navigationWidth))
  }, [navigationWidth])

  useEffect(() => {
    const keepWidthInBounds = () => setNavigationWidth((width) => clampNavigationWidth(width))
    window.addEventListener('resize', keepWidthInBounds)
    return () => window.removeEventListener('resize', keepWidthInBounds)
  }, [])

  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    const startX = event.clientX
    const startWidth = navigationWidth
    setIsResizing(true)
    document.body.classList.add('is-resizing-navigation')

    const resize = (moveEvent: PointerEvent) => {
      setNavigationWidth(clampNavigationWidth(startWidth + moveEvent.clientX - startX))
    }
    const stopResize = () => {
      setIsResizing(false)
      document.body.classList.remove('is-resizing-navigation')
      window.removeEventListener('pointermove', resize)
      window.removeEventListener('pointerup', stopResize)
      window.removeEventListener('pointercancel', stopResize)
    }

    window.addEventListener('pointermove', resize)
    window.addEventListener('pointerup', stopResize)
    window.addEventListener('pointercancel', stopResize)
  }

  const resizeWithKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const direction = event.key === 'ArrowLeft' ? -1 : 1
    setNavigationWidth((width) => clampNavigationWidth(width + direction * 12))
  }

  const handleCreateProject = async (input: { name: string }) => {
    setProjectCreating(true)
    setProjectError(null)
    try {
      const result = await createProject(input)
      setProjects((current) => [...current, result.project])
      setActiveProjectId(result.project.id)
      setProjectDialogOpen(false)
    } catch (error) {
      setProjectError(error instanceof Error ? error.message : 'Could not create the project')
    } finally {
      setProjectCreating(false)
    }
  }

  const changeTheme=(next:ThemeMode)=>{ setTheme(next); setCanvasMode(next==='light'?'light-grid':'dark-grid') }

  return (
    <main
      className={`design-lab${isResizing ? ' design-lab--resizing' : ''}${sidebarHovered ? ' design-lab--sidebar-expanded' : ''}`}
      style={{ '--navigation-width': `${navigationWidth}px` } as CSSProperties}
    >
      <AppSidebar
        active={active}
        settingsActive={settingsOpen}
        onChange={(module) => { setSettingsOpen(false); navigate(module) }}
        onSettings={() => setSettingsOpen(true)}
        onExpandedChange={setSidebarHovered}
      />
      <DirectoryPanel
        isResizing={isResizing}
        navigationWidth={navigationWidth}
        minNavigationWidth={MIN_NAVIGATION_WIDTH}
        maxNavigationWidth={maxNavigationWidth}
        onResizeStart={startResize}
        onResizeKeyDown={resizeWithKeyboard}
        projects={projects}
        activeProject={activeProject}
        activeModuleLabel={labels[active]}
        tree={directoryTree}
        treeLoading={treeLoading}
        onProjectChange={(projectId) => {
          setActiveProjectId(projectId)
          navigate(active)
        }}
        onCreateProject={() => { setProjectError(null); setProjectDialogOpen(true) }}
        selectedEntityId={selectedEntityId}
        selectedFolderPath={selectedFolderPath}
        onTreeItemSelect={(item) => {
          if (item.kind === 'folder') {
            navigate(active, treeItemRoutePath(item))
          } else {
            navigate(active, treeItemRoutePath(item))
          }
        }}
      />
      <section className="workspace-canvas">
        <header className="workspace-header">
          <div className="workspace-header__title">
            <span>Design Lab</span>
            <b>/</b>
            <strong>{settingsOpen ? 'Settings' : labels[active]}</strong>
          </div>
          <div className="workspace-header__actions">
            <TabSwitcher
              ariaLabel="Interface theme"
              variant="toggle"
              size="small"
              options={[
                {value:'light',label:'☼',accessibleLabel:t('theme.light')},
                {value:'dark',label:'◐',accessibleLabel:t('theme.dark')},
              ] as const}
              value={theme}
              onChange={changeTheme}
            />
            <IconButton type="button" aria-label={t('action.copyLink')} onClick={() => navigator.clipboard.writeText(window.location.href)}><LinkIcon size={18} /></IconButton>
            <IconButton type="button" aria-label={t('action.openCode')}><CodeIcon size={18} /></IconButton>
          </div>
        </header>

        <div className="workspace-stage">
          {settingsOpen ? <SettingsView onClose={() => setSettingsOpen(false)} /> : activeProject && ['tokens', 'palette', 'fonts', 'components', 'assets'].includes(active) ? <ModuleView data={moduleData} loading={moduleLoading} sourceId={activeProject.id} selectedEntityId={selectedEntityId} selectedFolderPath={selectedFolderPath} onSelectEntity={(id) => {
            if (!id) {
              navigate(active, selectedFolderPath === ALL_FOLDER_PATH ? '' : selectedFolderPath)
              return
            }
            const item = tree.find((candidate) => candidate.id === id)
            if (item) navigate(active, treeItemRoutePath(item))
          }} interfaceTheme={theme} canvasMode={canvasMode} canvasColor={canvasColor} onCanvasModeChange={setCanvasMode} onCanvasColorChange={setCanvasColor} /> : <div className="workspace-stage__empty">
            <StarIcon size={22} />
            <h1>{activeProject ? labels[active] : t('empty.createFirst')}</h1>
            <p>{activeProject ? t('empty.moduleDescription') : t('empty.projectDescription')}</p>
            {!activeProject && <Button type="button" variant="primary" className="workspace-stage__action" onClick={() => setProjectDialogOpen(true)}>{t('action.create')}</Button>}
          </div>}
        </div>
      </section>
      <CreateProjectDialog
        open={projectDialogOpen}
        busy={projectCreating}
        error={projectError}
        canClose={projects.length > 0}
        onClose={() => setProjectDialogOpen(false)}
        onCreate={handleCreateProject}
      />
    </main>
  )
}
