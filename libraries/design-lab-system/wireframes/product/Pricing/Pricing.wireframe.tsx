import './Pricing.wireframe.scss'
import { Button, Checkbox, Chip } from '@design-lab/system/components'
import type {
  WireframeAction,
  WireframeRenderContext,
  WireframeValues,
} from '@design-lab/system/wireframes'

type PlanId = 'none' | 'starter' | 'medium' | 'top'

type Plan = {
  id: Exclude<PlanId, 'none'>
  name: string
  description: string
  monthly: number
  features: string[]
  allowance: string
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For personal exploration and small prototypes.',
    monthly: 18,
    allowance: '40k tokens / month',
    features: ['1 workspace', 'Private projects', 'Community support'],
  },
  {
    id: 'medium',
    name: 'Medium',
    description: 'For product teams shipping every week.',
    monthly: 42,
    allowance: '140k tokens / month',
    features: ['Unlimited projects', 'Shared libraries', 'Priority support'],
  },
  {
    id: 'top',
    name: 'Top',
    description: 'For organizations standardizing product quality.',
    monthly: 86,
    allowance: '400k tokens / month',
    features: ['12 workspaces', 'Governance controls', 'Extra token packs'],
  },
]

function readPlan(values: WireframeValues): PlanId {
  return ['starter', 'medium', 'top'].includes(String(values.plan))
    ? (values.plan as PlanId)
    : 'none'
}

function planPrice(plan: Plan, annual: boolean, seats: number) {
  const monthly = annual ? Math.round(plan.monthly * 0.8) : plan.monthly
  return monthly * seats
}

function actionForPlan(plan: Plan['id'], values: WireframeValues): WireframeAction {
  const nextValues = {
    ...values,
    plan,
    annual: plan === 'starter' ? true : values.annual,
    tokensPurchased: plan === 'top' ? Number(values.tokensPurchased ?? 0) : 0,
  }
  return {
    id: values.plan === 'none' ? `choose-${plan}` : plan === 'top' ? 'upgrade-top' : `move-${plan}`,
    values: nextValues,
  }
}

function PlanCard({
  plan,
  currentPlan,
  annual,
  seats,
  prominent = false,
  onAction,
  values,
}: {
  plan: Plan
  currentPlan: PlanId
  annual: boolean
  seats: number
  prominent?: boolean
  onAction: WireframeRenderContext['onAction']
  values: WireframeValues
}) {
  const selected = currentPlan === plan.id
  const price = planPrice(plan, annual, seats)
  return (
    <article
      className={`pricing-wireframe__plan${prominent ? ' pricing-wireframe__plan--prominent' : ''}${selected ? ' pricing-wireframe__plan--current' : ''}`}
    >
      <header>
        <div>
          <span>{plan.allowance}</span>
          <h2>{plan.name}</h2>
        </div>
        {selected ? (
          <Chip size="small" color="success" variant="soft">
            Current
          </Chip>
        ) : plan.id === 'medium' ? (
          <Chip size="small" color="accent" variant="soft">
            Recommended
          </Chip>
        ) : null}
      </header>
      <p>{plan.description}</p>
      <div className="pricing-wireframe__price">
        <strong>${price}</strong>
        <span>
          / month
          {seats > 1 ? ` · ${seats} seats` : ''}
        </span>
      </div>
      <ul>
        {plan.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <Button
        variant={prominent || plan.id === 'medium' ? 'primary' : 'secondary'}
        size="large"
        fullWidth
        disabled={selected}
        onClick={() => onAction(actionForPlan(plan.id, values))}
      >
        {selected
          ? 'Current plan'
          : currentPlan === 'none'
            ? `Choose ${plan.name}`
            : `Move to ${plan.name}`}
      </Button>
    </article>
  )
}

function TokenAllowance({
  purchased,
  values,
  onAction,
}: {
  purchased: number
  values: WireframeValues
  onAction: WireframeRenderContext['onAction']
}) {
  const remaining = Math.max(0, 100 - purchased)
  const next = purchased < 50 ? 50 : 100
  return (
    <section className="pricing-wireframe__allowance">
      <div className="pricing-wireframe__allowance-copy">
        <span>Extra token allowance</span>
        <strong>{remaining}% still available</strong>
        <p>
          {remaining
            ? 'Purchase only what the account can still use this billing year.'
            : 'The complete optional allowance is already active for this account.'}
        </p>
      </div>
      <div
        className="pricing-wireframe__allowance-meter"
        style={{ '--pricing-progress': `${purchased}%` } as React.CSSProperties}
      >
        <div>
          <span />
        </div>
        <footer>
          <b>{purchased}% purchased</b>
          <span>{remaining}% available</span>
        </footer>
      </div>
      <Button
        variant="primary"
        size="large"
        disabled={!remaining}
        onClick={() =>
          onAction({
            id: purchased < 50 ? 'buy-half' : 'buy-rest',
            values: { ...values, tokensPurchased: next },
          })
        }
      >
        {remaining ? `Buy ${Math.min(50, remaining)}% allowance` : 'Maximum reached'}
      </Button>
    </section>
  )
}

function ComparisonLayout({
  values,
  onAction,
}: Pick<WireframeRenderContext, 'values' | 'onAction'>) {
  const currentPlan = readPlan(values)
  const annual = Boolean(values.annual)
  const seats = Number(values.teamSeats ?? 1)
  return (
    <>
      <div className="pricing-wireframe__hero">
        <Chip color="accent" variant="soft">
          Plans for every stage
        </Chip>
        <h1>Make better product decisions before they become expensive.</h1>
        <p>Every plan includes local projects, versioned decisions, and component review.</p>
      </div>
      <div className="pricing-wireframe__billing">
        <Checkbox
          label="Annual billing"
          description="Save 20% on the monthly equivalent."
          checked={annual}
          onChange={(event) =>
            onAction({
              id: 'change-billing',
              values: { ...values, annual: event.target.checked },
            })
          }
        />
      </div>
      <div className="pricing-wireframe__plan-grid">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlan={currentPlan}
            annual={annual}
            seats={seats}
            onAction={onAction}
            values={values}
          />
        ))}
      </div>
      {currentPlan === 'top' && (
        <TokenAllowance
          purchased={Number(values.tokensPurchased ?? 0)}
          values={values}
          onAction={onAction}
        />
      )}
    </>
  )
}

function RecommendedLayout({
  values,
  onAction,
}: Pick<WireframeRenderContext, 'values' | 'onAction'>) {
  const currentPlan = readPlan(values)
  const annual = Boolean(values.annual)
  const seats = Number(values.teamSeats ?? 1)
  const focusPlan = plans.find(
    (plan) => plan.id === (currentPlan === 'none' ? 'medium' : currentPlan),
  )!
  const alternatives = plans.filter((plan) => plan.id !== focusPlan.id)
  return (
    <div className="pricing-wireframe__recommended-layout">
      <div className="pricing-wireframe__recommended-copy">
        <Chip color="accent" variant="soft">
          Our recommendation
        </Chip>
        <h1>
          {currentPlan === 'none'
            ? 'Medium is the clearest place to start.'
            : `${focusPlan.name} fits your current work.`}
        </h1>
        <p>
          Enough room for real product work, with a path to increase capacity when the team needs
          it.
        </p>
        <div className="pricing-wireframe__proof">
          <strong>82%</strong>
          <span>
            of active product teams stay within this allowance for their first six months.
          </span>
        </div>
      </div>
      <PlanCard
        plan={focusPlan}
        currentPlan={currentPlan}
        annual={annual}
        seats={seats}
        prominent
        onAction={onAction}
        values={values}
      />
      <div className="pricing-wireframe__alternatives">
        <span>Other ways to start</span>
        {alternatives.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => onAction(actionForPlan(plan.id, values))}
          >
            <div>
              <strong>{plan.name}</strong>
              <small>{plan.allowance}</small>
            </div>
            <b>${planPrice(plan, annual, seats)} / mo</b>
          </button>
        ))}
      </div>
      {currentPlan === 'top' && (
        <TokenAllowance
          purchased={Number(values.tokensPurchased ?? 0)}
          values={values}
          onAction={onAction}
        />
      )}
    </div>
  )
}

function GuidedLayout({ values, onAction }: Pick<WireframeRenderContext, 'values' | 'onAction'>) {
  const currentPlanId = readPlan(values)
  const currentPlan = plans.find((plan) => plan.id === currentPlanId)
  const tokens = Number(values.tokensPurchased ?? 0)
  const seats = Number(values.teamSeats ?? 1)
  return (
    <div className="pricing-wireframe__guided-layout">
      <header>
        <div>
          <Chip color={currentPlan ? 'success' : 'warning'} variant="soft">
            {currentPlan ? 'Account active' : 'Setup incomplete'}
          </Chip>
          <h1>
            {currentPlan
              ? `${currentPlan.name} is working for ${seats} ${seats === 1 ? 'seat' : 'seats'}.`
              : 'Choose the capacity your team needs.'}
          </h1>
        </div>
        <p>Pricing adapts to what the account can do next, not to a generic plan table.</p>
      </header>
      <section className="pricing-wireframe__guided-summary">
        <div>
          <span>Current plan</span>
          <strong>{currentPlan?.name ?? 'None'}</strong>
          <small>{currentPlan?.allowance ?? 'No monthly allowance'}</small>
        </div>
        <div>
          <span>Team</span>
          <strong>{seats}</strong>
          <small>{seats === 1 ? 'active seat' : 'active seats'}</small>
        </div>
        <div>
          <span>Billing</span>
          <strong>{values.annual ? 'Annual' : 'Monthly'}</strong>
          <small>{values.annual ? '20% lower monthly equivalent' : 'Flexible renewal'}</small>
        </div>
      </section>
      {currentPlanId === 'top' ? (
        <TokenAllowance purchased={tokens} values={values} onAction={onAction} />
      ) : (
        <section className="pricing-wireframe__next-step">
          <div>
            <span>Recommended next step</span>
            <h2>
              {currentPlan
                ? 'Unlock extra token capacity with Top.'
                : 'Start with Medium and keep room to grow.'}
            </h2>
            <p>The recommendation changes when account entitlement changes.</p>
          </div>
          <Button
            variant="primary"
            size="large"
            onClick={() =>
              onAction(
                actionForPlan(currentPlan ? 'top' : 'medium', {
                  ...values,
                  annual: true,
                }),
              )
            }
          >
            {currentPlan ? 'Upgrade to Top' : 'Choose Medium'}
          </Button>
        </section>
      )}
    </div>
  )
}

export function renderWireframe({ layout, state, values, onAction }: WireframeRenderContext) {
  return (
    <div
      className={`pricing-wireframe pricing-wireframe--${layout}`}
      data-wireframe-state={state ?? 'custom'}
    >
      <nav className="pricing-wireframe__nav" aria-label="Pricing page">
        <a href="#" onClick={(event) => event.preventDefault()}>
          design lab
        </a>
        <span>Product</span>
        <span>Resources</span>
        <Button size="small" variant="secondary">
          Sign in
        </Button>
      </nav>
      <main>
        {layout === 'recommended' ? (
          <RecommendedLayout values={values} onAction={onAction} />
        ) : layout === 'guided' ? (
          <GuidedLayout values={values} onAction={onAction} />
        ) : (
          <ComparisonLayout values={values} onAction={onAction} />
        )}
      </main>
      <footer className="pricing-wireframe__footer">
        <span>Pricing wireframe · {layout}</span>
        <span>All prices in USD · taxes excluded</span>
      </footer>
    </div>
  )
}
