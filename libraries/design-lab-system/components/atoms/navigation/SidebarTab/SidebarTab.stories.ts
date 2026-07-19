import { createElement } from 'react'
import { TokensIcon } from '../../../../assets/icons'
import type { StoryExample, StoryDefinition } from '../../../storyContract'
import { AppSidebar } from '../../../organisms/shell/AppSidebar/AppSidebar'
import { SidebarTab } from './SidebarTab'

export function renderStoryExample(example: StoryExample, story: StoryDefinition) {
  const props = example.props
  if (story.id === 'inside-sidebar')
    return createElement(AppSidebar, {
      active: 'tokens',
      expanded: Boolean(props.expanded),
      onChange: () => undefined,
    })

  return createElement(SidebarTab, {
    icon: TokensIcon,
    label: String(props.label ?? 'Tokens'),
    active: Boolean(props.active),
    expanded: true,
  })
}

export const stories = [
  {
    id: 'states',
    kind: 'state',
    name: 'Selection states',
    description: 'Compare default and current-page treatment at the same width.',
    examples: [
      { label: 'Default', props: { label: 'Tokens', active: false } },
      { label: 'Active', props: { label: 'Tokens', active: true } },
    ],
  },
  {
    id: 'inside-sidebar',
    kind: 'context',
    name: 'Inside application sidebar',
    description: 'Use the navigation item inside its clipping and disclosure context.',
    interactive: true,
    subject: 'SidebarTab',
    examples: [
      { label: 'Collapsed', props: { expanded: false } },
      { label: 'Expanded', props: { expanded: true } },
    ],
  },
]
