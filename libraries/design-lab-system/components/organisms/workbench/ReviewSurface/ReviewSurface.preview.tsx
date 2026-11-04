const previewStyles = String.raw`
.preview-review-surface {
  width: 100%;
  height: 130px;
  display: grid;
  grid-template-columns: 1fr 42px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--corner-surface);
  overflow: hidden;
  background: var(--color-surface-primary);
}
.preview-review-surface__stage {
  display: grid;
  place-items: center;
  background: var(--color-canvas);
}
.preview-review-surface__screen {
  width: 66%;
  height: 65%;
  border: 1px solid var(--color-border-default);
  border-radius: var(--corner-card);
  background: var(--color-surface-secondary);
}
.preview-review-surface__rail {
  border-left: 1px solid var(--color-border-subtle);
}
`

export const preview = {
  html: `<style>${previewStyles}</style><div class="preview-review-surface"><div class="preview-review-surface__stage"><div class="preview-review-surface__screen"></div></div><div class="preview-review-surface__rail"></div></div>`,
}
