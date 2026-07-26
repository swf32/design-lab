import { useState } from 'react'
import type { StoryExample } from '../../../storyContract'
import { Button } from '../../../atoms/actions/Button/Button'
import { Input } from '../../../atoms/inputs/Input/Input'
import { Dialog, type DialogSize } from './Dialog'

function DialogStoryFixture({ example }: { example: StoryExample }) {
  const [open, setOpen] = useState(false)
  const size = (example.props.size ?? 'medium') as DialogSize
  const dismissible = example.props.dismissible !== false
  const label = typeof example.props.label === 'string' ? example.props.label : 'Open dialog'

  return (
    <>
      <Button type="button" variant="primary" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Dialog
        open={open}
        size={size}
        dismissible={dismissible}
        eyebrow="Workspace"
        title="Invite collaborator"
        description="Dialog owns modal behavior and layout while its consumer supplies the task content."
        onClose={() => setOpen(false)}
        footer={
          <>
            {dismissible && (
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            )}
            <Button type="button" variant="primary" onClick={() => setOpen(false)}>
              {dismissible ? 'Send invite' : 'Complete action'}
            </Button>
          </>
        }
      >
        <Input label="Email" type="email" placeholder="teammate@example.com" fullWidth autoFocus />
      </Dialog>
    </>
  )
}

export function renderStoryExample(example: StoryExample) {
  return <DialogStoryFixture example={example} />
}

const imports = [
  "import { useState } from 'react'",
  "import { Button, Input } from '@design-lab/system/components'",
]

function sourceFor(size: DialogSize, dismissible = true) {
  return `const [open, setOpen] = useState(false)

<>
  <Button onClick={() => setOpen(true)}>Open dialog</Button>
  <Dialog
    open={open}
    size="${size}"
    dismissible={${dismissible}}
    title="Invite collaborator"
    description="Dialog owns modal behavior and layout."
    onClose={() => setOpen(false)}
    footer={
      <Button onClick={() => setOpen(false)}>
        ${dismissible ? 'Send invite' : 'Complete action'}
      </Button>
    }
  >
    <Input label="Email" type="email" />
  </Dialog>
</>`
}

export const stories = [
  {
    id: 'sizes',
    kind: 'variant',
    name: 'Dialog sizes',
    description: 'Every modal starts closed in Workbench and opens only from its launcher.',
    interactive: true,
    examples: [
      {
        label: 'Small',
        props: { size: 'small', label: 'Open small dialog' },
        source: sourceFor('small'),
        imports,
      },
      {
        label: 'Medium',
        props: { size: 'medium', label: 'Open medium dialog' },
        source: sourceFor('medium'),
        imports,
      },
      {
        label: 'Large',
        props: { size: 'large', label: 'Open large dialog' },
        source: sourceFor('large'),
        imports,
      },
    ],
  },
  {
    id: 'dismissal',
    kind: 'behavior',
    name: 'Dismissal paths',
    description:
      'Dismissible dialogs support Close, backdrop, Escape, and a footer action. Required flows still expose an explicit completing action in Story.',
    interactive: true,
    examples: [
      {
        label: 'Dismissible',
        props: { dismissible: true, label: 'Open dismissible dialog' },
        source: sourceFor('medium'),
        imports,
      },
      {
        label: 'Required action',
        props: { dismissible: false, label: 'Open required dialog' },
        source: sourceFor('medium', false),
        imports,
      },
    ],
  },
]
