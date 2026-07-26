const previewStyles = String.raw`
.inspector-code-popover-preview {
  width: min(208px, 100%);
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid
    color-mix(in srgb, var(--color-inspection-component) 70%, var(--color-border-default));
  border-radius: var(--corner-surface);
  background: color-mix(in srgb, var(--color-surface-raised) 94%, transparent);
  box-shadow: 0 12px 32px color-mix(in srgb, var(--color-overlay-scrim) 48%, transparent);
}

.inspector-code-popover-preview__identity {
  padding: 8px 10px 7px;
  border-bottom: 1px solid var(--color-border-subtle);
  display: grid;
  gap: 2px;
}

.inspector-code-popover-preview__identity span {
  color: var(--color-inspection-component);
  font-size: 7px;
  font-weight: 750;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.inspector-code-popover-preview__identity strong {
  overflow: hidden;
  color: var(--color-text-primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inspector-code-popover-preview__code {
  margin: 0;
  overflow: hidden;
  background: var(--color-surface-secondary);
}

.inspector-code-popover-preview__code figcaption {
  min-height: 20px;
  padding: 0 8px;
  border-bottom: 1px solid var(--color-border-subtle);
  background: var(--color-surface-raised);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.inspector-code-popover-preview__code figcaption span {
  color: var(--color-text-disabled);
  font-size: 6px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.inspector-code-popover-preview__code figcaption em {
  color: var(--color-text-muted);
  font-size: 6px;
  font-style: normal;
}

.inspector-code-popover-preview__code pre {
  margin: 0;
  padding: 8px 10px;
  color: var(--color-code);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 8px;
  line-height: 1.5;
  white-space: nowrap;
}
`

export function InspectorCodePopoverPreview() {
  return (
    <div className="inspector-code-popover-preview" aria-hidden="true">
      <style>{previewStyles}</style>
      <header className="inspector-code-popover-preview__identity">
        <span>Component</span>
        <strong>Button</strong>
      </header>
      <figure className="inspector-code-popover-preview__code">
        <figcaption>
          <span>tsx</span>
          <em>Copy</em>
        </figcaption>
        <pre>{'<Button>Save</Button>'}</pre>
      </figure>
    </div>
  )
}
