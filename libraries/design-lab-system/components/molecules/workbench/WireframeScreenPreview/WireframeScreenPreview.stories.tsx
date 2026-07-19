import type { StoryDefinition } from '../../../storyContract'
import { WireframeScreenPreview } from './WireframeScreenPreview'

export const stories: StoryDefinition[] = [
  {
    id: 'scaled-screen',
    kind: 'behavior',
    name: 'Scaled screen',
    description:
      'Preserves a 1440 × 810 page viewport while fitting the available catalog or graph width.',
    examples: [{ label: 'Pricing page', props: {} }],
  },
]

export function renderStoryExample() {
  return (
    <WireframeScreenPreview>
      <div
        style={{
          minHeight: '100%',
          padding: 72,
          background: 'var(--color-surface-secondary)',
          color: 'var(--color-text-primary)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 72 }}>Choose a plan that fits.</h1>
        <div
          style={{ marginTop: 64, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}
        >
          {['Starter', 'Team', 'Top'].map((name) => (
            <div
              key={name}
              style={{
                height: 360,
                padding: 32,
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-card)',
                background: 'var(--color-surface-primary)',
                fontSize: 28,
              }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </WireframeScreenPreview>
  )
}
