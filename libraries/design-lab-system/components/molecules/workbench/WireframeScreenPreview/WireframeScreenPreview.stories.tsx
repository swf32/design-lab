import type { StoryDefinition, StoryExample } from '../../../storyContract'
import { WireframeScreenPreview } from './WireframeScreenPreview'

export const stories: StoryDefinition[] = [
  {
    id: 'scaled-screen',
    kind: 'behavior',
    name: 'Responsive virtual viewport',
    description:
      'Preserves desktop or portrait dimensions while activating the matching container-query composition.',
    examples: [
      { label: 'Desktop · 1440 × 810', props: { viewportWidth: 1440, viewportHeight: 810 } },
      { label: 'Mobile · 390 × 844', props: { viewportWidth: 390, viewportHeight: 844 } },
    ],
  },
]

export function renderStoryExample(example: StoryExample) {
  const viewportWidth = Number(example.props.viewportWidth ?? 1440)
  const viewportHeight = Number(example.props.viewportHeight ?? 810)
  return (
    <WireframeScreenPreview viewportWidth={viewportWidth} viewportHeight={viewportHeight}>
      <div
        className="wireframe-screen-preview-story"
        style={{
          minHeight: '100%',
          padding: 72,
          background: 'var(--color-surface-secondary)',
          color: 'var(--color-text-primary)',
        }}
      >
        <style>{`
          @container (max-width: 600px) {
            .wireframe-screen-preview-story > div {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
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
