import type { Meta, StoryObj } from '../__shared/stories-types'
import { MarkdownBoundary } from './MarkdownBoundary'

const meta = {
  component: MarkdownBoundary,
  title: 'UI / MarkdownBoundary',
  tags: ['autodocs'],
} satisfies Meta<typeof MarkdownBoundary>

export default meta
type Story = StoryObj<typeof meta>

/* A small caption so the catalog reader knows what they're looking at — which
 * part is MarkdownBoundary and which part is the injected renderer. */
function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: '0 0 var(--space-8)',
        font: 'var(--type-body-sm)',
        color: 'var(--color-fg-muted)',
      }}
    >
      {children}
    </p>
  )
}

/* A minimal hand-rolled MD render so stories stay engine-agnostic (no streamdown
 * dependency in the catalog). Real consumers inject Streamdown as `children`. */
function MiniMarkdown({ source }: { source: string }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)', font: 'var(--type-body)' }}>
      <h3 style={{ margin: 0, font: 'var(--type-heading-sm)', fontWeight: 'var(--fw-emphasis)' }}>
        Release notes
      </h3>
      <p style={{ margin: 0, font: 'var(--type-body)' }}>
        Shipped the new <strong>composer</strong> with{' '}
        <a href="https://example.com" style={{ color: 'var(--ring)' }}>
          inline previews
        </a>
        .
      </p>
      <ul style={{ margin: 0, paddingInlineStart: 'var(--space-20)', font: 'var(--type-body)' }}>
        <li>Streaming token-by-token render</li>
        <li>Partial-markdown recovery</li>
      </ul>
      <pre
        style={{
          font: 'var(--type-code)',
          background: 'var(--muted)',
          padding: 'var(--space-8)',
          borderRadius: 'var(--radius)',
          margin: 0,
        }}
      >
        {source}
      </pre>
    </div>
  )
}

/** COMPOSITION — MarkdownBoundary does NOT render markdown itself. It wraps a
 *  renderer you inject as `children` (in the app that's Streamdown; here it's a
 *  stub). The boundary's only jobs are catching a crash and theming via CSS
 *  vars — all the headings/lists/code/links below are the renderer's doing. */
export const Composition: Story = {
  render: () => (
    <div>
      <Caption>
        MarkdownBoundary + injected renderer (here a stub). The boundary itself renders nothing — it
        only wraps this and catches crashes.
      </Caption>
      <MarkdownBoundary rawText="# Release notes\n- streaming\n- recovery">
        <MiniMarkdown source={'const ok = true'} />
      </MarkdownBoundary>
    </div>
  ),
}

/* Simulates the real failure mode: a renderer that throws mid-stream (e.g. an
 * unclosed code fence the parser chokes on). The boundary catches it and shows
 * the raw markdown as <pre> instead of blanking the whole message. */
function ThrowsOnPartial(): never {
  throw new Error('unterminated code fence (simulated streaming parse failure)')
}

/** THE BOUNDARY'S OWN RENDER #1 — the renderer crashed, so the boundary shows
 *  the raw markdown string as <pre> instead of a blank message. This (and the
 *  CSS vars below) is the only thing MarkdownBoundary draws by itself. */
export const Fallback: Story = {
  render: () => (
    <div>
      <Caption>Renderer crashed → boundary shows the raw text. This IS the component.</Caption>
      <MarkdownBoundary rawText={'## Half a message\n\nHere is some code:\n\n```ts\nconst x ='}>
        <ThrowsOnPartial />
      </MarkdownBoundary>
    </div>
  ),
}

/** THE BOUNDARY'S OWN RENDER #2 — the CSS-var bridge. shadcn names (--card,
 *  --foreground, --border, --radius) resolve to our DTCG tokens inside this
 *  subtree only, so streamdown's chrome picks up our theme without leaking. */
export const VarsResolution: Story = {
  render: () => (
    <div>
      <Caption>The boundary maps shadcn var names → our tokens (scoped to itself).</Caption>
      <MarkdownBoundary>
        <div
          style={{
            background: 'var(--card)',
            color: 'var(--foreground)',
            padding: 'var(--space-16)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
          }}
        >
          Card surface using shadcn vars resolved through DTCG tokens.
        </div>
      </MarkdownBoundary>
    </div>
  ),
}
