import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { WorkbenchLayout, WorkbenchLayoutHeader, WorkbenchLayoutRail } from './WorkbenchLayout'

export function renderStoryExample(example: StoryExample) {
  return createElement(
    WorkbenchLayout,
    { style: { height: 280 } },
    createElement(WorkbenchLayoutHeader, null, createElement('strong', null, 'Component detail')),
    example.props.withPlayground
      ? createElement('div', { style: { minHeight: 76, padding: 16 } }, 'Live Canvas')
      : null,
    createElement(
      WorkbenchLayoutRail,
      null,
      createElement('div', null, createElement('span', null, 'DOCUMENTATION')),
      createElement(
        'div',
        null,
        createElement(
          'p',
          null,
          example.props.longContent
            ? 'A longer workbench rail keeps documentation readable as the available width changes and content wraps across lines.'
            : 'The active System owns this presentation.',
        ),
      ),
    ),
  )
}

export const stories = [
  {
    id: 'with-playground',
    kind: 'composition',
    name: 'Header, Canvas, and rail',
    examples: [{ label: 'Component Workbench', props: { withPlayground: true } }],
  },
  {
    id: 'long-content',
    kind: 'context',
    name: 'Long documentation',
    examples: [{ label: 'Wrapped content', props: { longContent: true } }],
  },
]
