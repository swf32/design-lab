const previewStyles = String.raw`
.preview-catalog-group {
  width: min(228px, 100%);
  box-sizing: border-box;
}
.preview-catalog-group header {
  min-height: 30px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.preview-catalog-group header b {
  overflow: hidden;
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-overflow: ellipsis;
  text-transform: capitalize;
  white-space: nowrap;
}
.preview-catalog-group header i {
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  border-radius: var(--corner-full);
  background: var(--color-surface-hover);
  color: var(--color-text-disabled);
  display: grid;
  place-items: center;
  font-size: 8px;
  font-style: normal;
  font-variant-numeric: tabular-nums;
}
`

export function CatalogGroupPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <section className="preview-catalog-group" aria-label="Catalog Group illustration">
        <header>
          <b>molecules / workbench</b>
          <i>3</i>
        </header>
      </section>
    </>
  )
}
