import { ArrowDownIcon, CopyIcon } from '../../../../assets/icons'

const previewStyles = String.raw`
.preview-code-block {
  width: min(188px, 100%);
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid var(--color-border-default);
  border-radius: var(--corner-surface);
  background: var(--color-surface-secondary);
  transition: border-color var(--transition-preview) var(--easing-preview);
}

.preview-code-block figcaption {
  min-height: 22px;
  padding: 0 8px 0 10px;
  border-bottom: 1px solid var(--color-border-subtle);
  background: var(--color-surface-raised);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.preview-code-block figcaption > span {
  color: var(--color-text-disabled);
  font-size: 6px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.preview-code-block figcaption .copy-action {
  padding: 0 4px;
  color: var(--color-text-muted);
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 6px;
}
.preview-code-block figcaption .preview-code-block__actions {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.preview-code-block figcaption .disclosure-action {
  color: var(--color-text-muted);
  display: grid;
  place-items: center;
}

.preview-code-block figcaption .copy-action svg {
  display: block;
  color: var(--color-text-muted);
}

.preview-code-block figcaption .is-copied {
  display: none;
}

.preview-code-block pre {
  margin: 0;
  padding: 8px 10px 10px;
}

.preview-code-block pre code {
  color: var(--color-code);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 7px;
  line-height: 1.6;
  white-space: pre;
}

@media (prefers-reduced-motion: no-preference) {
  .dl-component-card--preview-animated:is(:hover, :focus-visible) .preview-code-block {
    border-color: var(--color-border-strong);
  }
  .dl-component-card--preview-animated:is(:hover, :focus-visible)
    .preview-code-block
    figcaption
    .is-ready {
    display: none;
  }
  .dl-component-card--preview-animated:is(:hover, :focus-visible)
    .preview-code-block
    figcaption
    .is-copied {
    display: inline-flex;
  }
}
`

export function CodeBlockPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <figure
        className="preview-code-block"
        data-preview-motion="state-transition"
        aria-label="Code Block illustration"
      >
        <figcaption>
          <span>tsx</span>
          <span className="preview-code-block__actions" aria-hidden="true">
            <span className="disclosure-action">
              <ArrowDownIcon size={9} aria-hidden="true" />
            </span>
            <span className="copy-action is-ready">
              <CopyIcon size={9} aria-hidden="true" />
              Copy
            </span>
            <span className="copy-action is-copied">✓ Copied</span>
          </span>
        </figcaption>
        <pre>
          <code>{`import {\n  Button,\n  Input,\n  Select,\n} from '@design-lab/system'`}</code>
        </pre>
      </figure>
    </>
  )
}
