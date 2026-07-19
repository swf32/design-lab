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
    children,
  })
}

export const stories = [
  {
    id: 'content-shapes',
    kind: 'variant',
    name: 'Content shapes',
    examples: [
      { label: 'Single specimen', props: { layout: 'single' } },
      { label: 'Comparison', props: { layout: 'comparison' } },
    ],
  },
  {
    id: 'interactive-scenario',
    kind: 'behavior',
    name: 'Interactive scenario',
    description: 'A story may contain real interaction when it explains component behavior.',
    interactive: true,
    examples: [{ label: 'Behavior fixture', props: { interactive: true } }],
  },
]
