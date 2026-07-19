import { Button } from '../../../atoms/actions/Button/Button'
import { PlaygroundControlsRail } from './PlaygroundControlsRail'

export const stories = [
  {
    id: 'slots',
    kind: 'context' as const,
    name: 'Rail slots',
    description: 'Header, scrollable content, and footer remain independent composition slots.',
    examples: [
      { label: 'Complete rail', props: { footer: true } },
      { label: 'Without footer', props: { footer: false } },
    ],
  },
]

export function renderStoryExample(example: { props: Record<string, unknown> }) {
  return (
    <PlaygroundControlsRail
      header={<strong>Flight Search</strong>}
      footer={
        example.props.footer ? (
          <Button variant="secondary" fullWidth>
            Copy review link
          </Button>
        ) : undefined
      }
      style={{ width: 280, height: 420 }}
    >
      <p>Direction</p>
      <p>Product theme</p>
      <p>Typed controls</p>
    </PlaygroundControlsRail>
  )
}
