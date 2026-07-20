import { type ReactNode, useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import type { AttachmentItem, AttachmentSlotGroupProps } from '../AttachmentSlotGroup'
import {
  type ComposerAudioCapability,
  type ComposerAudioProps,
  type ComposerAudioVoiceSettings,
  type ComposerModality,
  type ComposerSettingsPopoverProps,
  FrameRatioGlyph,
} from '../ComposerSettingsPopover'
import type { DropdownOption } from '../Dropdown'
import { InlineWarning } from '../InlineWarning'
import type { PromptFieldAttachment } from '../PromptField'
import { ProviderIcon } from '../ProviderIcon'
import { Composer } from './Composer'

// =====================================================================
// Fixtures — the former in-component demo hardcode (moved here in the
// 2026-07-02 controlled-contract inversion; the app supplies real data,
// stories keep the catalog interactive). Thumbnails are LOCAL catalog
// assets (`/model-samples/*.avif`, same set AttachmentSlot stories use) —
// no picsum / external network dependency.
// =====================================================================

const MODELS: Record<string, readonly DropdownOption[]> = {
  text: [
    { id: 'claude', label: 'Claude Sonnet 4.6', icon: <ProviderIcon provider="anthropic" /> },
    { id: 'gpt', label: 'GPT-5.5', icon: <ProviderIcon provider="openai" /> },
  ],
  image: [
    { id: 'grok-imagine', label: 'Grok Imagine', icon: <ProviderIcon provider="xai" /> },
    { id: 'nano-banana', label: 'Nano Banana', icon: <ProviderIcon provider="google" /> },
  ],
  video: [
    { id: 'kling', label: 'Kling 3.0', icon: <ProviderIcon provider="kling" /> },
    { id: 'seedance', label: 'Seedance 2.0', icon: <ProviderIcon provider="seedance" /> },
  ],
  audio: [{ id: 'eleven', label: 'ElevenLabs v2', icon: <ProviderIcon provider="elevenlabs" /> }],
}

const DEFAULT_MODEL: Record<string, string> = {
  text: 'claude',
  image: 'grok-imagine',
  video: 'kling',
  audio: 'eleven',
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

const VIDEO_CAPABILITY = {
  supportsImageInput: true,
  supportsFrames: true,
  supportsReference: true,
  frameSlots: 2 as const,
  maxReferenceImages: 4,
}

/** Per-mode reference cap from the demo capability (mirrors the app's
 *  `maxImageRefsForMode`, kept inline so stories need no app deps). */
function demoSlotMax(mode: 'frames' | 'reference'): number {
  return mode === 'reference'
    ? (VIDEO_CAPABILITY.maxReferenceImages ?? 7)
    : VIDEO_CAPABILITY.frameSlots
}

const PLACEHOLDER: Record<string, string> = {
  text: 'Message Chat…',
  image: 'Describe the image…',
  video: 'Describe the video clip…',
  audio: 'Enter text to speak…',
}

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

const CANNED_TRANSCRIPT = 'Make the lighting warmer and add a slow push-in.'

/** Local catalog thumbnails — model-sample AVIFs already shipped in
 *  apps/web/public (also used by AttachmentSlot stories). */
const THUMBS = [
  '/model-samples/openai.avif',
  '/model-samples/google.avif',
  '/model-samples/luma.avif',
  '/model-samples/runway.avif',
] as const

const att = (id: string, name: string, i: number): PromptFieldAttachment => ({
  id,
  kind: 'upload',
  name,
  thumbnailUrl: THUMBS[i % THUMBS.length],
})

const ref = (id: string, i: number): AttachmentItem => ({
  id,
  thumbnailUrl: THUMBS[i % THUMBS.length],
})

// =====================================================================
// DemoComposer — stateful story host (spec 2026-07-02 §11.5.13).
// `<Composer>` is fully controlled and would be inert if rendered bare, so
// the playground / story cards render THIS host: it owns the demo state the
// old demo-shell Composer used to own and feeds the controlled contract.
// =====================================================================

export interface DemoComposerProps {
  /** Active modality — drives model set / placeholder / settings rows. */
  modality?: ComposerModality
  /** Seed prompt text. */
  initialValue?: string
  /** Seed generic prompt attachments (image tiles). */
  initialAttachments?: PromptFieldAttachment[]
  /** Seed video Start/End / reference images (video modality). */
  initialVideoImages?: AttachmentItem[]
  /** Stream status driving the submit (streaming → Stop, error → Retry). */
  status?: 'idle' | 'submitting' | 'streaming' | 'error'
  /** Mid-submit flag — dims the shell, gates settings pill / mic / slots. */
  busy?: boolean
  /** Error line under the textarea (role="alert"). */
  error?: string | null
  /** Tooltip on the soft-disabled submit + placeholder hover pulse. */
  submitHint?: string
  /** Banner above the textarea (InlineWarning). */
  warning?: ReactNode
}

export function DemoComposer({
  modality: modalityProp = 'text',
  initialValue = '',
  initialAttachments = [],
  initialVideoImages = [],
  status,
  busy = false,
  error,
  submitHint,
  warning,
}: DemoComposerProps) {
  const [text, setText] = useState(initialValue)
  const [modality, setModality] = useState<ComposerModality>(modalityProp)
  const [modelByModality, setModelByModality] = useState<Record<string, string>>(DEFAULT_MODEL)
  const [attachments, setAttachments] = useState<PromptFieldAttachment[]>(initialAttachments)
  const [videoImages, setVideoImages] = useState<AttachmentItem[]>(initialVideoImages)

  // Playground interactivity: when the `modality` CONTROL changes, reset the
  // internal state to follow it (the sanctioned adjust-state-during-render
  // pattern — no useEffect for derived state).
  const [prevModalityProp, setPrevModalityProp] = useState(modalityProp)
  if (modalityProp !== prevModalityProp) {
    setPrevModalityProp(modalityProp)
    setModality(modalityProp)
  }

  const [imageAspect, setImageAspect] = useState('1:1')
  const [imageSize, setImageSize] = useState('2K')
  const [duration, setDuration] = useState('5')
  const [videoAspect, setVideoAspect] = useState('9:16')
  const [resolution, setResolution] = useState('720p')
  const [withAudio, setWithAudio] = useState(false)
  const [cameraFixed, setCameraFixed] = useState(false)
  const [refMode, setRefMode] = useState<'frame' | 'reference'>('frame')

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

  const backend = modality === 'audio2' ? 'audio' : modality
  const isVideo = modality === 'video'
  const modelOptions = MODELS[backend] ?? []
  const modelValue = modelByModality[backend]
  const currentModel = modelOptions.find((m) => m.id === modelValue)

  const triggerLabel = backend.charAt(0).toUpperCase() + backend.slice(1)
  const triggerPreview = isVideo
    ? `${currentModel?.label} · ${videoAspect} · ${resolution}`
    : modality === 'image'
      ? `${currentModel?.label} · ${imageAspect} · ${imageSize}`
      : currentModel?.label

  // Demo file → attachment tile (object URL) so the shell stays interactive.
  const addFilesAsTiles = (files: File[]) => {
    const next = files.map((f) => ({
      id: `att-${f.name}-${f.size}`,
      kind: 'upload' as const,
      name: f.name,
      thumbnailUrl: URL.createObjectURL(f),
    }))
    setAttachments((prev) => [...prev, ...next])
  }

  // Demo "add a reference" — no library modal in stories; an empty-slot click
  // appends a local placeholder tile (the app wires onAdd to the real picker).
  const addDemoRef = () =>
    setVideoImages((prev) => [
      ...prev,
      { id: `ref-${Date.now()}-${prev.length}`, thumbnailUrl: THUMBS[prev.length % THUMBS.length] },
    ])

  const settings: ComposerSettingsPopoverProps = {
    modality,
    triggerIcon: currentModel?.icon,
    triggerLabel,
    triggerPreview,
    showModalitySwitcher: true,
    onModalityChange: (next) => setModality(next as ComposerModality),
    modelOptions,
    modelValue,
    onModelChange: (id) => setModelByModality((p) => ({ ...p, [backend]: id })),
    showModeToggle: isVideo,
    frameSlots: 2,
    refMode,
    onRefModeChange: setRefMode,
    imageAspectOptions: IMAGE_ASPECTS,
    imageAspect,
    onImageAspectChange: setImageAspect,
    imageSizeOptions: IMAGE_SIZES,
    imageSize,
    onImageSizeChange: setImageSize,
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
    showStaticCamera: true,
    staticCameraHint: 'no pan / zoom',
    cameraFixed,
    onCameraFixedChange: setCameraFixed,
    audio,
  }

  // Effective slot mode: reference when the model is reference-only OR the
  // user toggled Reference; else frames. In the APP this derivation is the
  // container's (single source shared with submit); the demo host plays the
  // container's role here.
  const slotMode: 'frames' | 'reference' =
    VIDEO_CAPABILITY.supportsReference &&
    (!VIDEO_CAPABILITY.supportsFrames || refMode === 'reference')
      ? 'reference'
      : 'frames'

  const videoSlots: Omit<AttachmentSlotGroupProps, 'disabled' | 'className' | 'ref'> | undefined =
    isVideo
      ? {
          mode: slotMode,
          max: demoSlotMax(slotMode),
          frameSlots: VIDEO_CAPABILITY.frameSlots,
          items: videoImages,
          onAdd: addDemoRef,
          onRemove: (id) => setVideoImages((prev) => prev.filter((i) => i.id !== id)),
          onSwap: () =>
            setVideoImages((prev) =>
              prev.length >= 2 ? [prev[1], prev[0], ...prev.slice(2)] : prev,
            ),
        }
      : undefined

  return (
    <Composer
      value={text}
      onValueChange={setText}
      placeholder={PLACEHOLDER[backend]}
      submitHint={submitHint}
      onSubmit={() => {}}
      onStop={() => {}}
      status={status}
      busy={busy}
      error={error}
      attachments={attachments}
      onAttachmentsChange={setAttachments}
      onFiles={addFilesAsTiles}
      fileAccept={isVideo ? ['image/', 'video/'] : 'image/'}
      videoSlots={videoSlots}
      settings={settings}
      onTranscribe={async () => CANNED_TRANSCRIPT}
      warning={warning}
    />
  )
}

// =====================================================================
// Meta
// =====================================================================

const meta = {
  title: 'Brand / Molecules / Composer',
  component: DemoComposer,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    modality: 'text',
    busy: false,
    status: 'idle',
  },
  argTypes: {
    // >3 options → select (house rule: inline-radio ≤3 / select >3).
    modality: { control: 'select', options: ['text', 'image', 'video', 'audio'] },
    status: { control: 'select', options: ['idle', 'submitting', 'streaming', 'error'] },
    busy: { control: 'boolean' },
    initialValue: { control: 'text' },
    submitHint: { control: 'text' },
    error: { control: 'text' },
    // Compound / node props — no sensible control.
    initialAttachments: { control: false },
    initialVideoImages: { control: false },
    warning: { control: false },
  },
} satisfies Meta<typeof DemoComposer>

export default meta
type Story = StoryObj<typeof meta>

// =====================================================================
// Stories — args-based against the DemoComposer host
// =====================================================================

/**
 * Text — the default chat composer: adaptive textarea + footer (attach ·
 * settings pill · voice dictation · submit). Type to grow the field; open the
 * pill to switch modality / model / settings. Switching to Video reveals the
 * reference slots.
 */
export const Text: Story = { args: { modality: 'text' } }

/** Image — image modality; the settings pill shows model · aspect · size. */
export const Image: Story = { args: { modality: 'image' } }

/** Video — video modality: empty Start / End reference slots appear above the
 *  textarea, settings pill shows model · aspect · resolution. */
export const Video: Story = { args: { modality: 'video' } }

/** VideoWithFrames — video modality with both keyframe slots filled (tiles +
 *  swap + Start/End badges). */
export const VideoWithFrames: Story = {
  args: { modality: 'video', initialVideoImages: [ref('a', 0), ref('b', 1)] },
}

/** VideoStartOnly — partial frame state: only the Start keyframe is filled (a
 *  tile); the End slot stays an empty dashed dropzone. */
export const VideoStartOnly: Story = {
  args: { modality: 'video', initialVideoImages: [ref('a', 0)] },
}

/** WithAttachments — generic prompt attachments (image tiles) shown above the
 *  textarea via PromptField's attachment slot. */
export const WithAttachments: Story = {
  args: {
    modality: 'image',
    initialAttachments: [att('1', 'reference.png', 0), att('2', 'mood.png', 1)],
  },
}

/**
 * Adaptive — the composer adapts to its CONTAINER width (not the viewport).
 * The footer is a single row on every width — attach · settings pill · voice ·
 * submit — and the settings pill carries the modality switcher + model +
 * per-modality settings inside its popover, so nothing crushes on a
 * phone-width surface. The pill's own trigger label compacts on narrow widths.
 */
export const Adaptive: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div
        style={{
          width: 360,
          padding: 12,
          border: '1px dashed rgba(255,255,255,0.2)',
          borderRadius: 12,
        }}
      >
        <code style={{ display: 'block', fontSize: 12, opacity: 0.6, marginBottom: 8 }}>
          container 360px — phone width
        </code>
        <DemoComposer modality="video" />
      </div>
      <div
        style={{
          width: 720,
          padding: 12,
          border: '1px dashed rgba(255,255,255,0.2)',
          borderRadius: 12,
        }}
      >
        <code style={{ display: 'block', fontSize: 12, opacity: 0.6, marginBottom: 8 }}>
          container 720px — desktop width
        </code>
        <DemoComposer modality="video" />
      </div>
    </div>
  ),
}

/** Busy — mid-submit: the submit shows its busy a11y name and the controls
 *  (settings pill, mic, slots) dim while a generation is in flight. */
export const Busy: Story = { args: { modality: 'image', busy: true, status: 'submitting' } }

/** Streaming — a response is streaming back: the submit swaps to the silver
 *  square Stop (`status='streaming'`); clicking it cancels the stream in the app. */
export const Streaming: Story = { args: { modality: 'text', status: 'streaming' } }

/** WithWarning — an attachment trips the selected model's limits: a borderless
 *  InlineWarning sits above the textarea (the chat feeds this from its
 *  per-model attachment checks). */
export const WithWarning: Story = {
  args: {
    modality: 'image',
    initialAttachments: [att('1', 'huge-poster.png', 2)],
    warning: (
      <InlineWarning tone="warning" size="sm" lead="Nano Banana.">
        1 attachment is incompatible with this model. Remove it or switch model.
      </InlineWarning>
    ),
  },
}

/** SoftDisabledHint — empty prompt + `submitHint`: the disabled submit turns
 *  SOFT (aria-disabled, still hoverable) and hover shows the tooltip while the
 *  textarea placeholder pulses, pointing the eye at "type here first"
 *  (spec 2026-07-02 §5 Phase 2). Type anything → the hint disappears and the
 *  accent CTA wakes up. */
export const SoftDisabledHint: Story = {
  args: { modality: 'image', submitHint: 'Add a prompt or upload an asset' },
}
