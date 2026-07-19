const previewStyles = String.raw`
.wireframe-card-preview {
  width: 100%;
  height: 150px;
  padding: 12px;
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  align-items: center;
  gap: 10px;
}

.wireframe-card-preview > i,
.wireframe-card-preview b {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-small);
  background: var(--color-surface-primary);
}

.wireframe-card-preview > i {
  height: 66px;
}

.wireframe-card-preview > span {
  display: grid;
  gap: 7px;
}

.wireframe-card-preview b {
  height: 25px;
}

.wireframe-card-preview b:nth-child(2) {
  border-color: var(--color-accent-primary);
}
`

export function WireframeCardPreview() {
  return (
    <div className="wireframe-card-preview">
      <style>{previewStyles}</style>
      <i />
      <span>
        <b />
        <b />
        <b />
      </span>
    </div>
  )
}
