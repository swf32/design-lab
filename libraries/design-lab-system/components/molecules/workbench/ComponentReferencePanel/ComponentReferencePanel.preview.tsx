const previewStyles = String.raw`
.preview-component-reference {
  width: min(248px, 100%);
  box-sizing: border-box;
  overflow: hidden;
  border-bottom: 1px solid var(--color-border-subtle);
  background: var(--color-surface-primary);
}
.preview-component-reference__import {
  min-width: 0;
  padding: 8px 9px;
}
.preview-component-reference__import header {
  min-height: 10px;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
}
.preview-component-reference__import header strong,
.preview-component-reference__graph-toggle {
  color: var(--color-text-disabled);
  font-size: 5px;
  font-weight: 700;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}
.preview-component-reference__code {
  min-width: 0;
  overflow: hidden;
  color: var(--color-code);
  display: block;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 6px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.preview-component-reference__graph-toggle {
  min-height: 24px;
  padding: 0 9px;
  border-top: 1px solid var(--color-border-subtle);
  display: flex;
  align-items: center;
  gap: 5px;
}
.preview-component-reference__graph-toggle small {
  font-size: 5px;
  font-weight: 400;
}
.preview-component-reference__graph-toggle i {
  width: 5px;
  height: 5px;
  margin-left: auto;
  border-right: 1px solid currentColor;
  border-bottom: 1px solid currentColor;
  transform: rotate(45deg);
}
`

export function ComponentReferencePanelPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <section
        className="preview-component-reference"
        role="img"
        aria-label="Component import and collapsed dependency reference"
      >
        <section className="preview-component-reference__import">
          <header>
            <strong>Import</strong>
          </header>
          <code className="preview-component-reference__code">
            {"import { Button } from '@design-lab/…'"}
          </code>
        </section>
        <div className="preview-component-reference__graph-toggle" aria-hidden="true">
          Relations <small>2</small>
          <i />
        </div>
      </section>
    </>
  )
}
