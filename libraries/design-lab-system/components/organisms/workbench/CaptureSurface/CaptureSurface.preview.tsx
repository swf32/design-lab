const previewStyles = String.raw`
.preview-capture-surface {
  width: 100%;
  height: 120px;
  display: grid;
  place-items: center;
  background: var(--color-canvas);
}
.preview-capture-surface__card {
  width: 160px;
  height: 74px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--corner-card);
  background: var(--color-surface-primary);
}
`

export const preview = {
  html: `<style>${previewStyles}</style><div class="preview-capture-surface"><div class="preview-capture-surface__card"></div></div>`,
}
