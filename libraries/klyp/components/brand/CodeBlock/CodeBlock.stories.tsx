import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { CodeBlock, type CodeBlockProps } from './CodeBlock'

// ---------------------------------------------------------------------------
// Real Shiki highlighting in the catalog — mirror production.
//
// In prod, CodeBlock NEVER receives plain `<code>`: message-text.tsx always
// feeds it a Shiki-rendered `<pre class="shiki">` body (same
// `shiki/bundle/web` highlighter + `github-dark-default` theme). Passing plain
// `<code>` here made the catalog look dull/empty vs the real component, so the
// stories render the same highlighted body. CodeBlock.scss already strips
// Shiki's inline backgrounds, so the highlighted tokens sit on the chassis bg.
//
// Dynamic `import()` (not a static top-level import) keeps the ~1.3MB shiki
// chunk off the route graph until a CodeBlock story actually mounts — the
// plain `<pre>` fallback paints first. Same approach as the catalog's
// ShikiCode + chat's ShikiBody (single highlighter source of truth).
// ---------------------------------------------------------------------------

const SHIKI_THEME = 'github-dark-default'

function shikiLang(lang: string): string {
  if (lang === 'tsx' || lang === 'jsx') return 'tsx'
  if (lang === 'ts') return 'typescript'
  if (lang === 'js') return 'javascript'
  if (lang === 'scss' || lang === 'css') return 'scss'
  if (lang === 'sh' || lang === 'shell' || lang === 'zsh') return 'bash'
  return lang
}

/** Async Shiki body. Plain `<pre>` first paint, swaps to highlighted HTML once
 *  the highlighter resolves. With no `lang`, stays plain (text fence). */
function Highlighted({ code, lang }: { code: string; lang?: string }) {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    if (!lang) {
      setHtml(null)
      return
    }
    let cancelled = false
    void import('shiki/bundle/web')
      .then(({ codeToHtml }) => codeToHtml(code, { lang: shikiLang(lang), theme: SHIKI_THEME }))
      .then((h) => {
        if (!cancelled) setHtml(h)
      })
      .catch(() => {
        // Unsupported language — keep the plain fallback.
        if (!cancelled) setHtml(null)
      })
    return () => {
      cancelled = true
    }
  }, [code, lang])

  if (!html) {
    return (
      <pre>
        <code>{code}</code>
      </pre>
    )
  }
  return (
    // Shiki output is sanitized HTML from a trusted package — no XSS path.
    // biome-ignore lint/security/noDangerouslySetInnerHtml: required for syntax highlighting
    <div dangerouslySetInnerHTML={{ __html: html }} />
  )
}

const SAMPLE = `function hello(name: string) {
  console.log(\`Hello, \${name}!\`)
}
hello('world')`

// One very long single line → horizontal overflow → the wrap toggle appears.
// (The old 60-short-line sample only overflowed vertically, so the wrap toggle
// — gated on scrollWidth > clientWidth — never showed.)
const WIDE_SAMPLE = `const config = { apiBaseUrl: 'https://api.example.com/v2/creators', timeoutMs: 30000, retries: 3, headers: { 'content-type': 'application/json', authorization: 'Bearer sk-redacted' } }`

const PLAIN_SAMPLE = `$ pnpm dev:klyp
  VITE v8  ready in 412 ms
  ➜  Local:   http://localhost:5173/`

const meta = {
  component: CodeBlock,
  title: 'Brand / Molecules / CodeBlock',
  tags: ['autodocs'],
  args: {
    language: 'tsx',
    source: SAMPLE,
    children: <Highlighted code={SAMPLE} lang="tsx" />,
  },
  argTypes: {
    language: { control: 'text' },
    filename: { control: 'text' },
    streaming: { control: 'boolean' },
    source: { control: false },
    children: { control: false },
    onToPrompt: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof CodeBlock>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { language: 'tsx', source: SAMPLE, children: <Highlighted code={SAMPLE} lang="tsx" /> },
}

export const WithFilename: Story = {
  args: {
    language: 'tsx',
    filename: 'hello.ts',
    source: SAMPLE,
    children: <Highlighted code={SAMPLE} lang="tsx" />,
  },
}

/** Text fence with no language — common in chat (``` with no lang). No badge,
 *  no highlighting; copy + chrome still work. */
export const Plain: Story = {
  args: { source: PLAIN_SAMPLE, children: <Highlighted code={PLAIN_SAMPLE} /> },
}

/** Mid-stream: fence still open. To-prompt is hidden (only safe once complete);
 *  copy stays. Body is the plain fallback, matching prod's pre-highlight state. */
export const Streaming: Story = {
  args: {
    language: 'tsx',
    source: SAMPLE,
    streaming: true,
    children: (
      <pre>
        <code>{SAMPLE}</code>
      </pre>
    ),
  },
}

/** Wide content overflows horizontally → the wrap toggle appears in the action
 *  rail (toggle to switch the body to wrapped). */
export const Overflow: Story = {
  args: {
    language: 'ts',
    source: WIDE_SAMPLE,
    children: <Highlighted code={WIDE_SAMPLE} lang="ts" />,
  },
}

export const WithToPrompt: Story = {
  args: {
    language: 'tsx',
    source: SAMPLE,
    onToPrompt: (src: string, lang?: string) => alert(`To prompt:\n${lang}\n${src}`),
    children: <Highlighted code={SAMPLE} lang="tsx" />,
  },
}

export const Adaptive: Story = {
  render: (args: CodeBlockProps) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[280, 600, 1200].map((w) => (
        <div key={w} style={{ width: w, border: '1px dashed #888' }}>
          <CodeBlock {...args} />
        </div>
      ))}
    </div>
  ),
  args: {
    language: 'tsx',
    filename: 'hello.ts',
    source: SAMPLE,
    children: <Highlighted code={SAMPLE} lang="tsx" />,
  },
}
