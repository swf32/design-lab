import { useState } from 'react'
import { Button, Checkbox, RadioButton, Slider } from '@design-lab/system/components'
import type { StoryDefinition } from '../../../storyContract'
import { WireframeDevPanel } from './WireframeDevPanel'

export const stories: StoryDefinition[] = [
  {
    id: 'complete-dev-panel',
    kind: 'integration',
    name: 'Complete state controls',
    description: 'Verifies the floating trigger, header, scrollable controls, and footer slots.',
    interactive: true,
    examples: [{ label: 'Pricing controls', props: {} }],
  },
]

export function renderStoryExample() {
  return <WireframeDevPanelStory />
}

function WireframeDevPanelStory() {
  const [open, setOpen] = useState(true)
  const [plan, setPlan] = useState('medium')
  const [annual, setAnnual] = useState(true)
  const [tokens, setTokens] = useState(50)
  return (
    <div style={{ width: '100%', minHeight: 620, position: 'relative' }}>
      <WireframeDevPanel
        open={open}
        onOpenChange={setOpen}
        title="Pricing state"
        description="Saved state · Team running low"
        footer={
          <Button size="small" fullWidth>
            Reset state
          </Button>
        }
      >
        <div style={{ display: 'grid', gap: 16 }}>
          {['starter', 'medium', 'top'].map((option) => (
            <RadioButton
              key={option}
              name="wireframe-plan"
              value={option}
              label={option}
              checked={plan === option}
              onChange={() => setPlan(option)}
            />
          ))}
          <Checkbox
            label="Annual billing"
            checked={annual}
            onChange={(event) => setAnnual(event.target.checked)}
          />
          <Slider
            label="Extra tokens"
            value={tokens}
            onValueChange={setTokens}
            formatValue={(value) => `${value}%`}
          />
        </div>
      </WireframeDevPanel>
    </div>
  )
}
