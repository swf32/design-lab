import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import type { DropdownOption } from '../Dropdown'
import { ModelInfoCard, type ModelInfoMetric } from '../ModelInfoCard'
import { ProviderIcon } from '../ProviderIcon'
import {
  type ComposerAudioCapability,
  type ComposerAudioProps,
  type ComposerAudioVoiceSettings,
  type ComposerModality,
  ComposerSettingsPanel,
  ComposerSettingsPopover,
  FrameRatioGlyph,
  type MotionControlValue,
  type MultiShotValue,
} from './ComposerSettingsPopover'

/**
 * Catalog presentation note
 * -------------------------
 * `ComposerSettingsPopover` is a PILL trigger that opens a POPOVER. The popover
 * panel is the meat of the component, but it only renders when open and portals
 * to <body> — so a grid of open popovers would stack into a wall and you'd have
 * to click to see anything.
 *
 * So the per-modality previews render the panel via the exported
 * `<ComposerSettingsPanel>` INLINE (no popover, no portal), wrapped in a
 * surface frame that mirrors the real popover chrome. That shows the actual UI
 * for each modality at a glance. The `Interactive` story shows the real
 * pill → popover behaviour.
 */

const meta = {
  title: 'Brand / Molecules / ComposerSettingsPopover',
  component: ComposerSettingsPopover,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ComposerSettingsPopover>

export default meta
type Story = StoryObj<typeof meta>

// ── Mock option sets (the host supplies these, already model-filtered) ──

const MODELS_BY_MODALITY: Record<string, readonly DropdownOption[]> = {
  text: [
    {
      id: 'claude-sonnet',
      label: 'Claude Sonnet 4.6',
      icon: <ProviderIcon provider="anthropic" />,
    },
    { id: 'gpt-5.5', label: 'GPT-5.5', icon: <ProviderIcon provider="openai" /> },
    { id: 'gemini-3', label: 'Gemini 3 Pro', icon: <ProviderIcon provider="google" /> },
  ],
  image: [
    { id: 'grok-imagine', label: 'Grok Imagine', icon: <ProviderIcon provider="xai" /> },
    { id: 'gpt-image', label: 'GPT Image', icon: <ProviderIcon provider="openai" /> },
    { id: 'nano-banana', label: 'Nano Banana', icon: <ProviderIcon provider="google" /> },
  ],
  video: [
    { id: 'kling', label: 'Kling 3.0', icon: <ProviderIcon provider="kling" /> },
    { id: 'seedance', label: 'Seedance 2.0', icon: <ProviderIcon provider="seedance" /> },
  ],
  audio: [{ id: 'eleven', label: 'ElevenLabs v2', icon: <ProviderIcon provider="elevenlabs" /> }],
}

// Demo model metadata for the hover detail card (`renderModelDetail`) — in the
// app the chat feature builds this from its model-info data.
const MODEL_DETAILS: Record<
  string,
  {
    provider: string
    description: string
    metrics: readonly ModelInfoMetric[]
    facts?: readonly string[]
    reasoning?: boolean
  }
> = {
  'claude-sonnet': {
    provider: 'Anthropic',
    description: 'Balanced flagship for everyday writing and creative direction.',
    metrics: [
      { label: 'Intelligence', value: 8, tone: 'success' },
      { label: 'Speed', value: 7, tone: 'warning' },
      { label: 'Context', value: 8, tone: 'info' },
      { label: 'Cost', value: 5, tone: 'danger' },
    ],
    reasoning: true,
  },
  'gpt-5.5': {
    provider: 'OpenAI',
    description: 'Versatile generalist with strong tool use and vision input.',
    metrics: [
      { label: 'Intelligence', value: 9, tone: 'success' },
      { label: 'Speed', value: 6, tone: 'warning' },
      { label: 'Context', value: 8, tone: 'info' },
      { label: 'Cost', value: 7, tone: 'danger' },
    ],
    reasoning: true,
  },
  'gemini-3': {
    provider: 'Google',
    description: 'Huge context; reads video, audio and PDFs as input.',
    metrics: [
      { label: 'Intelligence', value: 9, tone: 'success' },
      { label: 'Speed', value: 5, tone: 'warning' },
      { label: 'Context', value: 10, tone: 'info' },
      { label: 'Cost', value: 6, tone: 'danger' },
    ],
    reasoning: true,
  },
  kling: {
    provider: 'Kling',
    description: 'Cinematic motion and native audio — the go-to for character shots.',
    metrics: [
      { label: 'Quality', value: 9, tone: 'success' },
      { label: 'Speed', value: 5, tone: 'warning' },
      { label: 'Cost', value: 7, tone: 'danger' },
    ],
    facts: ['up to 15s', '1080p', 'audio'],
  },
  seedance: {
    provider: 'Seedance',
    description: 'Strict prompt adherence and multi-reference input.',
    metrics: [
      { label: 'Quality', value: 8, tone: 'success' },
      { label: 'Speed', value: 5, tone: 'warning' },
      { label: 'Cost', value: 6, tone: 'danger' },
    ],
    facts: ['reference video', 'multi-reference'],
  },
  'grok-imagine': {
    provider: 'xAI',
    description: 'Aurora image generation — stylised, photoreal-leaning frames.',
    metrics: [
      { label: 'Quality', value: 7, tone: 'success' },
      { label: 'Speed', value: 7, tone: 'warning' },
      { label: 'Cost', value: 4, tone: 'danger' },
    ],
    facts: ['up to 2K'],
  },
}

const IMAGE_ASPECTS: readonly DropdownOption[] = [
  { id: '1:1', short: '1:1', label: '1:1 — square', icon: <FrameRatioGlyph ratio="1:1" /> },
  { id: '16:9', short: '16:9', label: '16:9 — landscape', icon: <FrameRatioGlyph ratio="16:9" /> },
  { id: '9:16', short: '9:16', label: '9:16 — portrait', icon: <FrameRatioGlyph ratio="9:16" /> },
]

const IMAGE_SIZES: readonly DropdownOption[] = [
  { id: '1K', short: '1K', label: '1K — standard' },
  { id: '2K', short: '2K', label: '2K — high (default)' },
  { id: '4K', short: '4K', label: '4K — ultra' },
]

const VIDEO_DURATIONS: readonly DropdownOption[] = [
  { id: '5', short: '5s', label: '5s' },
  { id: '10', short: '10s', label: '10s' },
]

const VIDEO_ASPECTS: readonly DropdownOption[] = [
  { id: '9:16', short: '9:16', label: '9:16 — vertical', icon: <FrameRatioGlyph ratio="9:16" /> },
  { id: '16:9', short: '16:9', label: '16:9 — landscape', icon: <FrameRatioGlyph ratio="16:9" /> },
]

const VIDEO_RESOLUTIONS: readonly DropdownOption[] = [
  { id: '480p', short: '480p', label: '480p — preview' },
  { id: '720p', short: '720p', label: '720p — HD' },
  { id: '1080p', short: '1080p', label: '1080p — Full HD' },
]

const DEFAULT_MODEL: Record<string, string> = {
  text: 'claude-sonnet',
  image: 'grok-imagine',
  video: 'kling',
  audio: 'eleven',
}

// ── Demo audio data for the built-in audio section ──
const AUDIO_MODELS = [
  {
    id: 'eleven_v3',
    label: 'ElevenLabs v3',
    badge: 'Default',
    icon: <ProviderIcon provider="elevenlabs" size="sm" />,
  },
  {
    id: 'eleven_multilingual',
    label: 'Multilingual v2',
    icon: <ProviderIcon provider="elevenlabs" size="sm" />,
  },
] as const

const AUDIO_VOICES: readonly DropdownOption[] = [
  { id: 'rachel', label: 'Rachel', meta: 'American · female', group: 'Recent' },
  { id: 'antoni', label: 'Antoni', meta: 'American · male', group: 'Recent' },
  { id: 'bella', label: 'Bella', meta: 'British · female', group: 'Favorites' },
  { id: 'arnold', label: 'Arnold', meta: 'American · male', group: 'All voices' },
  { id: 'dorothy', label: 'Dorothy', meta: 'British · female', group: 'All voices' },
]

// ── Shared demo state — wires the panel/popover props with live local state so
//    every dropdown / toggle in the preview is interactive. ──

function useComposerDemoState(modality: ComposerModality) {
  const [modelByModality, setModelByModality] = useState<Record<string, string>>(DEFAULT_MODEL)
  const [aspect, setAspect] = useState('1:1')
  const [size, setSize] = useState('2K')
  const [duration, setDuration] = useState('5')
  const [videoAspect, setVideoAspect] = useState('9:16')
  const [resolution, setResolution] = useState('720p')
  const [withAudio, setWithAudio] = useState(false)
  const [cameraFixed, setCameraFixed] = useState(false)
  const [refMode, setRefMode] = useState<'frame' | 'reference'>('frame')

  // Kling parity extras (video).
  const [cameraMove, setCameraMove] = useState('none')
  const [multiShot, setMultiShot] = useState<MultiShotValue>({
    on: false,
    shotType: 'intelligence',
    shots: [],
  })
  const [motionControl, setMotionControl] = useState<MotionControlValue>({
    on: false,
    orientation: 'image',
  })

  // Audio section state.
  const [audioCapability, setAudioCapability] = useState<ComposerAudioCapability>('tts')
  const [audioModelId, setAudioModelId] = useState<string>(AUDIO_MODELS[0].id)
  const [voiceId, setVoiceId] = useState<string | undefined>(undefined)
  const [voiceSettings, setVoiceSettings] = useState<ComposerAudioVoiceSettings>({
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0,
    speed: 1,
  })
  const [sfxParams, setSfxParams] = useState<{
    durationSeconds: number | undefined
    loop: boolean
  }>({ durationSeconds: undefined, loop: false })
  const [musicParams, setMusicParams] = useState({ musicLengthMs: 30_000 })

  const backend = modality === 'audio2' ? 'audio' : modality
  const modelOptions = MODELS_BY_MODALITY[backend] ?? []
  const modelValue = modelByModality[backend]
  const setModel = (id: string) => setModelByModality((p) => ({ ...p, [backend]: id }))

  // Hover detail card in the model dropdown (renderModelDetail seam).
  const [reasoning, setReasoning] = useState('medium')
  const renderModelDetail = (opt: DropdownOption) => {
    const d = MODEL_DETAILS[opt.id]
    if (!d) return null
    return (
      <ModelInfoCard
        name={opt.label}
        icon={opt.icon}
        provider={d.provider}
        description={d.description}
        metrics={d.metrics}
        facts={d.facts}
        config={
          d.reasoning
            ? {
                label: 'Reasoning',
                options: [
                  { id: 'low', label: 'Low' },
                  { id: 'medium', label: 'Medium' },
                  { id: 'high', label: 'High' },
                ],
                value: reasoning,
                onChange: setReasoning,
              }
            : undefined
        }
      />
    )
  }

  const audio: ComposerAudioProps = {
    capability: audioCapability,
    onCapabilityChange: setAudioCapability,
    audioModels: AUDIO_MODELS,
    audioModelId,
    onAudioModelChange: setAudioModelId,
    voiceOptions: AUDIO_VOICES,
    selectedVoiceId: voiceId,
    onVoiceSelect: setVoiceId,
    voiceSettings,
    onVoiceSettingsChange: setVoiceSettings,
    sfxParams,
    onSfxParamsChange: setSfxParams,
    musicParams,
    onMusicParamsChange: setMusicParams,
  }

  return {
    backend,
    currentModel: modelOptions.find((m) => m.id === modelValue),
    props: {
      modelOptions,
      modelValue,
      onModelChange: setModel,
      renderModelDetail,
      showModeToggle: backend === 'video',
      frameSlots: 2,
      refMode,
      onRefModeChange: setRefMode,
      imageAspectOptions: IMAGE_ASPECTS,
      imageAspect: aspect,
      onImageAspectChange: setAspect,
      imageSizeOptions: IMAGE_SIZES,
      imageSize: size,
      onImageSizeChange: setSize,
      videoDurationOptions: VIDEO_DURATIONS,
      duration,
      onDurationChange: setDuration,
      videoAspectOptions: VIDEO_ASPECTS,
      videoAspect,
      onVideoAspectChange: setVideoAspect,
      videoResolutionOptions: VIDEO_RESOLUTIONS,
      videoResolution: resolution,
      onVideoResolutionChange: setResolution,
      showAudioToggle: true,
      audioHint: '~50% cost',
      withAudio,
      onWithAudioChange: setWithAudio,
      showStaticCamera: backend === 'video',
      staticCameraHint: 'no pan / zoom',
      cameraFixed,
      onCameraFixedChange: setCameraFixed,
      // Kling parity extras — only meaningful on video; harmless elsewhere.
      showCameraControl: backend === 'video',
      cameraMove,
      onCameraMoveChange: setCameraMove,
      showMultiShot: backend === 'video',
      multiShot,
      onMultiShotChange: setMultiShot,
      showMotionControl: backend === 'video',
      motionControl,
      onMotionControlChange: setMotionControl,
      audio,
    },
  }
}

/** Inline panel preview — the actual settings UI for one modality, framed like
 *  the real popover surface (no click needed to see it). */
function DemoPanel({ modality }: { modality: ComposerModality }) {
  const { props } = useComposerDemoState(modality)
  return (
    <div className="klyp-ComposerSettingsPopover-storyPanel">
      <ComposerSettingsPanel modality={modality} {...props} />
    </div>
  )
}

/** Interactive — the real composer pill. Click it to open the popover (the way
 *  it behaves in the chat composer footer). */
function DemoTrigger({ modality }: { modality: ComposerModality }) {
  const { backend, currentModel, props } = useComposerDemoState(modality)
  const triggerLabel = backend.charAt(0).toUpperCase() + backend.slice(1)
  return (
    <ComposerSettingsPopover
      modality={modality}
      triggerIcon={currentModel?.icon}
      triggerLabel={triggerLabel}
      triggerPreview={currentModel?.label}
      {...props}
    />
  )
}

/** Video — the richest panel: model + Duration / Aspect / Resolution + Audio +
 *  Static-camera toggles + Start/End ↔ Reference frame-mode + Kling camera /
 *  multi-shot / motion-control parity controls. */
export const Video: Story = { render: () => <DemoPanel modality="video" /> }

/** Image — model + Aspect / Size. */
export const Image: Story = { render: () => <DemoPanel modality="image" /> }

/** Audio — the built-in audio section (owns its own model select). */
export const Audio: Story = { render: () => <DemoPanel modality="audio" /> }

/** Text — model picker only (no generation params). */
export const Text: Story = { render: () => <DemoPanel modality="text" /> }

/** Interactive — the real trigger pill. Click to open the popover; open the
 *  model dropdown and hover a row to see the ModelInfoCard detail side-card. */
export const Interactive: Story = { render: () => <DemoTrigger modality="video" /> }
