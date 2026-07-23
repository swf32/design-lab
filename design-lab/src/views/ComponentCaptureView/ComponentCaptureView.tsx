import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { ComponentCard, ComponentThumbnail, StoryCanvas } from '@design-lab/system/components'
import { getModuleData, type ModuleData } from '../../api/projects'
import { designSystemModeStyle } from '../../designSystemMode'
import {
  previewComponentFor,
  storyModuleFor,
  type ComponentEntity,
  type StoryDefinition,
} from '../../componentRuntime'
import '../ModuleView/ModuleView.scss'
import './ComponentCaptureView.scss'

type CaptureRequest = {
  sourceId: string
  componentId: string
  capture: 'info' | 'preview' | 'story'
  storyId: string | null
  sourceMode: string | null
  interfaceTheme: 'dark' | 'light'
}

function colorLuminance(value: string | number | undefined) {
  if (typeof value !== 'string') return null
  const hex = value.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1]
  const rgb = hex
    ? hex.length === 3
      ? [...hex].map((channel) => Number.parseInt(`${channel}${channel}`, 16))
      : [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16))
    : value
        .trim()
        .match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i)
        ?.slice(1, 4)
        .map(Number)
  if (!rgb?.every(Number.isFinite)) return null
  const linear = rgb.map((channel) => {
    const normalized = channel / 255
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

function recommendedInterfaceTheme(variables: Record<string, string | number>) {
  const preferredKeys = [
    '--color-canvas',
    '--ds-color-canvas',
    '--color-surface-primary',
    '--ds-color-surface-primary',
    '--color-surface-raised',
    '--ds-color-surface-raised',
  ]
  for (const key of preferredKeys) {
    const luminance = colorLuminance(variables[key])
    if (luminance !== null) return luminance > 0.42 ? 'light' : 'dark'
  }
  return null
}

function readCaptureRequest(): CaptureRequest {
  const params = new URLSearchParams(window.location.search)
  const requestedCapture = params.get('capture')
  return {
    sourceId: params.get('source') ?? '',
    componentId: params.get('component') ?? '',
    capture:
      requestedCapture === 'story' || requestedCapture === 'preview' ? requestedCapture : 'info',
    storyId: params.get('story'),
    sourceMode: params.get('sourceMode'),
    interfaceTheme: params.get('interfaceTheme') === 'light' ? 'light' : 'dark',
  }
}

function Specimen({
  label,
  children,
  sourceStyle,
}: {
  label: string
  children: ReactNode
  sourceStyle: CSSProperties
}) {
  return (
    <div className="button-specimen">
      <div style={sourceStyle}>{children}</div>
      <code>{label}</code>
    </div>
  )
}

function StoryCapture({
  component,
  story,
  sourceStyle,
}: {
  component: ComponentEntity
  story: StoryDefinition
  sourceStyle: CSSProperties
}) {
  const module = storyModuleFor(component)
  if (!module?.renderStoryExample)
    throw new Error(`Story renderer is unavailable for ${component.id}`)

  return (
    <StoryCanvas
      title={story.name}
      description={story.description}
      meta={[story.kind ?? 'context', story.interactive && 'interactive']
        .filter(Boolean)
        .join(' · ')}
    >
      <div className="story-comparison">
        {(story.examples ?? []).map((example, index) => (
          <Specimen
            key={`${story.id}:${example.label}:${index}`}
            label={example.label}
            sourceStyle={sourceStyle}
          >
            {module.renderStoryExample?.(example, story)}
          </Specimen>
        ))}
      </div>
    </StoryCanvas>
  )
}

export function ComponentCaptureView() {
  const [request] = useState(readCaptureRequest)
  const [data, setData] = useState<Extract<ModuleData, { kind: 'components' }> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = request.interfaceTheme
    getModuleData(request.sourceId, 'components')
      .then((result) => {
        if (result.kind !== 'components') throw new Error('Component module is unavailable')
        setData(result)
      })
      .catch((reason: unknown) =>
        setError(reason instanceof Error ? reason.message : 'Capture could not be loaded'),
      )
  }, [request.interfaceTheme, request.sourceId])

  if (error) return <main className="component-capture-state">{error}</main>
  if (!data) return <main className="component-capture-state">Loading capture…</main>

  const component = data.components.find((candidate) => candidate.id === request.componentId)
  if (!component) return <main className="component-capture-state">Component was not found</main>

  const sourceMode = request.sourceMode ?? data.modes[0] ?? 'default'
  if (data.modes.length && !data.modes.includes(sourceMode))
    return (
      <main className="component-capture-state">
        Unknown source mode “{sourceMode}”. Available: {data.modes.join(', ')}
      </main>
    )

  const sourceStyle = designSystemModeStyle(data.themeVariables, sourceMode) as CSSProperties
  const module = storyModuleFor(component)
  const captureInfo = {
    ref: `${request.sourceId}:component:${component.id}`,
    component: { id: component.id, name: component.name },
    availableModes: data.modes,
    modeRecommendations: data.modes.map((mode) => ({
      mode,
      interfaceTheme: recommendedInterfaceTheme(data.themeVariables[mode] ?? {}),
    })),
    availableStories: (module?.stories ?? []).map(({ id, name, kind }) => ({ id, name, kind })),
    interfaceThemes: ['dark', 'light'],
    captures: {
      preview: { cssWidth: 260, cssHeight: 150, dpr: 2, pixelWidth: 520, pixelHeight: 300 },
      story: { cssWidth: 600, cssHeight: 180, dpr: 2, pixelWidth: 1200, pixelHeight: 360 },
    },
  }
  if (request.capture === 'info')
    return (
      <main
        className="component-capture-state"
        data-designlab-capture-ready="info"
        data-capture-info={JSON.stringify(captureInfo)}
      >
        Capture information ready
      </main>
    )

  if (request.capture === 'preview') {
    const Preview = previewComponentFor(component, request.sourceId)
    return (
      <main
        className="component-capture component-capture--preview"
        data-designlab-capture-ready="preview"
        data-capture-info={JSON.stringify(captureInfo)}
        data-source-mode={sourceMode}
      >
        <ComponentCard
          name={component.name}
          entry={component.entry ?? ''}
          meta={`${component.variants.length} variants`}
          preview={
            <span className="component-capture__source-scope" style={sourceStyle}>
              {Preview ? <Preview /> : <ComponentThumbnail kind={component.id} />}
            </span>
          }
        />
      </main>
    )
  }

  const story = module?.stories?.find((candidate) => candidate.id === request.storyId)
  if (!request.storyId || !story)
    return (
      <main className="component-capture-state">
        Story was not found. Available: {module?.stories?.map(({ id }) => id).join(', ') || 'none'}
      </main>
    )

  return (
    <main
      className="component-capture component-capture--story"
      data-designlab-capture-ready="story"
      data-capture-info={JSON.stringify(captureInfo)}
      data-source-mode={sourceMode}
      data-story-id={story.id}
    >
      <StoryCapture component={component} story={story} sourceStyle={sourceStyle} />
    </main>
  )
}
