import { createElement } from 'react'
import { Button } from '../../../atoms/actions/Button/Button'
import type { StoryExample } from '../../../storyContract'
import { StoryCanvas } from './StoryCanvas'

export function renderStoryExample(example: StoryExample) {
  const comparison = example.props.layout === 'comparison'
  const children = comparison
    ? createElement(
        'div',
        { style: { display: 'flex', gap: 12, flexWrap: 'wrap' } },
        createElement(Button, { variant: 'primary', children: 'Primary' }),
        createElement(Button, { variant: 'secondary', children: 'Secondary' }),
      )
    : createElement(Button, {
        variant: 'primary',
        onClick: () => undefined,
        children: example.props.interactive ? 'Click me' : 'Continue',
      })

  return createElement(StoryCanvas, {
    title: example.label,
    description: comparison ? 'One comparison axis in a full-width story.' : undefined,
    meta: example.props.interactive ? 'Interactive' : 'Example',
    canvasMode: example.props.handoff ? 'dark-grid' : undefined,
    canvasColor: '#111111',
    onCanvasModeChange: example.props.handoff ? () => undefined : undefined,
    onCanvasColorChange: example.props.handoff ? () => undefined : undefined,
    source: example.props.handoff
      ? 'import { StoryCanvas, Button } from \'@design-lab/system/components\'\n\n<StoryCanvas title="Primary action">\n  <Button variant="primary">Continue</Button>\n</StoryCanvas>'
      : undefined,
    children,
  })
}

export const stories = [
  {
    id: 'handoff',
    kind: 'integration',
    name: 'Canvas preference and source handoff',
    description:
      'A Story may expose the shared background preference and a quiet source handoff that becomes fully visible on hover, focus, or expansion.',
    interactive: true,
    subject: 'StoryCanvas',
    related: ['CanvasBackgroundControl', 'CodeBlock'],
    examples: [
      {
        label: 'Handoff fixture',
        props: { handoff: true },
        source:
          'const source = "import { Button } from \'@design-lab/system/components\'"\n\n<StoryCanvas title="Primary action" source={source}>\n  <Button variant="primary">Continue</Button>\n</StoryCanvas>',
        imports: ["import { Button } from '@design-lab/system/components'"],
      },
    ],
  },
  {
    id: 'content-shapes',
    kind: 'variant',
    name: 'Content shapes',
    examples: [
      {
        label: 'Single specimen',
        props: { layout: 'single' },
        source: '<StoryCanvas title="Single specimen">{specimen}</StoryCanvas>',
      },
      {
        label: 'Comparison',
        props: { layout: 'comparison' },
        source: '<StoryCanvas title="Comparison">{comparison}</StoryCanvas>',
      },
    ],
  },
  {
    id: 'interactive-scenario',
    kind: 'behavior',
    name: 'Interactive scenario',
    description: 'A story may contain real interaction when it explains component behavior.',
    interactive: true,
    examples: [
      {
        label: 'Behavior fixture',
        props: { interactive: true },
        source: '<StoryCanvas title="Interactive scenario">{interactiveExample}</StoryCanvas>',
      },
    ],
  },
]
