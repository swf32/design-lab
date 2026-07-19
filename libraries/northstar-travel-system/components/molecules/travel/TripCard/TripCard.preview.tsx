const previewStyles = String.raw`
.northstar-trip-preview {
  width: 100%;
  box-sizing: border-box;
  padding: 16px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-medium);
  background: var(--color-surface-secondary);
  display: grid;
  gap: 14px;
}

.northstar-trip-preview__route {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
}

.northstar-trip-preview__route strong {
  color: var(--color-text-primary);
  font-size: 16px;
}

.northstar-trip-preview__route i {
  height: 1px;
  background: var(--color-border-strong);
}

.northstar-trip-preview__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.northstar-trip-preview__footer span {
  width: 45%;
  height: 6px;
  border-radius: 99px;
  background: var(--color-border-default);
}

.northstar-trip-preview__footer b {
  width: 64px;
  height: 24px;
  border-radius: var(--radius-small);
  background: var(--color-accent-primary);
}
`

export function TripCardPreview() {
  return (
    <div className="northstar-trip-preview">
      <style>{previewStyles}</style>
      <div className="northstar-trip-preview__route">
        <strong>09:10</strong>
        <i />
        <strong>12:25</strong>
      </div>
      <div className="northstar-trip-preview__footer">
        <span />
        <b />
      </div>
    </div>
  )
}
