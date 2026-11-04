const previewStyles = String.raw`
.preview-playground-surface {
  width: 100%;
  height: 130px;
  display: grid;
  grid-template-columns: 44px 1fr;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--corner-surface);
  overflow: hidden;
}
.preview-playground-surface__rail {
  border-right: 1px solid var(--color-border-subtle);
  background: var(--color-surface-primary);
}
.preview-playground-surface__canvas {
  display: grid;
  place-items: center;
  background: var(--color-canvas);
}
.preview-playground-surface__specimen {
  width: 55%;
  height: 35px;
  border-radius: var(--corner-card);
  background: var(--color-accent-primary);
}
`

export const preview = {
  html: `<style>${previewStyles}</style><div class="preview-playground-surface"><div class="preview-playground-surface__rail"></div><div class="preview-playground-surface__canvas"><div class="preview-playground-surface__specimen"></div></div></div>`,
}
