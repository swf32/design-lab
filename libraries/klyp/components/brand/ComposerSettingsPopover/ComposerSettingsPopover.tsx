import './ComposerSettingsPopover.scss'

import { ClockOutline, DiamondOutline } from '@klyp/icons/outline'
import { Button } from '@klyp/ui/Button'
import { Switch } from '@klyp/ui/Switch'
import { type ReactNode, type SVGProps, useMemo, useState } from 'react'
import { Dialog as RACDialog, DialogTrigger as RACDialogTrigger } from 'react-aria-components'
import { Dropdown, type DropdownOption } from '../Dropdown'
import { Popover } from '../Popover'
import { TabSwitcher } from '../TabSwitcher'
import {
  type ComposerAudioCapability,
  type ComposerAudioLabels,
  type ComposerAudioModelOption,
  type ComposerAudioProps,
  ComposerAudioSection,
  type ComposerAudioVoiceSettings,
} from './ComposerAudioSection'
import {
  ComposerMultiShot,
  type ComposerMultiShotLabels,
  type MultiShotShot,
  type MultiShotShotType,
  type MultiShotValue,
} from './ComposerMultiShot'

// Re-export the folded-in section types so consumers import them from the
// popover (and the barrel) rather than the co-located internal files.
export type {
  ComposerAudioCapability,
  ComposerAudioLabels,
  ComposerAudioModelOption,
  ComposerAudioProps,
  ComposerAudioVoiceSettings,
  ComposerMultiShotLabels,
  MultiShotShot,
  MultiShotShotType,
  MultiShotValue,
}

/** Kling Motion Control composer state — `on` gates the mode; `orientation`
 *  picks which source dictates the character's orientation (image | video). */
export type MotionControlValue = { on: boolean; orientation: 'image' | 'video' }

/**
 * `<ComposerSettingsPopover>` — unified settings UI for the chat composer.
 *
 * One pill trigger in the composer footer opens one popover above it
 * containing the model picker + per-modality generation settings
 * (aspect / size / duration / resolution / audio / static-camera /
 * frame-mode) + a bottom modality switcher. Inspired by Higgsfield's
 * composer pill — one anchor, one popover.
 *
 * Composed entirely from DS primitives, no new generic markup:
 *   - RAC `<DialogTrigger>` + `<Button>` + `<Popover>` + `<Dialog>`
 *   - `<TabSwitcher>` (segmented — modality + frame-mode)
 *   - `<Dropdown>` (model / aspect / size / duration / resolution)
 *   - `<Switch>` (audio / static-camera toggle rows)
 *
 * Presentational + fully decoupled from the chat feature: the host owns
 * all state and supplies option arrays already filtered to what the
 * current model accepts. Three host-supplied seams keep it app-agnostic:
 *   1. `triggerIcon` + per-option `icon` — host passes a `<ProviderIcon>`
 *      (this component never resolves provider taxonomy).
 *   2. `audio` — the controlled audio props for the built-in audio section
 *      (folded in 2026-06-30 from the former standalone AudioControls; the
 *      audio modality owns its own model selection, so the top model
 *      dropdown is hidden then).
 *   3. `labels` — EN defaults inside, host overrides for i18n / brand.
 *
 * Video parity (Kling) extras — all opt-in via their `show*` flags, all
 * presentational (host owns state): camera-control preset dropdown,
 * multi-shot storyboard editor (folded-in <ComposerMultiShot>), and
 * motion-control (toggle + image/video orientation switcher + hint).
 */

// =====================================================================
// Modality
// =====================================================================

/**
 * Modality the composer is in. `audio2` is a UI-only variant the host may
 * use for an alternate audio panel — this component treats it like `audio`
 * for layout (hides the model dropdown, renders the built-in audio section).
 */
export type ComposerModality = 'text' | 'image' | 'video' | 'audio' | 'audio2'

// =====================================================================
// Labels (EN defaults — override via `labels` prop)
// =====================================================================

export interface ComposerSettingsLabels {
  triggerAria: string
  modality: string
  modalityText: string
  modalityImage: string
  modalityVideo: string
  modalityAudio: string
  submode: string
  submodeFrame: string
  /** Frame-mode label for single-slot models (e.g. Grok = first frame only). */
  submodeFrameSingle: string
  submodeReference: string
  aspect: string
  size: string
  duration: string
  resolution: string
  audio: string
  staticCamera: string
  // ── Camera control (Kling) ──────────────────────────────────────
  camera: string
  cameraNone: string
  cameraDownBack: string
  cameraForwardUp: string
  cameraRight: string
  cameraLeft: string
  // ── Multi-shot (Kling) ──────────────────────────────────────────
  multiShot: string
  multiShotHint: string
  // ── Motion control (Kling) ──────────────────────────────────────
  motionControl: string
  motionControlHint: string
  motionOrientation: string
  motionImage: string
  motionVideo: string
  motionAttachHint: string
}

const DEFAULT_LABELS: ComposerSettingsLabels = {
  triggerAria: 'Settings — model and generation parameters',
  modality: 'Modality',
  modalityText: 'Text',
  modalityImage: 'Image',
  modalityVideo: 'Video',
  modalityAudio: 'Audio',
  submode: 'Mode',
  submodeFrame: 'Start/End',
  submodeFrameSingle: 'Start',
  submodeReference: 'Reference',
  aspect: 'Aspect',
  size: 'Size',
  duration: 'Duration',
  resolution: 'Resolution',
  audio: 'Audio',
  staticCamera: 'Static camera',
  camera: 'Camera',
  cameraNone: 'No camera move',
  cameraDownBack: 'Pull back',
  cameraForwardUp: 'Push in',
  cameraRight: 'Orbit right',
  cameraLeft: 'Orbit left',
  multiShot: 'Multi-shot',
  multiShotHint: 'storyboard, up to 6 cuts',
  motionControl: 'Motion Control',
  motionControlHint: 'animate a character with a driving video',
  motionOrientation: 'Match orientation to',
  motionImage: 'Image',
  motionVideo: 'Video',
  motionAttachHint: 'Attach a character image + a driving video in the composer.',
}

/** Default Kling camera presets. The host may override the whole set via the
 *  `cameraOptions` prop; otherwise these are built from the `camera*` labels.
 *  `id` = the `camera_control.type` value the backend expects ('none' = off). */
function defaultCameraOptions(copy: ComposerSettingsLabels): DropdownOption[] {
  return [
    { id: 'none', label: copy.cameraNone },
    { id: 'down_back', label: copy.cameraDownBack },
    { id: 'forward_up', label: copy.cameraForwardUp },
    { id: 'right_turn_forward', label: copy.cameraRight },
    { id: 'left_turn_forward', label: copy.cameraLeft },
  ]
}

// =====================================================================
// Inline glyph — ratio-aware frame
// =====================================================================

/**
 * Ratio-aware frame glyph — renders a rect whose shape matches the actual
 * aspect ratio ("16:9" → wide, "9:16" → tall, "1:1" → square). Lets users
 * read shape, not just digits, in the option list. Exported so hosts can
 * reuse it when building their own aspect option icons.
 */
export function FrameRatioGlyph({ ratio, ...rest }: { ratio: string } & SVGProps<SVGSVGElement>) {
  const [a, b] = ratio.split(':').map(Number)
  const w = Number.isFinite(a) ? a : 1
  const h = Number.isFinite(b) ? b : 1
  const maxDim = 12
  const scale = maxDim / Math.max(w, h)
  const rectW = w * scale
  const rectH = h * scale
  const x = (16 - rectW) / 2
  const y = (16 - rectH) / 2
  return (
    <svg
      viewBox="0 0 16 16"
      width={14}
      height={14}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
      {...rest}
    >
      <rect x={x} y={y} width={rectW} height={rectH} rx="1" />
    </svg>
  )
}

// =====================================================================
// Props
// =====================================================================

export interface ComposerSettingsPopoverProps {
  // ── Split ─────────────────────────────────────────────────────────
  /** Which half of the controls this instance renders. The composer footer
   *  splits the old single pill into a MODEL pill (`'model'` — modality
   *  switcher + model dropdown) and a SETTINGS pill (`'settings'` — aspect /
   *  size / duration / resolution / audio / camera / etc.). `'all'` (default)
   *  keeps the original combined pill (catalog / standalone). */
  section?: 'model' | 'settings' | 'all'
  /** Per-instance trigger aria (overrides `labels.triggerAria`) — e.g. "Model"
   *  vs "Settings" for the two split pills. */
  triggerAria?: string

  // ── Modality ──────────────────────────────────────────────────────
  /** Active modality — drives which control rows render. */
  modality: ComposerModality
  /** Render the Text/Image/Video/Audio modality switcher INSIDE the popover
   *  panel — used on MOBILE (narrow composer) where the standalone footer
   *  switcher is replaced by this single settings pill. */
  showModalitySwitcher?: boolean
  /** Fires when the in-popover modality switcher changes (mobile). */
  onModalityChange?: (next: string) => void

  // ── Trigger pill ──────────────────────────────────────────────────
  /** Provider glyph for the current model (host passes `<ProviderIcon>`). */
  triggerIcon?: ReactNode
  /** Short modality label shown on narrow footers (e.g. "Image"). */
  triggerLabel: string
  /** Inline preview shown on wide footers (e.g. "Grok Imagine · 1:1 · 2K").
   *  Rendered as-is into a span, so any node is fine (an option's `label` is a
   *  ReactNode now that the picker types are unified on DropdownOption). */
  triggerPreview?: ReactNode
  /** Transient accent-glow on the trigger pill — the host points the user at
   *  the model picker (e.g. the chat's StartCreating cards glow the pill while
   *  hovered). Same gold treatment as Button `variant='accent'`, fades in/out
   *  over `--duration-fast` (see the `data-accent-hint` rules in the SCSS). */
  triggerGlow?: boolean

  // ── Split-pill trigger transport (read by the two-pill <Composer> layout;
  //    the popover itself only uses these on the pill it renders) ──────────
  /** SETTINGS pill: leading glyph (host passes `<SettingsOutline>`). */
  settingsIcon?: ReactNode
  /** SETTINGS pill: label (e.g. "Settings"). */
  settingsLabel?: string
  /** SETTINGS pill: inline preview (e.g. "1:1 · 2K" / "5s · 720p"). */
  settingsPreview?: ReactNode
  /** Per-pill aria for the split layout. */
  modelAria?: string
  settingsAria?: string
  /** Two-pill layout: whether the SETTINGS pill has anything to show (false for
   *  text modality — no aspect / duration / audio). The <Composer> hides the
   *  settings pill when false. Default true. */
  hasSettings?: boolean

  // ── Model dropdown (hidden for audio / audio2) ────────────────────
  modelOptions?: readonly DropdownOption[]
  modelValue?: string
  onModelChange?: (id: string) => void
  /** Detail side-card for the hovered / focused model row — threaded to the
   *  model Dropdown's `renderDetail` slot. The host builds the card node
   *  (e.g. `<ModelInfoCard>` fed by its model metadata); this component stays
   *  model-agnostic. Return `null` for models with nothing to show. */
  renderModelDetail?: (option: DropdownOption) => ReactNode

  // ── Frame-mode toggle (Start/End ↔ Reference), video only ─────────
  /** Show the Start/End ↔ Reference switcher (model has both modes). */
  showModeToggle?: boolean
  /** Keyframe slot count — 1 → frame label is "Start", 2 → "Start/End". */
  frameSlots?: number
  refMode?: 'frame' | 'reference'
  onRefModeChange?: (m: 'frame' | 'reference') => void

  // ── Image params ──────────────────────────────────────────────────
  imageAspectOptions?: readonly DropdownOption[]
  imageAspect?: string
  onImageAspectChange?: (v: string) => void
  imageSizeOptions?: readonly DropdownOption[]
  imageSize?: string
  onImageSizeChange?: (v: string) => void

  // ── Video params ──────────────────────────────────────────────────
  videoDurationOptions?: readonly DropdownOption[]
  duration?: string
  onDurationChange?: (v: string) => void
  videoAspectOptions?: readonly DropdownOption[]
  videoAspect?: string
  onVideoAspectChange?: (v: string) => void
  /** Omit / empty → Resolution row collapses (model is single-resolution). */
  videoResolutionOptions?: readonly DropdownOption[]
  videoResolution?: string
  onVideoResolutionChange?: (v: string) => void
  /** Show the Audio toggle row (model declares audio support). */
  showAudioToggle?: boolean
  audioHint?: string
  withAudio?: boolean
  onWithAudioChange?: (b: boolean) => void
  /** Show the Static-camera toggle row (Seedance family that supports it). */
  showStaticCamera?: boolean
  staticCameraHint?: string
  cameraFixed?: boolean
  onCameraFixedChange?: (b: boolean) => void

  // ── Camera control (Kling) — a `camera_control.type` movement preset ──
  /** Show the camera-control preset dropdown (Standard Kling only). */
  showCameraControl?: boolean
  /** Override the preset list; defaults to the built-in Kling presets. */
  cameraOptions?: readonly DropdownOption[]
  /** Selected preset id ('none' = off). */
  cameraMove?: string
  onCameraMoveChange?: (v: string) => void

  // ── Multi-shot / storyboard (Kling 3.0+) ──────────────────────────
  /** Show the multi-shot toggle (+ cut editor when on). */
  showMultiShot?: boolean
  multiShot?: MultiShotValue
  onMultiShotChange?: (next: MultiShotValue) => void
  /** Copy override for the inner cut editor (host i18n). Merged over the EN
   *  defaults; `seconds` falls back to the built-in `${n}s` when omitted. */
  multiShotLabels?: Partial<ComposerMultiShotLabels>

  // ── Motion control (Kling 2.6 / 3.0) ──────────────────────────────
  /** Show the motion-control toggle (+ orientation switcher + hint when on).
   *  The character image + driving video are attached in the composer. */
  showMotionControl?: boolean
  motionControl?: MotionControlValue
  onMotionControlChange?: (next: MotionControlValue) => void

  // ── Audio (built-in section — folded in from the former AudioControls) ─
  /** Controlled audio props — the audio section renders when modality is
   *  audio/audio2 and `audio` is supplied (owns its own model selection). */
  audio?: ComposerAudioProps

  // ── Misc ──────────────────────────────────────────────────────────
  /** Override any EN default label. */
  labels?: Partial<ComposerSettingsLabels>
  /** Disable interaction (e.g. mid-generation). */
  disabled?: boolean
  /** Open on mount — for catalog/story previews of the panel contents. */
  defaultOpen?: boolean
  /** Extra class on the trigger pill (e.g. to mark the mobile variant). */
  className?: string
}

/**
 * Props for the inner `<ComposerSettingsPanel>` — the settings subset of the
 * popover props (everything except the trigger-pill-only / open-state props).
 * Exported so catalog/story previews can render the panel inline (no popover).
 */
export type ComposerSettingsPanelProps = Omit<
  ComposerSettingsPopoverProps,
  | 'triggerIcon'
  | 'triggerLabel'
  | 'triggerPreview'
  | 'triggerGlow'
  | 'className'
  | 'defaultOpen'
  | 'disabled'
> & {
  /**
   * Suppress the panel's INLINE modality switcher. Set by
   * `<ComposerSettingsPopover>`, which relocates the switcher into the Popover
   * `footer` slot (pinned below the height-morph box) so it never double-renders.
   * Standalone callers (catalog / inline preview) leave it off → the switcher
   * renders inline as the panel's last row (default behaviour, unchanged).
   */
  hideModalitySwitcher?: boolean
}

// =====================================================================
// Component
// =====================================================================

export function ComposerSettingsPopover({
  section = 'all',
  triggerAria,
  triggerIcon,
  triggerLabel,
  triggerPreview,
  triggerGlow = false,
  className,
  defaultOpen = false,
  disabled,
  labels,
  ...rest
}: ComposerSettingsPopoverProps) {
  const [open, setOpen] = useState(defaultOpen)
  const copy = { ...DEFAULT_LABELS, ...labels }
  // Picking a MODEL closes the popover (the choice is made — nothing else to do
  // here). Picking a SETTING (aspect / duration / …) does NOT — the user tweaks
  // several in a row, so the settings popover stays open (Val 2026-07-03).
  const onModelChange =
    section === 'model' && rest.onModelChange
      ? (id: string) => {
          rest.onModelChange?.(id)
          setOpen(false)
        }
      : rest.onModelChange
  const panel = { ...rest, section, onModelChange }

  // Modality switcher relocates from INSIDE the panel into the Popover `footer`
  // slot ONLY for the combined 'all' pill (so it stays pinned below the
  // height-morph box). The split MODEL pill renders it inline at the top of its
  // panel instead (section='model'); the SETTINGS pill has no switcher.
  const footer =
    section === 'all' && panel.showModalitySwitcher && panel.onModalityChange ? (
      <div className="klyp-ComposerSettingsPopover__panelFooter">
        <ModalitySwitcher
          modality={panel.modality}
          onModalityChange={panel.onModalityChange}
          copy={copy}
        />
      </div>
    ) : undefined

  return (
    <RACDialogTrigger isOpen={open} onOpenChange={setOpen}>
      <Button
        variant="primary"
        size="md"
        animateWidth
        isDisabled={disabled}
        aria-label={triggerAria ?? copy.triggerAria}
        className={['klyp-ComposerSettingsPopover__trigger', className].filter(Boolean).join(' ')}
        data-modality={panel.modality}
        data-section={section}
        data-accent-hint={triggerGlow ? '' : undefined}
      >
        {triggerIcon && (
          <span className="klyp-ComposerSettingsPopover__triggerProvider" aria-hidden="true">
            {triggerIcon}
          </span>
        )}
        <span className="klyp-ComposerSettingsPopover__triggerLabel">{triggerLabel}</span>
        {triggerPreview && (
          <span className="klyp-ComposerSettingsPopover__triggerPreview" aria-hidden="true">
            {triggerPreview}
          </span>
        )}
      </Button>

      <Popover
        placement="top start"
        offset={8}
        // Glide the panel between per-modality heights instead of jumping
        // (Image shows aspect+size rows → taller; Text hides them → shorter).
        // The modality lives in the host and flows in via `panel.modality`, so a
        // tab switch re-renders this subtree → PopoverHeightMorph re-measures the
        // dialog's new natural height and tweens to it (same mechanism as the
        // trigger Button's `animateWidth`, on the height axis).
        animateHeight
        // The modality tab bar is a FIXED footer — rendered OUTSIDE the
        // height-morph box so it stays anchored at the bottom (by the trigger)
        // while only the content above glides. Inside the morph it drifted with
        // every tab switch.
        footer={footer}
        className="klyp-ComposerSettingsPopover__popoverSurface"
      >
        <RACDialog
          aria-label={triggerAria ?? copy.triggerAria}
          className="klyp-ComposerSettingsPopover__dialog"
        >
          {/* 'all' relocates the modality switcher to the Popover footer (skip
              the inline one); the split 'model' pill renders it inline (top). */}
          <ComposerSettingsPanel
            {...panel}
            labels={labels}
            hideModalitySwitcher={section === 'all'}
          />
        </RACDialog>
      </Popover>
    </RACDialogTrigger>
  )
}

// =====================================================================
// Panel — the popover's inner settings UI, extracted so catalog/story
// previews can render it INLINE (no popover, no portal) and show the real
// per-modality UI without a click. In the app it's rendered inside the
// popover by <ComposerSettingsPopover> above. Presentational — the host
// owns all state and supplies already-filtered option arrays.
// =====================================================================

export function ComposerSettingsPanel({
  modality,
  section = 'all',
  showModalitySwitcher,
  onModalityChange,
  modelOptions,
  modelValue,
  onModelChange,
  renderModelDetail,
  showModeToggle,
  frameSlots,
  refMode = 'frame',
  onRefModeChange,
  imageAspectOptions,
  imageAspect,
  onImageAspectChange,
  imageSizeOptions,
  imageSize,
  onImageSizeChange,
  videoDurationOptions,
  duration,
  onDurationChange,
  videoAspectOptions,
  videoAspect,
  onVideoAspectChange,
  videoResolutionOptions,
  videoResolution,
  onVideoResolutionChange,
  showAudioToggle,
  audioHint,
  withAudio = false,
  onWithAudioChange,
  showStaticCamera,
  staticCameraHint,
  cameraFixed = false,
  onCameraFixedChange,
  showCameraControl,
  cameraOptions,
  cameraMove,
  onCameraMoveChange,
  showMultiShot,
  multiShot,
  onMultiShotChange,
  multiShotLabels,
  showMotionControl,
  motionControl,
  onMotionControlChange,
  audio,
  labels,
  hideModalitySwitcher = false,
}: ComposerSettingsPanelProps) {
  const copy = { ...DEFAULT_LABELS, ...labels }

  const isAudio = modality === 'audio' || modality === 'audio2'
  // Split gates: the MODEL pill renders the modality switcher + model dropdown;
  // the SETTINGS pill renders the param rows. 'all' renders both (combined).
  const showModelPart = section !== 'settings'
  const showSettingsPart = section !== 'model'

  // Camera presets — host override or built-in Kling set (memoised on copy).
  const cameraOpts = useMemo<readonly DropdownOption[]>(
    () => cameraOptions ?? defaultCameraOptions(copy),
    [
      cameraOptions,
      copy.cameraNone,
      copy.cameraDownBack,
      copy.cameraForwardUp,
      copy.cameraRight,
      copy.cameraLeft,
    ],
  )

  // Trigger-pill label for a single-select value picker — mirrors
  // BrandSelect's `short ?? label`, so e.g. Duration still reads "5s"
  // (the option's short/label) rather than the raw id "5".
  const pillLabel = (
    opts: readonly DropdownOption[] | undefined,
    id: string | undefined,
    fallback: string,
  ): ReactNode => {
    const opt = opts?.find((o) => o.id === id)
    return opt?.short ?? opt?.label ?? fallback
  }

  // Current model option — its provider glyph becomes the model pill's
  // leading icon (the decoupled equivalent of the host's <ProviderIcon>).
  const currentModelOption = modelOptions?.find((o) => o.id === modelValue)

  function handleSubmodeChange(next: string) {
    const target = next as 'frame' | 'reference'
    if (target === refMode) return
    onRefModeChange?.(target)
  }

  return (
    <div
      className="klyp-ComposerSettingsPopover__panel"
      // audio2 uses the standard panel width (same as video); the built-in
      // audio section decides its own internal layout.
      data-modality={modality}
    >
      {/* ── MODEL part — model dropdown (top) + modality switcher (below) ──*/}
      {/* Model dropdown — full width, no side label. Hidden for audio:*/}
      {/* the audio section owns its own model selection.*/}
      {showModelPart && !isAudio && modelOptions && modelOptions.length > 0 && (
        <Dropdown
          aria-label="Model"
          selectionMode="single"
          indicator="none"
          selectedKeys={new Set(modelValue ? [modelValue] : [])}
          onSelectionChange={(ids) => {
            const [id] = ids
            if (id) onModelChange?.(id)
          }}
          triggerIcon={currentModelOption?.icon}
          triggerLabel={currentModelOption?.short ?? currentModelOption?.label ?? 'Model'}
          options={modelOptions}
          side="top"
          align="end"
          renderDetail={renderModelDetail}
        />
      )}

      {/* Modality switcher — BELOW the model picker (Val 2026-07-03). Shown when*/}
      {/* NOT relocated to the Popover footer (the 'all' pill relocates it; the*/}
      {/* split 'model' pill renders it here, under the model dropdown).*/}
      {showModelPart && !hideModalitySwitcher && showModalitySwitcher && onModalityChange && (
        <ModalitySwitcher modality={modality} onModalityChange={onModalityChange} copy={copy} />
      )}

      {/* Frame-mode switcher — Start/End ↔ Reference (video only).*/}
      {showSettingsPart && showModeToggle && modality === 'video' && (
        <TabSwitcher
          value={refMode}
          onValueChange={handleSubmodeChange}
          ariaLabel={copy.submode}
          size="md"
          fullWidth
        >
          <TabSwitcher.Item value="frame">
            {frameSlots === 1 ? copy.submodeFrameSingle : copy.submodeFrame}
          </TabSwitcher.Item>
          <TabSwitcher.Item value="reference">{copy.submodeReference}</TabSwitcher.Item>
        </TabSwitcher>
      )}

      {/* Image params — Aspect + Size as a 50/50 dropdown row.*/}
      {showSettingsPart && modality === 'image' && (
        <div className="klyp-ComposerSettingsPopover__selectRow" data-modality="image">
          {imageAspectOptions && imageAspectOptions.length > 0 && (
            <Dropdown
              aria-label={copy.aspect}
              selectionMode="single"
              indicator="none"
              selectedKeys={new Set(imageAspect ? [imageAspect] : [])}
              onSelectionChange={(ids) => {
                const [id] = ids
                if (id) onImageAspectChange?.(id)
              }}
              triggerIcon={<FrameRatioGlyph ratio={imageAspect ?? '1:1'} />}
              hideChevron
              triggerLabel={pillLabel(imageAspectOptions, imageAspect, copy.aspect)}
              options={imageAspectOptions}
              side="top"
              align="start"
            />
          )}
          {imageSizeOptions && imageSizeOptions.length > 0 && (
            <Dropdown
              aria-label={copy.size}
              selectionMode="single"
              indicator="none"
              selectedKeys={new Set(imageSize ? [imageSize] : [])}
              onSelectionChange={(ids) => {
                const [id] = ids
                if (id) onImageSizeChange?.(id)
              }}
              triggerIcon={<DiamondOutline width={14} height={14} />}
              hideChevron
              triggerLabel={pillLabel(imageSizeOptions, imageSize, copy.size)}
              options={imageSizeOptions}
              side="top"
              align="start"
            />
          )}
        </div>
      )}

      {/* Video params — Duration / Aspect / Resolution dropdown row,*/}
      {/* then optional Audio + Static-camera toggle rows.*/}
      {showSettingsPart && modality === 'video' && (
        <>
          <div className="klyp-ComposerSettingsPopover__selectRow" data-modality="video">
            {videoDurationOptions && videoDurationOptions.length > 0 && (
              <Dropdown
                aria-label={copy.duration}
                selectionMode="single"
                indicator="none"
                selectedKeys={new Set(duration ? [duration] : [])}
                onSelectionChange={(ids) => {
                  const [id] = ids
                  if (id) onDurationChange?.(id)
                }}
                triggerIcon={<ClockOutline width={14} height={14} />}
                hideChevron
                triggerLabel={pillLabel(videoDurationOptions, duration, copy.duration)}
                options={videoDurationOptions}
                side="top"
                align="start"
              />
            )}
            {videoAspectOptions && videoAspectOptions.length > 0 && (
              <Dropdown
                aria-label={copy.aspect}
                selectionMode="single"
                indicator="none"
                selectedKeys={new Set(videoAspect ? [videoAspect] : [])}
                onSelectionChange={(ids) => {
                  const [id] = ids
                  if (id) onVideoAspectChange?.(id)
                }}
                triggerIcon={<FrameRatioGlyph ratio={videoAspect ?? '16:9'} />}
                hideChevron
                triggerLabel={pillLabel(videoAspectOptions, videoAspect, copy.aspect)}
                options={videoAspectOptions}
                side="top"
                align="start"
              />
            )}
            {videoResolutionOptions && videoResolutionOptions.length > 0 && (
              <Dropdown
                aria-label={copy.resolution}
                selectionMode="single"
                indicator="none"
                selectedKeys={new Set(videoResolution ? [videoResolution] : [])}
                onSelectionChange={(ids) => {
                  const [id] = ids
                  if (id) onVideoResolutionChange?.(id)
                }}
                triggerIcon={<DiamondOutline width={14} height={14} />}
                hideChevron
                triggerLabel={pillLabel(videoResolutionOptions, videoResolution, copy.resolution)}
                options={videoResolutionOptions}
                side="top"
                align="start"
              />
            )}
          </div>

          {showAudioToggle && (
            <ToggleRow
              label={copy.audio}
              hint={audioHint}
              value={withAudio}
              onChange={(b) => onWithAudioChange?.(b)}
            />
          )}

          {showStaticCamera && (
            <ToggleRow
              label={copy.staticCamera}
              hint={staticCameraHint}
              value={cameraFixed}
              onChange={(b) => onCameraFixedChange?.(b)}
            />
          )}

          {/* Camera control — a `camera_control.type` movement preset*/}
          {/* (Standard Kling only). 'none' = off.*/}
          {showCameraControl && (
            <Dropdown
              aria-label={copy.camera}
              selectionMode="single"
              indicator="none"
              selectedKeys={new Set([cameraMove ?? 'none'])}
              onSelectionChange={(ids) => {
                const [id] = ids
                if (id) onCameraMoveChange?.(id)
              }}
              triggerLabel={
                cameraOpts.find((o) => o.id === (cameraMove ?? 'none'))?.label ?? copy.cameraNone
              }
              options={cameraOpts}
              side="top"
              align="start"
            />
          )}

          {/* Multi-shot / storyboard (Standard Kling 3.0+). Toggle; when on,*/}
          {/* the Auto/Custom cut editor (per-cut prompt + duration, summing to*/}
          {/* the total).*/}
          {showMultiShot && multiShot && onMultiShotChange && (
            <>
              <ToggleRow
                label={copy.multiShot}
                hint={copy.multiShotHint}
                value={multiShot.on}
                onChange={(on) => onMultiShotChange({ ...multiShot, on })}
              />
              {multiShot.on && (
                <ComposerMultiShot
                  value={multiShot}
                  totalDuration={Number(duration) || 5}
                  onChange={onMultiShotChange}
                  // Host i18n override (merged over EN defaults). `seconds`
                  // keeps a built-in `${n}s` fallback when the host omits it.
                  labels={{
                    seconds: (n) => `${n}s`,
                    ...multiShotLabels,
                  }}
                />
              )}
            </>
          )}

          {/* Motion Control (Standard Kling 2.6 / 3.0). Toggle + orientation;*/}
          {/* the character image + driving video are attached in the composer*/}
          {/* (toggling on opens the video slot there).*/}
          {showMotionControl && motionControl && onMotionControlChange && (
            <>
              <ToggleRow
                label={copy.motionControl}
                hint={copy.motionControlHint}
                value={motionControl.on}
                onChange={(on) => onMotionControlChange({ ...motionControl, on })}
              />
              {motionControl.on && (
                <>
                  <TabSwitcher
                    value={motionControl.orientation}
                    onValueChange={(v) =>
                      onMotionControlChange({
                        ...motionControl,
                        orientation: v as 'image' | 'video',
                      })
                    }
                    ariaLabel={copy.motionOrientation}
                    size="md"
                    fullWidth
                  >
                    <TabSwitcher.Item value="image">{copy.motionImage}</TabSwitcher.Item>
                    <TabSwitcher.Item value="video">{copy.motionVideo}</TabSwitcher.Item>
                  </TabSwitcher>
                  <p className="klyp-ComposerSettingsPopover__motionHint">
                    {copy.motionAttachHint}
                  </p>
                </>
              )}
            </>
          )}
        </>
      )}

      {/* Audio — built-in controlled section (owns its own model selection).
          In the split layout it rides in the SETTINGS pill (audio's model
          selection lives inside this section). */}
      {showSettingsPart && isAudio && audio && <ComposerAudioSection {...audio} />}
    </div>
  )
}

// =====================================================================
// Internal — modality switcher (shared by the inline panel slot and the
// popover footer slot so the markup never diverges between the two)
// =====================================================================

/**
 * Text/Image/Video/Audio segmented switcher. Rendered in exactly one place per
 * usage: INLINE as the panel's last row (standalone <ComposerSettingsPanel>), or
 * in the Popover `footer` slot (<ComposerSettingsPopover>, pinned below the
 * height-morph box). Same component → identical look + behaviour either way.
 */
function ModalitySwitcher({
  modality,
  onModalityChange,
  copy,
}: {
  modality: ComposerModality
  onModalityChange: (next: string) => void
  copy: ComposerSettingsLabels
}) {
  return (
    <TabSwitcher
      value={modality === 'audio2' ? 'audio' : modality}
      onValueChange={onModalityChange}
      ariaLabel={copy.modality}
      size="md"
      fullWidth
      // Accent-glow on the active pill — the modality picker is the primary
      // "what am I generating" choice; matches the live chat composer
      // (feature copy sets tone="accent" too, 2026-06-30). Sub-setting
      // switchers (frame / stability / motion) stay neutral per single-accent.
      tone="accent"
      className="klyp-ComposerSettingsPopover__modalitySwitcher"
    >
      <TabSwitcher.Item value="image">{copy.modalityImage}</TabSwitcher.Item>
      <TabSwitcher.Item value="video">{copy.modalityVideo}</TabSwitcher.Item>
      <TabSwitcher.Item value="text">{copy.modalityText}</TabSwitcher.Item>
      <TabSwitcher.Item value="audio">{copy.modalityAudio}</TabSwitcher.Item>
    </TabSwitcher>
  )
}

// =====================================================================
// Internal — full-width Switch styled as a button-like row
// =====================================================================

/**
 * Toggle row — a `<Switch>` stretched into a full-width button-like row.
 * Label left, track right (row-reverse in SCSS); the whole row is the
 * click target via RAC's own `<label>` wrapper. 40px height matches the
 * Dropdown / TabSwitcher controls above it.
 */
function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <Switch
      isSelected={value}
      onChange={onChange}
      size="md"
      className="klyp-ComposerSettingsPopover__toggleRow"
    >
      {label}
      {hint && <span className="klyp-ComposerSettingsPopover__toggleRowHint">({hint})</span>}
    </Switch>
  )
}

export default ComposerSettingsPopover
