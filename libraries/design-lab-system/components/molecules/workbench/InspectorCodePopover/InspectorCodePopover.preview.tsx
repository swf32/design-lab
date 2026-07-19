const previewStyles = String.raw`
.inspector-code-popover-preview {
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid var(--color-inspection-component);
  border-radius: var(--radius-medium);
  background: var(--color-surface-raised);
}

.inspector-code-popover-preview header {
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border-subtle);
  display: grid;
  gap: 4px;
}

.inspector-code-popover-preview header span {
  color: var(--color-inspection-component);
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
}

.inspector-code-popover-preview header strong,
.inspector-code-popover-preview pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.inspector-code-popover-preview pre {
  margin: 0;
  padding: 12px;
  color: var(--color-code);
  font-size: 9px;
}
`

export function InspectorCodePopoverPreview() {
  return (
    <div className="inspector-code-popover-preview">
      <style>{previewStyles}</style>
      <header>
        <span>Component</span>
        <strong>Button</strong>
      </header>
      <pre>{'<Button variant="primary">Search</Button>'}</pre>
    </div>
  )
}
