export type ColorCardProps = { name: string; value: string }

export function ColorCard({ name, value }: ColorCardProps) {
  return <article className="dl-color-card"><div className="dl-color-card__swatch" style={{background:value}}/><code title={name}>{name}</code><span title={value}>{value}</span></article>
}
