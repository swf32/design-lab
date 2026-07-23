import './PageView.scss'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  Button,
  Checkbox,
  Chip,
  RadioButton,
  Slider,
  TabSwitcher,
  UserFlowCanvas,
  USER_FLOW_NODE_GAP,
  USER_FLOW_NODE_WIDTH,
  WireframeDevPanel,
  WorkbenchInspector,
  type UserFlowCanvasEdge,
  type UserFlowCanvasNode,
  type UserFlowCanvasViewState,
} from '@design-lab/system/components'
import { ArrowLeftIcon, LinkIcon } from '@design-lab/system/icons'
import type { PageAction, WireframeValues } from '@design-lab/system/pages'
import type { ModuleData } from '../../api/projects'
import { designSystemModeStyle } from '../../designSystemMode'
import {
  clearFlowActionHighlight,
  highlightFlowActionTarget,
  resolveFlowActionTarget,
  useFlowActionCapture,
} from '../../hooks/useFlowActionCapture'
import { useFlowLayoutAutosave } from '../../hooks/useFlowLayoutAutosave'
import { pageRendererFor } from '../../pages/registry'

type PageEntity = Extract<ModuleData, { kind: 'pages' }>['pages'][number]
type PageViewMode = 'screen' | 'flow'

function parseControlValue(
  value: string,
  control: PageEntity['controls'][number],
): string | number | boolean {
  if (control.kind === 'boolean') return value === 'true'
  if (control.kind === 'range') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : control.min
  }
  return value
}

function parseStateValue(value: string, sample: unknown) {
  if (typeof sample === 'boolean') return value === 'true'
  if (typeof sample === 'number') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : sample
  }
  return value
}

function valuesMatch(candidate: WireframeValues, state: PageEntity['states'][number]) {
  return Object.entries(state.values).every(([id, value]) => candidate[id] === value)
}

function initialContext(page: PageEntity, modes: string[]) {
  const search = new URLSearchParams(window.location.search)
  const requestedState = search.get('state')
  const state =
    page.states.find((item) => item.id === requestedState) ??
    page.states.find((item) => item.id === page.defaultState) ??
    page.states[0]
  const values = { ...(state?.values ?? {}) }
  for (const control of page.controls) {
    const serialized = search.get(`control.${control.id}`)
    if (serialized != null) values[control.id] = parseControlValue(serialized, control)
  }
  for (const [id, sample] of Object.entries(state?.values ?? {})) {
    const serialized = search.get(`value.${id}`)
    if (serialized != null) values[id] = parseStateValue(serialized, sample)
  }
  const matchedState = page.states.find((item) => valuesMatch(values, item))
  const view: PageViewMode = search.get('view') === 'flow' ? 'flow' : 'screen'
  const requestedMode = search.get('mode')
  const mode =
    requestedMode && modes.includes(requestedMode) ? requestedMode : (modes[0] ?? 'default')
  const node =
    page.flow.nodes.find((item) => item.state === matchedState?.id) ?? page.flow.nodes[0] ?? null
  return {
    stateId: matchedState?.id ?? null,
    values,
    view,
    mode,
    selectedNodeId: node?.id ?? null,
  }
}

// A cross-Page edge has no node of its own on this Page's flow, so it is represented on the
// Canvas as a synthetic "exit" node (PAGE_RULES.md "Sitemap"). Reusing the target Page's own
// renderer for its default state gives the reviewer a real preview of where the action leads.
function exitNodeId(pageId: string) {
  return `page-exit:${pageId}`
}

export function PageView({
  page,
  pages,
  sourceId,
  modes,
  themeVariables,
  onClose,
  onNavigateToPage,
}: {
  page: PageEntity
  pages: PageEntity[]
  sourceId: string
  modes: string[]
  themeVariables: Extract<ModuleData, { kind: 'pages' }>['themeVariables']
  onClose: () => void
  onNavigateToPage: (pageId: string) => void
}) {
  const availableModes = useMemo(() => (modes.length ? modes : ['default']), [modes])
  const initial = useMemo(() => initialContext(page, availableModes), [page, availableModes])
  const [stateId, setStateId] = useState<string | null>(initial.stateId)
  const [values, setValues] = useState<WireframeValues>(initial.values)
  const [view, setView] = useState<PageViewMode>(initial.view)
  const [mode, setMode] = useState(initial.mode)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initial.selectedNodeId)
  const [flowViewState, setFlowViewState] = useState<UserFlowCanvasViewState | undefined>(undefined)
  const [devModeOpen, setDevModeOpen] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [activeFlowActionId, setActiveFlowActionId] = useState<string | null>(null)
  const [normalizedLayout, setNormalizedLayout] = useState<
    Array<{ id: string; x: number; y: number }>
  >([])
  const stageRef = useRef<HTMLElement>(null)
  const clickTargetRef = useFlowActionCapture(stageRef)
  const renderer = pageRendererFor(page)
  const currentState = page.states.find((state) => state.id === stateId) ?? null
  const modeStyle = useMemo(
    () => designSystemModeStyle(themeVariables, mode),
    [mode, themeVariables],
  )

  useEffect(() => {
    if (!availableModes.includes(mode)) setMode(availableModes[0])
  }, [availableModes, mode])

  useEffect(() => {
    const search = new URLSearchParams()
    search.set('view', view)
    search.set('mode', mode)
    search.set('state', stateId ?? 'custom')
    for (const [id, value] of Object.entries(values)) search.set(`value.${id}`, String(value))
    const next = `${window.location.pathname}?${search.toString()}`
    if (`${window.location.pathname}${window.location.search}` !== next)
      window.history.replaceState(window.history.state, '', next)
  }, [mode, stateId, values, view])

  const selectState = (nextStateId: string) => {
    const state = page.states.find((item) => item.id === nextStateId)
    if (!state) return
    setStateId(state.id)
    setValues({ ...state.values })
    const node = page.flow.nodes.find((item) => item.state === state.id)
    if (node) setSelectedNodeId(node.id)
  }

  const applyValues = (nextValues: WireframeValues) => {
    const matched = page.states.find((state) => valuesMatch(nextValues, state))
    setValues(nextValues)
    setStateId(matched?.id ?? null)
    if (matched) {
      const node = page.flow.nodes.find((item) => item.state === matched.id)
      if (node) setSelectedNodeId(node.id)
    }
  }

  useEffect(() => {
    if (view !== 'screen') clearFlowActionHighlight()
  }, [view])

  const handleLayoutNormalized = useCallback(
    (nodes: Array<{ id: string; x: number; y: number }>) => {
      setNormalizedLayout((current) => {
        if (
          current.length === nodes.length &&
          current.every(
            (node, index) =>
              node.id === nodes[index]?.id &&
              node.x === nodes[index]?.x &&
              node.y === nodes[index]?.y,
          )
        )
          return current
        return nodes
      })
    },
    [],
  )

  useFlowLayoutAutosave({
    sourceId,
    moduleId: 'pages',
    directory: page.directory,
    authoredNodes: page.flow.nodes,
    normalizedNodes: normalizedLayout,
    enabled: view === 'flow',
  })

  const dispatchAction = (action: PageAction) => {
    highlightFlowActionTarget(resolveFlowActionTarget(clickTargetRef.current))
    setActiveFlowActionId(action.id)
    const currentNode =
      page.flow.nodes.find((node) => node.state === stateId) ??
      page.flow.nodes.find((node) => node.id === selectedNodeId)
    const candidates = page.flow.edges.filter(
      (edge) => edge.from === currentNode?.id && edge.action === action.id,
    )
    const edge =
      candidates.find(
        (candidate) =>
          candidate.to.condition &&
          values[candidate.to.condition.controlId] === candidate.to.condition.value,
      ) ?? candidates.find((candidate) => !candidate.to.condition)
    if (edge?.to.kind === 'state') {
      const to = edge.to
      const targetState = page.states.find((state) => state.id === to.stateId)
      const targetNode = page.flow.nodes.find((node) => node.state === to.stateId)
      if (targetState) {
        setValues({ ...targetState.values })
        setStateId(targetState.id)
        setSelectedNodeId(targetNode?.id ?? null)
        return
      }
    }
    if (edge?.to.kind === 'page') {
      onNavigateToPage(edge.to.pageId)
      return
    }
    if (action.values) applyValues(action.values)
  }

  const selectNode = (nodeId: string) => {
    if (nodeId.startsWith('page-exit:')) {
      onNavigateToPage(nodeId.slice('page-exit:'.length))
      return
    }
    setSelectedNodeId(nodeId)
    const node = page.flow.nodes.find((item) => item.id === nodeId)
    if (node) selectState(node.state)
  }

  const copyLink = async () => {
    const value = window.location.href
    let copied = false
    if (navigator.clipboard?.writeText && window.isSecureContext)
      try {
        await navigator.clipboard.writeText(value)
        copied = true
      } catch {
        copied = false
      }
    if (!copied) {
      const textarea = document.createElement('textarea')
      textarea.value = value
      textarea.readOnly = true
      textarea.style.position = 'fixed'
      textarea.style.inset = '0 auto auto -9999px'
      textarea.style.fontSize = '16px'
      document.body.append(textarea)
      textarea.select()
      textarea.setSelectionRange(0, value.length)
      copied = document.execCommand('copy')
      textarea.remove()
    }
    setCopyState(copied ? 'copied' : 'failed')
    if (copied) window.setTimeout(() => setCopyState('idle'), 1800)
  }

  const stateNodes: UserFlowCanvasNode[] = useMemo(
    () =>
      page.flow.nodes.map((node) => {
        const state = page.states.find((item) => item.id === node.state)
        const rendered =
          renderer && state
            ? renderer.renderPage({
                state: state.id,
                values: { ...state.values },
                onAction: () => undefined,
              })
            : null
        return {
          id: node.id,
          title: state?.name ?? node.state,
          description: state?.description ?? 'State definition unavailable.',
          preview: rendered,
          mobilePreview: rendered,
          screenStyle: modeStyle,
          eyebrow:
            page.flow.edges.some(
              (edge) => edge.to.kind === 'state' && edge.to.stateId === node.state,
            ) && page.flow.edges.some((edge) => edge.from === node.id)
              ? 'Transition state'
              : page.flow.edges.some((edge) => edge.from === node.id)
                ? 'Entry state'
                : 'Terminal state',
          x: node.x,
          y: node.y,
        }
      }),
    [modeStyle, page.flow.edges, page.flow.nodes, page.states, renderer],
  )

  const exitTargetIds = useMemo(
    () => [
      ...new Set(
        page.flow.edges
          .filter((edge) => edge.to.kind === 'page')
          .map((edge) => (edge.to as { pageId: string }).pageId),
      ),
    ],
    [page.flow.edges],
  )

  const exitNodes: UserFlowCanvasNode[] = useMemo(
    () =>
      exitTargetIds.map((pageId) => {
        const target = pages.find((item) => item.id === pageId)
        const sourceEdge = page.flow.edges.find(
          (edge) => edge.to.kind === 'page' && (edge.to as { pageId: string }).pageId === pageId,
        )
        const sourceNode = page.flow.nodes.find((node) => node.id === sourceEdge?.from)
        const targetState =
          target?.states.find((state) => state.id === target.defaultState) ?? target?.states[0]
        const targetRenderer = target ? pageRendererFor(target) : null
        const rendered =
          targetRenderer && targetState
            ? targetRenderer.renderPage({
                state: targetState.id,
                values: { ...targetState.values },
                onAction: () => undefined,
              })
            : null
        return {
          id: exitNodeId(pageId),
          title: target?.name ?? pageId,
          description: target
            ? `Exits to the ${target.name} Page.`
            : 'This Page could not be found.',
          preview: rendered ?? (
            <div className="page-view__exit-badge">
              <strong>{target?.name ?? pageId}</strong>
              <span>Select to open</span>
            </div>
          ),
          mobilePreview: rendered,
          screenStyle: modeStyle,
          eyebrow: 'Exits to another Page',
          x: (sourceNode?.x ?? 0) + USER_FLOW_NODE_WIDTH + USER_FLOW_NODE_GAP,
          y: sourceNode?.y ?? 0,
        }
      }),
    [exitTargetIds, modeStyle, page.flow.edges, page.flow.nodes, pages],
  )

  const edges: UserFlowCanvasEdge[] = useMemo(
    () =>
      page.flow.edges.map((edge) => {
        const to = edge.to
        return {
          id: edge.id,
          from: edge.from,
          to:
            to.kind === 'state'
              ? (page.flow.nodes.find((node) => node.state === to.stateId)?.id ?? edge.id)
              : exitNodeId(to.pageId),
          label: to.condition
            ? `${edge.label} · if ${to.condition.controlId}=${String(to.condition.value)}`
            : edge.label,
          action: edge.action,
        }
      }),
    [page.flow.edges, page.flow.nodes],
  )

  const highlightedEdgeIds = useMemo(() => {
    if (!activeFlowActionId) return []
    return edges.filter((edge) => edge.action === activeFlowActionId).map((edge) => edge.id)
  }, [activeFlowActionId, edges])

  const activeFlowEdge = useMemo(() => {
    if (!activeFlowActionId) return null
    return page.flow.edges.find((edge) => edge.action === activeFlowActionId) ?? null
  }, [activeFlowActionId, page.flow.edges])

  return (
    <main className="page-view">
      <section ref={stageRef} className={`page-view__stage page-view__stage--${view}`}>
        {view === 'flow' ? (
          <UserFlowCanvas
            nodes={[...stateNodes, ...exitNodes]}
            edges={edges}
            selectedId={selectedNodeId}
            onSelect={selectNode}
            viewState={flowViewState}
            onViewStateChange={setFlowViewState}
            highlightedEdgeIds={highlightedEdgeIds}
            onLayoutNormalized={handleLayoutNormalized}
            onPreview={(nodeId) => {
              if (nodeId.startsWith('page-exit:')) {
                onNavigateToPage(nodeId.slice('page-exit:'.length))
                return
              }
              selectNode(nodeId)
              setView('screen')
            }}
          />
        ) : renderer ? (
          <div className="page-view__screen" style={modeStyle as CSSProperties}>
            {renderer.renderPage({ state: stateId, values, onAction: dispatchAction })}
          </div>
        ) : (
          <div className="page-view__missing">
            <strong>Page renderer could not be loaded.</strong>
            <span>{page.entry ?? 'No adjacent entry was discovered.'}</span>
          </div>
        )}
      </section>

      {activeFlowEdge && (
        <div className="page-view__flow-hint" role="status">
          <span>
            Flow action <strong>{activeFlowEdge.action}</strong>
            {activeFlowEdge.label ? ` · ${activeFlowEdge.label}` : ''}
            {view === 'flow' ? ' — matching edge highlighted' : ''}
          </span>
          {view === 'screen' ? (
            <Button type="button" variant="secondary" size="small" onClick={() => setView('flow')}>
              Show on graph
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="small"
              onClick={() => {
                setActiveFlowActionId(null)
                clearFlowActionHighlight()
              }}
            >
              Clear
            </Button>
          )}
        </div>
      )}

      <WireframeDevPanel
        open={devModeOpen}
        onOpenChange={setDevModeOpen}
        title="Page controls"
        description={
          currentState ? `Saved state · ${currentState.name}` : 'Custom control combination'
        }
        footer={
          <Button
            variant="secondary"
            size="small"
            fullWidth
            onClick={() => selectState(page.defaultState)}
          >
            Reset to default
          </Button>
        }
      >
        <div className="page-dev-controls">
          <section>
            <header>
              <span>Review</span>
              <Chip size="small" variant="soft">
                {view === 'screen' ? 'Screen' : 'User flow'}
              </Chip>
            </header>
            <div className="page-dev-controls__review">
              <Button
                variant="ghost"
                size="small"
                fullWidth
                leading={<ArrowLeftIcon size={16} aria-hidden="true" />}
                onClick={onClose}
              >
                Back to {page.name}
              </Button>
              <TabSwitcher
                ariaLabel="Page view"
                value={view}
                onChange={(nextView) => {
                  setView(nextView)
                  setDevModeOpen(false)
                }}
                options={[
                  { value: 'screen', label: 'Screen' },
                  { value: 'flow', label: 'User flow' },
                ]}
              />
              <Button
                variant="secondary"
                size="small"
                fullWidth
                leading={<LinkIcon size={16} aria-hidden="true" />}
                onClick={copyLink}
              >
                {copyState === 'copied'
                  ? 'Link copied'
                  : copyState === 'failed'
                    ? 'Copy manually below'
                    : 'Copy review link'}
              </Button>
              {copyState === 'failed' && (
                <input
                  className="page-dev-controls__copy-fallback"
                  aria-label="Review link"
                  value={window.location.href}
                  readOnly
                  onFocus={(event) => event.currentTarget.select()}
                  onClick={(event) => event.currentTarget.select()}
                />
              )}
            </div>
          </section>
          {availableModes.length > 1 && (
            <section>
              <header>
                <span>Product theme</span>
                <Chip size="small" variant="soft">
                  {mode}
                </Chip>
              </header>
              {availableModes.length <= 3 ? (
                <TabSwitcher
                  ariaLabel="Product theme"
                  value={mode}
                  onChange={setMode}
                  options={availableModes.map((item) => ({ value: item, label: item }))}
                  size="small"
                />
              ) : (
                <div role="radiogroup" aria-label="Product theme">
                  {availableModes.map((item) => (
                    <RadioButton
                      key={item}
                      name="page-product-theme"
                      value={item}
                      label={item}
                      checked={mode === item}
                      onChange={() => setMode(item)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
          <section>
            <header>
              <span>Saved state</span>
              <Chip size="small" color={currentState ? 'success' : 'warning'} variant="soft">
                {currentState ? 'Matched' : 'Custom'}
              </Chip>
            </header>
            <div role="radiogroup" aria-label="Saved Page state">
              {page.states.map((state) => (
                <RadioButton
                  key={state.id}
                  name="page-state"
                  value={state.id}
                  label={state.name}
                  description={state.description}
                  checked={stateId === state.id}
                  onChange={() => selectState(state.id)}
                />
              ))}
            </div>
          </section>
          <section>
            <header>
              <span>Domain &amp; data conditions</span>
            </header>
            <div className="page-dev-controls__values">
              {page.controls.map((control) => {
                if (
                  control.visibleWhen &&
                  values[control.visibleWhen.control] !== control.visibleWhen.equals
                )
                  return null
                if (control.kind === 'boolean')
                  return (
                    <Checkbox
                      key={control.id}
                      label={control.label}
                      description={control.description}
                      checked={Boolean(values[control.id])}
                      onChange={(event) =>
                        applyValues({ ...values, [control.id]: event.target.checked })
                      }
                    />
                  )
                if (control.kind === 'range')
                  return (
                    <Slider
                      key={control.id}
                      label={control.label}
                      value={Number(values[control.id])}
                      minValue={control.min}
                      maxValue={control.max}
                      step={control.step}
                      size="large"
                      formatValue={(value) => `${value}${control.unit ?? ''}`}
                      onValueChange={(value) => applyValues({ ...values, [control.id]: value })}
                    />
                  )
                return (
                  <div key={control.id} className="page-dev-controls__radio">
                    <strong>{control.label}</strong>
                    {control.description && <p>{control.description}</p>}
                    <div role="radiogroup" aria-label={control.label}>
                      {control.options.map((option) => (
                        <RadioButton
                          key={option.value}
                          name={`page-control-${control.id}`}
                          value={option.value}
                          label={option.label}
                          description={option.description}
                          checked={values[control.id] === option.value}
                          onChange={() => applyValues({ ...values, [control.id]: option.value })}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </WireframeDevPanel>
      {view === 'screen' && <WorkbenchInspector surfaceRef={stageRef} />}
      <span className="page-view__copy-status" aria-live="polite">
        {copyState === 'copied'
          ? 'Review link copied'
          : copyState === 'failed'
            ? 'Copy is unavailable. Select the browser address.'
            : ''}
      </span>
    </main>
  )
}
