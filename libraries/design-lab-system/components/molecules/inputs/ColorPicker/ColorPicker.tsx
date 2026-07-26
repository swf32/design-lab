import './ColorPicker.scss'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useDesignLabI18n } from '../../../../i18n'

const DEFAULT_PRESETS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
]

function normalizeHex(value: string) {
  const candidate = value.trim()
  if (/^#[0-9a-f]{6}$/i.test(candidate)) return candidate.toLowerCase()
  if (/^[0-9a-f]{6}$/i.test(candidate)) return `#${candidate.toLowerCase()}`
  return null
}

type HsvColor = { hue: number; saturation: number; value: number }

function hexToHsv(hex: string): HsvColor {
  const normalized = normalizeHex(hex) ?? '#000000'
  const red = Number.parseInt(normalized.slice(1, 3), 16) / 255
  const green = Number.parseInt(normalized.slice(3, 5), 16) / 255
  const blue = Number.parseInt(normalized.slice(5, 7), 16) / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  let hue = 0
  if (delta) {
    if (max === red) hue = 60 * (((green - blue) / delta) % 6)
    else if (max === green) hue = 60 * ((blue - red) / delta + 2)
    else hue = 60 * ((red - green) / delta + 4)
  }
  return {
    hue: Math.round(hue < 0 ? hue + 360 : hue),
    saturation: max === 0 ? 0 : (delta / max) * 100,
    value: max * 100,
  }
}

function hsvToHex({ hue, saturation, value }: HsvColor) {
  const chroma = (value / 100) * (saturation / 100)
  const sector = hue / 60
  const second = chroma * (1 - Math.abs((sector % 2) - 1))
  const match = value / 100 - chroma
  const [red, green, blue] =
    sector < 1
      ? [chroma, second, 0]
      : sector < 2
        ? [second, chroma, 0]
        : sector < 3
          ? [0, chroma, second]
          : sector < 4
            ? [0, second, chroma]
            : sector < 5
              ? [second, 0, chroma]
              : [chroma, 0, second]
  return `#${[red, green, blue]
    .map((channel) =>
      Math.round((channel + match) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

export type ColorPickerProps = {
  label: string
  value?: string | null
  defaultValue?: string
  onChange?: (color: string | null) => void
  trigger?: ReactNode
  presets?: string[]
  allowClear?: boolean
  disabled?: boolean
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ColorPicker({
  label,
  value,
  defaultValue = '#3b82f6',
  onChange,
  trigger,
  presets = DEFAULT_PRESETS,
  allowClear = true,
  disabled = false,
  className = '',
  open: openProp,
  onOpenChange,
}: ColorPickerProps) {
  const { t } = useDesignLabI18n()
  const [internalOpen, setInternalOpen] = useState(false)
  const open = openProp ?? internalOpen
  const [internal, setInternal] = useState<string | null>(
    value === undefined ? defaultValue : value,
  )
  const color = value === undefined ? internal : value
  const safeColor = normalizeHex(color ?? '') ?? defaultValue
  const [draft, setDraft] = useState(safeColor)
  const [hsv, setHsv] = useState(() => hexToHsv(safeColor))
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [popoverPosition, setPopoverPosition] = useState<CSSProperties | null>(null)

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [onOpenChange, openProp],
  )

  useEffect(() => {
    setDraft(safeColor)
    setHsv((current) => {
      const next = hexToHsv(safeColor)
      return next.saturation === 0 ? { ...next, hue: current.hue } : next
    })
  }, [safeColor])
  const positionPopover = useCallback(() => {
    const triggerElement = triggerRef.current
    const popoverElement = popoverRef.current
    if (!triggerElement || !popoverElement) return
    const triggerRect = triggerElement.getBoundingClientRect()
    const popoverRect = popoverElement.getBoundingClientRect()
    const viewport = window.visualViewport
    const viewportLeft = viewport?.offsetLeft ?? 0
    const viewportTop = viewport?.offsetTop ?? 0
    const viewportRight = viewportLeft + (viewport?.width ?? window.innerWidth)
    const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight)
    const margin = 12
    const gap = 6
    const preferredTop = triggerRect.bottom + gap
    const top =
      preferredTop + popoverRect.height <= viewportBottom - margin
        ? preferredTop
        : Math.max(viewportTop + margin, triggerRect.top - popoverRect.height - gap)
    const left = Math.min(
      Math.max(triggerRect.left, viewportLeft + margin),
      viewportRight - popoverRect.width - margin,
    )
    setPopoverPosition({ top, left })
  }, [])

  useLayoutEffect(() => {
    if (!open) {
      setPopoverPosition(null)
      return
    }
    positionPopover()
    const frame = requestAnimationFrame(positionPopover)
    return () => cancelAnimationFrame(frame)
  }, [open, positionPopover])

  useEffect(() => {
    if (!open) return
    const close = (event: PointerEvent) => {
      const target = event.target as Node
      if (!rootRef.current?.contains(target) && !popoverRef.current?.contains(target))
        setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', escape)
    window.addEventListener('resize', positionPopover)
    window.addEventListener('scroll', positionPopover, true)
    window.visualViewport?.addEventListener('resize', positionPopover)
    window.visualViewport?.addEventListener('scroll', positionPopover)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', escape)
      window.removeEventListener('resize', positionPopover)
      window.removeEventListener('scroll', positionPopover, true)
      window.visualViewport?.removeEventListener('resize', positionPopover)
      window.visualViewport?.removeEventListener('scroll', positionPopover)
    }
  }, [open, positionPopover])

  const commit = (next: string | null) => {
    if (value === undefined) setInternal(next)
    onChange?.(next)
    if (next) {
      setDraft(next)
      setHsv((current) => {
        const nextHsv = hexToHsv(next)
        return nextHsv.saturation === 0 ? { ...nextHsv, hue: current.hue } : nextHsv
      })
    }
  }
  const commitHsv = (next: HsvColor) => {
    setHsv(next)
    const hex = hsvToHex(next)
    setDraft(hex)
    if (value === undefined) setInternal(hex)
    onChange?.(hex)
  }
  const commitDraft = () => {
    const next = normalizeHex(draft)
    if (next) commit(next)
    else setDraft(safeColor)
  }
  const updateSpectrum = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    commitHsv({
      ...hsv,
      saturation: Math.min(100, Math.max(0, ((event.clientX - bounds.left) / bounds.width) * 100)),
      value: Math.min(100, Math.max(0, 100 - ((event.clientY - bounds.top) / bounds.height) * 100)),
    })
  }
  const handleSpectrumKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 1
    let next = hsv
    if (event.key === 'ArrowLeft') next = { ...hsv, saturation: Math.max(0, hsv.saturation - step) }
    else if (event.key === 'ArrowRight')
      next = { ...hsv, saturation: Math.min(100, hsv.saturation + step) }
    else if (event.key === 'ArrowUp') next = { ...hsv, value: Math.min(100, hsv.value + step) }
    else if (event.key === 'ArrowDown') next = { ...hsv, value: Math.max(0, hsv.value - step) }
    else return
    event.preventDefault()
    commitHsv(next)
  }

  return (
    <div
      className={`dl-color-picker${open ? ' dl-color-picker--open' : ''}${className ? ` ${className}` : ''}`}
      ref={rootRef}
    >
      <button
        ref={triggerRef}
        className="dl-color-picker__trigger"
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="dialog"
        disabled={disabled}
        style={{ color: color ?? undefined }}
        onClick={() => setOpen(!open)}
      >
        {trigger ?? <span className="dl-color-picker__swatch" style={{ background: safeColor }} />}
      </button>
      {open &&
        createPortal(
          <div
            ref={popoverRef}
            className="dl-color-picker__popover"
            role="dialog"
            aria-label={label}
            style={{
              ...popoverPosition,
              visibility: popoverPosition ? 'visible' : 'hidden',
            }}
          >
            <div className="dl-color-picker__spectrum-wrap">
              <div
                className="dl-color-picker__spectrum"
                role="slider"
                tabIndex={0}
                aria-label={t('colorPicker.saturationBrightness')}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(hsv.saturation)}
                aria-valuetext={`${Math.round(hsv.saturation)}% / ${Math.round(hsv.value)}%`}
                style={{ backgroundColor: `hsl(${hsv.hue} 100% 50%)` }}
                onKeyDown={handleSpectrumKeyDown}
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId)
                  updateSpectrum(event)
                }}
                onPointerMove={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) updateSpectrum(event)
                }}
              >
                <span
                  className="dl-color-picker__spectrum-thumb"
                  style={{ left: `${hsv.saturation}%`, top: `${100 - hsv.value}%` }}
                />
              </div>
            </div>
            <label className="dl-color-picker__hue">
              <span>{t('colorPicker.hue')}</span>
              <output>{Math.round(hsv.hue)}°</output>
              <input
                type="range"
                min={0}
                max={359}
                value={Math.round(hsv.hue)}
                onChange={(event) => commitHsv({ ...hsv, hue: Number(event.target.value) })}
              />
            </label>
            <div className="dl-color-picker__presets" aria-label={t('colorPicker.presets')}>
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  aria-label={preset}
                  aria-pressed={safeColor === preset.toLowerCase()}
                  style={{ background: preset }}
                  onClick={() => commit(preset.toLowerCase())}
                />
              ))}
            </div>
            <label className="dl-color-picker__hex">
              <span>{t('colorPicker.hex')}</span>
              <input
                value={draft}
                spellCheck={false}
                onChange={(event) => setDraft(event.target.value)}
                onBlur={commitDraft}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    commitDraft()
                  }
                }}
              />
            </label>
            {allowClear && (
              <button
                className="dl-color-picker__clear"
                type="button"
                onClick={() => {
                  commit(null)
                  setOpen(false)
                }}
              >
                {t('colorPicker.reset')}
              </button>
            )}
          </div>,
          document.body,
        )}
    </div>
  )
}
