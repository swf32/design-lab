import { createElement, useRef, useState } from 'react'
import type { StoryExample } from '../../../storyContract'
import { StarIcon } from '@design-lab/system/icons'
import { Button } from '../../../atoms/actions/Button/Button'
import { WorkbenchInspector } from './WorkbenchInspector'

function InspectorFixture() {
  const surfaceRef = useRef<HTMLDivElement>(null)
  const [activations, setActivations] = useState(0)
  return (
    <div ref={surfaceRef} style={{ minWidth: 280, minHeight: 160, padding: 24 }}>
      <Button
        variant="primary"
        leading={<StarIcon size={16} aria-hidden="true" />}
        onClick={() => setActivations((current) => current + 1)}
      >
        Inspect me · actions {activations}
      </Button>
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
      'Hover the leading icon as a slot, turn on Hard Mode to force neutral Component surfaces and doubled identity outlines, then pin without activating the fixture.',
    interactive: true,
    examples: [{ label: 'Inspector surface', props: {} }],
  },
]
