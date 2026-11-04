import './ColorSwatch.scss'

export type ColorSwatchProps = {
  value: string
  size?: 'small' | 'large'
}

export function ColorSwatch({ value, size = 'small' }: ColorSwatchProps) {
  return (
    <i
      className={`dl-color-swatch dl-color-swatch--${size}`}
      style={{ background: value }}
      aria-hidden="true"
    />
  )
}
