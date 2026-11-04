const previewStyles = String.raw`
.preview-settings-surface {
  width: 100%;
  height: 130px;
  padding: 12px;
  display: grid;
  gap: 8px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--corner-surface);
  background: var(--color-surface-primary);
}
.preview-settings-surface__header {
  width: 45%;
  height: 13px;
  border-radius: var(--corner-control);
  background: var(--color-text-secondary);
}
.preview-settings-surface__panel {
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--corner-card);
  background: var(--color-surface-secondary);
}
`

export const preview = {
  html: `<style>${previewStyles}</style><div class="preview-settings-surface"><div class="preview-settings-surface__header"></div><div class="preview-settings-surface__panel"></div><div class="preview-settings-surface__panel"></div></div>`,
}
