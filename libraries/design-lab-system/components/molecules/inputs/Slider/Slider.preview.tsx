const previewStyles = String.raw`
.preview-slider {
  width: min(232px, 100%);
  display: grid;
  gap: var(--space-8);
  color: var(--color-text-primary);
}
.preview-slider__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-12);
  font-size: 12px;
  font-weight: 520;
  line-height: 1.25;
}
.preview-slider__header output {
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.preview-slider__track {
  position: relative;
  height: 22px;
}
.preview-slider__rail {
  position: absolute;
  inset: 7px 0;
  border: 1px solid var(--color-border-subtle);
  border-radius: 999px;
  background: var(--color-surface-raised);
}
.preview-slider__fill {
  position: absolute;
  top: 7px;
  bottom: 7px;
  left: 0;
  width: 52%;
  border-radius: 999px;
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
  box-shadow: 0 2px 7px color-mix(in srgb, var(--color-canvas) 30%, transparent);
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
          <span className="preview-slider__rail" />
          <span className="preview-slider__fill" />
          <i className="preview-slider__thumb" />
        </div>
      </div>
    </>
  )
}
