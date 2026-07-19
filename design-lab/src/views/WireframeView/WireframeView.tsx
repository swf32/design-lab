import './WireframeView.scss'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import {
  Button,
  Checkbox,
  Chip,
  IconButton,
  RadioButton,
  Slider,
  TabSwitcher,
  UserFlowCanvas,
  WireframeDevPanel,
} from '@design-lab/system/components'
import { ArrowLeftIcon, LinkIcon } from '@design-lab/system/icons'
import type {
  WireframeAction,
  WireframeModule,
  WireframeValues,
} from '@design-lab/system/wireframes'
import type { ModuleData } from '../../api/projects'

type WireframeEntity = Extract<ModuleData, { kind: 'wireframes' }>['wireframes'][number]
type WireframeViewMode = 'screen' | 'flow'

const wireframeModules = import.meta.glob<WireframeModule>(
  '../../../../libraries/*/wireframes/**/*.wireframe.tsx',
  { eager: true },
)

function rendererFor(wireframe: WireframeEntity) {
  if (!wireframe.entry) return null
  const suffix = `/libraries/${wireframe.sourceId}/wireframes/${wireframe.directory}/${wireframe.entry}`
  return Object.entries(wireframeModules).find(([path]) => path.endsWith(suffix))?.[1] ?? null
}

function parseControlValue(
  value: string,
  control: WireframeEntity['controls'][number],
): string | number | boolean {
  if (control.kind === 'boolean') return value === 'true'
  if (control.kind === 'range') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : control.min
  }
  return value
}

function valuesMatch(
  candidate: WireframeValues,
  state: WireframeEntity['states'][number],
  controls: WireframeEntity['controls'],
) {
  return controls.every((control) => candidate[control.id] === state.values[control.id])
}

function initialContext(wireframe: WireframeEntity) {
  const search = new URLSearchParams(window.location.search)
  const layout = wireframe.layouts.some((item) => item.id === search.get('layout'))
    ? search.get('layout')!
    : wireframe.defaultLayout
  const requestedState = search.get('state')
  const state =
    wireframe.states.find((item) => item.id === requestedState) ??
    wireframe.states.find((item) => item.id === wireframe.defaultState) ??
    wireframe.states[0]
  const values = { ...(state?.values ?? {}) }
  for (const control of wireframe.controls) {
    const serialized = search.get(`control.${control.id}`)
    if (serialized != null) values[control.id] = parseControlValue(serialized, control)
  }
  const matchedState = wireframe.states.find((item) =>
    valuesMatch(values, item, wireframe.controls),
  )
  const view: WireframeViewMode = search.get('view') === 'flow' ? 'flow' : 'screen'
  const node =
    wireframe.flow.nodes.find((item) => item.state === matchedState?.id) ??
    wireframe.flow.nodes[0] ??
    null
  return {
    layout,
    stateId: matchedState?.id ?? null,
    values,
    view,
    selectedNodeId: node?.id ?? null,
  }
}

export function WireframeView({
  wireframe,
  sourceId,
  onClose,
}: {
  wireframe: WireframeEntity
  sourceId: string
  onClose: () => void
}) {
  const initial = useMemo(() => initialContext(wireframe), [wireframe])
  const [layout, setLayout] = useState(initial.layout)
  const [stateId, setStateId] = useState<string | null>(initial.stateId)
  const [values, setValues] = useState<WireframeValues>(initial.values)
  const [view, setView] = useState<WireframeViewMode>(initial.view)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initial.selectedNodeId)
  const [devModeOpen, setDevModeOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const renderer = rendererFor(wireframe)
  const currentState = wireframe.states.find((state) => state.id === stateId) ?? null
  const selectedNode = wireframe.flow.nodes.find((node) => node.id === selectedNodeId) ?? null

  useEffect(() => {
    const search = new URLSearchParams()
    search.set('source', sourceId)
    search.set('layout', layout)
    search.set('view', view)
    search.set('state', stateId ?? 'custom')
    for (const control of wireframe.controls)
      search.set(`control.${control.id}`, String(values[control.id]))
    const next = `${window.location.pathname}?${search.toString()}`
    if (`${window.location.pathname}${window.location.search}` !== next)
      window.history.replaceState(window.history.state, '', next)
  }, [layout, sourceId, stateId, values, view, wireframe.controls])

  const selectState = (nextStateId: string) => {
    const state = wireframe.states.find((item) => item.id === nextStateId)
    if (!state) return
    setStateId(state.id)
    setValues({ ...state.values })
    const node = wireframe.flow.nodes.find((item) => item.state === state.id)
    if (node) setSelectedNodeId(node.id)
  }

  const applyValues = (nextValues: WireframeValues) => {
    const matched = wireframe.states.find((state) =>
      valuesMatch(nextValues, state, wireframe.controls),
    )
    setValues(nextValues)
    setStateId(matched?.id ?? null)
    if (matched) {
      const node = wireframe.flow.nodes.find((item) => item.state === matched.id)
      if (node) setSelectedNodeId(node.id)
    }
  }

  const dispatchAction = (action: WireframeAction) => {
    const currentNode =
      wireframe.flow.nodes.find((node) => node.state === stateId) ??
      wireframe.flow.nodes.find((node) => node.id === selectedNodeId)
    const edge = wireframe.flow.edges.find(
      (candidate) => candidate.from === currentNode?.id && candidate.action === action.id,
    )
    const targetNode = edge ? wireframe.flow.nodes.find((node) => node.id === edge.to) : undefined
    const targetState = targetNode
      ? wireframe.states.find((state) => state.id === targetNode.state)
      : undefined
    if (targetState) {
      setValues({ ...targetState.values })
      setStateId(targetState.id)
      setSelectedNodeId(targetNode!.id)
      return
    }
    if (action.values) applyValues(action.values)
  }

  const selectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId)
    const node = wireframe.flow.nodes.find((item) => item.id === nodeId)
    if (node) selectState(node.state)
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  const nodes = wireframe.flow.nodes.map((node) => {
    const state = wireframe.states.find((item) => item.id === node.state)
    return {
      id: node.id,
      title: state?.name ?? node.state,
      description: state?.description ?? 'State definition unavailable.',
      eyebrow:
        wireframe.flow.edges.some((edge) => edge.to === node.id) &&
        wireframe.flow.edges.some((edge) => edge.from === node.id)
          ? 'Transition state'
          : wireframe.flow.edges.some((edge) => edge.from === node.id)
            ? 'Entry state'
            : 'Terminal state',
      x: node.x,
      y: node.y,
    }
  })

  return (
    <main className="wireframe-view">
      <header className="wireframe-view__toolbar">
        <div className="wireframe-view__identity">
          <IconButton type="button" aria-label="Back to Wireframes" onClick={onClose}>
            <ArrowLeftIcon size={18} />
          </IconButton>
          <div>
            <span>Wireframe · {wireframe.status}</span>
            <strong>{wireframe.name}</strong>
          </div>
        </div>
        <TabSwitcher
          ariaLabel="Wireframe view"
          value={view}
          onChange={setView}
          options={[
            { value: 'screen', label: 'Screen' },
            { value: 'flow', label: 'User flow' },
          ]}
        />
        <div className="wireframe-view__context">
          <div>
            <span>{wireframe.layouts.find((item) => item.id === layout)?.name}</span>
            <strong>{currentState?.name ?? 'Custom state'}</strong>
          </div>
          {view === 'flow' && selectedNode && (
            <Button size="small" variant="primary" onClick={() => setView('screen')}>
              Preview state
            </Button>
          )}
          <IconButton
            type="button"
            aria-label={copied ? 'Link copied' : 'Copy review link'}
            onClick={copyLink}
          >
            <LinkIcon size={18} />
          </IconButton>
        </div>
      </header>

      <section className={`wireframe-view__stage wireframe-view__stage--${view}`}>
        {view === 'flow' ? (
          <>
            <UserFlowCanvas
              nodes={nodes}
              edges={wireframe.flow.edges}
              selectedId={selectedNodeId}
              onSelect={selectNode}
            />
            <Button
              className="wireframe-view__mobile-preview"
              variant="primary"
              onClick={() => setView('screen')}
            >
              Preview state
            </Button>
          </>
        ) : renderer ? (
          <div
            className="wireframe-view__screen"
            style={{ '--wireframe-layout': layout } as CSSProperties}
          >
            {renderer.renderWireframe({
              layout,
              state: stateId,
              values,
              onAction: dispatchAction,
            })}
          </div>
        ) : (
          <div className="wireframe-view__missing">
            <strong>Wireframe renderer could not be loaded.</strong>
            <span>{wireframe.entry ?? 'No adjacent entry was discovered.'}</span>
          </div>
        )}
      </section>

      <WireframeDevPanel
        open={devModeOpen}
        onOpenChange={setDevModeOpen}
        title="Wireframe controls"
        description={
          currentState ? `Saved state · ${currentState.name}` : 'Custom control combination'
        }
        footer={
          <Button
            variant="secondary"
            size="small"
            fullWidth
            onClick={() => selectState(wireframe.defaultState)}
          >
            Reset to default
          </Button>
        }
      >
        <div className="wireframe-dev-controls">
          <section>
            <header>
              <span>Layout direction</span>
              <Chip size="small" variant="soft">
                {wireframe.layouts.length}
              </Chip>
            </header>
            <div role="radiogroup" aria-label="Layout direction">
              {wireframe.layouts.map((item) => (
                <RadioButton
                  key={item.id}
                  name="wireframe-layout"
                  value={item.id}
                  label={item.name}
                  description={item.description}
                  checked={layout === item.id}
                  onChange={() => setLayout(item.id)}
                />
              ))}
            </div>
          </section>
          <section>
            <header>
              <span>Saved state</span>
              <Chip size="small" color={currentState ? 'success' : 'warning'} variant="soft">
                {currentState ? 'Matched' : 'Custom'}
              </Chip>
            </header>
            <div role="radiogroup" aria-label="Saved Wireframe state">
              {wireframe.states.map((state) => (
                <RadioButton
                  key={state.id}
                  name="wireframe-state"
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
              <span>State values</span>
            </header>
            <div className="wireframe-dev-controls__values">
              {wireframe.controls.map((control) => {
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
                  <div key={control.id} className="wireframe-dev-controls__radio">
                    <strong>{control.label}</strong>
                    {control.description && <p>{control.description}</p>}
                    <div role="radiogroup" aria-label={control.label}>
                      {control.options.map((option) => (
                        <RadioButton
                          key={option.value}
                          name={`wireframe-control-${control.id}`}
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
      <div className="wireframe-view__live-state" aria-live="polite">
        {currentState?.name ?? 'Custom state'}
      </div>
    </main>
  )
}
