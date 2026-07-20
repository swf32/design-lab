import './ComponentPlaygroundView.scss'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  Button,
  CanvasBackgroundControl,
  Checkbox,
  Chip,
  ColorPicker,
  ControlField,
  Input,
  PlaygroundControlsRail,
  RadioButton,
  Select,
  Slider,
  TabSwitcher,
  WorkbenchAction,
  WorkbenchInspector,
  type CanvasMode,
  type ChipColor,
} from '@design-lab/system/components'
import { ArrowLeftIcon, SettingsIcon } from '@design-lab/system/icons'
import type {
  ComponentPlaygroundModule,
  PlaygroundControl,
  PlaygroundValues,
} from '@design-lab/system/playground'
import type { ModuleData } from '../../api/projects'
import { designSystemModeStyle } from '../../designSystemMode'

type ComponentsData = Extract<ModuleData, { kind: 'components' }>
type ComponentEntity = ComponentsData['components'][number]

const playgroundModules = import.meta.glob<ComponentPlaygroundModule>(
  '../../../../libraries/*/components/**/*.playground.{ts,tsx}',
  { eager: true },
)

function playgroundModule(component: ComponentEntity) {
  if (!component.playground) return null
  const suffix = `/libraries/${component.sourceId}/components/${component.directory}/${component.playground}`
  return Object.entries(playgroundModules).find(([path]) => path.endsWith(suffix))?.[1] ?? null
}

function parseControlValue(control: PlaygroundControl, value: string | null) {
  if (value == null) return control.defaultValue
  if (control.kind === 'boolean') return value === 'true'
  if (control.kind === 'number') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : control.defaultValue
  }
  return value
}

function initialValues(module: ComponentPlaygroundModule) {
  const params = new URLSearchParams(window.location.search)
  return Object.fromEntries(
    Object.entries(module.playground.controls).map(([key, definition]) => [
      key,
      parseControlValue(definition, params.get(key)),
    ]),
  ) as PlaygroundValues
}

function statusPresentation(status?: string) {
  const colors: Record<string, ChipColor> = {
    ready: 'success',
    'in-progress': 'accent',
    wireframe: 'warning',
  }
  const normalized = status ?? 'wireframe'
  return {
    color: colors[normalized] ?? 'default',
    label: normalized
      .split('-')
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(' '),
  }
}

function PlaygroundControls({
  component,
  controls,
  values,
  onChange,
}: {
  component: ComponentEntity
  controls: ComponentPlaygroundModule['playground']['controls']
  values: PlaygroundValues
  onChange: (key: string, value: string | number | boolean) => void
}) {
  return (
    <div className="component-playground-controls">
      <header>
        <span>Typed controls</span>
        <strong>{Object.keys(controls).length}</strong>
      </header>
      {Object.entries(controls).map(([key, definition]) => {
        const value = values[key]
        if (definition.kind === 'string')
          return (
            <Input
              key={key}
              label={definition.label}
              helperText={definition.description}
              placeholder={definition.placeholder}
              value={String(value)}
              size="small"
              fullWidth
              onChange={(event) => onChange(key, event.target.value)}
            />
          )
        if (definition.kind === 'boolean')
          return (
            <Checkbox
              key={key}
              label={definition.label}
              description={definition.description}
              checked={Boolean(value)}
              onChange={(event) => onChange(key, event.target.checked)}
            />
          )
        if (definition.kind === 'enum')
          return (
            <Select
              key={key}
              label={definition.label}
              helperText={definition.description}
              options={definition.options}
              value={String(value)}
              size="small"
              fullWidth
              onChange={(event) => onChange(key, event.target.value)}
            />
          )
        if (definition.kind === 'number')
          return (
            <Slider
              key={key}
              label={definition.label}
              value={Number(value)}
              minValue={definition.min}
              maxValue={definition.max}
              step={definition.step}
              size="small"
              onValueChange={(next) => onChange(key, next)}
            />
          )
        if (definition.kind === 'choice')
          return (
            <fieldset
              className="component-playground-controls__choice"
              key={key}
              aria-label={definition.label}
            >
              <legend>{definition.label}</legend>
              {definition.options.map((option) => (
                <RadioButton
                  key={option.value}
                  name={`${component.id}-${key}`}
                  value={option.value}
                  label={option.label}
                  description={option.description}
                  checked={value === option.value}
                  onChange={() => onChange(key, option.value)}
                  size="small"
                />
              ))}
            </fieldset>
          )
        return (
          <ControlField key={key} label={definition.label}>
            <ColorPicker
              label={definition.label}
              value={String(value)}
              onChange={(next) => onChange(key, next ?? definition.defaultValue)}
            />
          </ControlField>
        )
      })}
    </div>
  )
}

export function ComponentPlaygroundView({
  component,
  data,
  canvasMode,
  canvasColor,
  onCanvasModeChange,
  onCanvasColorChange,
  onClose,
}: {
  component: ComponentEntity
  data: ComponentsData
  canvasMode: CanvasMode
  canvasColor: string
  onCanvasModeChange: (mode: CanvasMode) => void
  onCanvasColorChange: (color: string) => void
  onClose: () => void
}) {
  const module = playgroundModule(component)
  if (!module) {
    return (
      <div className="module-state component-playground-missing">
        This Playground could not be loaded.
      </div>
    )
  }
  return (
    <LoadedComponentPlayground
      key={component.id}
      component={component}
      data={data}
      module={module}
      canvasMode={canvasMode}
      canvasColor={canvasColor}
      onCanvasModeChange={onCanvasModeChange}
      onCanvasColorChange={onCanvasColorChange}
      onClose={onClose}
    />
  )
}

function LoadedComponentPlayground({
  component,
  data,
  module,
  canvasMode,
  canvasColor,
  onCanvasModeChange,
  onCanvasColorChange,
  onClose,
}: {
  component: ComponentEntity
  data: ComponentsData
  module: ComponentPlaygroundModule
  canvasMode: CanvasMode
  canvasColor: string
  onCanvasModeChange: (mode: CanvasMode) => void
  onCanvasColorChange: (color: string) => void
  onClose: () => void
}) {
  const params = useMemo(() => new URLSearchParams(window.location.search), [])
  const availableModes = data.modes.length ? data.modes : ['default']
  const initialVariant = params.get('variant')
  const [variant, setVariant] = useState(
    module.playground.variants.some((item) => item.id === initialVariant)
      ? String(initialVariant)
      : module.playground.defaultVariant,
  )
  const initialMode = params.get('mode')
  const [mode, setMode] = useState(
    initialMode && availableModes.includes(initialMode) ? initialMode : availableModes[0],
  )
  const [values, setValues] = useState<PlaygroundValues>(() => initialValues(module))
  const compactQuery = '(max-width: 760px), (max-height: 560px) and (max-width: 960px)'
  const [isCompact, setIsCompact] = useState(() => window.matchMedia(compactQuery).matches)
  const [controlsOpen, setControlsOpen] = useState(() => !window.matchMedia(compactQuery).matches)
  const closeControlsRef = useRef<HTMLButtonElement>(null)
  const openControlsRef = useRef<HTMLButtonElement>(null)
  const canvasRef = useRef<HTMLElement>(null)
  const wasControlsOpenRef = useRef(controlsOpen)
  const selectedVariant =
    module.playground.variants.find((item) => item.id === variant) ?? module.playground.variants[0]
  const status = statusPresentation(component.status)
  const shellStyle = {
    '--canvas-solid': canvasColor,
  } as CSSProperties
  const specimenStyle = designSystemModeStyle(data.themeVariables, mode)

  useEffect(() => {
    const media = window.matchMedia(compactQuery)
    const updateLayout = () => {
      setIsCompact(media.matches)
      setControlsOpen(!media.matches)
    }
    updateLayout()
    media.addEventListener('change', updateLayout)
    return () => media.removeEventListener('change', updateLayout)
  }, [])

  useEffect(() => {
    if (!isCompact) return
    if (controlsOpen) {
      window.requestAnimationFrame(() => closeControlsRef.current?.focus())
    } else if (wasControlsOpenRef.current) {
      openControlsRef.current?.focus()
    }
    wasControlsOpenRef.current = controlsOpen
  }, [controlsOpen, isCompact])

  useEffect(() => {
    if (!isCompact || !controlsOpen) return
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setControlsOpen(false)
    }
    window.addEventListener('keydown', closeWithEscape)
    return () => window.removeEventListener('keydown', closeWithEscape)
  }, [controlsOpen, isCompact])

  useEffect(() => {
    const next = new URLSearchParams()
    next.set('variant', variant)
    next.set('mode', mode)
    for (const [key, definition] of Object.entries(module.playground.controls)) {
      const value = values[key]
      if (value !== definition.defaultValue) next.set(key, String(value))
    }
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}?${next.toString()}`,
    )
  }, [mode, module.playground.controls, values, variant])

  return (
    <main
      className={`component-playground-page${controlsOpen ? ' is-controls-open' : ''}`}
      style={shellStyle}
    >
      <button
        type="button"
        className="component-playground-page__scrim"
        aria-label="Close Playground settings"
        aria-hidden={!isCompact || !controlsOpen}
        tabIndex={isCompact && controlsOpen ? 0 : -1}
        onClick={() => setControlsOpen(false)}
      />
      <PlaygroundControlsRail
        id="component-playground-settings"
        className="component-playground-panel"
        aria-hidden={isCompact && !controlsOpen}
        inert={isCompact && !controlsOpen ? true : undefined}
        header={
          <>
            <Button
              type="button"
              variant="ghost"
              size="small"
              leading={<ArrowLeftIcon size={16} aria-hidden="true" />}
              onClick={onClose}
            >
              Component
            </Button>
            <button
              type="button"
              className="component-playground-panel__done"
              ref={closeControlsRef}
              onClick={() => setControlsOpen(false)}
            >
              Done
            </button>
            <div className="component-playground-panel__identity">
              <div>
                <span>Playground</span>
                <Chip color={status.color} variant="soft" size="small">
                  {status.label}
                </Chip>
              </div>
              <h1>{component.name}</h1>
              <code>{component.directory}</code>
            </div>
          </>
        }
        footer={
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigator.clipboard.writeText(window.location.href)}
          >
            Copy review link
          </Button>
        }
      >
        <section className="component-playground-panel__section">
          <span>Direction</span>
          <TabSwitcher
            ariaLabel="Playground direction"
            options={module.playground.variants.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
            value={variant}
            onChange={setVariant}
          />
          <p>{selectedVariant?.description ?? module.playground.description}</p>
        </section>

        {availableModes.length > 1 && (
          <section className="component-playground-panel__section">
            <span>Product theme</span>
            <TabSwitcher
              ariaLabel="Product theme"
              options={availableModes.map((item) => ({ value: item, label: item }))}
              value={mode}
              onChange={setMode}
              size="small"
            />
          </section>
        )}

        <PlaygroundControls
          component={component}
          controls={module.playground.controls}
          values={values}
          onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
        />
      </PlaygroundControlsRail>

      <section
        ref={canvasRef}
        className={`component-playground-canvas component-playground-canvas--${canvasMode}`}
        aria-label={`${component.name} ${selectedVariant?.name ?? 'Playground'} preview`}
        aria-hidden={isCompact && controlsOpen}
        inert={isCompact && controlsOpen ? true : undefined}
      >
        <div className="component-playground-canvas__tools" data-workbench-inspector-ui>
          <CanvasBackgroundControl
            mode={canvasMode}
            color={canvasColor}
            onModeChange={onCanvasModeChange}
            onColorChange={onCanvasColorChange}
          />
        </div>
        <div className="component-playground-canvas__stage">
          <div className="component-playground-page__specimen" style={specimenStyle}>
            {module.renderPlaygroundVariant({ variant, values, mode })}
          </div>
        </div>
      </section>

      <WorkbenchAction
        className="component-playground-page__settings"
        ref={openControlsRef}
        aria-label="Open Playground settings"
        aria-controls="component-playground-settings"
        aria-expanded={controlsOpen}
        onClick={() => setControlsOpen(true)}
        icon={<SettingsIcon size={18} aria-hidden="true" />}
      >
        Settings
      </WorkbenchAction>
      <WorkbenchInspector surfaceRef={canvasRef} />
    </main>
  )
}
