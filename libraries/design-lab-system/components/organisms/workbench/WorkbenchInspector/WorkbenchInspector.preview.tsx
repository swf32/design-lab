import { InspectIcon } from '@design-lab/system/icons'

const previewStyles = String.raw`
.preview-workbench-inspector {
  width: min(224px, 100%);
  height: 112px;
  position: relative;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-medium);
  background: var(--color-surface-secondary);
  overflow: hidden;
}

.preview-workbench-inspector__target {
  width: 116px;
  height: 42px;
  position: absolute;
  top: 24px;
  left: 24px;
  border: 2px dashed var(--color-inspection-component);
  border-radius: var(--radius-small);
  background: color-mix(in srgb, var(--color-inspection-component) 10%, transparent);
}

.preview-workbench-inspector__popover {
  width: 68px;
  padding: var(--spacing-2);
  position: absolute;
  top: 14px;
  right: 10px;
  border: 1px solid var(--color-inspection-component);
  border-radius: var(--radius-small);
  background: var(--color-surface-raised);
  color: var(--color-code);
  font-size: 6px;
  line-height: 1.5;
}

.preview-workbench-inspector__trigger {
  padding: 4px 6px;
  position: absolute;
  right: 10px;
  bottom: 8px;
  border: 1px dashed var(--color-inspection-component);
  border-radius: var(--radius-small);
  color: var(--color-inspection-component);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: 7px;
}
`

export function WorkbenchInspectorPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div
        className="preview-workbench-inspector"
        role="img"
        aria-label="Active Component inspector"
      >
        <span className="preview-workbench-inspector__target" />
        <span className="preview-workbench-inspector__popover">
          component
          <br />
          {'<Button />'}
        </span>
        <span className="preview-workbench-inspector__trigger">
          <InspectIcon size={9} aria-hidden="true" />
          Inspecting
        </span>
      </div>
    </>
  )
}
