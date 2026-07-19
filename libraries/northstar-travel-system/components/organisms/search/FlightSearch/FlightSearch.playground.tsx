import { control, definePlayground, type PlaygroundValues } from '@design-lab/system/playground'
import type { CSSProperties } from 'react'
import { Button } from '../../../atoms/actions/Button/Button'

export const playground = definePlayground({
  name: 'Flight Search wireframes',
  description: 'Three reviewable directions before a production component is approved.',
  defaultVariant: 'stacked',
  variants: [
    { id: 'stacked', name: 'Stacked', description: 'Comfortable form for small screens.' },
    { id: 'inline', name: 'Inline', description: 'Efficient horizontal desktop composition.' },
    { id: 'command', name: 'Command', description: 'Sentence-like search with a strong action.' },
  ],
  controls: {
    tripType: control.enum({
      label: 'Trip type',
      defaultValue: 'return',
      options: [
        { value: 'return', label: 'Return' },
        { value: 'one-way', label: 'One way' },
        { value: 'multi-city', label: 'Multi-city' },
      ],
    }),
    cabin: control.choice({
      label: 'Cabin',
      defaultValue: 'economy',
      options: [
        { value: 'economy', label: 'Economy', description: 'Best range of fares.' },
        { value: 'business', label: 'Business', description: 'Priority and space.' },
      ],
    }),
    travellers: control.number({
      label: 'Travellers',
      defaultValue: 2,
      min: 1,
      max: 9,
      step: 1,
    }),
    flexible: control.boolean({
      label: 'Flexible dates',
      defaultValue: true,
    }),
    actionColor: control.color({
      label: 'Action color',
      defaultValue: '#006d77',
    }),
  },
})

type Values = PlaygroundValues<typeof playground.controls>

const prototypeStyles = String.raw`
.northstar-search-prototype {
  width: min(820px, 100%);
  box-sizing: border-box;
  padding: 28px;
  border: 1px solid var(--ds-color-border-default);
  border-radius: var(--ds-radius-card);
  background: var(--ds-color-surface-primary);
  color: var(--ds-color-text-primary);
  box-shadow: 0 24px 70px rgb(5 42 48 / 12%);
  font-family: Inter, system-ui, sans-serif;
}

.northstar-search-prototype header {
  margin-bottom: 22px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.northstar-search-prototype header span {
  color: var(--ds-color-text-secondary);
  font-size: 12px;
}

.northstar-search-prototype h2 {
  margin: 4px 0 0;
  font-size: 24px;
}

.northstar-search-prototype__fields {
  display: grid;
  gap: 12px;
}

.northstar-search-prototype--inline .northstar-search-prototype__fields {
  grid-template-columns: 1.2fr 1.2fr 1fr 1fr auto;
}

.northstar-search-prototype--stacked .northstar-search-prototype__fields {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.northstar-search-prototype__field {
  min-width: 0;
  min-height: 64px;
  box-sizing: border-box;
  padding: 10px 14px;
  border: 1px solid var(--ds-color-border-default);
  border-radius: var(--ds-radius-control);
  background: var(--ds-color-surface-secondary);
  display: grid;
  align-content: center;
  gap: 4px;
}

.northstar-search-prototype__field small {
  color: var(--ds-color-text-secondary);
  font-size: 10px;
}

.northstar-search-prototype__field strong {
  overflow: hidden;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.northstar-search-prototype__action {
  min-height: 52px;
  padding: 0 22px;
}

.northstar-search-prototype--stacked .northstar-search-prototype__action {
  grid-column: 1 / -1;
}

.northstar-search-prototype--command p {
  margin: 0 0 18px;
  font-size: clamp(20px, 4vw, 36px);
  line-height: 1.45;
}

.northstar-search-prototype--command mark {
  padding: 3px 8px;
  border-radius: 8px;
  background: var(--ds-color-surface-secondary);
  color: var(--ds-color-accent-primary);
}

@media (max-width: 760px) {
  .northstar-search-prototype {
    padding: 20px;
  }

  .northstar-search-prototype header {
    align-items: flex-start;
    flex-direction: column;
  }

  .northstar-search-prototype--inline .northstar-search-prototype__fields,
  .northstar-search-prototype--stacked .northstar-search-prototype__fields {
    grid-template-columns: 1fr;
  }

  .northstar-search-prototype__action {
    width: 100%;
    min-height: 48px;
    grid-column: auto;
  }
}
`

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="northstar-search-prototype__field">
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  )
}

export function renderPlaygroundVariant({ variant, values }: { variant: string; values: Values }) {
  const meta = `${values.tripType} · ${values.travellers} travellers · ${values.cabin}`
  return (
    <section className={`northstar-search-prototype northstar-search-prototype--${variant}`}>
      <style>{prototypeStyles}</style>
      <header>
        <div>
          <span>Flight search · Wireframe</span>
          <h2>Where next?</h2>
        </div>
        <span>{meta}</span>
      </header>
      {variant === 'command' ? (
        <>
          <p>
            Fly from <mark>Lisbon</mark> to <mark>Copenhagen</mark> in <mark>September</mark>.
          </p>
          <Button
            className="northstar-search-prototype__action"
            style={{ backgroundColor: values.actionColor } as CSSProperties}
          >
            Explore fares
          </Button>
        </>
      ) : (
        <div className="northstar-search-prototype__fields">
          <Field label="From" value="Lisbon · LIS" />
          <Field label="To" value="Copenhagen · CPH" />
          <Field label="Dates" value={values.flexible ? 'Flexible September' : '12–18 Sep'} />
          <Field label="Travellers" value={`${values.travellers} · ${values.cabin}`} />
          <Button
            className="northstar-search-prototype__action"
            style={{ backgroundColor: values.actionColor } as CSSProperties}
          >
            Search flights
          </Button>
        </div>
      )}
    </section>
  )
}
