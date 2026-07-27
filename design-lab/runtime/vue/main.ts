import {
  createApp,
  defineComponent,
  h,
  nextTick,
  reactive,
  ref,
  type App,
  type Component,
} from 'vue'
import './runtime.css'

type StoryExample = { label: string; props?: Record<string, unknown> }
type Story = {
  id: string
  kind?: string
  name: string
  description?: string
  examples?: StoryExample[]
}

const params = new URLSearchParams(window.location.search)
const view = params.get('view') ?? 'preview'
const mode = params.get('mode') ?? 'default'
const captureSurface = params.get('captureSurface') === 'true'

function applySourceModeClass(sourceMode: string) {
  const normalizedMode = sourceMode.trim().toLowerCase()
  document.documentElement.classList.toggle('light', normalizedMode === 'light')
  document.documentElement.classList.toggle('dark', normalizedMode === 'dark')
}

function jsonParameter<T>(name: string, fallback: T): T {
  const value = params.get(name)
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

async function runtimeImport(path: string | null) {
  if (!path) return null
  return import(/* @vite-ignore */ path)
}

function moduleDefault(module: Record<string, unknown> | null) {
  return (module?.default ?? module) as Component | null
}

function componentNode(component: Component, props: Record<string, unknown> = {}) {
  return h(component, props)
}

function surfaceClass(name: string) {
  return `${name}${captureSurface ? ' designlab-vue-surface--capture' : ''}`
}

function captureInfo(stories: Story[]) {
  const capabilities = [
    'component.preview',
    ...(stories.length ? ['component.story'] : []),
    'component.playground',
    'controls.args',
    'capture',
    'hmr',
  ]
  return {
    protocol: 'designlab.runtime',
    version: 1,
    ref: params.get('ref'),
    component: {
      id: params.get('componentId'),
      name: params.get('componentName'),
    },
    runtime: {
      profileId: params.get('profileId'),
      adapter: 'vue-sfc',
      technology: 'vue',
      capabilities,
    },
    availableModes: jsonParameter<string[]>('modes', []),
    modeRecommendations: jsonParameter<
      Array<{ mode: string; interfaceTheme: 'dark' | 'light' | null }>
    >('modeRecommendations', []),
    availableStories: stories.map(({ id, name, kind }) => ({ id, name, kind })),
    interfaceThemes: ['dark', 'light'],
    captures: {
      preview: {
        kind: 'preview',
        selector: '.designlab-vue-preview',
        cssWidth: 260,
        cssHeight: 150,
        dpr: 2,
      },
      ...(stories.length
        ? {
            story: {
              kind: 'story',
              selector: '.designlab-vue-story',
              cssWidth: 600,
              cssHeight: 180,
              dpr: 2,
            },
          }
        : {}),
    },
  }
}

async function start() {
  const [entryModule, previewModule, storiesModule, playgroundModule, setupModule] =
    await Promise.all([
      runtimeImport(params.get('entry')),
      runtimeImport(params.get('preview')),
      runtimeImport(params.get('stories')),
      runtimeImport(params.get('playground')),
      runtimeImport(params.get('setup')),
    ])
  const Entry = moduleDefault(entryModule)
  const Preview = moduleDefault(previewModule)
  const stories = ((storiesModule?.default ?? storiesModule)?.stories ?? []) as Story[]
  const playground = (playgroundModule?.default ?? playgroundModule) as Record<
    string,
    unknown
  > | null
  const appliedVariableNames = new Set<string>()
  const applyVariables = (variables: Record<string, string | number>) => {
    for (const name of appliedVariableNames)
      if (!(name in variables)) document.documentElement.style.removeProperty(name)
    appliedVariableNames.clear()
    for (const [name, value] of Object.entries(variables)) {
      document.documentElement.style.setProperty(name, String(value))
      appliedVariableNames.add(name)
    }
  }
  applyVariables(jsonParameter<Record<string, string | number>>('variables', {}))
  applySourceModeClass(mode)
  document.documentElement.style.setProperty('background', 'transparent', 'important')
  document.body.style.setProperty('background', 'transparent', 'important')
  document.documentElement.style.setProperty('color-scheme', 'normal', 'important')
  document.documentElement.dataset.sourceMode = mode

  if (!Entry && view !== 'preview') throw new Error('Vue runtime entry is unavailable.')
  const selectedStory = stories.find((story) => story.id === params.get('story')) ?? stories[0]
  const authoredArgs = jsonParameter<Record<string, unknown>>('args', {})
  const variantId = params.get('variant')
  const draftValues = jsonParameter<Record<string, unknown>>('values', {})
  const liveArgs = reactive({ ...authoredArgs })
  const liveValues = reactive({ ...draftValues })
  const liveVariant = ref(variantId)
  const liveMode = ref(mode)

  const replaceRecord = (target: Record<string, unknown>, next: Record<string, unknown>) => {
    for (const key of Object.keys(target)) delete target[key]
    Object.assign(target, next)
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window.parent) return
    const message = event.data as {
      protocol?: string
      version?: number
      type?: string
      runtimeId?: string
      payload?: {
        args?: Record<string, unknown>
        values?: Record<string, unknown>
        variant?: string
        mode?: string
        variables?: Record<string, string | number>
      }
    } | null
    if (
      message?.protocol !== 'designlab.runtime' ||
      message.version !== 1 ||
      message.runtimeId !== params.get('profileId')
    )
      return
    if (message.type === 'setArgs' && message.payload?.args)
      replaceRecord(liveArgs, message.payload.args)
    if (message.type === 'setState') {
      if (message.payload?.values) replaceRecord(liveValues, message.payload.values)
      if (message.payload?.variant) liveVariant.value = message.payload.variant
    }
    if (message.type === 'setMode' && message.payload?.mode) {
      liveMode.value = message.payload.mode
      if (message.payload.variables) applyVariables(message.payload.variables)
      applySourceModeClass(liveMode.value)
      document.documentElement.dataset.sourceMode = liveMode.value
    }
    if (message.type === 'setArgs' || message.type === 'setState' || message.type === 'setMode')
      void nextTick(() =>
        window.parent.postMessage(
          {
            protocol: 'designlab.runtime',
            version: 1,
            type: 'rendered',
            runtimeId: params.get('profileId'),
            payload: { view },
          },
          '*',
        ),
      )
  })

  const Root = defineComponent({
    name: 'DesignLabVueRuntimeRoot',
    setup() {
      if (view === 'preview')
        return () =>
          h(
            'main',
            {
              class: surfaceClass('designlab-vue-preview'),
              'data-source-mode': liveMode.value,
            },
            Preview
              ? h(Preview)
              : h('span', { class: 'designlab-vue-missing' }, 'Preview unavailable'),
          )
      if (view === 'story')
        return () =>
          h(
            'main',
            {
              class: surfaceClass('designlab-vue-story'),
              'data-source-mode': liveMode.value,
            },
            (selectedStory?.examples ?? []).map((example) =>
              h('div', { class: 'designlab-vue-example' }, [
                componentNode(Entry as Component, example.props ?? {}),
                h('code', example.label),
              ]),
            ),
          )
      if (view === 'draft')
        return () => {
          const draftVariant = (
            playground?.variants as Array<Record<string, unknown>> | undefined
          )?.find((variant) => variant.id === liveVariant.value)
          return h(
            'main',
            {
              class: surfaceClass('designlab-vue-playground'),
              'data-source-mode': liveMode.value,
            },
            componentNode(Entry as Component, {
              ...((draftVariant?.props as Record<string, unknown> | undefined) ?? {}),
              ...liveValues,
            }),
          )
        }
      const seed = selectedStory?.examples?.[0]?.props ?? {}
      return () =>
        h(
          'main',
          {
            class: surfaceClass('designlab-vue-playground'),
            'data-source-mode': liveMode.value,
          },
          componentNode(Entry as Component, { ...seed, ...liveArgs }),
        )
    },
  })

  const app = createApp(Root)
  if (typeof setupModule?.setup === 'function') await setupModule.setup(app as App)
  app.mount('#app')
  // Runtime plugins may initialize their own color-mode class during mount.
  // The selected source mode remains authoritative inside this isolated document.
  applySourceModeClass(liveMode.value)

  const info = captureInfo(stories)
  document.body.dataset.designlabRuntimeReady = 'true'
  const readyTarget = document.querySelector(
    view === 'story' ? '.designlab-vue-story' : '.designlab-vue-preview',
  )
  if (view === 'info') {
    const marker = document.createElement('main')
    marker.className = surfaceClass('designlab-vue-runtime-state')
    marker.textContent = 'Capture information ready'
    document.querySelector('#app')?.replaceChildren(marker)
  }
  const marker =
    view === 'info' ? document.querySelector('.designlab-vue-runtime-state') : readyTarget
  if (marker) {
    marker.setAttribute('data-designlab-capture-ready', view)
    marker.setAttribute('data-capture-info', JSON.stringify(info))
  }
  window.parent.postMessage(
    {
      protocol: 'designlab.runtime',
      version: 1,
      type: 'ready',
      runtimeId: params.get('profileId'),
      payload: { stories, playground },
    },
    '*',
  )
}

start().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  document.body.innerHTML = `<main class="designlab-vue-runtime-error"><strong>Vue preview could not start</strong><pre></pre></main>`
  const pre = document.querySelector('pre')
  if (pre) pre.textContent = message
  window.parent.postMessage(
    {
      protocol: 'designlab.runtime',
      version: 1,
      type: 'error',
      runtimeId: params.get('profileId'),
      payload: { message },
    },
    '*',
  )
})
