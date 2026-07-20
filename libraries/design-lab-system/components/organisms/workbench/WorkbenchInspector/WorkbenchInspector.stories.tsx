import { createElement, useRef, useState } from 'react'
import type { StoryExample } from '../../../storyContract'
import { StarIcon } from '@design-lab/system/icons'
import { inspectionAttributes, slotAttributes } from '@design-lab/system/inspection'
import { WorkbenchInspector } from './WorkbenchInspector'

function InspectorFixture() {
  const surfaceRef = useRef<HTMLDivElement>(null)
  const [activations, setActivations] = useState(0)
  return (
    <div ref={surfaceRef} style={{ minWidth: 280, minHeight: 160, padding: 24 }}>
      <button
        type="button"
        onClick={() => setActivations((current) => current + 1)}
        {...inspectionAttributes('FixtureButton', {
          variant: 'primary',
          children: 'Inspect me',
        })}
      >
        <span {...slotAttributes('leading')}>
          <StarIcon size={16} aria-hidden="true" />
        </span>
        Inspect me · actions {activations}
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
    description:
      'Hover the leading icon as a slot, pin a selection without activating the fixture, dismiss it with one surface click, and select again with the next.',
    interactive: true,
    examples: [{ label: 'Inspector surface', props: {} }],
  },
]
