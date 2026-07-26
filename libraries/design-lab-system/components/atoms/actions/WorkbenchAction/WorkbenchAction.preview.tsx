import { CodeIcon, InspectIcon, SettingsIcon } from '@design-lab/system/icons'

const previewStyles = String.raw`
.preview-workbench-actions {
  width: min(220px, 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-8);
}

.preview-workbench-action {
  min-height: 22px;
  padding: 0 7px;
  border: 1px dashed currentColor;
  border-radius: var(--corner-full);
  background: var(--color-workbench-action-surface);
  display: inline-flex;
  align-items: center;
  gap: var(--space-4);
  font-size: 8px;
  font-weight: 650;
}

.preview-workbench-action--neutral {
  color: var(--color-workbench-action-neutral);
}

.preview-workbench-action--inspect {
  color: var(--color-inspection-component);
}

.preview-workbench-action--dev {
  color: var(--color-workbench-action-dev);
}
`

export function WorkbenchActionPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div
        className="preview-workbench-actions"
        role="img"
        aria-label="Compact neutral, Inspect, and Dev mode workbench actions"
      >
        <span className="preview-workbench-action preview-workbench-action--neutral">
          <SettingsIcon size={10} aria-hidden="true" />
          Settings
        </span>
        <span className="preview-workbench-action preview-workbench-action--inspect">
          <InspectIcon size={10} aria-hidden="true" />
          Inspect
        </span>
        <span className="preview-workbench-action preview-workbench-action--dev">
          <CodeIcon size={10} aria-hidden="true" />
          Dev
        </span>
      </div>
    </>
  )
}
