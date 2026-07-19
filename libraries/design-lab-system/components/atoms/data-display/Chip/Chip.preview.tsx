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
  min-height: 23px;
  padding: 0 9px;
  border: 1px solid color-mix(in srgb, var(--color-text-secondary) 12%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-text-secondary) 14%, var(--color-surface-primary));
  display: inline-flex;
  align-items: center;
  color: var(--color-text-secondary);
  font-size: 8px;
  font-weight: 600;
}
.preview-chip.is-success {
  border-color: color-mix(in srgb, var(--color-status-success) 12%, transparent);
  background: color-mix(in srgb, var(--color-status-success) 14%, var(--color-surface-primary));
  color: var(--color-status-success);
}
.preview-chip.is-warning {
  border-color: color-mix(in srgb, var(--color-status-warning) 12%, transparent);
  background: color-mix(in srgb, var(--color-status-warning) 14%, var(--color-surface-primary));
  color: var(--color-status-warning);
}
.preview-chip.is-danger {
  border-color: color-mix(in srgb, var(--color-status-danger) 12%, transparent);
  background: color-mix(in srgb, var(--color-status-danger) 14%, var(--color-surface-primary));
  color: var(--color-status-danger);
}
`

export function ChipPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-chips" role="img" aria-label="Soft status chips">
        <span className="preview-chip is-success">Ready</span>
        <span className="preview-chip is-warning">Pending</span>
        <span className="preview-chip is-danger">Failed</span>
      </div>
    </>
  )
}
