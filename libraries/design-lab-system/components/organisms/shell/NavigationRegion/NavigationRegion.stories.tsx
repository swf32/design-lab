import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { NavigationRegion } from './NavigationRegion'

const projects = [
  {
    id: 'design-lab-system',
    name: 'Design Lab System',
    path: 'libraries/design-lab-system',
    available: true,
    kind: 'library' as const,
  },
]

const tree = [
  { name: 'All', path: '__all__', kind: 'folder' as const, level: 0, virtual: true },
  { name: 'organisms', path: 'organisms', kind: 'folder' as const, level: 0 },
  {
    id: 'navigation-region',
    name: 'Navigation Region',
    path: 'organisms/shell/NavigationRegion',
    kind: 'component' as const,
    level: 1,
  },
]

export function renderStoryExample(example: StoryExample) {
  const expanded = Boolean((example.props as { expanded?: boolean } | undefined)?.expanded)
  return createElement(NavigationRegion, {
    expanded,
    mobileTitle: 'Browse Design Lab',
    mobileCloseLabel: 'Close',
    onMobileClose: () => undefined,
    sidebarProps: {
      active: 'components',
      onChange: () => undefined,
      onExpandedChange: () => undefined,
    },
    directoryProps: {
      isResizing: false,
      navigationWidth: 340,
      minNavigationWidth: 260,
      maxNavigationWidth: 440,
      onResizeStart: () => undefined,
      onResizeKeyDown: () => undefined,
      projects,
      activeProject: projects[0],
      activeModuleLabel: 'Components',
      tree,
      treeLoading: false,
      onProjectChange: () => undefined,
      onCreateProject: () => undefined,
      persistItemColors: false,
    },
    style: { minHeight: 280, width: 340 },
  })
}

export const stories = [
  {
    id: 'shared-navigation-width',
    kind: 'integration',
    name: 'Shared navigation width',
    examples: [
      { label: 'Collapsed', props: { expanded: false } },
      { label: 'Expanded', props: { expanded: true } },
    ],
  },
]
