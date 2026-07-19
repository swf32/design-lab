import './WireframeView.scss'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import {
  Button,
  Checkbox,
  Chip,
  RadioButton,
  Slider,
  TabSwitcher,
  UserFlowCanvas,
  WireframeDevPanel,
} from '@design-lab/system/components'
import { ArrowLeftIcon, LinkIcon } from '@design-lab/system/icons'
import type { WireframeAction, WireframeValues } from '@design-lab/system/wireframes'
import type { ModuleData } from '../../api/projects'
import { wireframeRendererFor } from '../../wireframes/registry'

type WireframeEntity = Extract<ModuleData, { kind: 'wireframes' }>['wireframes'][number]
type WireframeViewMode = 'screen' | 'flow'

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

function parseStateValue(value: string, sample: unknown) {
  if (typeof sample === 'boolean') return value === 'true'
  if (typeof sample === 'number') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : sample
  }
  return value
}

function valuesMatch(candidate: WireframeValues, state: WireframeEntity['states'][number]) {
  return Object.entries(state.values).every(([id, value]) => candidate[id] === value)
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
  for (const [id, sample] of Object.entries(state?.values ?? {})) {
    const serialized = search.get(`value.${id}`)
    if (serialized != null) values[id] = parseStateValue(serialized, sample)
  }
  const matchedState = wireframe.states.find((item) => valuesMatch(values, item))
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
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const renderer = wireframeRendererFor(wireframe)
  const currentState = wireframe.states.find((state) => state.id === stateId) ?? null

  useEffect(() => {
    const search = new URLSearchParams()
    search.set('source', sourceId)
    search.set('layout', layout)
    search.set('view', view)
    search.set('state', stateId ?? 'custom')
    for (const [id, value] of Object.entries(values)) search.set(`value.${id}`, String(value))
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
    const matched = wireframe.states.find((state) => valuesMatch(nextValues, state))
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

  const nodes = wireframe.flow.nodes.map((node) => {
    const state = wireframe.states.find((item) => item.id === node.state)
    return {
      id: node.id,
      title: state?.name ?? node.state,
      description: state?.description ?? 'State definition unavailable.',
      preview:
        renderer && state
          ? renderer.renderWireframe({
              layout,
              state: state.id,
              values: { ...state.values },
              onAction: () => undefined,
            })
          : null,
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
      <section className={`wireframe-view__stage wireframe-view__stage--${view}`}>
        {view === 'flow' ? (
          <UserFlowCanvas
            nodes={nodes}
            edges={wireframe.flow.edges}
            selectedId={selectedNodeId}
            onSelect={selectNode}
            onPreview={(nodeId) => {
              selectNode(nodeId)
              setView('screen')
            }}
          />
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
              <span>Review</span>
              <Chip size="small" variant="soft">
                {view === 'screen' ? 'Screen' : 'User flow'}
              </Chip>
            </header>
            <div className="wireframe-dev-controls__review">
              <Button
                variant="ghost"
                size="small"
                fullWidth
                leading={<ArrowLeftIcon size={16} aria-hidden="true" />}
                onClick={onClose}
              >
                Back to Wireframes
              </Button>
              <TabSwitcher
                ariaLabel="Wireframe view"
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
                  className="wireframe-dev-controls__copy-fallback"
                  aria-label="Review link"
                  value={window.location.href}
                  readOnly
                  onFocus={(event) => event.currentTarget.select()}
                  onClick={(event) => event.currentTarget.select()}
                />
              )}
            </div>
          </section>
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
      <span className="wireframe-view__copy-status" aria-live="polite">
        {copyState === 'copied'
          ? 'Review link copied'
          : copyState === 'failed'
            ? 'Copy is unavailable. Select the browser address.'
            : ''}
      </span>
    </main>
  )
}
