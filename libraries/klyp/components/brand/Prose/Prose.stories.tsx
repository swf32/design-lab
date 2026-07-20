import type { ComponentProps, ReactNode } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { StoryCell, StoryFrame, StoryStack } from '../__shared/story-layout'
import { Prose } from './Prose'

/**
 * ── Copy-paste reference renderer (PROSE_MD_COMPONENTS) ────────────────────
 *
 * NOTE: this is a stories HELPER, not a story. Prose styles bare semantic tags
 * for free, but links and fenced code only pick up the recipe if their nodes
 * carry the EXACT classes below. This map is the contract made concrete: drop
 * it into your Markdown engine's `components` override (Streamdown /
 * react-markdown both take a `components` prop shaped exactly like this) so the
 * class names are applied for you.
 *
 *   // app side (has streamdown + shiki):
 *   import { PROSE_MD_COMPONENTS } from '@klyp/brand/Prose/Prose.stories'  // or copy inline
 *   <Prose
 *     content={md}
 *     render={(c) => <Streamdown components={PROSE_MD_COMPONENTS}>{c}</Streamdown>}
 *   />
 *
 * `code` here only handles inline code; wire your real Shiki <CodeBlock> for
 * fenced blocks and give its wrapper `klyp-Prose__shiki` (highlighted) or its
 * <pre> `klyp-Prose__shikiFallback` (un-highlighted) per the contract.
 */
export const PROSE_MD_COMPONENTS = {
  a: (props: ComponentProps<'a'>) => (
    <a {...props} className="klyp-Prose__link" rel="noreferrer noopener" />
  ),
  // Inline code only. Fenced code → your Shiki <CodeBlock>, whose wrapper must
  // carry "klyp-Prose__shiki" (or the <pre> fallback "klyp-Prose__shikiFallback").
  code: (props: ComponentProps<'code'>) => <code {...props} />,
  pre: (props: ComponentProps<'pre'>) => <pre {...props} className="klyp-Prose__shikiFallback" />,
} satisfies Record<string, (props: never) => ReactNode>

/**
 * The real engine (Streamdown + Shiki + CodeBlock) lives in the app layer.
 * For catalog/preview purposes we render plain semantic HTML that exercises
 * every prose rule — headings, body, lists, blockquote, table, inline code,
 * link override, image, hr, and `em → medium weight`.
 */
const SampleArticle = () => (
  <>
    <h2>Designing for the reading column</h2>
    <p>
      Long-form text needs room to breathe. The body runs at <code>18px</code> on a relaxed{' '}
      <strong>1.55</strong> line-height, while headings stay tight so the hierarchy reads at a
      glance. Emphasis uses <em>medium weight</em>, never italic.
    </p>
    <h3>Lists and structure</h3>
    <ul>
      <li>Generous leading keeps paragraphs scannable.</li>
      <li>
        Inline code such as <code>const x = 1</code> is monospace and subtly tinted.
      </li>
      <li>
        Links carry the accent —{' '}
        <a
          className="klyp-Prose__link"
          href="https://example.com"
          target="_blank"
          rel="noreferrer noopener"
        >
          read the spec
        </a>
        .
      </li>
    </ul>
    <blockquote>
      A great reading surface gets out of the way. You notice the words, not the typography.
    </blockquote>
    <h4>A small comparison</h4>
    <table>
      <thead>
        <tr>
          <th>Property</th>
          <th>Body</th>
          <th>Heading</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Line height</td>
          <td>1.55</td>
          <td>tight</td>
        </tr>
        <tr>
          <td>Weight</td>
          <td>regular</td>
          <td>semibold</td>
        </tr>
      </tbody>
    </table>
    <hr />
    <p>That is the entire recipe — quiet, consistent, and token-driven.</p>
  </>
)

const RAW = '# Designing for the reading column\n\nLong-form text needs room to breathe...'
const CODE_RAW = '```ts\nconst greeting = "hello, reading column"\n```'

const meta = {
  component: Prose,
  title: 'Brand / Molecules / Prose',
  tags: ['autodocs'],
  // Playground: `size` is the live control (the component's only visual variant).
  // The reading content is supplied as a default `children` ReactNode — Prose is
  // engine-agnostic, so the catalog has no Markdown engine to drive `content`
  // live; `content`/`render`/`children`/`rawText` stay table-only (control:false).
  args: {
    size: 'comfortable',
    content: RAW,
    children: <SampleArticle />,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['comfortable', 'compact'] },
    content: { control: false },
    render: { control: false },
    children: { control: false },
    rawText: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Prose>

export default meta
type Story = StoryObj<typeof meta>

/** Default — the full reading recipe at comfortable (18px) density. Flip `size`
 *  in the playground to compare densities. */
export const Default: Story = {}

/** Sizes — the two reading densities side by side. `comfortable` (18px) for
 *  articles; `compact` (16px) for denser surfaces (panels, previews). */
export const Sizes: Story = {
  render: () => (
    <StoryStack gap="2xl" fill>
      <StoryCell label="comfortable — 18px" fill>
        <Prose size="comfortable" content={RAW}>
          <SampleArticle />
        </Prose>
      </StoryCell>
      <StoryCell label="compact — 16px" fill>
        <Prose size="compact" content={RAW}>
          <SampleArticle />
        </Prose>
      </StoryCell>
    </StoryStack>
  ),
}

/**
 * Render-slot contract — link + fenced-code styling only lands when the
 * renderer tags its nodes with the three contract classes. This story drives
 * the `render` slot through `PROSE_MD_COMPONENTS` so all three are visible:
 * `klyp-Prose__link` (accent link), `klyp-Prose__shiki` (highlighted block
 * wrapper), and `klyp-Prose__shikiFallback` (un-highlighted <pre> fallback).
 * In a real app the same map goes into `<Streamdown components={…} />`.
 */
export const RenderContract: Story = {
  render: () => {
    const A = PROSE_MD_COMPONENTS.a
    const Pre = PROSE_MD_COMPONENTS.pre
    return (
      <StoryStack gap="2xl" fill>
        <StoryCell label="Link — klyp-Prose__link" fill>
          <Prose
            content={RAW}
            render={() => (
              <p>
                A correctly-classed link carries the accent — <A href="#">read the spec</A>. Without
                the <code>klyp-Prose__link</code> class it would render unstyled.
              </p>
            )}
          />
        </StoryCell>
        <StoryCell label="Highlighted code — klyp-Prose__shiki" fill>
          <Prose
            content={CODE_RAW}
            render={() => (
              <div className="klyp-Prose__shiki">
                <pre>
                  <code>{'const greeting = "hello, reading column"'}</code>
                </pre>
              </div>
            )}
          />
        </StoryCell>
        <StoryCell label="Un-highlighted fallback — klyp-Prose__shikiFallback" fill>
          <Prose
            content={CODE_RAW}
            render={() => (
              <Pre>
                <code>{'const greeting = "hello, reading column"'}</code>
              </Pre>
            )}
          />
        </StoryCell>
      </StoryStack>
    )
  },
}

/**
 * Engine-failure fallback — when the injected render engine throws (a partial-
 * Markdown parser bug mid-stream, an unclosed code fence), MarkdownBoundary
 * catches it BELOW the boundary and renders the raw `content` as a <pre>
 * instead of blanking the whole message. The throw here is deliberate; a single
 * React dev-mode console error for the simulated failure is expected on this card.
 */
export const RawFallback: Story = {
  render: () => (
    <Prose
      content={RAW}
      render={() => {
        throw new Error('engine failure (simulated)')
      }}
    />
  ),
}

/** Adaptive — same content inside 280 / 600 / 1200px frames. The reading column
 *  fills a narrow pane and caps at the reading measure (~768px) on wide ones. */
export const Adaptive: Story = {
  render: () => (
    <StoryStack gap="lg">
      {[280, 600, 1200].map((w) => (
        <StoryCell key={w} label={`${w}px`}>
          <StoryFrame width={w}>
            <Prose content={RAW}>
              <SampleArticle />
            </Prose>
          </StoryFrame>
        </StoryCell>
      ))}
    </StoryStack>
  ),
}
