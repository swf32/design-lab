import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { ContentCard } from './ContentCard'

const meta = {
  title: 'Brand / Molecules / ContentCard',
  component: ContentCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ContentCard>

export default meta
type Story = StoryObj<typeof meta>

const IMG = 'https://picsum.photos/seed/klyp-content-card/1280/720'
const IMG_ALT = 'https://picsum.photos/seed/klyp-content-card-2/1280/720'

/** A sized, padded stage so the 16:9 card has somewhere to live. Renders the
 *  card inside a `<ul>` since the component's root is an `<li>`. */
function Frame({ width = 360, children }: { width?: number; children: ReactNode }) {
  return (
    <div style={{ padding: 24, background: 'var(--color-bg-root)', display: 'inline-block' }}>
      <ul style={{ width, margin: 0, padding: 0, listStyle: 'none' }}>{children}</ul>
    </div>
  )
}

export const Default: Story = {
  name: 'Default — cover, badges, title',
  render: () => (
    <Frame>
      <ContentCard
        href="/academy/lighting-basics"
        image={IMG}
        title="Lighting basics for cinematic shots"
        badges={[{ label: 'Guide' }, { label: 'Seedance' }]}
      />
    </Frame>
  ),
}

export const Variants: Story = {
  name: 'Variants — badge counts',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
        background: 'var(--color-bg-root)',
        padding: 24,
      }}
    >
      <ul style={{ width: 320, margin: 0, padding: 0, listStyle: 'none' }}>
        <ContentCard href="#" image={IMG} title="No badges — clean cover" />
      </ul>
      <ul style={{ width: 320, margin: 0, padding: 0, listStyle: 'none' }}>
        <ContentCard
          href="#"
          image={IMG_ALT}
          title="Single category badge"
          badges={[{ label: 'Tutorial' }]}
        />
      </ul>
      <ul style={{ width: 320, margin: 0, padding: 0, listStyle: 'none' }}>
        <ContentCard
          href="#"
          image={IMG}
          title="Several chips wrap onto the cover"
          badges={[
            { label: 'Guide' },
            { label: 'Kling' },
            { label: 'Video' },
            { label: 'Advanced' },
          ]}
        />
      </ul>
    </div>
  ),
}

export const States: Story = {
  name: 'States — link / static / reveal',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
        background: 'var(--color-bg-root)',
        padding: 24,
      }}
    >
      <ul style={{ width: 320, margin: 0, padding: 0, listStyle: 'none' }}>
        <ContentCard
          href="/academy/x"
          image={IMG}
          title="Link card (hover to zoom + brighten)"
          badges={[{ label: 'Link' }]}
        />
      </ul>
      <ul style={{ width: 320, margin: 0, padding: 0, listStyle: 'none' }}>
        <ContentCard
          image={IMG_ALT}
          title="Static card — no href, non-navigating"
          badges={[{ label: 'Static' }]}
        />
      </ul>
      <ul style={{ width: 320, margin: 0, padding: 0, listStyle: 'none' }}>
        <ContentCard
          href="#"
          reveal
          image={IMG}
          title="Reveal-on-scroll entrance"
          badges={[{ label: 'Reveal' }]}
        />
      </ul>
    </div>
  ),
}

export const PolymorphicLink: Story = {
  name: 'Polymorphic link — custom element',
  render: () => (
    <Frame>
      <ContentCard
        image={IMG}
        title="Rendered through a custom <button>-styled anchor"
        badges={[{ label: 'Custom' }]}
        linkComponent={(props) => (
          // The app would pass its router <Link> here; this demo just proves
          // the polymorphic seam with a plain anchor that logs on click.
          // biome-ignore lint/a11y/useValidAnchor: demo-only sink
          <a {...props} href="#" onClick={(e) => e.preventDefault()} />
        )}
      />
    </Frame>
  ),
}

export const HeadingLevels: Story = {
  name: 'Heading levels — titleAs under different parents',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
        background: 'var(--color-bg-root)',
        padding: 24,
      }}
    >
      <section>
        <h2
          style={{
            font: '14px var(--font-sans)',
            color: 'var(--color-fg-muted)',
            margin: '0 0 8px',
          }}
        >
          Section with an h2 — cards use titleAs="h3"
        </h2>
        <ul style={{ width: 320, margin: 0, padding: 0, listStyle: 'none' }}>
          <ContentCard
            href="#"
            titleAs="h3"
            image={IMG}
            title="Title renders as <h3> under the h2"
            badges={[{ label: 'h3' }]}
          />
        </ul>
      </section>
      <section>
        <h3
          style={{
            font: '14px var(--font-sans)',
            color: 'var(--color-fg-muted)',
            margin: '0 0 8px',
          }}
        >
          Sub-section with an h3 — cards use titleAs="h4"
        </h3>
        <ul style={{ width: 320, margin: 0, padding: 0, listStyle: 'none' }}>
          <ContentCard
            href="#"
            titleAs="h4"
            image={IMG_ALT}
            title="Title renders as <h4> under the h3"
            badges={[{ label: 'h4' }]}
          />
        </ul>
      </section>
      <ul style={{ width: 320, margin: 0, padding: 0, listStyle: 'none' }}>
        <ContentCard
          href="#"
          titleAs="span"
          image={IMG}
          title="titleAs=span — opts out of heading semantics"
          badges={[{ label: 'span' }]}
        />
      </ul>
    </div>
  ),
}

export const Adaptive: Story = {
  name: 'Adaptive — 280 / 600 / 1200',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 24,
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        background: 'var(--color-bg-root)',
        padding: 24,
      }}
    >
      {[280, 600, 1200].map((w) => (
        <div key={w} style={{ width: w, maxWidth: '100%' }}>
          <div
            style={{
              font: '12px var(--font-sans)',
              color: 'var(--color-fg-muted)',
              marginBottom: 8,
            }}
          >
            {w}px
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            <ContentCard
              href="#"
              image={IMG}
              title="Title scales up once the card has room to breathe"
              badges={[{ label: 'Guide' }, { label: 'Seedance' }]}
            />
          </ul>
        </div>
      ))}
    </div>
  ),
}
