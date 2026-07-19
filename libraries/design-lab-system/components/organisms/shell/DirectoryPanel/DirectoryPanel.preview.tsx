const previewStyles = String.raw`
.preview-directory-panel {
  position: relative;
  width: 154px;
  height: 118px;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-medium);
  background: var(--color-surface-secondary);
  display: flex;
  flex-direction: column;
  gap: 0;
}
.preview-directory-panel header {
  height: 31px;
  padding: 4px 6px;
  border-bottom: 1px solid var(--color-border-subtle);
  border-radius: 0;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 5px;
}
.preview-directory-panel header > b {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  border-radius: 50%;
  background: var(--color-text-primary);
  color: var(--color-canvas);
  display: grid;
  place-items: center;
  font-size: 6px;
}
.preview-directory-panel header > span {
  min-width: 0;
  height: auto;
  flex: 1;
  background: transparent;
}
.preview-directory-panel header strong,
.preview-directory-panel header small {
  overflow: hidden;
  display: block;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.preview-directory-panel header strong {
  color: var(--color-text-secondary);
  font-size: 6px;
}
.preview-directory-panel header small {
  color: var(--color-text-disabled);
  font-size: 5px;
}
.preview-directory-panel header > i {
  width: auto;
  height: auto;
  margin: 0;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 7px;
  font-style: normal;
}
.preview-directory-panel__toolbar {
  height: 18px;
  padding: 0 7px;
  color: var(--color-text-disabled);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 5px;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.preview-directory-panel__toolbar b {
  font-size: 8px;
}
.preview-directory-panel__search {
  height: 17px;
  margin: 0 5px 2px;
  padding: 0 5px;
  border: 1px solid var(--color-border-subtle);
  border-radius: 3px;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 6px;
}
.preview-directory-panel__search span {
  height: auto;
  overflow: hidden;
  background: transparent;
  color: var(--color-text-disabled);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.preview-directory-panel main {
  position: relative;
  padding: 1px 8px 1px 4px;
  display: grid;
  gap: 1px;
}
.preview-directory-panel main span {
  height: 11px;
  padding: 0 4px;
  border-radius: 3px;
  background: transparent;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 6px;
}
.preview-directory-panel main span.is-nested {
  padding-left: 11px;
}
.preview-directory-panel main span.is-deep {
  padding-left: 21px;
}
.preview-directory-panel main span.is-active {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}
.preview-directory-panel main span i {
  width: auto;
  height: auto;
  margin: 0;
  border-radius: 0;
  background: transparent;
  color: var(--color-accent-secondary);
  font-size: 6px;
  font-style: normal;
}
.preview-directory-panel main em {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 3px;
  height: 31px;
  border-radius: 3px;
  background: var(--color-border-strong);
}
.preview-directory-panel footer {
  height: 17px;
  margin-top: auto;
  padding: 0 7px;
  border-top: 1px solid var(--color-border-subtle);
  color: var(--color-text-disabled);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 5px;
}
.preview-directory-panel footer i {
  width: 4px;
  height: 4px;
  margin: 0;
  border-radius: 50%;
  background: var(--color-status-success);
}
`
export function DirectoryPanelPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-directory-panel" aria-label="Directory Panel illustration">
        <header>
          <b>DL</b>
          <span>
            <strong>Design Lab System</strong>
            <small>local library</small>
          </span>
          <i>⌄</i>
        </header>
        <div className="preview-directory-panel__toolbar">
          COMPONENTS <b>＋</b>
        </div>
        <div className="preview-directory-panel__search">
          ⌕ <span>Search this module…</span>
        </div>
        <main>
          <span className="is-active">
            <i>◇</i> All
          </span>
          <span>
            <i>›</i> Components
          </span>
          <span>
            <i>›</i> Experimental
          </span>
          <em />
        </main>
        <footer>
          <i /> Local filesystem
        </footer>
      </div>
    </>
  )
}
