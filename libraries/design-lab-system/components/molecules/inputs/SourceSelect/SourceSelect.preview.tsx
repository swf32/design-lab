const previewStyles = String.raw`
.preview-source-select {
  width: min(260px, 100%);
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-medium);
  background: var(--color-surface-secondary);
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--color-text-muted);
}
.preview-source-select > i {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-text-primary);
  color: var(--color-canvas);
  display: grid;
  place-items: center;
  font-size: 8px;
  font-weight: 800;
  font-style: normal;
}
.preview-source-select > span {
  flex: 1;
  min-width: 0;
}
.preview-source-select b,
.preview-source-select small {
  display: block;
}
.preview-source-select b {
  color: var(--color-text-secondary);
  font-size: 10px;
}
.preview-source-select small {
  margin-top: 2px;
  color: var(--color-text-disabled);
  font-size: 8px;
}
.preview-source-select em {
  font-style: normal;
}
`
export function SourceSelectPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-source-select" aria-label="Source Select illustration">
        <i>DL</i>
        <span>
          <b>Design Lab System</b>
          <small>local library</small>
        </span>
        <em>⌄</em>
      </div>
    </>
  )
}
