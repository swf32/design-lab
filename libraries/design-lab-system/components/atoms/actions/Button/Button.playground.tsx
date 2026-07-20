import { control, definePlayground, type PlaygroundValues } from '@design-lab/system/playground'
import { StarIcon } from '@design-lab/system/icons'

export const playground = definePlayground({
  name: 'Button wireframes',
  description:
    'Compare primary action directions and corner systems before changing the production Button.',
  defaultVariant: 'mesh',
  variants: [
    {
      id: 'mesh',
      name: 'Living mesh',
      description: 'A high-emphasis primary action with slow token-driven color blobs.',
    },
    {
      id: 'solid',
      name: 'Solid',
      description: 'A quiet primary action that relies on one semantic accent.',
    },
    {
      id: 'outline',
      name: 'Outline',
      description: 'A lower-emphasis direction with a crisp boundary and transparent center.',
    },
  ],
  controls: {
    label: control.string({
      label: 'Label',
      defaultValue: 'Create component',
      placeholder: 'Button label',
    }),
    radius: control.choice({
      label: 'Corner radius',
      defaultValue: 'soft',
      options: [
        {
          value: 'square',
          label: 'Square',
          description: 'No rounding for a strict technical direction.',
        },
        {
          value: 'soft',
          label: 'Soft',
          description: 'Uses the compact control radius.',
        },
        {
          value: 'pill',
          label: 'Maximum',
          description: 'Rounds the button to a complete pill.',
        },
      ],
    }),
    size: control.choice({
      label: 'Size',
      defaultValue: 'comfortable',
      options: [
        { value: 'compact', label: 'Compact' },
        { value: 'comfortable', label: 'Comfortable' },
        { value: 'large', label: 'Large' },
      ],
    }),
    fullWidth: control.boolean({
      label: 'Full width',
      defaultValue: false,
      description: 'Fill the available specimen width.',
    }),
    leadingIcon: control.boolean({
      label: 'Leading icon',
      defaultValue: true,
      description: 'Compose a named leading slot with a Library icon.',
    }),
    animated: control.boolean({
      label: 'Animate mesh',
      defaultValue: true,
      description: 'Reduced-motion preferences always override this control.',
    }),
    disabled: control.boolean({
      label: 'Disabled',
      defaultValue: false,
    }),
  },
})

type Values = PlaygroundValues<typeof playground.controls>

const buttonWireframeStyles = String.raw`
.button-wireframe-stage {
  width: min(560px, 100%);
  min-height: 280px;
  padding: calc(var(--spacing-4) * 2);
  box-sizing: border-box;
  border: 1px solid color-mix(in srgb, var(--color-border-default) 72%, transparent);
  border-radius: var(--radius-card);
  background:
    radial-gradient(
      circle at 50% 18%,
      color-mix(in srgb, var(--color-accent-secondary) 9%, transparent),
      transparent 45%
    ),
    color-mix(in srgb, var(--color-surface-primary) 82%, transparent);
  display: grid;
  place-items: center;
}

.button-wireframe {
  --button-wireframe-height: var(--size-control-large);
  --button-wireframe-radius: var(--radius-small);

  width: auto;
  min-width: 184px;
  min-height: var(--button-wireframe-height);
  padding: 0 calc(var(--spacing-4) + var(--spacing-2));
  box-sizing: border-box;
  position: relative;
  border: 1px solid transparent;
  border-radius: var(--button-wireframe-radius);
  font: inherit;
  font-family: var(--typography-interface-family);
  font-size: calc(var(--typography-body-size) + 2px);
  font-weight: 700;
  letter-spacing: -0.01em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  isolation: isolate;
  overflow: hidden;
  cursor: pointer;
  touch-action: manipulation;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  transition:
    border-color var(--transition-fast) ease-out,
    box-shadow var(--transition-fast) ease-out,
    opacity var(--transition-fast) ease-out;
}

.button-wireframe--radius-square {
  --button-wireframe-radius: 0;
}

.button-wireframe--radius-pill {
  --button-wireframe-radius: calc(var(--size-control-large) * 2);
}

.button-wireframe--size-compact {
  --button-wireframe-height: var(--size-control-medium);

  min-width: 164px;
  padding-inline: var(--spacing-4);
  font-size: var(--typography-body-size);
}

.button-wireframe--size-large {
  --button-wireframe-height: calc(var(--size-control-large) + var(--spacing-2));

  min-width: 220px;
  padding-inline: calc(var(--spacing-4) * 2);
  font-size: calc(var(--typography-body-size) + 3px);
}

.button-wireframe--full {
  width: 100%;
}

.button-wireframe--solid {
  border-color: var(--color-accent-primary);
  background: var(--color-accent-primary);
  color: var(--color-canvas);
  box-shadow: 0 12px 34px color-mix(in srgb, var(--color-accent-primary) 24%, transparent);
}

.button-wireframe--outline {
  border-color: var(--color-border-strong);
  background: color-mix(in srgb, var(--color-surface-primary) 42%, transparent);
  color: var(--color-text-primary);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

.button-wireframe--mesh {
  border-color: color-mix(in srgb, var(--color-text-primary) 16%, transparent);
  background: var(--color-accent-primary);
  color: var(--color-canvas);
  box-shadow:
    0 14px 42px color-mix(in srgb, var(--color-accent-secondary) 24%, transparent),
    inset 0 1px color-mix(in srgb, var(--color-text-primary) 22%, transparent);
}

.button-wireframe:hover:not(:disabled),
.button-wireframe:focus-visible {
  border-color: color-mix(in srgb, var(--color-text-primary) 48%, transparent);
  box-shadow:
    0 16px 48px color-mix(in srgb, var(--color-accent-secondary) 30%, transparent),
    inset 0 1px color-mix(in srgb, var(--color-text-primary) 30%, transparent);
}

.button-wireframe:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-accent-primary) 38%, transparent);
  outline-offset: 4px;
}

.button-wireframe:active:not(:disabled) {
  box-shadow:
    0 8px 24px color-mix(in srgb, var(--color-accent-secondary) 22%, transparent),
    inset 0 1px color-mix(in srgb, var(--color-text-primary) 24%, transparent);
}

.button-wireframe:disabled {
  cursor: not-allowed;
  opacity: 0.44;
}

.button-wireframe__mesh {
  position: absolute;
  z-index: -1;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  pointer-events: none;
  -webkit-mask-image: -webkit-linear-gradient(#fff, #fff);
  mask-image: linear-gradient(#fff 0 0);
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}

.button-wireframe__blob {
  width: 68%;
  aspect-ratio: 1;
  position: absolute;
  border-radius: 50%;
  filter: blur(18px);
  opacity: 0.84;
  transform: translate3d(0, 0, 0);
}

.button-wireframe__blob--a {
  top: -58%;
  left: -12%;
  background: var(--color-accent-secondary);
}

.button-wireframe__blob--b {
  right: -18%;
  bottom: -64%;
  background: var(--color-status-warning);
}

.button-wireframe__blob--c {
  top: -62%;
  right: 8%;
  background: var(--color-status-success);
  opacity: 0.58;
}

.button-wireframe--animated .button-wireframe__blob--a {
  animation: button-mesh-a 7.2s var(--easing-preview) infinite alternate;
}

.button-wireframe--animated .button-wireframe__blob--b {
  animation: button-mesh-b 8.4s var(--easing-preview) infinite alternate;
}

.button-wireframe--animated .button-wireframe__blob--c {
  animation: button-mesh-c 6.6s var(--easing-preview) infinite alternate;
}

.button-wireframe__label {
  position: relative;
  z-index: 1;
}

.button-wireframe__leading {
  width: 16px;
  height: 16px;
  position: relative;
  z-index: 1;
  display: grid;
  flex: 0 0 auto;
  place-items: center;
}

@keyframes button-mesh-a {
  to {
    transform: translate3d(48%, 36%, 0) scale(1.12);
  }
}

@keyframes button-mesh-b {
  to {
    transform: translate3d(-46%, -42%, 0) scale(1.2);
  }
}

@keyframes button-mesh-c {
  to {
    transform: translate3d(-24%, 72%, 0) scale(0.88);
  }
}

@supports (-webkit-touch-callout: none) {
  .button-wireframe__mesh {
    -webkit-mask-image: -webkit-linear-gradient(#fff, #fff);
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-size: 100% 100%;
    -webkit-transform: translateZ(0);
  }

  .button-wireframe__blob {
    -webkit-transform: translate3d(0, 0, 0);
  }
}

@media (max-width: 760px) {
  .button-wireframe-stage {
    min-height: 240px;
    padding: calc(var(--spacing-4) * 1.5);
  }

  .button-wireframe {
    max-width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .button-wireframe {
    transition: none;
  }

  .button-wireframe__blob {
    animation: none !important;
  }
}
`

export function renderPlaygroundVariant({ variant, values }: { variant: string; values: Values }) {
  const isMesh = variant === 'mesh'
  const className = [
    'button-wireframe',
    `button-wireframe--${variant}`,
    `button-wireframe--radius-${values.radius}`,
    `button-wireframe--size-${values.size}`,
    values.fullWidth && 'button-wireframe--full',
    isMesh && values.animated && 'button-wireframe--animated',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <style>{buttonWireframeStyles}</style>
      <div className="button-wireframe-stage">
        <button type="button" className={className} disabled={values.disabled}>
          {isMesh && (
            <span className="button-wireframe__mesh" aria-hidden="true">
              <span className="button-wireframe__blob button-wireframe__blob--a" />
              <span className="button-wireframe__blob button-wireframe__blob--b" />
              <span className="button-wireframe__blob button-wireframe__blob--c" />
            </span>
          )}
          {values.leadingIcon && (
            <span className="button-wireframe__leading">
              <StarIcon size={16} aria-hidden="true" />
            </span>
          )}
          <span className="button-wireframe__label">{values.label || 'Button'}</span>
        </button>
      </div>
    </>
  )
}
