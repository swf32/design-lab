import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { CodeBlock } from './CodeBlock'

export function renderStoryExample(example: StoryExample) {
  const language = String(example.props?.language ?? 'tsx')
  const code =
    language === 'scss'
      ? '.component {\n  color: var(--color-text-primary);\n}'
      : "import { Button } from '@design-lab/system/components'"
  return createElement(CodeBlock, {
    language,
    code,
    copyOnClick: Boolean(example.props?.copyOnClick),
  })
}

export const stories = [
  {
    id: 'languages',
    kind: 'context',
    name: 'Language labels',
    description: 'Source remains readable across common library file formats.',
    examples: [
      { label: 'TSX', props: { language: 'tsx' } },
      { label: 'SCSS', props: { language: 'scss' } },
    ],
  },
  {
    id: 'copy',
    kind: 'behavior',
    name: 'Copy source',
    description: 'The action copies the complete source and acknowledges success.',
    interactive: true,
    examples: [
      { label: 'Copy action', props: { showCopy: true } },
      { label: 'Whole fragment', props: { copyOnClick: true } },
    ],
  },
  {
    id: 'overflow',
    kind: 'context',
    name: 'Long source',
    description: 'Long lines scroll inside the block without widening documentation.',
    examples: [{ label: 'Horizontal overflow' }],
  },
]
