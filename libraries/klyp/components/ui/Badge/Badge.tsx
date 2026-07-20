import './Badge.scss'

import type { ComponentType, HTMLAttributes, ReactNode, SVGProps } from 'react'

// Badge — Geist-aligned status pill primitive (v2, 2026-05-15).
// Static label only. Wrap inside a Button if you need an onClick handler.
// Visual + sizing parity verified via DOM inspection of vercel.com/geist/badge
// on 2026-05-15. See packages/ui/src/Badge/CHANGELOG.md for migration notes.

export type BadgeIntent =
  | 'gray'
  | 'blue'
  | 'purple'
  | 'amber'
  | 'red'
  | 'pink'
  | 'green'
  | 'teal'
  | 'gold'
  | 'inverted'
  | 'featured'
  | 'premium'

export type BadgeVariant = 'solid' | 'subtle' | 'outline'
export type BadgeSize = 'sm' | 'md' | 'lg'

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  intent?: BadgeIntent
  /**
   * `solid`, `subtle`, and `outline` fills apply to the 9 color intents
   * (`gray` … `teal`, `gold`). `outline` paints a transparent surface with the
   * intent color on both stroke and text — useful for unfilled chips.
   * `inverted`, `featured`, and `premium` are single-look intents — they
   * render the same regardless of `variant`.
   */
  variant?: BadgeVariant
  size?: BadgeSize
  /**
   * Visual-only inactive dim (via `--opacity-disabled`). Badge is a
   * non-interactive `<span>` — this does NOT block events or set
   * `aria-disabled`; convey the inactive meaning in the surrounding
   * label/context.
   */
  disabled?: boolean
  icon?: IconComponent
  /**
   * Accessible label. Required when Badge has no text children (icon-only)
   * so screen readers can announce its meaning.
   */
  title?: string
  children?: ReactNode
}

export function Badge({
  intent = 'gray',
  variant = 'subtle',
  size = 'md',
  disabled,
  icon: IconComp,
  title,
  className,
  children,
  ...props
}: BadgeProps) {
  const hasText =
    children !== undefined && children !== null && children !== false && children !== ''

  if (import.meta.env.DEV && !hasText && !title) {
    console.warn(
      '[Badge] icon-only badge requires a `title` prop so screen readers can announce its meaning.',
    )
  }

  const merged = typeof className === 'string' ? `klyp-Badge ${className}` : 'klyp-Badge'
  const isIconOnly = !hasText && Boolean(IconComp)
  const iconOnlyA11y = isIconOnly && title ? ({ role: 'img', 'aria-label': title } as const) : {}
  // Hide the decorative icon from AT only when the badge already exposes an
  // accessible name (text children, or `title` lifted to role="img"/aria-label).
  // For an icon-only badge with no title we must NOT hide the icon, otherwise
  // the whole badge becomes a mute element with nothing announced.
  // TODO(a11y): exposing the bare SVG is "less broken", not fixed — an SVG
  // without <title> still has no accessible name. The real fix is the caller
  // passing `title` (the DEV warning above nags about exactly that).
  const iconHidden = hasText || Boolean(title) ? true : undefined

  return (
    <span
      {...props}
      {...iconOnlyA11y}
      className={merged}
      data-intent={intent}
      data-variant={variant}
      data-size={size}
      data-disabled={disabled || undefined}
      title={title}
    >
      {IconComp ? (
        <span className="klyp-Badge__iconWrap" aria-hidden={iconHidden}>
          <IconComp focusable={false} />
        </span>
      ) : null}
      {children}
    </span>
  )
}

export default Badge
