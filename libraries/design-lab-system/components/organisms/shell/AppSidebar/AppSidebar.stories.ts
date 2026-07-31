import { createElement } from 'react'
import type { StoryExample, StoryDefinition } from '../../../storyContract'
import { DirectoryPanel } from '../DirectoryPanel/DirectoryPanel'
import { ComponentsIcon } from '../../../../assets/icons/ComponentsIcon'
import { PagesIcon } from '../../../../assets/icons/PagesIcon'
import { AppSidebar, type AppSidebarItem, type ModuleId } from './AppSidebar'

const sources = [
  {
    id: 'design-lab-system',
    name: 'Design Lab System',
    path: 'libraries/design-lab-system',
    available: true,
    kind: 'library' as const,
  },
]

export function renderStoryExample(example: StoryExample, story: StoryDefinition) {
  const props = example.props
  const additiveItems: AppSidebarItem<'components' | 'libraries'>[] = [
    { id: 'components', label: 'Components', icon: ComponentsIcon },
    { id: 'libraries', label: 'Libraries', icon: PagesIcon },
  ]
  const sidebar = createElement(AppSidebar, {
    active:
      story.id === 'additive-modules'
        ? ('libraries' as const)
        : (String(props.active ?? 'components') as ModuleId),
    items: story.id === 'additive-modules' ? additiveItems : undefined,
    expanded: Boolean(props.expanded),
    settingsActive: Boolean(props.settingsActive),
    onChange: () => undefined,
  })
  if (story.id !== 'navigation-width') return sidebar

  return createElement(
    'div',
    { style: { display: 'flex', minHeight: 520 } },
    sidebar,
    createElement(DirectoryPanel, {
      isResizing: false,
      navigationWidth: 260,
      minNavigationWidth: 220,
      maxNavigationWidth: 420,
      onResizeStart: () => undefined,
      onResizeKeyDown: () => undefined,
      projects: sources,
      activeProject: sources[0],
      activeModuleLabel: 'Components',
      tree: [
        { name: 'atoms', path: 'atoms', kind: 'folder', level: 0 },
        { id: 'button', name: 'Button', path: 'atoms/Button', kind: 'component', level: 1 },
      ],
      treeLoading: false,
      onProjectChange: () => undefined,
      onCreateProject: () => undefined,
      defaultCollapsed: false,
    }),
  )
}

export const stories = [
  {
    id: 'additive-modules',
    kind: 'integration',
    name: 'Additive module descriptors',
    description:
      'A newly supplied module inherits the same tab geometry and states without id-specific CSS.',
    examples: [{ label: 'Libraries added', props: {} }],
  },
  {
    id: 'disclosure',
    kind: 'behavior',
    name: 'Hover disclosure',
    description:
      'Hover the production sidebar to reveal labels without changing the combined navigation width.',
    interactive: true,
    examples: [
      { label: 'Collapsed', props: { expanded: false } },
      { label: 'Expanded', props: { expanded: true } },
    ],
  },
  {
    id: 'selection',
    kind: 'state',
    name: 'Module selection',
    examples: [{ label: 'Components active', props: { active: 'components' } }],
  },
  {
    id: 'settings',
    kind: 'state',
    name: 'Settings selection',
    description:
      'The persistent footer action opens application settings without becoming a project module.',
    examples: [{ label: 'Settings active', props: { settingsActive: true } }],
  },
  {
    id: 'navigation-width',
    kind: 'integration',
    name: 'Shared navigation width',
    description:
      'Application Sidebar and the adjacent directory region divide one stable navigation width.',
    interactive: true,
    subject: 'AppSidebar',
    related: ['DirectoryPanel'],
    examples: [
      { label: 'Collapsed rail', props: { expanded: false } },
      { label: 'Expanded rail', props: { expanded: true } },
    ],
  },
]
