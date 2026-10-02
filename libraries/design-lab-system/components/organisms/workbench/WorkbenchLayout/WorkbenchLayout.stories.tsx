import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import {
  WorkbenchLayout,
  WorkbenchLayoutHeader,
  WorkbenchLayoutRail,
  WorkbenchMarkdown,
  WorkbenchPropsTable,
  WorkbenchSection,
} from './WorkbenchLayout'

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
      createElement(
        WorkbenchSection,
        null,
        createElement('span', null, 'DOCUMENTATION'),
        createElement(
          WorkbenchMarkdown,
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
      example.props.withPlayground
        ? createElement(
            WorkbenchSection,
            null,
            createElement('span', null, 'PROPS & API'),
            createElement(
              WorkbenchPropsTable,
              null,
              createElement(
                'div',
                { className: 'dl-workbench-props-head' },
                createElement('strong', null, 'NAME'),
                createElement('strong', null, 'TYPE'),
                createElement('strong', null, 'DEFAULT'),
              ),
              createElement(
                'div',
                null,
                createElement('code', null, 'children'),
                createElement('span', null, 'ReactNode'),
                createElement('small', null, '—'),
              ),
            ),
          )
        : null,
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
