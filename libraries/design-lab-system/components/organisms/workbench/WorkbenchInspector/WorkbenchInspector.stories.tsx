import { createElement, useRef } from 'react'
import type { StoryExample } from '../../../storyContract'
import { inspectionAttributes } from '@design-lab/system/inspection'
import { WorkbenchInspector } from './WorkbenchInspector'

function InspectorFixture() {
  const surfaceRef = useRef<HTMLDivElement>(null)
  return (
    <div ref={surfaceRef} style={{ minWidth: 280, minHeight: 160, padding: 24 }}>
      <button
        type="button"
        {...inspectionAttributes('FixtureButton', {
          variant: 'primary',
          children: 'Inspect me',
        })}
      >
        Inspect me
      </button>
      <WorkbenchInspector surfaceRef={surfaceRef} />
    </div>
  )
}

export function renderStoryExample(_example: StoryExample) {
  return createElement(InspectorFixture)
}

export const stories = [
  {
    id: 'component-handoff',
    kind: 'behavior',
    name: 'Component handoff',
    description: 'Activate Inspector, select the marked fixture, and copy its authored JSX.',
    interactive: true,
    examples: [{ label: 'Inspector surface', props: {} }],
  },
]
