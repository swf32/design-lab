import { ArrowDownIcon } from '../../../../assets/icons'

const previewStyles = String.raw`
.select-preview {
  width: min(220px, 100%);
  display: grid;
  gap: var(--spacing-2);
}
.select-preview span {
  color: var(--color-text-muted);
  font-size: 9px;
  font-weight: 600;
}
.select-preview div {
  height: 40px;
  padding: 0 var(--spacing-3);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-small);
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
