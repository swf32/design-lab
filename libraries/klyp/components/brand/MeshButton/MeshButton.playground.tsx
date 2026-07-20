import { control, definePlayground, type PlaygroundValues } from '@design-lab/system/playground'
import { MeshButton } from './MeshButton'

export const playground = definePlayground({
  name: 'MeshButton modes',
  description:
    'Compare the static, caller-driven mode against the built-in idle/processing/success/error state machine across mesh tones.',
  defaultVariant: 'static',
  variants: [
    {
      id: 'static',
      name: 'Static',
      description: 'Legacy mode: children render as-is; busy/active are caller-driven.',
    },
    {
      id: 'state-machine',
      name: 'State machine',
      description: 'The `state` prop drives the animated Iconsax icon swap and label spring.',
    },
  ],
  controls: {
    label: control.string({
      label: 'Label',
      defaultValue: 'Generate',
      placeholder: 'Button label',
    }),
    tone: control.choice({
      label: 'Tone',
      defaultValue: 'gold',
      options: [
        { value: 'gold', label: 'Gold' },
        { value: 'neutral', label: 'Neutral' },
        { value: 'purple', label: 'Purple' },
        { value: 'blue', label: 'Blue' },
      ],
    }),
    size: control.choice({
      label: 'Size',
      defaultValue: 'md',
      options: [
        { value: 'xs', label: 'XS' },
        { value: 'sm', label: 'SM' },
        { value: 'md', label: 'MD' },
        { value: 'lg', label: 'LG' },
        { value: 'xl', label: 'XL' },
      ],
    }),
    state: control.choice({
      label: 'State',
      defaultValue: 'idle',
      description: 'Only applies to the state-machine variant.',
      options: [
        { value: 'idle', label: 'Idle' },
        { value: 'processing', label: 'Processing' },
        { value: 'success', label: 'Success' },
        { value: 'error', label: 'Error' },
      ],
    }),
    fluidWidth: control.boolean({
      label: 'Fluid width',
      defaultValue: false,
      description: 'State-machine only: width springs to fit the current state.',
    }),
    active: control.boolean({
      label: 'Active',
      defaultValue: false,
      description: 'Static only: arms the gold surface with a black label + icon.',
    }),
    busy: control.boolean({
      label: 'Busy',
      defaultValue: false,
      description: 'Static only: disables input while a legacy async action runs.',
    }),
  },
})

type Values = PlaygroundValues<typeof playground.controls>

export function renderPlaygroundVariant({ variant, values }: { variant: string; values: Values }) {
  const isStateMachine = variant === 'state-machine'
  return (
    <MeshButton
      tone={values.tone as never}
      size={values.size as never}
      state={isStateMachine ? (values.state as never) : undefined}
      fluidWidth={isStateMachine ? values.fluidWidth : undefined}
      active={!isStateMachine ? values.active : undefined}
      busy={!isStateMachine ? values.busy : undefined}
    >
      {values.label || 'Generate'}
    </MeshButton>
  )
}
