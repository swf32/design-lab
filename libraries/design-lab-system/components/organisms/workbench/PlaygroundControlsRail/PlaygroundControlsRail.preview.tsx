const previewStyles = String.raw`
.playground-controls-rail-preview {
  width: min(190px, 100%);
  height: 150px;
  overflow: hidden;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-medium);
  background: var(--color-surface-primary);
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.playground-controls-rail-preview header,
.playground-controls-rail-preview footer {
  height: 32px;
  padding: 0 10px;
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  align-items: center;
}

.playground-controls-rail-preview footer {
  border-top: 1px solid var(--color-border-subtle);
  border-bottom: 0;
}

.playground-controls-rail-preview span {
  height: 6px;
  border-radius: 99px;
  background: var(--color-border-strong);
}

.playground-controls-rail-preview header span {
  width: 55%;
}

.playground-controls-rail-preview main {
  padding: 10px;
  display: grid;
  align-content: start;
  gap: 8px;
}

.playground-controls-rail-preview main span {
  width: 100%;
}

.playground-controls-rail-preview main span:last-child {
  width: 72%;
}

.playground-controls-rail-preview footer span {
  width: 100%;
}
`

export function PlaygroundControlsRailPreview() {
  return (
    <div className="playground-controls-rail-preview">
      <style>{previewStyles}</style>
      <header>
        <span />
      </header>
      <main>
        <span />
        <span />
        <span />
      </main>
      <footer>
        <span />
      </footer>
    </div>
  )
}
