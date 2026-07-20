import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { CodeIcon, InspectIcon, SettingsIcon } from '@design-lab/system/icons'
import {
  WorkbenchAction,
  type WorkbenchActionProps,
  type WorkbenchActionTone,
} from './WorkbenchAction'

const icons = {
  neutral: <SettingsIcon size={18} aria-hidden="true" />,
  inspect: <InspectIcon size={18} aria-hidden="true" />,
  dev: <CodeIcon size={18} aria-hidden="true" />,
}

export function renderStoryExample(example: StoryExample) {
  const props = example.props as unknown as Omit<WorkbenchActionProps, 'children'>
  const tone = (props.tone ?? 'neutral') as WorkbenchActionTone
  return createElement(WorkbenchAction, {
    ...props,
    icon: icons[tone],
    children: example.label,
  })
}

export const stories = [
  {
    id: 'semantic-tones',
    kind: 'variant',
    name: 'Semantic tones',
    description: 'Compare one shared floating-action shape across workbench responsibilities.',
    examples: [
      { label: 'Settings', props: { tone: 'neutral' } },
      { label: 'Inspect', props: { tone: 'inspect' } },
      { label: 'Dev mode', props: { tone: 'dev' } },
    ],
  },
  {
    id: 'states',
    kind: 'state',
    name: 'Inactive and active',
    description: 'Active treatment increases clarity without changing geometry.',
    examples: [
      { label: 'Inspect', props: { tone: 'inspect' } },
      { label: 'Inspecting', props: { tone: 'inspect', active: true } },
      { label: 'Unavailable', props: { tone: 'neutral', disabled: true } },
    ],
  },
]
