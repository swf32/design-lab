import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { CreateProjectDialog } from './CreateProjectDialog'

export function renderStoryExample(_example: StoryExample) {
  return createElement(CreateProjectDialog, {
    open: true,
    busy: false,
    error: null,
    canClose: true,
    onClose: () => undefined,
    onScan: async ({ name }) => ({
      name: name || 'Existing system',
      scan: { frameworks: ['React'], found: {} },
      changes: { createFiles: [], updateFiles: [] },
    }),
    onCreate: async () => undefined,
  })
}

export const stories = [
  {
    id: 'project-onboarding',
    kind: 'behavior',
    name: 'Choose setup mode',
    examples: [{ label: 'Initial step', props: {} }],
  },
]
