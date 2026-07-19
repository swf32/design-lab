import { Checkbox } from '../Checkbox/Checkbox'
import type { StoryExample } from '../../../storyContract'
import { ControlField } from './ControlField'

export function renderStoryExample(example: StoryExample) {
  const props = example.props
  const disabled = props.state === 'disabled'
  let control = (
    <input defaultValue="Value" disabled={disabled} autoFocus={props.state === 'focus'} />
  )

  if (props.control === 'select')
    control = (
      <select defaultValue="primary" disabled={disabled}>
        <option value="primary">Primary</option>
        <option value="secondary">Secondary</option>
      </select>
    )
  if (props.control === 'checkbox')
    control = <Checkbox label="Enabled" defaultChecked disabled={disabled} />

  return <ControlField label={String(props.label ?? example.label)}>{control}</ControlField>
}

export const stories = [
  {
    id: 'control-types',
    kind: 'variant',
    name: 'Control types',
    examples: [
      { label: 'Text', props: { label: 'Label', control: 'input' } },
      { label: 'Select', props: { label: 'Variant', control: 'select' } },
      { label: 'Boolean', props: { label: 'Disabled', control: 'checkbox' } },
    ],
  },
  {
    id: 'focus-disabled',
    kind: 'state',
    name: 'Focus and disabled states',
    examples: [
      { label: 'Focus', props: { state: 'focus' } },
      { label: 'Disabled', props: { state: 'disabled' } },
    ],
  },
]
