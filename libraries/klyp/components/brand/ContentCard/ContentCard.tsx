import './ContentCard.scss'

import { Badge } from '@klyp/ui'
import { motion } from 'motion/react'
import type { ElementType, ReactNode } from 'react'

/**
 * `<ContentCard>` — article / media card: a 16:9 cover image with bottom-left
 * glass `<Badge>` chips overlaid on the cover, and a title beneath. On hover
 * the cover image zooms slightly (masked by the media's `overflow: hidden`)
 * and the title brightens muted → primary. Optional reveal-on-scroll entrance
 * via Motion (used by grids; off inside carousels).
 *
 * Router-agnostic by design (this is `@klyp/brand` — no router import). The
 * whole card is a single link rendered through a polymorphic `linkComponent`
 * prop (an `ElementType`, default plain `<a>`) plus an `href` string. The app
 * injects its router's link via `linkComponent` and maps `href` to its own
 * routing props through a thin wrapper. Pass no `href` to render a static,
 * non-navigating card (a `<div>`).
 *
 * @example
 * // Static (catalog / standalone)
 * <ContentCard href="/academy/intro" image={src} title="…" badges={[{label:'Guide'}]} />
 *
 * @example
 * // With a router link (apps/web)
 * <ContentCard
 *   linkComponent={(p) => <Link {...p} to="/academy/$slug" params={{ slug }} />}
 *   image={src} title="…"
 * />
 */

/** A chip overlaid on the card media — the DS `<Badge>` (gray, subtle, md),
 *  given a translucent glass treatment in this card context (see SCSS). */
export type CardBadge = { label: string }

/**
 * Polymorphic link element. Plain `<a>` by default; the app passes a wrapper
 * around its router's `<Link>`. Receives `className` + `children`; the app
 * wires its own navigation (e.g. ignores `href` and uses `to`/`params`).
 */
export type ContentCardLinkComponent = ElementType<{
  href?: string
  className?: string
  children?: ReactNode
}>

/**
 * Heading element for the card title. Lets each call site place the card at the
 * correct level in its surrounding document outline (academy grid, carousel,
 * marketing page, /components catalog). `'span'` opts out of heading semantics
 * entirely (e.g. when the title is decorative or duplicated by an aria-label).
 */
export type ContentCardTitleAs = 'h2' | 'h3' | 'h4' | 'span'

const REVEAL = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] as const },
  },
}

export interface ContentCardProps {
  /** Cover image URL (rendered in a 16:9 frame, `object-fit: cover`). */
  image: string
  /** Card title, shown beneath the cover. */
  title: string
  /**
   * Heading element for the title. Default `'h3'` (parity with the original).
   * Set this so the card sits at the right level in its parent's heading
   * outline — a fixed `h3` dropped under an h1 or h4 section produces a
   * skipped / broken hierarchy (WCAG 1.3.1, 2.4.10).
   */
  titleAs?: ContentCardTitleAs
  /** Glass chips overlaid bottom-left on the cover. Empty / omitted → none. */
  badges?: readonly CardBadge[]
  /**
   * Navigation target. When set, the whole card is a link rendered via
   * `linkComponent`. When omitted, the card renders as a non-navigating
   * `<div>` (still hover-reactive).
   */
  href?: string
  /**
   * Polymorphic link element. Defaults to a plain `<a>` so the card renders
   * in any environment (catalog, marketing iframe) without a router. The app
   * injects its router link here.
   */
  linkComponent?: ContentCardLinkComponent
  /** Reveal-on-scroll entrance (use in grids; off inside carousels). */
  reveal?: boolean
  /** `alt` text for the cover image. Default `''` (decorative — title carries the name). */
  imageAlt?: string
  /** Extra class appended to the root `<li>`. */
  className?: string
  /** Ref to the root `<li>` (React 19 ref-as-prop). */
  ref?: React.Ref<HTMLLIElement>
}

export function ContentCard({
  image,
  title,
  titleAs = 'h3',
  badges = [],
  href,
  linkComponent,
  reveal = false,
  imageAlt = '',
  className,
  ref,
}: ContentCardProps) {
  const TitleTag = titleAs
  const revealProps = reveal
    ? {
        initial: 'hidden' as const,
        whileInView: 'show' as const,
        viewport: { once: true, amount: 0.2 },
        variants: REVEAL,
      }
    : {}

  const rootClass =
    typeof className === 'string' && className.length > 0
      ? `klyp-ContentCard ${className}`
      : 'klyp-ContentCard'

  const inner = (
    <>
      <div className="klyp-ContentCard__media">
        <img
          className="klyp-ContentCard__img"
          src={image}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
        />
        {/* Category + model chips — bottom-left glass overlay on the cover.
         *  DS <Badge> (gray, subtle, md); the glass treatment is scoped in the SCSS. */}
        {badges.length > 0 ? (
          <div className="klyp-ContentCard__badges">
            {badges.map((b) => (
              <Badge
                key={b.label}
                className="klyp-ContentCard__badge"
                intent="gray"
                variant="subtle"
                size="md"
              >
                {b.label}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
      <div className="klyp-ContentCard__body">
        <TitleTag className="klyp-ContentCard__title">{title}</TitleTag>
      </div>
    </>
  )

  // Link tier: with an href, render the polymorphic link element; otherwise a
  // static <div>. Keeping the markup identical between the two keeps the
  // hover-zoom / title-brighten selectors working in both modes.
  const LinkComp = (linkComponent ?? 'a') as ContentCardLinkComponent
  const linkBody =
    href !== undefined ? (
      <LinkComp href={href} className="klyp-ContentCard__link">
        {inner}
      </LinkComp>
    ) : (
      <div className="klyp-ContentCard__link" data-static="">
        {inner}
      </div>
    )

  return (
    <motion.li ref={ref} className={rootClass} {...revealProps}>
      {linkBody}
    </motion.li>
  )
}

export default ContentCard
