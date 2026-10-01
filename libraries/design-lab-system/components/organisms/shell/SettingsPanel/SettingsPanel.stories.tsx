import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { Button } from '../../../atoms/actions/Button/Button'
import { SettingsPanel } from './SettingsPanel'

export function renderStoryExample(example: StoryExample) {
  if (example.props.prominent)
    return createElement(SettingsPanel, {
      prominent: true,
      eyebrow: 'AI integration',
      title: 'MCP and agent access',
      description:
        'Give coding agents a verified, filesystem-backed view of Components, tokens, assets, fonts, and knowledge.',
      action: createElement('strong', null, 'Ready'),
    })
  if (example.props.withAction)
    return createElement(SettingsPanel, {
      eyebrow: 'Project files',
      title: 'Design Lab integration',
      description: 'Check source mounts, local rules, and the active interface System.',
      action: createElement(Button, { size: 'small', children: 'Check integration' }),
      children: createElement('p', null, 'Config and authoring rules are present.'),
    })
  if (example.props.longContent)
    return createElement(SettingsPanel, {
      eyebrow: 'Project files',
      title: 'Integration diagnostics for a large workspace',
      description:
        'Review source mounts and the active System before installing updates. Long package names and nested paths must remain readable at narrow widths.',
      children: createElement(
        'ul',
        null,
        ...[
          'packages/brand-foundations/src/tokens/semantic-color-aliases',
          'packages/customer-dashboard/src/components/navigation/AccountSwitcher',
          'packages/marketing-site/src/assets/illustrations/onboarding',
          'design-lab/system/components/organisms/workbench/InspectorCodePopover',
          'packages/customer-dashboard/src/pages/subscription-management',
        ].map((path) => createElement('li', { key: path }, path)),
      ),
    })
  return createElement(SettingsPanel, {
    eyebrow: 'Visual layer',
    title: 'Interface Skin',
    description: 'A Skin changes public variables over the active System.',
    children: createElement('p', null, 'Active: System appearance'),
  })
}

export const stories = [
  {
    id: 'content',
    kind: 'context',
    name: 'Settings task and guidance',
    examples: [{ label: 'Visual layer', props: {} }],
  },
  {
    id: 'action',
    kind: 'integration',
    name: 'Status check with action',
    examples: [{ label: 'Project files', props: { withAction: true } }],
  },
  {
    id: 'prominent',
    kind: 'variant',
    name: 'Leading overview',
    examples: [{ label: 'AI integration', props: { prominent: true } }],
  },
  {
    id: 'long-content',
    kind: 'context',
    name: 'Long source paths',
    examples: [{ label: 'Dense diagnostics', props: { longContent: true } }],
  },
]
