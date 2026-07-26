import { ArrowDownIcon } from '../../../../assets/icons'

const previewStyles = String.raw`
.select-preview {
  width: min(220px, 100%);
  display: grid;
  gap: var(--space-8);
}
.select-preview span {
  color: var(--color-text-muted);
  font-size: 9px;
  font-weight: 600;
}
.select-preview div {
  height: 40px;
  padding: 0 var(--space-12);
  border: 1px solid var(--color-border-default);
  border-radius: var(--corner-control);
  background: var(--color-surface-secondary);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
}
`

export function SelectPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="select-preview">
        <span>Cabin class</span>
        <div>
          Premium economy
          <ArrowDownIcon size={14} aria-hidden="true" />
        </div>
      </div>
    </>
  )
}
