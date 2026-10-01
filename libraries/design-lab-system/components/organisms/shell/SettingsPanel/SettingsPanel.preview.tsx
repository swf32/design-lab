const previewStyles = String.raw`
.preview-settings-panel {
  width: min(216px, 100%);
  min-height: 112px;
  box-sizing: border-box;
  padding: 14px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--corner-surface);
  background: var(--color-surface-secondary);
}
.preview-settings-panel__eyebrow {
  width: 54px;
  height: 5px;
  margin-bottom: 10px;
  background: var(--color-accent-primary);
}
.preview-settings-panel__title {
  width: 96px;
  height: 9px;
  margin-bottom: 8px;
  border-radius: 2px;
  background: var(--color-text-secondary);
}
.preview-settings-panel__description {
  width: 100%;
  height: 5px;
  margin-bottom: 5px;
  border-radius: 2px;
  background: var(--color-text-muted);
  opacity: 0.5;
}
.preview-settings-panel__description--short {
  width: 72%;
}
`

export function SettingsPanelPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-settings-panel" aria-label="Settings panel illustration">
        <div className="preview-settings-panel__eyebrow" />
        <div className="preview-settings-panel__title" />
        <div className="preview-settings-panel__description" />
        <div className="preview-settings-panel__description preview-settings-panel__description--short" />
      </div>
    </>
  )
}
