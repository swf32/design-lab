import { PlusIcon } from '../../../../assets/icons/PlusIcon'

const previewStyles = String.raw`
.preview-slot-placeholder {
  width: 156px;
  height: 72px;
  max-width: 100%;
  box-sizing: border-box;
  border: 1px dashed var(--color-inspection-slot);
  border-radius: var(--corner-control);
  display: grid;
  place-items: center;
  color: var(--color-inspection-slot);
}
`

export function SlotPlaceholderPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <span
        className="preview-slot-placeholder"
        role="img"
        aria-label="Transparent slot boundary with an insertion marker"
      >
        <PlusIcon size={16} aria-hidden="true" />
      </span>
    </>
  )
}
