import type { ReactNode } from 'react'

type BaseControl<Kind extends string, Value> = {
  kind: Kind
  label: string
  defaultValue: Value
  description?: string
}

export type StringPlaygroundControl = BaseControl<'string', string> & {
  placeholder?: string
}

export type BooleanPlaygroundControl = BaseControl<'boolean', boolean>

export type EnumPlaygroundControl = BaseControl<'enum', string> & {
  options: readonly { value: string; label: string }[]
}

export type ChoicePlaygroundControl = BaseControl<'choice', string> & {
  options: readonly { value: string; label: string; description?: string }[]
}

export type NumberPlaygroundControl = BaseControl<'number', number> & {
  min: number
  max: number
  step?: number
}

export type ColorPlaygroundControl = BaseControl<'color', string>

export type PlaygroundControl =
  | StringPlaygroundControl
  | BooleanPlaygroundControl
  | EnumPlaygroundControl
  | ChoicePlaygroundControl
  | NumberPlaygroundControl
  | ColorPlaygroundControl

export type PlaygroundControls = Record<string, PlaygroundControl>

export type PlaygroundVariant = {
  id: string
  name: string
  description?: string
}

export type ComponentPlaygroundDefinition<
  Controls extends PlaygroundControls = PlaygroundControls,
> = {
  name: string
  description?: string
  controls: Controls
  variants: readonly PlaygroundVariant[]
  defaultVariant: string
}

export type PlaygroundValues<Controls extends PlaygroundControls = PlaygroundControls> = {
  [Key in keyof Controls]: Controls[Key]['defaultValue']
}

export type PlaygroundRenderContext<Controls extends PlaygroundControls = PlaygroundControls> = {
  variant: string
  values: PlaygroundValues<Controls>
  mode: string
}

type CommonControlOptions<Value> = {
  label: string
  defaultValue: Value
  description?: string
}

export const control = {
  string(options: CommonControlOptions<string> & { placeholder?: string }) {
    return { kind: 'string' as const, ...options }
  },
  boolean(options: CommonControlOptions<boolean>) {
    return { kind: 'boolean' as const, ...options }
  },
  enum(
    options: CommonControlOptions<string> & {
      options: readonly { value: string; label: string }[]
    },
  ) {
    return { kind: 'enum' as const, ...options }
  },
  choice(
    options: CommonControlOptions<string> & {
      options: readonly { value: string; label: string; description?: string }[]
    },
  ) {
    return { kind: 'choice' as const, ...options }
  },
  number(
    options: CommonControlOptions<number> & {
      min: number
      max: number
      step?: number
    },
  ) {
    return { kind: 'number' as const, ...options }
  },
  color(options: CommonControlOptions<string>) {
    return { kind: 'color' as const, ...options }
  },
}

export function definePlayground<const Controls extends PlaygroundControls>(
  definition: ComponentPlaygroundDefinition<Controls>,
) {
  return definition
}

export type ComponentPlaygroundModule = {
  playground: ComponentPlaygroundDefinition
  renderPlaygroundVariant: (context: PlaygroundRenderContext) => ReactNode
}
