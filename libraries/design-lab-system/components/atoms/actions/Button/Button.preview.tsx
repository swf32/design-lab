const previewStyles = String.raw`
.preview-button-sheet {
  width: 172px;
  height: 96px;
  position: relative;
  padding: 14px;
  box-sizing: border-box;
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 8px;
}
.preview-button {
  width: auto;
  height: 32px;
  padding: 0 13px;
  border-radius: var(--radius-small);
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 8px;
  font-style: normal;
  font-weight: 700;
  letter-spacing: 0.01em;
}
.preview-button--primary {
  min-width: 82px;
  background: var(--color-accent-primary);
  color: var(--color-canvas);
  box-shadow: 0 5px 12px color-mix(in srgb, var(--color-accent-primary) 18%, transparent);
}
.preview-button--secondary {
  min-width: 70px;
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface-secondary);
  color: var(--color-text-primary);
}
.preview-button--ghost {
  width: 32px;
  padding: 0;
  border: 1px solid transparent;
  color: var(--color-text-muted);
  justify-content: center;
  letter-spacing: 0.08em;
}
.preview-button b {
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
}
`
export function ButtonPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-button-sheet" role="img" aria-label="Button variants illustration">
        <span className="preview-button preview-button--primary">
          <b>＋</b>Create
        </span>
        <span className="preview-button preview-button--secondary">Cancel</span>
        <span className="preview-button preview-button--ghost" aria-hidden="true">
          •••
        </span>
      </div>
    </>
  )
}
