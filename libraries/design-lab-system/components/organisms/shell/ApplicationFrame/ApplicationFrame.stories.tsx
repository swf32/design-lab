import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { ApplicationFrame } from './ApplicationFrame'

const projects = [
  {
    id: 'design-lab-system',
    name: 'Design Lab System',
    path: 'libraries/design-lab-system',
    available: true,
    kind: 'library' as const,
  },
]

export function renderStoryExample(_example: StoryExample) {
  return createElement(ApplicationFrame, {
    navigationWidth: 220,
    navigationDismissLabel: 'Close navigation',
    onNavigationDismiss: () => undefined,
    navigationProps: {
      mobileTitle: 'Browse Design Lab',
      mobileCloseLabel: 'Close',
      onMobileClose: () => undefined,
      sidebarProps: {
        active: 'components',
        onChange: () => undefined,
      },
      directoryProps: {
        isResizing: false,
        navigationWidth: 220,
        minNavigationWidth: 180,
        maxNavigationWidth: 320,
        onResizeStart: () => undefined,
        onResizeKeyDown: () => undefined,
        projects,
        activeProject: projects[0],
        activeModuleLabel: 'Components',
        tree: [],
        treeLoading: false,
        onProjectChange: () => undefined,
        onCreateProject: () => undefined,
        persistItemColors: false,
      },
    },
    workspaceProps: {
      headerProps: {
        productName: 'Design Lab',
        sectionName: 'Components',
      },
      children: createElement('span', null, 'Active module'),
    },
    style: { minHeight: 280 },
  })
}

export const stories = [
  {
    id: 'application-regions',
    kind: 'context',
    name: 'Navigation and workspace regions',
    examples: [{ label: 'Default frame', props: {} }],
  },
]
