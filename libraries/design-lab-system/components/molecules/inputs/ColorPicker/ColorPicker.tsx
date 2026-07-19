import './ColorPicker.scss'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
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
}: ColorPickerProps) {
  const { t } = useDesignLabI18n()
  const [open, setOpen] = useState(false)
  const [internal, setInternal] = useState<string | null>(
    value === undefined ? defaultValue : value,
  )
  const color = value === undefined ? internal : value
  const safeColor = normalizeHex(color ?? '') ?? defaultValue
  const [draft, setDraft] = useState(safeColor)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [popoverPosition, setPopoverPosition] = useState<CSSProperties | null>(null)

  useEffect(() => setDraft(safeColor), [safeColor])
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
    if (next) setDraft(next)
  }
  const commitDraft = () => {
    const next = normalizeHex(draft)
    if (next) commit(next)
    else setDraft(safeColor)
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
        onClick={() => setOpen((current) => !current)}
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
            <div className="dl-color-picker__heading">
              <span className="dl-color-picker__preview" style={{ background: safeColor }} />
              <strong>{label}</strong>
            </div>
            <label className="dl-color-picker__spectrum">
              <span>{t('colorPicker.color')}</span>
              <input
                type="color"
                value={safeColor}
                onChange={(event) => commit(event.target.value)}
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
