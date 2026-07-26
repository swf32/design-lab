import { createElement } from 'react'
import { TabSwitcher } from '../../../molecules/inputs/TabSwitcher/TabSwitcher'
import type { StoryExample } from '../../../storyContract'
import { DirectoryPanel, type DirectoryTreeItem } from './DirectoryPanel'

const sources = [
  {
    id: 'design-lab-system',
    name: 'Design Lab System',
    path: 'libraries/design-lab-system',
    available: true,
    kind: 'library' as const,
  },
]

const baseTree: DirectoryTreeItem[] = [
  { name: 'All', path: '__all__', kind: 'folder', level: 0, virtual: true },
  { name: 'atoms', path: 'atoms', kind: 'folder', level: 0 },
  { name: 'inputs', path: 'atoms/inputs', kind: 'folder', level: 1 },
  { id: 'checkbox', name: 'Checkbox', path: 'atoms/inputs/Checkbox', kind: 'component', level: 2 },
  { id: 'input', name: 'Input', path: 'atoms/inputs/Input', kind: 'component', level: 2 },
  { name: 'organisms', path: 'organisms', kind: 'folder', level: 0 },
  {
    id: 'directory-panel',
    name: 'Directory Panel',
    path: 'organisms/shell/DirectoryPanel',
    kind: 'component',
    level: 1,
  },
]

const denseTree: DirectoryTreeItem[] = [
  ...baseTree,
  { name: 'molecules', path: 'molecules', kind: 'folder', level: 0 },
  ...[
    'Asset Card',
    'Canvas Background Control',
    'Code Block',
    'Color Picker',
    'Component Card',
    'Component Reference Panel',
    'Component Thumbnail',
    'Module Header',
    'Source Select',
    'Story Canvas',
    'Tab Switcher',
  ].map((name) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    path: `molecules/${name.replace(/\s+/g, '')}`,
    kind: 'component' as const,
    level: 1,
  })),
]

const tokenTree: DirectoryTreeItem[] = [
  { name: 'All', path: '__all__', kind: 'folder', level: 0, virtual: true },
  { name: 'semantic', path: 'by-file/semantic', kind: 'folder', level: 0 },
  {
    name: 'core.tokens.json',
    path: 'by-file/semantic/core.tokens.json',
    kind: 'token-document',
    level: 1,
  },
  {
    name: 'color',
    path: 'by-file/semantic/core.tokens.json/color',
    kind: 'token-group',
    level: 2,
  },
  {
    name: 'accent',
    path: 'by-file/semantic/core.tokens.json/color/accent',
    kind: 'token-group',
    level: 3,
  },
  {
    id: 'color.accent.primary',
    name: 'primary',
    path: 'by-file/semantic/core.tokens.json/color/accent/primary',
    kind: 'token',
    level: 4,
  },
]

export function renderStoryExample(example: StoryExample) {
  const props = example.props
  const state = String(props.state ?? 'ready')
  const dense = props.fixture === 'dense-components'
  const tokenFixture = props.fixture === 'tokens'
  const tree = state === 'empty' ? [] : tokenFixture ? tokenTree : dense ? denseTree : baseTree

  return createElement(DirectoryPanel, {
    isResizing: state === 'resizing',
    navigationWidth: 300,
    minNavigationWidth: 220,
    maxNavigationWidth: 440,
    onResizeStart: () => undefined,
    onResizeKeyDown: () => undefined,
    projects: sources,
    activeProject: sources[0],
    activeModuleLabel: tokenFixture ? 'Tokens' : 'Components',
    tree,
    treeLoading: state === 'loading',
    onProjectChange: () => undefined,
    onCreateProject: () => undefined,
    selectedFolderPath:
      typeof props.selectedFolderPath === 'string' ? props.selectedFolderPath : null,
    searchEnabled: props.searchEnabled !== false,
    coloringEnabled: props.coloringEnabled !== false,
    actionsEnabled: props.actionsEnabled !== false,
    defaultCollapsed: props.defaultCollapsed !== false,
    persistItemColors: false,
    viewControl: tokenFixture
      ? createElement(TabSwitcher, {
          ariaLabel: 'Token navigation view',
          size: 'small',
          overflow: 'wrap',
          options: [
            { value: 'tokens', label: 'Tokens' },
            { value: 'files', label: 'Files' },
          ],
          value: 'files',
          onChange: () => undefined,
        })
      : undefined,
  })
}

export const stories = [
  {
    id: 'typed-token-hierarchy',
    kind: 'integration',
    name: 'Typed token hierarchy',
    description:
      'Filesystem folders, token documents, JSON groups, and token leaves remain visually and semantically distinct.',
    examples: [{ label: 'Token files', props: { fixture: 'tokens' } }],
  },
  {
    id: 'content-states',
    kind: 'state',
    name: 'Content states',
    examples: [
      { label: 'Representative tree', props: { state: 'ready', fixture: 'components' } },
      { label: 'Empty', props: { state: 'empty' } },
      { label: 'Loading', props: { state: 'loading' } },
    ],
  },
  {
    id: 'content-stress',
    kind: 'context',
    name: 'Dense project tree',
    description:
      'Realistic categories, nesting, long names, and enough entities to force the tree region to scroll while the source header and filesystem footer remain fixed.',
    interactive: true,
    subject: 'DirectoryPanel',
    examples: [
      {
        label: 'Scrollable component library',
        props: { state: 'ready', fixture: 'dense-components' },
      },
    ],
  },
  {
    id: 'width',
    kind: 'behavior',
    name: 'Resizable width',
    interactive: true,
    examples: [{ label: 'Resize', props: { state: 'resizing' } }],
  },
  {
    id: 'folder-filter',
    kind: 'integration',
    name: 'Folder disclosure and filtering',
    description:
      'The disclosure button only expands the branch; the folder label filters the active module view, and the virtual All row restores the complete inventory.',
    interactive: true,
    examples: [
      { label: 'All', props: { selectedFolderPath: '__all__' } },
      { label: 'Atoms', props: { selectedFolderPath: 'atoms' } },
      { label: 'Images', props: { selectedFolderPath: 'images' } },
    ],
  },
  {
    id: 'capabilities',
    kind: 'behavior',
    name: 'Optional navigation capabilities',
    description:
      'Search, remembered icon colors, future actions, and initial collapse can be enabled independently.',
    interactive: true,
    examples: [
      {
        label: 'Full navigation UX',
        props: {
          searchEnabled: true,
          coloringEnabled: true,
          actionsEnabled: true,
          defaultCollapsed: true,
        },
      },
      {
        label: 'Quiet tree',
        props: {
          searchEnabled: false,
          coloringEnabled: false,
          actionsEnabled: false,
          defaultCollapsed: false,
        },
      },
    ],
  },
]
