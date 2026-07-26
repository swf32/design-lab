const previewStyles = String.raw`
.preview-chips {
  min-height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 7px;
}
.preview-chip {
  --preview-chip-color: var(--color-text-secondary);
  min-height: 23px;
  padding: 0 9px;
  border: 1px solid color-mix(in srgb, var(--preview-chip-color) 12%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--preview-chip-color) 14%, var(--color-surface-primary));
  display: inline-flex;
  align-items: center;
  color: var(--preview-chip-color);
  font-size: 8px;
  font-weight: 600;
}
.preview-chip.is-teal {
  --preview-chip-color: var(--color-category-teal);
}
.preview-chip.is-cyan {
  --preview-chip-color: var(--color-category-cyan);
}
.preview-chip.is-violet {
  --preview-chip-color: var(--color-category-violet);
}
.preview-chip.is-orange {
  --preview-chip-color: var(--color-category-orange);
}
`

export function ChipPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-chips" role="img" aria-label="Soft categorical chips">
        <span className="preview-chip is-violet">Code</span>
        <span className="preview-chip is-cyan">Vector</span>
        <span className="preview-chip is-teal">Raster</span>
        <span className="preview-chip is-orange">Video</span>
      </div>
    </>
  )
}
