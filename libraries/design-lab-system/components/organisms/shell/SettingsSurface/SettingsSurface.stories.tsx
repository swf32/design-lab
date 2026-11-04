import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { SettingsPanel } from '../SettingsPanel/SettingsPanel'
import { SettingsSurface } from './SettingsSurface'

export function renderStoryExample(example: StoryExample) {
  return createElement(
    SettingsSurface,
    { style: { height: 300 } },
    createElement(SettingsPanel, {
      eyebrow: 'Interface System',
      title: example.label,
      description: 'The active project-owned System controls this presentation.',
      children: createElement('p', null, 'Validation and recovery actions appear here.'),
    }),
  )
}

export const stories = [
  {
    id: 'settings-states',
    kind: 'state',
    name: 'Settings states',
    examples: [
      { label: 'Healthy System', props: {} },
      { label: 'System needs attention', props: {} },
    ],
  },
]
