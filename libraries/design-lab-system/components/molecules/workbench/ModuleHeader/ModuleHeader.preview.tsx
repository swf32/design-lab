import { ArrowLeftIcon } from '../../../../assets/icons'

const previewStyles = String.raw`
.preview-module-header {
  width: min(210px, 100%);
  min-height: 72px;
  box-sizing: border-box;
  padding: 9px 0 11px;
  border-bottom: 1px solid var(--color-border-subtle);
  display: grid;
  grid-template-columns: 50px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
}
.preview-module-header__back {
  min-height: 30px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-small);
  background: var(--color-surface-secondary);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 6px;
  font-style: normal;
}
.preview-module-header__identity {
  min-width: 0;
}
.preview-module-header__identity small {
  color: var(--color-accent-primary);
  display: block;
  font-size: 5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.preview-module-header__identity b {
  margin-top: 3px;
  color: var(--color-text-primary);
  display: block;
  font-size: 13px;
  line-height: 1;
}
.preview-module-header code {
  padding-left: 8px;
  border-left: 1px solid var(--color-border-subtle);
  color: var(--color-code);
  font-size: 5px;
}
`
export function ModuleHeaderPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-module-header" aria-label="Module Header illustration">
        <i className="preview-module-header__back">
          <ArrowLeftIcon size={9} aria-hidden="true" />
          Back
        </i>
        <span className="preview-module-header__identity">
          <small>Atoms / actions</small>
          <b>Button</b>
        </span>
        <code>Button.tsx</code>
      </div>
    </>
  )
}
