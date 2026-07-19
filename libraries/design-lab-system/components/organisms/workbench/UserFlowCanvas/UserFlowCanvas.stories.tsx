import { useState } from 'react'
import type { StoryDefinition } from '../../../storyContract'
import { UserFlowCanvas } from './UserFlowCanvas'

const nodes = [
  {
    id: 'discover',
    eyebrow: 'Entry',
    title: 'No subscription',
    description: 'A new buyer compares available plans.',
    x: 60,
    y: 180,
  },
  {
    id: 'subscribed',
    eyebrow: 'Subscription',
    title: 'Top plan',
    description: 'Extra token allowance becomes available.',
    x: 470,
    y: 180,
  },
  {
    id: 'complete',
    eyebrow: 'Terminal',
    title: 'Allowance full',
    description: 'No more token purchases are available.',
    x: 880,
    y: 180,
  },
]

export const stories: StoryDefinition[] = [
  {
    id: 'select-and-pan',
    kind: 'behavior',
    name: 'Select, pan, and zoom',
    description:
      'Verifies labeled transitions, node selection, pointer panning, and visible zoom controls.',
    interactive: true,
    examples: [{ label: 'Pricing flow', props: {} }],
  },
]

export function renderStoryExample() {
  return <UserFlowCanvasStory />
}

function UserFlowCanvasStory() {
  const [selected, setSelected] = useState('discover')
  return (
    <UserFlowCanvas
      style={{ width: '100%', height: 560 }}
      nodes={nodes}
      edges={[
        { id: 'upgrade', from: 'discover', to: 'subscribed', label: 'Choose Top' },
        { id: 'buy', from: 'subscribed', to: 'complete', label: 'Buy allowance' },
      ]}
      selectedId={selected}
      onSelect={setSelected}
    />
  )
}
