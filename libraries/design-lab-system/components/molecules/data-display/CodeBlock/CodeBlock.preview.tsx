const previewStyles = String.raw`
.preview-code-block {
  width: 170px;
  height: 92px;
  padding-bottom: 8px;
  overflow: hidden;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-medium);
  background: var(--color-surface-secondary);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.preview-code-block header {
  height: 25px;
  padding: 0 7px;
  border-bottom: 1px solid var(--color-border-subtle);
  background: var(--color-surface-raised);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-text-disabled);
  font-size: 7px;
}
.preview-code-block i {
  width: 70%;
  height: 4px;
  margin-left: 10px;
  border-radius: 2px;
  background: var(--color-code);
  opacity: 0.75;
}
.preview-code-block i:nth-of-type(2) {
  width: 50%;
}
.preview-code-block i:nth-of-type(3) {
  width: 78%;
}
.preview-code-block i:nth-of-type(4) {
  width: 42%;
}
`
export function CodeBlockPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-code-block" aria-label="Code Block illustration">
        <header>
          <span>tsx</span>
          <b>Copy</b>
        </header>
        <i />
        <i />
        <i />
        <i />
      </div>
    </>
  )
}
