import { ArrowLeftIcon } from '../../../../assets/icons'

const previewStyles = String.raw`
.preview-module-header {
  width: min(228px, 100%);
  box-sizing: border-box;
  padding: 4px 0 8px;
  border-bottom: 1px solid var(--color-border-subtle);
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
}
.preview-module-header__back {
  padding-right: 10px;
  border-right: 1px solid var(--color-border-subtle);
}
.preview-module-header__back i {
  min-width: 48px;
  min-height: 20px;
  padding-inline: 6px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--corner-control);
  background: var(--color-surface-secondary);
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: 6px;
  font-style: normal;
}
.preview-module-header__back svg {
  display: block;
  color: currentColor;
}
.preview-module-header__identity {
  min-width: 0;
}
.preview-module-header__identity small {
  color: var(--color-accent-primary);
  display: block;
  font-size: 6px;
  font-weight: 700;
  letter-spacing: 0.1em;
  line-height: 1.2;
  text-transform: uppercase;
}
.preview-module-header__identity b {
  margin-top: 2px;
  color: var(--color-text-primary);
  display: block;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.15;
}
.preview-module-header__utilities {
  display: flex;
  align-items: center;
  gap: 6px;
}
.preview-module-header__utilities code {
  width: 28px;
  height: 4px;
  padding-left: 6px;
  border-left: 1px solid var(--color-border-subtle);
  border-radius: 2px;
  background: var(--color-code);
}
.preview-module-header__utilities strong {
  color: var(--color-text-disabled);
  font-size: 12px;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
  line-height: 1;
}
`

export function ModuleHeaderPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <header className="preview-module-header" aria-label="Module Header illustration">
        <div className="preview-module-header__back">
          <i>
            <ArrowLeftIcon size={9} aria-hidden="true" />
            Back
          </i>
        </div>
        <span className="preview-module-header__identity">
          <small>Category path</small>
          <b>Title</b>
        </span>
        <span className="preview-module-header__utilities" aria-hidden="true">
          <code />
          <strong>18</strong>
        </span>
      </header>
    </>
  )
}
