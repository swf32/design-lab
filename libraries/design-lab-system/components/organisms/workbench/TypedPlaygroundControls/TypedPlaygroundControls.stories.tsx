import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { TypedPlaygroundControls } from './TypedPlaygroundControls'

export function renderStoryExample(_example: StoryExample) {
  return createElement(TypedPlaygroundControls, {
    componentId: 'button',
    heading: 'Props',
    controls: {
      label: { kind: 'string', label: 'Label', defaultValue: 'Continue' },
      disabled: { kind: 'boolean', label: 'Disabled', defaultValue: false },
      tone: {
        kind: 'enum',
        label: 'Tone',
        defaultValue: 'primary',
        options: [
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
        ],
      },
    },
    values: { label: 'Continue', disabled: false, tone: 'primary' },
    onChange: () => undefined,
  })
}

export const stories = [
  {
    id: 'mixed-control-types',
    kind: 'context',
    name: 'Mixed typed controls',
    examples: [{ label: 'String, boolean, and enum', props: {} }],
  },
]
