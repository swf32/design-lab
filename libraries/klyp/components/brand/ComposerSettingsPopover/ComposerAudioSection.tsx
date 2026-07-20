/**
 * ComposerAudioSection — the controlled audio-settings section folded INTO
 * ComposerSettingsPopover (rendered when modality is audio). Co-located with
 * the popover; not a standalone DS component / not a catalog entry. Its public
 * types are re-exported from ComposerSettingsPopover.
 *
 *   1. Capability + Model — two Dropdown value pills on one row
 *   2. Voice              — full-width Dropdown picker (tts / dialogue only)
 *   3. Params             — SFX Duration / Music Length (per capability)
 *   4. Toggle             — SFX Loop
 *   5. Advanced           — Accordion: stability preset + Speed/Similarity/Style
 *
 * Fully presentational + controlled — the host owns every value and supplies
 * already-grouped voice options (via `option.group`) and a provider glyph on
 * each model option (`icon`). NO Convex, NO `@/lib/brand` — the brand package
 * is app-agnostic; copy comes via `labels` with EN defaults inline.
 *
 * Stability is set via Creative / Natural / Robust presets (ElevenLabs v3
 * dropped the raw stability slider); Speed / Similarity / Style stay as
 * fine-tuning sliders. The active preset is derived from the numeric
 * `voiceSettings.stability` (nearest preset).
 */

import './ComposerAudioSection.scss'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@klyp/ui/Accordion'
import { Slider } from '@klyp/ui/Slider'
import { Switch } from '@klyp/ui/Switch'
import { type ReactNode, useMemo } from 'react'
import { Dropdown, type DropdownOption } from '../Dropdown'
import { TabSwitcher } from '../TabSwitcher'

// =====================================================================
// Public types (re-exported from ComposerSettingsPopover)
// =====================================================================

export type ComposerAudioCapability = 'tts' | 'dialogue' | 'sfx' | 'music'

export interface ComposerAudioVoiceSettings {
  stability?: number
  similarityBoost?: number
  style?: number
  speed?: number
}

export interface ComposerAudioLabels {
  capability: string
  capTts: string
  capDialogue: string
  capSfx: string
  capMusic: string
  model: string
  voice: string
  voicePlaceholder: string
  sfxDuration: string
  sfxDurationAuto: string
  sfxLoop: string
  musicLength: string
  advanced: string
  stability: string
  presetCreative: string
  presetNatural: string
  presetRobust: string
  similarity: string
  style: string
  speed: string
}

const DEFAULT_LABELS: ComposerAudioLabels = {
  capability: 'Capability',
  capTts: 'Speech',
  capDialogue: 'Dialogue',
  capSfx: 'Sound FX',
  capMusic: 'Music',
  model: 'Model',
  voice: 'Voice',
  voicePlaceholder: 'Choose voice',
  sfxDuration: 'Duration',
  sfxDurationAuto: 'Auto',
  sfxLoop: 'Loop',
  musicLength: 'Length',
  advanced: 'Advanced',
  stability: 'Stability',
  presetCreative: 'Creative',
  presetNatural: 'Natural',
  presetRobust: 'Robust',
  similarity: 'Similarity',
  style: 'Style',
  speed: 'Speed',
}

/** Audio model option — the host supplies the provider glyph as `icon`
 *  (the brand package never infers provider). */
export interface ComposerAudioModelOption {
  id: string
  label: string
  badge?: string
  audioCapability?: string
  icon?: ReactNode
}

export interface ComposerAudioProps {
  capability: ComposerAudioCapability
  onCapabilityChange: (c: ComposerAudioCapability) => void
  audioModels: readonly ComposerAudioModelOption[]
  audioModelId: string
  onAudioModelChange: (id: string) => void
  /** Already grouped (Recent / Favorites / All) via `option.group`. */
  voiceOptions: readonly DropdownOption[]
  selectedVoiceId?: string
  onVoiceSelect: (id: string) => void
  voiceSettings: ComposerAudioVoiceSettings
  onVoiceSettingsChange: (next: ComposerAudioVoiceSettings) => void
  sfxParams: { durationSeconds: number | undefined; loop: boolean }
  onSfxParamsChange: (next: { durationSeconds: number | undefined; loop: boolean }) => void
  musicParams: { musicLengthMs: number }
  onMusicParamsChange: (next: { musicLengthMs: number }) => void
  /** Copy override (EN defaults inside). */
  labels?: Partial<ComposerAudioLabels>
}

// =====================================================================
// Presets / option sets
// =====================================================================

// Stability presets (ElevenLabs v3 — replaces the raw stability slider).
const STABILITY_PRESETS = [
  { id: 'creative', stability: 0.3 },
  { id: 'natural', stability: 0.5 },
  { id: 'robust', stability: 0.75 },
] as const

// SFX duration presets (seconds).
const SFX_DURATION_PRESETS = [0.5, 1, 2, 5, 10, 15, 20, 30] as const

// Music length presets (seconds → label).
const MUSIC_LENGTH_PRESETS: readonly { sec: number; label: string }[] = [
  { sec: 10, label: '10s' },
  { sec: 30, label: '30s' },
  { sec: 60, label: '1m' },
  { sec: 120, label: '2m' },
  { sec: 300, label: '5m' },
]

// =====================================================================
// Component
// =====================================================================

export function ComposerAudioSection({
  capability,
  onCapabilityChange,
  audioModels,
  audioModelId,
  onAudioModelChange,
  voiceOptions,
  selectedVoiceId,
  onVoiceSelect,
  voiceSettings,
  onVoiceSettingsChange,
  sfxParams,
  onSfxParamsChange,
  musicParams,
  onMusicParamsChange,
  labels,
}: ComposerAudioProps) {
  const copy = { ...DEFAULT_LABELS, ...labels }

  // 'dialogue' removed from the SELECTABLE options (spec 2026-07-02 §11.5.11):
  // the capability exists in the type union + submit path, but there is no
  // turns editor anywhere — selecting it dead-ended in a permanently disabled
  // submit (onSubmit requires text, dialogue requires per-turn text+voice).
  // Re-add together with the turns editor if the product asks for it. The
  // `ComposerAudioCapability` union and `capDialogue` label stay intact so
  // existing hosts keep compiling.
  const capabilityOptions = useMemo<DropdownOption[]>(
    () => [
      { id: 'tts', label: copy.capTts },
      { id: 'sfx', label: copy.capSfx },
      { id: 'music', label: copy.capMusic },
    ],
    [copy.capTts, copy.capSfx, copy.capMusic],
  )

  const sfxDurationOptions = useMemo<DropdownOption[]>(
    () => [
      { id: '__auto__', label: copy.sfxDurationAuto },
      ...SFX_DURATION_PRESETS.map((sec) => ({ id: String(sec), label: `${sec}s` })),
    ],
    [copy.sfxDurationAuto],
  )

  const musicLengthOptions = useMemo<DropdownOption[]>(
    () => MUSIC_LENGTH_PRESETS.map((o) => ({ id: String(o.sec), label: o.label })),
    [],
  )

  // Model options filtered to the active capability; the host's provider glyph
  // rides along as the row + trigger icon, and `badge` becomes the meta text.
  const modelOptions = useMemo<DropdownOption[]>(() => {
    return audioModels
      .filter((m) => !m.audioCapability || m.audioCapability === capability)
      .map((m) => ({ id: m.id, label: m.label, icon: m.icon, meta: m.badge }))
  }, [audioModels, capability])

  // Stability preset derived from the numeric value (nearest).
  const activePreset = useMemo(() => {
    const s = voiceSettings.stability ?? 0.5
    let best: (typeof STABILITY_PRESETS)[number] = STABILITY_PRESETS[1]
    for (const p of STABILITY_PRESETS) {
      if (Math.abs(p.stability - s) < Math.abs(best.stability - s)) best = p
    }
    return best.id
  }, [voiceSettings.stability])

  function handlePresetChange(id: string) {
    const preset = STABILITY_PRESETS.find((p) => p.id === id)
    if (preset) onVoiceSettingsChange({ ...voiceSettings, stability: preset.stability })
  }

  const showVoice = capability === 'tts' || capability === 'dialogue'
  const showSfxParams = capability === 'sfx'
  const showMusicParams = capability === 'music'
  const showAdvanced = capability === 'tts'

  // SFX duration controlled value (id string).
  const sfxDurationValue =
    sfxParams.durationSeconds === undefined ? '__auto__' : String(sfxParams.durationSeconds)

  // Music length controlled value (seconds → string, falling back to 30s).
  const currentMusicSec = Math.round(musicParams.musicLengthMs / 1000)
  const musicLengthValue = musicLengthOptions.some((o) => o.id === String(currentMusicSec))
    ? String(currentMusicSec)
    : '30'

  return (
    <>
      {/* 1+2. Capability + Model — two dropdowns on one row. When the
          capability exposes a single model (SFX / Music), capability fills the
          whole row (grid collapses to one column). */}
      <div
        className="klyp-ComposerAudioSection__modeRow"
        data-cols={modelOptions.length > 1 ? '2' : '1'}
      >
        <Dropdown
          aria-label={copy.capability}
          triggerLabel={
            capabilityOptions.find((o) => o.id === capability)?.label ?? copy.capability
          }
          options={capabilityOptions}
          selectionMode="single"
          indicator="none"
          selectedKeys={new Set([capability])}
          onSelectionChange={(ids) => {
            const [id] = ids
            if (id) onCapabilityChange(id as ComposerAudioCapability)
          }}
          side="top"
          align="start"
        />
        {modelOptions.length > 1 && (
          <Dropdown
            aria-label={copy.model}
            triggerIcon={modelOptions.find((o) => o.id === audioModelId)?.icon}
            triggerLabel={modelOptions.find((o) => o.id === audioModelId)?.label ?? copy.model}
            options={modelOptions}
            selectionMode="single"
            indicator="none"
            selectedKeys={new Set([audioModelId])}
            onSelectionChange={(ids) => {
              const [id] = ids
              if (id) onAudioModelChange(id)
            }}
            side="top"
            align="end"
          />
        )}
      </div>

      {/* 3. Voice — full-width picker, grouped via option.group (tts/dialogue). */}
      {showVoice && (
        <Dropdown
          aria-label={copy.voice}
          triggerLabel={
            voiceOptions.find((o) => o.id === selectedVoiceId)?.label ?? copy.voicePlaceholder
          }
          options={voiceOptions}
          selectionMode="single"
          indicator="none"
          selectedKeys={selectedVoiceId ? new Set([selectedVoiceId]) : new Set<string>()}
          onSelectionChange={(ids) => {
            const [id] = ids
            if (id) onVoiceSelect(id)
          }}
          side="top"
          align="end"
        />
      )}

      {/* 4a. SFX Duration */}
      {showSfxParams && (
        <div className="klyp-ComposerSettingsPopover__selectRow" data-modality="audio-sfx">
          <Dropdown
            aria-label={copy.sfxDuration}
            triggerLabel={
              sfxDurationOptions.find((o) => o.id === sfxDurationValue)?.label ?? copy.sfxDuration
            }
            options={sfxDurationOptions}
            selectionMode="single"
            indicator="none"
            selectedKeys={new Set([sfxDurationValue])}
            onSelectionChange={(ids) => {
              const [id] = ids
              if (id)
                onSfxParamsChange({
                  ...sfxParams,
                  durationSeconds: id === '__auto__' ? undefined : Number(id),
                })
            }}
            side="top"
            align="start"
          />
        </div>
      )}

      {/* 4b. Music Length */}
      {showMusicParams && (
        <div className="klyp-ComposerSettingsPopover__selectRow" data-modality="audio-music">
          <Dropdown
            aria-label={copy.musicLength}
            triggerLabel={
              musicLengthOptions.find((o) => o.id === musicLengthValue)?.label ?? copy.musicLength
            }
            options={musicLengthOptions}
            selectionMode="single"
            indicator="none"
            selectedKeys={new Set([musicLengthValue])}
            onSelectionChange={(ids) => {
              const [id] = ids
              if (id) onMusicParamsChange({ musicLengthMs: Number(id) * 1000 })
            }}
            side="top"
            align="start"
          />
        </div>
      )}

      {/* 5. SFX Loop toggle */}
      {showSfxParams && (
        <Switch
          isSelected={sfxParams.loop}
          onChange={(checked) => onSfxParamsChange({ ...sfxParams, loop: checked })}
          size="md"
          className="klyp-ComposerAudioSection__toggleRow"
        >
          {copy.sfxLoop}
        </Switch>
      )}

      {/* 6. Advanced — stability preset segmented + fine-tuning sliders (tts). */}
      {showAdvanced && (
        <Accordion className="klyp-ComposerAudioSection__advanced">
          <AccordionItem id="composer-audio-advanced">
            <AccordionTrigger>{copy.advanced}</AccordionTrigger>
            <AccordionContent>
              <div className="klyp-ComposerAudioSection__presetRow">
                <span className="klyp-ComposerAudioSection__sliderLabel">{copy.stability}</span>
                <TabSwitcher
                  value={activePreset}
                  onValueChange={handlePresetChange}
                  ariaLabel={copy.stability}
                  size="md"
                  fullWidth
                >
                  <TabSwitcher.Item value="creative">{copy.presetCreative}</TabSwitcher.Item>
                  <TabSwitcher.Item value="natural">{copy.presetNatural}</TabSwitcher.Item>
                  <TabSwitcher.Item value="robust">{copy.presetRobust}</TabSwitcher.Item>
                </TabSwitcher>
              </div>
              <SliderRow
                label={copy.speed}
                value={voiceSettings.speed ?? 1.0}
                min={0.7}
                max={1.2}
                step={0.01}
                onChange={(v) => onVoiceSettingsChange({ ...voiceSettings, speed: v })}
              />
              <SliderRow
                label={copy.similarity}
                value={voiceSettings.similarityBoost ?? 0.75}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => onVoiceSettingsChange({ ...voiceSettings, similarityBoost: v })}
              />
              <SliderRow
                label={copy.style}
                value={voiceSettings.style ?? 0}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => onVoiceSettingsChange({ ...voiceSettings, style: v })}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </>
  )
}

export default ComposerAudioSection

// =====================================================================
// SliderRow — label + value meta above the DS Slider
// =====================================================================

interface SliderRowProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}

function SliderRow({ label, value, min, max, step, onChange }: SliderRowProps) {
  const displayVal = value.toFixed(step < 0.1 ? 2 : 0)
  return (
    <div className="klyp-ComposerAudioSection__sliderRow">
      <div className="klyp-ComposerAudioSection__sliderMeta">
        <span className="klyp-ComposerAudioSection__sliderLabel">{label}</span>
        <span className="klyp-ComposerAudioSection__sliderValue">{displayVal}</span>
      </div>
      <Slider
        value={value}
        minValue={min}
        maxValue={max}
        step={step}
        aria-label={label}
        onChange={(v) => {
          if (typeof v === 'number') onChange(v)
        }}
      />
    </div>
  )
}
