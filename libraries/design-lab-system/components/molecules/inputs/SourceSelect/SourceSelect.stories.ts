import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { SourceSelect, type SourceOption } from './SourceSelect'

export function renderStoryExample(example: StoryExample) {
  const kind = String(example.props.kind ?? 'project') as SourceOption['kind']
  const available = example.props.available !== false
  const sources: SourceOption[] = [
    {
      id: 'design-lab-system',
      name: kind === 'library' ? 'Design Lab System' : 'Starter project',
      path: kind === 'library' ? 'libraries/design-lab-system' : 'projects/starter-project',
      available,
      kind,
    },
    {
      id: 'unavailable',
      name: 'Archived source',
      path: 'projects/archived-source',
      available: false,
      kind: 'project',
    },
  ]
  return createElement(SourceSelect, {
    sources,
    activeSource: sources[0],
    onChange: () => undefined,
    onCreateProject: () => undefined,
  })
}

export const stories = [
  {
    id: 'source-kinds',
    kind: 'variant',
    name: 'Source kinds',
    examples: [
      { label: 'Project', props: { kind: 'project' } },
      { label: 'Library', props: { kind: 'library' } },
    ],
  },
  {
    id: 'availability',
    kind: 'state',
    name: 'Availability',
    examples: [
      { label: 'Available', props: { available: true } },
      { label: 'Unavailable', props: { available: false } },
    ],
  },
]
