const previewStyles = String.raw`
.preview-slider {
  width: min(248px, 100%);
  min-height: 96px;
  margin: auto;
  display: grid;
  place-content: center stretch;
  gap: 10px;
}
.preview-slider__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  color: var(--color-text-primary);
  font-size: 11px;
  font-weight: 520;
}
.preview-slider__header output {
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.preview-slider__track {
  position: relative;
  height: 9px;
  border-radius: 999px;
  background: var(--color-surface-raised);
}
.preview-slider__fill {
  position: absolute;
  inset: 0 48% 0 0;
  border-radius: inherit;
  background: var(--color-accent-primary);
}
.preview-slider__thumb {
  position: absolute;
  top: 50%;
  left: 52%;
  width: 22px;
  height: 22px;
  box-sizing: border-box;
  border: 3px solid var(--color-accent-primary);
  border-radius: 50%;
  background: var(--color-surface-primary);
  box-shadow: 0 2px 7px color-mix(in srgb, var(--color-canvas) 28%, transparent);
  transform: translate(-50%, -50%);
}
`

export function SliderPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-slider" role="img" aria-label="Volume slider set to 52">
        <div className="preview-slider__header">
          <span>Volume</span>
          <output>52</output>
        </div>
        <div className="preview-slider__track">
          <i className="preview-slider__fill" />
          <i className="preview-slider__thumb" />
        </div>
      </div>
    </>
  )
}
