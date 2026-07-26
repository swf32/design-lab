import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { CodeBlock } from './CodeBlock'

export function renderStoryExample(example: StoryExample) {
  const language = String(example.props?.language ?? 'tsx')
  const code = example.props?.collapsedLines
    ? "import {\n  Button,\n  Input,\n  Select,\n  Slider,\n} from '@design-lab/system/components'"
    : language === 'scss'
      ? '.component {\n  color: var(--color-text-primary);\n}'
      : "import { Button } from '@design-lab/system/components'"
  return createElement(CodeBlock, {
    language,
    code,
    copyOnClick: Boolean(example.props?.copyOnClick),
    variant: example.props?.variant === 'code-only' ? 'code-only' : 'default',
    collapsedLines:
      typeof example.props?.collapsedLines === 'number' ? example.props.collapsedLines : undefined,
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
    id: 'variants',
    kind: 'variant',
    name: 'Chrome variants',
    description: 'Code-only removes the language header and keeps actions over the source.',
    examples: [
      { label: 'Default', props: {} },
      { label: 'Code only', props: { variant: 'code-only' } },
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
    id: 'disclosure',
    kind: 'behavior',
    name: 'Collapsed source',
    description:
      'Only the first lines show until the user expands the complete source; expanded state is exposed through the root class for composed presentation.',
    interactive: true,
    examples: [{ label: 'Three-line preview', props: { collapsedLines: 3 } }],
  },
  {
    id: 'overflow',
    kind: 'context',
    name: 'Long source',
    description: 'Long lines scroll inside the block without widening documentation.',
    examples: [{ label: 'Horizontal overflow' }],
  },
]
