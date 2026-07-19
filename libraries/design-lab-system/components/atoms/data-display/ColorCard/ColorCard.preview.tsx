const previewStyles = String.raw`
.preview-color-cards {
  min-height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.preview-color-cards > span {
  width: 49px;
  height: 78px;
  padding: 4px;
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-small);
  background: var(--color-surface-secondary);
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 4px 10px color-mix(in srgb, var(--color-canvas) 18%, transparent);
}
.preview-color-cards > span > i {
  width: 100%;
  height: 40px;
  flex: 0 0 40px;
  margin: 0;
  border-radius: 3px;
  background: var(--color-accent-primary);
}
.preview-color-cards > span.is-surface > i {
  border: 1px solid var(--color-border-subtle);
  background: var(--color-surface-raised);
}
.preview-color-cards > span.is-danger > i {
  background: var(--color-status-danger);
}
.preview-color-cards code,
.preview-color-cards small {
  overflow: hidden;
  color: var(--color-text-secondary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 5px;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.preview-color-cards small {
  color: var(--color-text-disabled);
  font-size: 4.5px;
}
`
const colors = [
  { name: 'accent', value: '#26D9C7', className: 'is-accent' },
  { name: 'surface', value: '#20201F', className: 'is-surface' },
  { name: 'danger', value: '#FF7B72', className: 'is-danger' },
]

export function ColorCardPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div
        className="preview-color-cards"
        role="img"
        aria-label="Color cards with token names and resolved values"
      >
        {colors.map((color) => (
          <span className={color.className} key={color.name}>
            <i />
            <code>{color.name}</code>
            <small>{color.value}</small>
          </span>
        ))}
      </div>
    </>
  )
}
