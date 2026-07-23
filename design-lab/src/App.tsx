import './App.scss'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  AppSidebar,
  CreateProjectDialog,
  DirectoryPanel,
  TabSwitcher,
  WorkspaceHeader,
  WorkspaceStage,
  type CanvasMode,
  type ModuleId,
} from '@design-lab/system/components'
import { useDesignLabI18n, type MessageKey } from '@design-lab/system/i18n'
import { ModuleView } from './views/ModuleView/ModuleView'
import { ComponentPlaygroundView } from './views/ComponentPlaygroundView/ComponentPlaygroundView'
import { SettingsView } from './views/SettingsView/SettingsView'
import { WireframeView } from './views/WireframeView/WireframeView'
import { PageView } from './views/PageView/PageView'
import { Button, IconButton } from '@design-lab/system/components'
import {
  CodeIcon,
  DarkThemeIcon,
  DirectoryIcon,
  LightThemeIcon,
  LinkIcon,
  StarIcon,
} from '@design-lab/system/icons'
import {
  createProject,
  getModuleData,
  getProjectTree,
  listProjects,
  type ModuleData,
  type Project,
  type ProjectTreeItem,
} from './api/projects'
import { appRouteHref, findRouteTreeItem, readAppRoute, treeItemRoutePath } from './navigation'
import { ErrorBoundary } from './ErrorBoundary'

const moduleMessageKeys: Record<ModuleId, MessageKey> = {
  home: 'module.home',
  components: 'module.components',
  wireframes: 'module.wireframes',
  pages: 'module.pages',
  assets: 'module.assets',
  palette: 'module.palette',
  tokens: 'module.tokens',
  fonts: 'module.fonts',
}

function crashFallback(surface: string, reset: () => void, goBack: () => void) {
  return (
    <main className="component-playground-missing">
      <span>{surface} hit an unexpected error and could not render.</span>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          variant="secondary"
          onClick={() => {
            goBack()
            reset()
          }}
        >
          Go back
        </Button>
        <Button variant="ghost" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  )
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
const MOBILE_LAYOUT_QUERY = '(max-width: 760px)'
type ThemeMode = 'dark' | 'light'
type DesignLabHistoryState = {
  designLab: true
  canGoBack: boolean
}
const initialRoute = readAppRoute()

function getInitialTheme(): ThemeMode {
  return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'
}
function getInitialCanvasMode(theme: ThemeMode): CanvasMode {
  const saved = localStorage.getItem(CANVAS_MODE_KEY)
  return saved === 'dark-grid' || saved === 'light-grid' || saved === 'solid'
    ? saved
    : theme === 'light'
      ? 'light-grid'
      : 'dark-grid'
}

function clampNavigationWidth(value: number) {
  const max = Math.max(MIN_NAVIGATION_WIDTH, window.innerWidth - MIN_WORKSPACE_WIDTH)
  return Math.min(Math.max(value, MIN_NAVIGATION_WIDTH), max)
}

function getInitialNavigationWidth() {
  const saved = Number.parseInt(localStorage.getItem(NAVIGATION_WIDTH_KEY) ?? '', 10)
  return clampNavigationWidth(Number.isFinite(saved) ? saved : DEFAULT_NAVIGATION_WIDTH)
}

export default function App() {
  const { t, locale } = useDesignLabI18n()
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)
  const [canvasMode, setCanvasMode] = useState<CanvasMode>(() =>
    getInitialCanvasMode(getInitialTheme()),
  )
  const [canvasColor, setCanvasColor] = useState(
    localStorage.getItem(CANVAS_COLOR_KEY) ?? '#264653',
  )
  const [active, setActive] = useState<ModuleId>(initialRoute.module)
  const [routePath, setRoutePath] = useState(initialRoute.path)
  const [routeSourceId, setRouteSourceId] = useState(initialRoute.sourceId)
  const [navigationWidth, setNavigationWidth] = useState(getInitialNavigationWidth)
  const [isResizing, setIsResizing] = useState(false)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProjectId, setActiveProjectId] = useState(
    localStorage.getItem(ACTIVE_PROJECT_KEY) ?? '',
  )
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
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)
  const [isMobileLayout, setIsMobileLayout] = useState(
    () => window.matchMedia(MOBILE_LAYOUT_QUERY).matches,
  )
  const wasMobileNavigationOpen = useRef(false)
  const maxNavigationWidth = Math.max(MIN_NAVIGATION_WIDTH, window.innerWidth - MIN_WORKSPACE_WIDTH)
  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null
  const playgroundOpen = active === 'components' && routePath.endsWith('/playground')
  // See the `mirroredReviewPage` comment above: prefer the authored production route over the
  // filesystem path whenever it is safe to mirror. A folder at the same path always wins — e.g.
  // `pages/account/` must open the folder catalog, not the Account Page whose mirroredRoute is
  // `/account`.
  const folderAtRoutePath = tree.some(
    (item) => item.kind === 'folder' && !item.virtual && item.path === routePath,
  )
  const mirroredReviewPage =
    active === 'pages' && moduleData?.kind === 'pages' && !folderAtRoutePath
      ? moduleData.pages.find(
          (item) =>
            item.mirroredRoute &&
            item.mirroredRoute !== '/' &&
            routePath === item.mirroredRoute.replace(/^\//, ''),
        )
      : undefined
  const pageReviewOpen =
    active === 'pages' && (routePath.endsWith('/review') || Boolean(mirroredReviewPage))
  const wireframeRouteRequested = active === 'wireframes' && Boolean(routePath)
  const wireframeTreeItem = wireframeRouteRequested ? findRouteTreeItem(tree, routePath) : undefined
  const wireframeOpen =
    wireframeRouteRequested &&
    (wireframeTreeItem?.kind === 'wireframe' ||
      (moduleData?.kind === 'wireframes' &&
        moduleData.wireframes.some((wireframe) => wireframe.directory === routePath)))
  const waitingForRouteSource = Boolean(routeSourceId) && activeProjectId !== routeSourceId
  const entityRoutePath = playgroundOpen
    ? routePath.replace(/\/playground$/, '')
    : pageReviewOpen
      ? mirroredReviewPage
        ? mirroredReviewPage.directory
        : routePath.replace(/\/review$/, '')
      : routePath
  const directoryTree: ProjectTreeItem[] = [
    'components',
    'assets',
    'tokens',
    'wireframes',
    'pages',
  ].includes(active)
    ? [{ name: 'All', path: ALL_FOLDER_PATH, kind: 'folder', level: 0, virtual: true }, ...tree]
    : tree
  const labels = Object.fromEntries(
    Object.entries(moduleMessageKeys).map(([key, message]) => [key, t(message)]),
  ) as Record<ModuleId, string>

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  useEffect(() => {
    localStorage.setItem(CANVAS_MODE_KEY, canvasMode)
    localStorage.setItem(CANVAS_COLOR_KEY, canvasColor)
  }, [canvasMode, canvasColor])

  // sourceId defaults to the currently active source so most call sites stay untouched; an
  // explicit override is only needed when the source itself is changing in the same navigation
  // (e.g. switching Project/Library), since activeProjectId state has not re-rendered yet there.
  const navigate = (
    module: ModuleId,
    path = '',
    options: { replace?: boolean; sourceId?: string } = {},
  ) => {
    const effectiveSourceId = options.sourceId ?? activeProjectId
    const href = appRouteHref(module, effectiveSourceId, path)
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== href) {
      const currentState = window.history.state as DesignLabHistoryState | null
      const state: DesignLabHistoryState = options.replace
        ? currentState?.designLab
          ? currentState
          : { designLab: true, canGoBack: false }
        : { designLab: true, canGoBack: true }
      window.history[options.replace ? 'replaceState' : 'pushState'](state, '', href)
    }
    setActive(module)
    setRoutePath(path)
    setRouteSourceId(effectiveSourceId)
  }

  // See the `mirroredReviewPage` comment above: prefer the authored production route over the
  // filesystem path whenever it is safe to mirror.
  const pageReviewPath = (page: { directory: string; mirroredRoute: string | null }) =>
    page.mirroredRoute && page.mirroredRoute !== '/'
      ? page.mirroredRoute.replace(/^\//, '')
      : `${page.directory}/review`

  useEffect(() => {
    if ((window.history.state as DesignLabHistoryState | null)?.designLab) return
    window.history.replaceState(
      { designLab: true, canGoBack: false } satisfies DesignLabHistoryState,
      '',
      window.location.href,
    )
  }, [])

  useEffect(() => {
    const restoreRoute = () => {
      const route = readAppRoute()
      setActive(route.module)
      setRoutePath(route.path)
      setRouteSourceId(route.sourceId)
      const target = projects.find((project) => project.id === route.sourceId && project.available)
      if (target && target.id !== activeProjectId) setActiveProjectId(target.id)
    }
    window.addEventListener('popstate', restoreRoute)
    return () => window.removeEventListener('popstate', restoreRoute)
  }, [projects, activeProjectId])

  useEffect(() => {
    listProjects()
      .then((result) => {
        setProjects(result.projects)
        const requested = result.projects.find(
          (project) => project.id === routeSourceId && project.available,
        )
        const saved = result.projects.find(
          (project) => project.id === activeProjectId && project.available,
        )
        const next =
          requested ?? saved ?? result.projects.find((project) => project.available) ?? null
        if (next) setActiveProjectId(next.id)
        else setProjectDialogOpen(true)
      })
      .catch((error: Error) => setProjectError(error.message))
    // Intentionally runs once on mount: routeSourceId/activeProjectId are only read here to pick
    // the initial active source, not to re-trigger a project list refetch on every route change.
  }, [])

  // Any direct setActiveProjectId that did not go through navigate() (initial resolution above,
  // project creation, popstate restoring a different source) still needs the URL to end up
  // carrying the resolved source id, so a freshly opened deep link becomes canonical and shareable.
  useEffect(() => {
    if (!activeProjectId || activeProjectId === routeSourceId) return
    setRouteSourceId(activeProjectId)
    const href = appRouteHref(active, activeProjectId, routePath)
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== href)
      window.history.replaceState(window.history.state, '', href)
  }, [active, activeProjectId, routePath, routeSourceId])

  useEffect(() => {
    if (!activeProjectId) {
      setTree([])
      return
    }
    localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId)
    setTree([])
    setTreeLoading(true)
    getProjectTree(activeProjectId, active)
      .then((result) => setTree(result.tree))
      .catch(() => setTree([]))
      .finally(() => setTreeLoading(false))
    setModuleLoading(true)
    getModuleData(activeProjectId, active)
      .then(setModuleData)
      .catch(() => setModuleData(null))
      .finally(() => setModuleLoading(false))
  }, [active, activeProjectId])

  useEffect(() => {
    if (treeLoading) return
    if (!entityRoutePath) {
      setSelectedEntityId(null)
      setSelectedFolderPath(ALL_FOLDER_PATH)
      return
    }
    const item = findRouteTreeItem(tree, entityRoutePath)
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
    if (canonicalPath !== entityRoutePath)
      navigate(
        active,
        playgroundOpen
          ? `${canonicalPath}/playground`
          : pageReviewOpen
            ? pageReviewPath({
                directory: canonicalPath,
                mirroredRoute:
                  (moduleData?.kind === 'pages' &&
                    moduleData.pages.find((page) => page.directory === canonicalPath)
                      ?.mirroredRoute) ||
                  null,
              })
            : canonicalPath,
        { replace: true },
      )
  }, [active, entityRoutePath, moduleData, pageReviewOpen, playgroundOpen, tree, treeLoading])

  useEffect(() => {
    localStorage.setItem(NAVIGATION_WIDTH_KEY, String(navigationWidth))
  }, [navigationWidth])

  useEffect(() => {
    const keepWidthInBounds = () => setNavigationWidth((width) => clampNavigationWidth(width))
    window.addEventListener('resize', keepWidthInBounds)
    return () => window.removeEventListener('resize', keepWidthInBounds)
  }, [])

  useEffect(() => {
    const media = window.matchMedia(MOBILE_LAYOUT_QUERY)
    const updateLayout = () => {
      setIsMobileLayout(media.matches)
      if (!media.matches) setMobileNavigationOpen(false)
    }
    updateLayout()
    media.addEventListener('change', updateLayout)
    return () => media.removeEventListener('change', updateLayout)
  }, [])

  useEffect(() => {
    if (mobileNavigationOpen) {
      window.requestAnimationFrame(() => {
        document.getElementById('design-lab-navigation-close')?.focus()
      })
    } else if (wasMobileNavigationOpen.current) {
      document.getElementById('design-lab-navigation-trigger')?.focus()
    }
    wasMobileNavigationOpen.current = mobileNavigationOpen
  }, [mobileNavigationOpen])

  useEffect(() => {
    if (!mobileNavigationOpen) return
    const containNavigationFocus = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileNavigationOpen(false)
        return
      }
      if (event.key !== 'Tab') return
      const navigation = document.getElementById('design-lab-navigation')
      const focusable = [
        ...(navigation?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? []),
      ].filter((element) => element.offsetParent !== null)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', containNavigationFocus)
    return () => window.removeEventListener('keydown', containNavigationFocus)
  }, [mobileNavigationOpen])

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

  const changeTheme = (next: ThemeMode) => {
    setTheme(next)
    setCanvasMode(next === 'light' ? 'light-grid' : 'dark-grid')
  }

  if (playgroundOpen) {
    const component =
      moduleData?.kind === 'components'
        ? moduleData.components.find((item) => item.directory === entityRoutePath)
        : null
    if (component && moduleData?.kind === 'components')
      return (
        <ErrorBoundary
          fallback={(_error, reset) =>
            crashFallback('Playground', reset, () => navigate('components'))
          }
        >
          <ComponentPlaygroundView
            component={component}
            data={moduleData}
            canvasMode={canvasMode}
            canvasColor={canvasColor}
            onCanvasModeChange={setCanvasMode}
            onCanvasColorChange={setCanvasColor}
            onClose={() => navigate('components', entityRoutePath)}
          />
        </ErrorBoundary>
      )
    return (
      <main className="component-playground-missing">
        <span>
          {moduleLoading || waitingForRouteSource
            ? t('status.loading')
            : 'Playground could not be loaded.'}
        </span>
        {!moduleLoading && !waitingForRouteSource && (
          <Button variant="secondary" onClick={() => navigate('components')}>
            Back to Components
          </Button>
        )}
      </main>
    )
  }

  if (pageReviewOpen) {
    const page =
      mirroredReviewPage ??
      (moduleData?.kind === 'pages'
        ? moduleData.pages.find((item) => item.directory === entityRoutePath)
        : null)
    if (page && moduleData?.kind === 'pages')
      return (
        <ErrorBoundary
          key={page.id}
          fallback={(_error, reset) =>
            crashFallback('Page review', reset, () => navigate('pages', page.directory))
          }
        >
          <PageView
            // A cross-Page action can replace `page` while this view stays mounted at the same
            // tree position; without a key React would reuse the fiber and keep stale internal
            // state (and stale hook counts from whatever the previous Page's renderer called),
            // which is exactly what produced a permanently blank root after one cross-Page click.
            key={page.id}
            page={page}
            pages={moduleData.pages}
            sourceId={activeProjectId}
            modes={moduleData.modes}
            themeVariables={moduleData.themeVariables}
            onClose={() => navigate('pages', page.directory)}
            onNavigateToPage={(pageId) => {
              const target = moduleData.pages.find((item) => item.id === pageId)
              if (target) navigate('pages', pageReviewPath(target))
            }}
          />
        </ErrorBoundary>
      )
    return (
      <main className="component-playground-missing">
        <span>
          {moduleLoading || waitingForRouteSource
            ? t('status.loading')
            : 'Page could not be loaded.'}
        </span>
        {!moduleLoading && !waitingForRouteSource && (
          <Button variant="secondary" onClick={() => navigate('pages')}>
            Back to Pages
          </Button>
        )}
      </main>
    )
  }

  if (wireframeOpen) {
    const wireframe =
      moduleData?.kind === 'wireframes'
        ? moduleData.wireframes.find((item) => item.directory === entityRoutePath)
        : null
    if (wireframe && moduleData?.kind === 'wireframes')
      return (
        <ErrorBoundary
          key={wireframe.id}
          fallback={(_error, reset) =>
            crashFallback('Wireframe', reset, () => navigate('wireframes'))
          }
        >
          <WireframeView
            key={wireframe.id}
            wireframe={wireframe}
            sourceId={activeProjectId}
            modes={moduleData.modes}
            themeVariables={moduleData.themeVariables}
            onClose={() => navigate('wireframes')}
          />
        </ErrorBoundary>
      )
    return (
      <main className="component-playground-missing">
        <span>
          {moduleLoading || waitingForRouteSource
            ? t('status.loading')
            : 'Wireframe could not be loaded.'}
        </span>
        {!moduleLoading && !waitingForRouteSource && (
          <Button variant="secondary" onClick={() => navigate('wireframes')}>
            Back to Wireframes
          </Button>
        )}
      </main>
    )
  }

  return (
    <main
      className={`design-lab${isResizing ? ' design-lab--resizing' : ''}${sidebarHovered ? ' design-lab--sidebar-expanded' : ''}${mobileNavigationOpen ? ' design-lab--mobile-navigation-open' : ''}`}
      style={{ '--navigation-width': `${navigationWidth}px` } as CSSProperties}
    >
      <div
        className="navigation-shell"
        id="design-lab-navigation"
        aria-hidden={isMobileLayout && !mobileNavigationOpen}
        inert={isMobileLayout && !mobileNavigationOpen ? true : undefined}
      >
        <header className="navigation-shell__mobile-header">
          <strong>Browse Design Lab</strong>
          <button
            type="button"
            id="design-lab-navigation-close"
            onClick={() => setMobileNavigationOpen(false)}
          >
            Close
          </button>
        </header>
        <div className="navigation-shell__panes">
          <AppSidebar
            active={active}
            settingsActive={settingsOpen}
            onChange={(module) => {
              setSettingsOpen(false)
              setMobileNavigationOpen(false)
              navigate(module)
            }}
            onSettings={() => {
              setSettingsOpen(true)
              setMobileNavigationOpen(false)
            }}
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
              setMobileNavigationOpen(false)
              navigate(active, '', { sourceId: projectId })
            }}
            onCreateProject={() => {
              setProjectError(null)
              setMobileNavigationOpen(false)
              setProjectDialogOpen(true)
            }}
            selectedEntityId={selectedEntityId}
            selectedFolderPath={selectedFolderPath}
            onTreeItemSelect={(item) => {
              setMobileNavigationOpen(false)
              navigate(active, treeItemRoutePath(item))
            }}
          />
        </div>
      </div>
      <button
        type="button"
        className="navigation-scrim"
        aria-label="Close navigation"
        aria-hidden={!mobileNavigationOpen}
        tabIndex={mobileNavigationOpen ? 0 : -1}
        onClick={() => setMobileNavigationOpen(false)}
      />
      <section
        className="workspace-canvas"
        aria-hidden={isMobileLayout && mobileNavigationOpen}
        inert={isMobileLayout && mobileNavigationOpen ? true : undefined}
      >
        <WorkspaceHeader
          productName="Design Lab"
          sectionName={settingsOpen ? 'Settings' : labels[active]}
          navigation={
            <IconButton
              type="button"
              id="design-lab-navigation-trigger"
              aria-label="Open navigation"
              aria-controls="design-lab-navigation"
              aria-expanded={mobileNavigationOpen}
              onClick={() => setMobileNavigationOpen(true)}
            >
              <DirectoryIcon size={20} />
            </IconButton>
          }
          actions={
            <>
              <TabSwitcher
                ariaLabel="Interface theme"
                variant="toggle"
                size="small"
                iconSize={12}
                options={
                  [
                    {
                      value: 'light',
                      icon: <LightThemeIcon />,
                      accessibleLabel: t('theme.light'),
                    },
                    {
                      value: 'dark',
                      icon: <DarkThemeIcon />,
                      accessibleLabel: t('theme.dark'),
                    },
                  ] as const
                }
                value={theme}
                onChange={changeTheme}
              />
              <IconButton
                type="button"
                aria-label={t('action.copyLink')}
                onClick={() => navigator.clipboard.writeText(window.location.href)}
              >
                <LinkIcon size={18} />
              </IconButton>
              <IconButton type="button" aria-label={t('action.openCode')}>
                <CodeIcon size={18} />
              </IconButton>
            </>
          }
        />

        <WorkspaceStage>
          {settingsOpen ? (
            <SettingsView onClose={() => setSettingsOpen(false)} />
          ) : activeProject &&
            ['tokens', 'palette', 'fonts', 'components', 'assets', 'wireframes', 'pages'].includes(
              active,
            ) ? (
            <ModuleView
              data={moduleData}
              loading={moduleLoading}
              sourceId={activeProject.id}
              selectedEntityId={selectedEntityId}
              selectedFolderPath={selectedFolderPath}
              onBack={() => {
                const state = window.history.state as DesignLabHistoryState | null
                if (state?.designLab && state.canGoBack) {
                  window.history.back()
                  return
                }
                navigate(active)
              }}
              onSelectEntity={(id) => {
                if (!id) {
                  navigate(active, selectedFolderPath === ALL_FOLDER_PATH ? '' : selectedFolderPath)
                  return
                }
                const item = tree.find((candidate) => candidate.id === id)
                if (item) navigate(active, treeItemRoutePath(item))
              }}
              interfaceTheme={theme}
              canvasMode={canvasMode}
              canvasColor={canvasColor}
              onCanvasModeChange={setCanvasMode}
              onCanvasColorChange={setCanvasColor}
              onOpenPlayground={() => {
                if (entityRoutePath) navigate('components', `${entityRoutePath}/playground`)
              }}
              onOpenPageReview={() => {
                const page =
                  moduleData?.kind === 'pages'
                    ? moduleData.pages.find((item) => item.directory === entityRoutePath)
                    : null
                if (page) navigate('pages', pageReviewPath(page))
              }}
              onNavigateToPage={(pageId) => {
                const page =
                  moduleData?.kind === 'pages'
                    ? moduleData.pages.find((item) => item.id === pageId)
                    : null
                if (page) navigate('pages', pageReviewPath(page))
              }}
            />
          ) : (
            <div className="workspace-stage__empty">
              <StarIcon size={22} />
              <h1>{activeProject ? labels[active] : t('empty.createFirst')}</h1>
              <p>{activeProject ? t('empty.moduleDescription') : t('empty.projectDescription')}</p>
              {!activeProject && (
                <Button
                  type="button"
                  variant="primary"
                  className="workspace-stage__action"
                  onClick={() => setProjectDialogOpen(true)}
                >
                  {t('action.create')}
                </Button>
              )}
            </div>
          )}
        </WorkspaceStage>
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
