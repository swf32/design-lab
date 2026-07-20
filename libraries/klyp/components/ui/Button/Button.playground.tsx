import { control, definePlayground, type PlaygroundValues } from '@design-lab/system/playground'
import { Button } from './Button'

export const playground = definePlayground({
  name: 'Button modes',
  description:
    'Compare the static, caller-driven mode against the built-in idle/processing/success/error state machine.',
  defaultVariant: 'static',
  variants: [
    {
      id: 'static',
      name: 'Static',
      description: 'Children render as-is; the caller owns busy/disabled feedback.',
    },
    {
      id: 'state-machine',
      name: 'State machine',
      description: 'The `state` prop drives the built-in icon swap and label spring.',
    },
  ],
  controls: {
    label: control.string({
      label: 'Label',
      defaultValue: 'Generate',
      placeholder: 'Button label',
    }),
    variant: control.choice({
      label: 'Variant',
      defaultValue: 'primary',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'outline', label: 'Outline' },
        { value: 'ghost', label: 'Ghost' },
        { value: 'destructive', label: 'Destructive' },
        { value: 'accent', label: 'Accent' },
        { value: 'link', label: 'Link' },
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
    disabled: control.boolean({
      label: 'Disabled',
      defaultValue: false,
    }),
  },
})

type Values = PlaygroundValues<typeof playground.controls>

export function renderPlaygroundVariant({ variant, values }: { variant: string; values: Values }) {
  const isStateMachine = variant === 'state-machine'
  return (
    <Button
      variant={values.variant as never}
      size={values.size as never}
      disabled={values.disabled}
      state={isStateMachine ? (values.state as never) : undefined}
      fluidWidth={isStateMachine ? values.fluidWidth : undefined}
    >
      {values.label || 'Generate'}
    </Button>
  )
}
