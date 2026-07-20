import './Avatar.scss'

import {
  createContext,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

// =====================================================================
// Avatar — Klyp canonical primitive (Phase 2 of React Aria migration)
// =====================================================================
//
// Architecture: see ../../../../MIGRATION-REACT-ARIA-2026-04-30.md §5/§6/§16
//
// Avatar has NO React Aria counterpart — it's pure HTML img + fallback.
// We replace Base UI's `Avatar.Root + Image + Fallback` pattern with a
// minimal context: the Root holds image-load `status`, the Image reports
// load/error events into context, and the Fallback shows itself only when
// no image is rendered or when the image errored.
//
// Backward-compat: keeps the same compound API used by callers
// (`<Avatar><AvatarImage src/><AvatarFallback>...</AvatarFallback></Avatar>`)
// AND legacy `size="default"` alias (mapped to 'md').
// Pure CSS via data-attributes; no Tailwind, no CVA, no Base UI.

// === Public API types ===============================================
// Size ramp:
//   xs 20px · sm 24px · md 32px (default) · lg 40px · xl 56px
// `default` is a legacy alias for `md` kept for back-compat (callers
// upgraded from Base UI). Do not remove without a sweep.
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'default'

// Shape — four-step radius ramp:
//   sharp  = 0          (hard crop, editorial thumbnails)
//   rounded = --radius-sm 6px  (gentle, dense lists)
//   card    = --r-card   12px  (matches card surfaces)
//   circle  = --radius-full    (classic avatar, default)
// `square` is a deprecated alias for `card` — kept for back-compat.
export type AvatarShape = 'circle' | 'card' | 'rounded' | 'sharp' | 'square'

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  size?: AvatarSize
  /** Visual shape. Defaults to `circle` (preserves current behavior). */
  shape?: AvatarShape
  /** When true, renders a skeleton placeholder. Image / fallback hidden. */
  loading?: boolean
  children?: ReactNode
}

export type AvatarImageProps = ImgHTMLAttributes<HTMLImageElement>

export interface AvatarFallbackProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Optional delay (ms) before showing the fallback. Mirrors Base-UI
   * behaviour to avoid a flash of fallback while a fast image loads.
   * Defaults to 0.
   */
  delayMs?: number
  children?: ReactNode
}

export type AvatarBadgeTone = 'accent' | 'online' | 'busy' | 'away' | 'offline'

export interface AvatarBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Status colour. Defaults to `accent` (preserves current behavior). */
  tone?: AvatarBadgeTone
}
export type AvatarGroupProps = HTMLAttributes<HTMLDivElement>
export interface AvatarGroupCountProps extends HTMLAttributes<HTMLDivElement> {
  size?: AvatarSize
}

// === Context ========================================================
type ImageStatus = 'idle' | 'loaded' | 'error'

interface AvatarContextValue {
  status: ImageStatus
  setStatus: (s: ImageStatus) => void
}

const AvatarContext = createContext<AvatarContextValue | null>(null)

function useAvatar(): AvatarContextValue {
  const ctx = useContext(AvatarContext)
  // Allow subcomponents to be used outside an <Avatar> (defensive).
  return (
    ctx ?? {
      status: 'idle',
      setStatus: () => {},
    }
  )
}

// === Internal mappings ==============================================
const SIZE_MAP: Record<AvatarSize, string> = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  default: 'md',
  lg: 'lg',
  xl: 'xl',
}

// === Components =====================================================
export function Avatar({
  size = 'md',
  shape = 'circle',
  loading = false,
  className,
  children,
  ...props
}: AvatarProps) {
  const [status, setStatus] = useState<ImageStatus>('idle')
  const value = useMemo(() => ({ status, setStatus }), [status])
  const s = SIZE_MAP[size] ?? 'md'

  return (
    <AvatarContext.Provider value={value}>
      <span
        {...props}
        className={typeof className === 'string' ? `klyp-Avatar ${className}` : 'klyp-Avatar'}
        data-slot="avatar"
        data-size={s}
        data-shape={shape}
        data-status={status}
        {...(loading ? { 'data-loading': '' } : {})}
        aria-busy={loading ? true : undefined}
      >
        {loading ? <span aria-hidden className="klyp-Avatar__skeleton" /> : children}
      </span>
    </AvatarContext.Provider>
  )
}

export function AvatarImage({
  className,
  onLoad,
  onError,
  src,
  alt = '',
  ...props
}: AvatarImageProps) {
  const { status, setStatus } = useAvatar()

  // Reset status on src change (or on mount when src is set). `status`
  // is intentionally NOT a dep: including it caused a flicker loop where
  // onError → status='error' → effect re-ran → reset to 'idle' → img
  // remounted → errored again.
  useEffect(() => {
    if (!src) {
      setStatus('error')
      return
    }
    setStatus('idle')
  }, [src, setStatus])

  if (!src) return null
  if (status === 'error') return null

  return (
    <img
      {...props}
      src={src}
      alt={alt}
      data-slot="avatar-image"
      className={
        typeof className === 'string' ? `klyp-Avatar__image ${className}` : 'klyp-Avatar__image'
      }
      onLoad={(e) => {
        setStatus('loaded')
        onLoad?.(e)
      }}
      onError={(e) => {
        setStatus('error')
        onError?.(e)
      }}
    />
  )
}

export function AvatarFallback({
  className,
  children,
  delayMs = 0,
  ...props
}: AvatarFallbackProps) {
  const { status } = useAvatar()
  const [canShow, setCanShow] = useState(delayMs === 0)

  useEffect(() => {
    if (delayMs <= 0) return
    const t = setTimeout(() => setCanShow(true), delayMs)
    return () => clearTimeout(t)
  }, [delayMs])

  // Hide fallback if the image successfully loaded.
  if (status === 'loaded') return null
  if (!canShow) return null

  return (
    <span
      {...props}
      data-slot="avatar-fallback"
      className={
        typeof className === 'string'
          ? `klyp-Avatar__fallback ${className}`
          : 'klyp-Avatar__fallback'
      }
    >
      {children}
    </span>
  )
}

// Status badges carry meaning (online/busy/away/offline) but render as an
// empty span — screen readers get nothing. Derive an accessible name from
// `tone`. `accent` is semantically empty (decorative), so it stays unlabeled.
const BADGE_TONE_LABEL: Partial<Record<AvatarBadgeTone, string>> = {
  online: 'Online',
  busy: 'Busy',
  away: 'Away',
  offline: 'Offline',
}

export function AvatarBadge({
  className,
  tone = 'accent',
  role,
  'aria-label': ariaLabel,
  ...props
}: AvatarBadgeProps) {
  const toneLabel = BADGE_TONE_LABEL[tone]
  // Caller-supplied aria-label/role win; otherwise derive from tone.
  const resolvedLabel = ariaLabel ?? toneLabel
  const resolvedRole = role ?? (resolvedLabel ? 'img' : undefined)

  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: resolvedRole is 'img' whenever resolvedLabel is set — biome can't trace the dynamic pairing
    <span
      {...props}
      role={resolvedRole}
      aria-label={resolvedLabel}
      data-slot="avatar-badge"
      data-tone={tone}
      className={
        typeof className === 'string' ? `klyp-Avatar__badge ${className}` : 'klyp-Avatar__badge'
      }
    />
  )
}

export function AvatarGroup({ className, ...props }: AvatarGroupProps) {
  return (
    <div
      {...props}
      data-slot="avatar-group"
      className={
        typeof className === 'string' ? `klyp-AvatarGroup ${className}` : 'klyp-AvatarGroup'
      }
    />
  )
}

export function AvatarGroupCount({ className, size, ...props }: AvatarGroupCountProps) {
  const s = size ? (SIZE_MAP[size] ?? 'md') : undefined
  return (
    <div
      {...props}
      data-slot="avatar-group-count"
      {...(s ? { 'data-size': s } : {})}
      className={
        typeof className === 'string'
          ? `klyp-AvatarGroupCount ${className}`
          : 'klyp-AvatarGroupCount'
      }
    />
  )
}
