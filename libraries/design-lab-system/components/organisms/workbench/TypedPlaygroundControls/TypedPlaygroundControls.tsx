import './TypedPlaygroundControls.scss'
import { Checkbox } from '../../../atoms/inputs/Checkbox/Checkbox'
import { ControlField } from '../../../atoms/inputs/ControlField/ControlField'
import { Input } from '../../../atoms/inputs/Input/Input'
import { RadioButton } from '../../../atoms/inputs/RadioButton/RadioButton'
import { Select } from '../../../atoms/inputs/Select/Select'
import { ColorPicker } from '../../../molecules/inputs/ColorPicker/ColorPicker'
import { Slider } from '../../../molecules/inputs/Slider/Slider'
import type { ComponentPlaygroundModule, PlaygroundValues } from '../../../../playground'

export type TypedPlaygroundControlsProps = {
  componentId: string
  controls: ComponentPlaygroundModule['playground']['controls']
  values: PlaygroundValues
  onChange: (key: string, value: string | number | boolean) => void
  heading?: string
}

export function TypedPlaygroundControls({
  componentId,
  controls,
  values,
  onChange,
  heading = 'Typed controls',
}: TypedPlaygroundControlsProps) {
  return (
    <div className="dl-typed-playground-controls">
      <header>
        <span>{heading}</span>
        <strong>{Object.keys(controls).length}</strong>
      </header>
      {Object.entries(controls).map(([key, definition]) => {
        const value = values[key]
        if (definition.kind === 'string')
          return (
            <Input
              key={key}
              label={definition.label}
              helperText={definition.description}
              placeholder={definition.placeholder}
              value={String(value)}
              size="small"
              fullWidth
              onChange={(event) => onChange(key, event.target.value)}
            />
          )
        if (definition.kind === 'boolean')
          return (
            <Checkbox
              key={key}
              label={definition.label}
              description={definition.description}
              checked={Boolean(value)}
              onChange={(event) => onChange(key, event.target.checked)}
            />
          )
        if (definition.kind === 'enum')
          return (
            <Select
              key={key}
              label={definition.label}
              helperText={definition.description}
              options={definition.options}
              value={String(value)}
              size="small"
              fullWidth
              onChange={(event) => onChange(key, event.target.value)}
            />
          )
        if (definition.kind === 'number')
          return (
            <Slider
              key={key}
              label={definition.label}
              value={Number(value)}
              minValue={definition.min}
              maxValue={definition.max}
              step={definition.step}
              size="small"
              onValueChange={(next) => onChange(key, next)}
            />
          )
        if (definition.kind === 'choice')
          return (
            <fieldset
              className="dl-typed-playground-controls__choice"
              key={key}
              aria-label={definition.label}
            >
              <legend>{definition.label}</legend>
              {definition.options.map((option) => (
                <RadioButton
                  key={option.value}
                  name={`${componentId}-${key}`}
                  value={option.value}
                  label={option.label}
                  description={option.description}
                  checked={value === option.value}
                  onChange={() => onChange(key, option.value)}
                  size="small"
                />
              ))}
            </fieldset>
          )
        return (
          <ControlField key={key} label={definition.label}>
            <ColorPicker
              label={definition.label}
              value={String(value)}
              onChange={(next) => onChange(key, next ?? definition.defaultValue)}
            />
          </ControlField>
        )
      })}
    </div>
  )
}
