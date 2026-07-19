const previewStyles = String.raw`
.preview-component-reference {
  width: min(248px, 100%);
  min-height: 96px;
  margin: auto;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 6px;
}
.preview-component-reference__code,
.preview-component-reference__files,
.preview-component-reference__graph {
  padding: 7px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-small);
  background: var(--color-surface-secondary);
}
.preview-component-reference__code {
  min-width: 0;
  color: var(--color-code);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 5px;
  line-height: 1.5;
}
.preview-component-reference__files {
  display: grid;
  align-content: center;
  gap: 5px;
}
.preview-component-reference__files i,
.preview-component-reference__graph i {
  height: 3px;
  border-radius: 2px;
  background: var(--color-border-default);
}
.preview-component-reference__files i:nth-child(2) {
  width: 72%;
}
.preview-component-reference__files i:nth-child(3) {
  width: 88%;
}
.preview-component-reference__graph {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
}
.preview-component-reference__graph i:first-child {
  background: var(--color-accent-primary);
}
`

export function ComponentReferencePanelPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div
        className="preview-component-reference"
        role="img"
        aria-label="Component import, files, and dependency reference"
      >
        <code className="preview-component-reference__code">
          import {'{ Button }'}
          <br />
          from '@design-lab/system/components'
        </code>
        <span className="preview-component-reference__files">
          <i />
          <i />
          <i />
        </span>
        <span className="preview-component-reference__graph">
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>
    </>
  )
}
