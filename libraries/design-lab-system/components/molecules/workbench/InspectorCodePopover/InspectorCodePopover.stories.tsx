import { InspectorCodePopover } from './InspectorCodePopover'

export const stories = [
  {
    id: 'kinds',
    kind: 'variant' as const,
    name: 'Inspection identity',
    description: 'Distinguishes Component, slot, and ordinary element handoff.',
    examples: [
      { label: 'Component', props: { kind: 'component' } },
      { label: 'Slot', props: { kind: 'slot' } },
      { label: 'Element', props: { kind: 'element' } },
    ],
  },
  {
    id: 'copy',
    kind: 'behavior' as const,
    name: 'Copy fragment',
    description: 'Clicking or keyboard-activating the code fragment copies the complete source.',
    interactive: true,
    examples: [{ label: 'Copyable TSX', props: { kind: 'component' } }],
  },
]

export function renderStoryExample(example: { props: Record<string, unknown> }) {
  const kind =
    example.props.kind === 'slot' || example.props.kind === 'element'
      ? example.props.kind
      : 'component'
  return (
    <InspectorCodePopover
      kind={kind}
      name={kind === 'component' ? 'Button' : kind === 'slot' ? 'label' : 'strong'}
      language={kind === 'element' ? 'scss' : 'tsx'}
      code={
        kind === 'element'
          ? '.northstar-button {\n  width: 100%;\n}'
          : '<Button variant="primary">Search</Button>'
      }
    />
  )
}
