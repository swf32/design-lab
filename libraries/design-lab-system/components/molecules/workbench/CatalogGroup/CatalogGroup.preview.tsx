const previewStyles = String.raw`
.preview-catalog-group {
  width: min(220px, 100%);
}
.preview-catalog-group header {
  min-height: 28px;
  box-sizing: border-box;
  padding: 0 10px 7px;
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.preview-catalog-group header b {
  color: var(--color-text-secondary);
  font-size: 8px;
}
.preview-catalog-group header i {
  min-width: 18px;
  height: 18px;
  border-radius: var(--radius-pill);
  background: var(--color-surface-hover);
  color: var(--color-text-disabled);
  display: grid;
  place-items: center;
  font-size: 6px;
  font-style: normal;
}
.preview-catalog-group section {
  padding-top: 9px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5px;
}
.preview-catalog-group section i {
  height: 42px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-card);
  background: var(--color-surface-secondary);
}
`

export function CatalogGroupPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-catalog-group" aria-label="Catalog Group illustration">
        <header>
          <b>molecules / workbench</b>
          <i>2</i>
        </header>
        <section aria-hidden="true">
          <i />
          <i />
        </section>
      </div>
    </>
  )
}
