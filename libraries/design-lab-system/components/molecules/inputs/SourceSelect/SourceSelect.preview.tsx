import { ArrowDownIcon } from '../../../../assets/icons'

const previewStyles = String.raw`
.preview-source-select {
  width: min(232px, 100%);
  display: grid;
  gap: 6px;
}
.preview-source-select__row {
  box-sizing: border-box;
  min-height: 34px;
  padding: 4px 6px;
  border: 1px solid transparent;
  border-radius: var(--corner-surface);
  background: transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
}
.preview-source-select__mark {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  border-radius: 50%;
  background: var(--color-text-primary);
  color: var(--color-canvas);
  display: grid;
  place-items: center;
  font-size: 7px;
  font-weight: 800;
}
.preview-source-select__text {
  min-width: 0;
  flex: 1;
}
.preview-source-select__text b,
.preview-source-select__text small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.preview-source-select__text b {
  color: var(--color-text-secondary);
  font-size: 10px;
  font-weight: 550;
}
.preview-source-select__text small {
  margin-top: 1px;
  color: var(--color-text-disabled);
  font-size: 8px;
}
.preview-source-select__row svg {
  flex: 0 0 auto;
  color: var(--color-text-muted);
}
`

export function SourceSelectPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div
        className="preview-source-select"
        aria-label="Project and library source selector illustration"
      >
        <div className="preview-source-select__row">
          <span className="preview-source-select__mark">SP</span>
          <span className="preview-source-select__text">
            <b>Starter project</b>
            <small>local project</small>
          </span>
          <ArrowDownIcon size={14} aria-hidden="true" />
        </div>
        <div className="preview-source-select__row">
          <span className="preview-source-select__mark">DL</span>
          <span className="preview-source-select__text">
            <b>Design Lab System</b>
            <small>local library</small>
          </span>
          <ArrowDownIcon size={14} aria-hidden="true" />
        </div>
      </div>
    </>
  )
}
