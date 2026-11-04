import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import {
  CaptureSurface,
  ComponentCard,
  ComponentThumbnail,
  StoryCanvas,
} from '@design-lab/system/components'
import { getModuleData, type ModuleData } from '../../api/projects'
import { designSystemModeStyle } from '../../designSystemMode'
import { createRuntimeCaptureInfo } from '../../../shared/runtimeProtocol.mjs'
import {
  previewComponentFor,
  storyModuleFor,
  type ComponentEntity,
  type StoryDefinition,
} from '../../componentRuntime'

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

  if (error) return <CaptureSurface kind="state">{error}</CaptureSurface>
  if (!data) return <CaptureSurface kind="state">Loading capture…</CaptureSurface>

  const component = data.components.find((candidate) => candidate.id === request.componentId)
  if (!component) return <CaptureSurface kind="state">Component was not found</CaptureSurface>
  if (!component.capabilities.includes('capture'))
    return (
      <CaptureSurface kind="state">
        {component.technology} adapter does not provide a capture surface for this Component yet.
      </CaptureSurface>
    )

  const sourceMode = request.sourceMode ?? data.modes[0] ?? 'default'
  if (data.modes.length && !data.modes.includes(sourceMode))
    return (
      <CaptureSurface kind="state">
        Unknown source mode “{sourceMode}”. Available: {data.modes.join(', ')}
      </CaptureSurface>
    )

  const sourceStyle = designSystemModeStyle(data.themeVariables, sourceMode) as CSSProperties
  const module = storyModuleFor(component)
  const availableStories = (module?.stories ?? []).map(({ id, name, kind }) => ({ id, name, kind }))
  const captureInfo = createRuntimeCaptureInfo({
    ref: `${request.sourceId}:component:${component.id}`,
    component: { id: component.id, name: component.name },
    runtime: {
      profileId: `${request.sourceId}:react-compatibility`,
      adapter: 'react-compatibility',
      technology: 'react',
      capabilities: [
        'component.preview',
        ...(availableStories.length ? ['component.story'] : []),
        'capture',
        'hmr',
      ],
    },
    availableModes: data.modes,
    modeRecommendations: data.modes.map((mode) => ({
      mode,
      interfaceTheme: recommendedInterfaceTheme(data.themeVariables[mode] ?? {}),
    })),
    availableStories,
    interfaceThemes: ['dark', 'light'],
    captures: {
      preview: {
        kind: 'preview',
        selector: '.dl-component-card__preview',
        cssWidth: 260,
        cssHeight: 150,
        dpr: 2,
      },
      ...(availableStories.length
        ? {
            story: {
              kind: 'story',
              selector: '.dl-story-canvas__stage',
              cssWidth: 600,
              cssHeight: 180,
              dpr: 2,
            },
          }
        : {}),
    },
  })
  if (request.capture === 'info')
    return (
      <CaptureSurface
        kind="state"
        data-designlab-capture-ready="info"
        data-capture-info={JSON.stringify(captureInfo)}
      >
        Capture information ready
      </CaptureSurface>
    )

  if (request.capture === 'preview') {
    const Preview = previewComponentFor(component, request.sourceId)
    return (
      <CaptureSurface
        kind="preview"
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
      </CaptureSurface>
    )
  }

  const story = module?.stories?.find((candidate) => candidate.id === request.storyId)
  if (!request.storyId || !story)
    return (
      <CaptureSurface kind="state">
        Story was not found. Available: {module?.stories?.map(({ id }) => id).join(', ') || 'none'}
      </CaptureSurface>
    )

  return (
    <CaptureSurface
      kind="story"
      data-designlab-capture-ready="story"
      data-capture-info={JSON.stringify(captureInfo)}
      data-source-mode={sourceMode}
      data-story-id={story.id}
    >
      <StoryCapture component={component} story={story} sourceStyle={sourceStyle} />
    </CaptureSurface>
  )
}
