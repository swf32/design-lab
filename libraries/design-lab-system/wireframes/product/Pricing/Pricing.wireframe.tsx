import './Pricing.wireframe.scss'
import { Button, Checkbox, Chip, Slider } from '@design-lab/system/components'
import { StarIcon } from '@design-lab/system/icons'
import { inspectionSourceAttributes } from '@design-lab/system/inspection'
import type {
  WireframeAction,
  WireframeRenderContext,
  WireframeValues,
} from '@design-lab/system/wireframes'

type PlanId = 'none' | 'starter' | 'team' | 'top'

const starIconSource = `import { StarIcon } from '@design-lab/system/icons'

<StarIcon size={16} aria-hidden="true" />`

type Plan = {
  id: Exclude<PlanId, 'none'>
  name: string
  description: string
  monthly: number
  features: string[]
  allowance: number
  team?: boolean
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For personal exploration and small prototypes.',
    monthly: 18,
    allowance: 40000,
    features: ['1 workspace', 'Private projects', 'Community support'],
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For product teams shipping every week.',
    monthly: 42,
    allowance: 140000,
    team: true,
    features: ['Unlimited projects', 'Shared libraries', 'Priority support'],
  },
  {
    id: 'top',
    name: 'Top',
    description: 'For organizations standardizing product quality.',
    monthly: 86,
    allowance: 400000,
    features: ['12 workspaces', 'Governance controls', 'Extra token packs'],
  },
]

function readPlan(values: WireframeValues): PlanId {
  return ['starter', 'team', 'top'].includes(String(values.plan)) ? (values.plan as PlanId) : 'none'
}

function planPrice(plan: Plan, annual: boolean, seats: number) {
  const monthly = annual ? Math.round(plan.monthly * 0.8) : plan.monthly
  return monthly * (plan.team ? seats : 1)
}

function actionForPlan(plan: Plan['id'], values: WireframeValues): WireframeAction {
  const nextValues = {
    ...values,
    plan,
    annual: plan === 'starter' ? true : values.annual,
    teamSeats: plan === 'team' ? Math.max(2, Number(values.teamSeats ?? 2)) : 1,
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
  const tokensUsed = Math.max(0, Math.min(100, Number(values.tokensUsed ?? 0)))
  return (
    <article
      className={`pricing-wireframe__plan${prominent ? ' pricing-wireframe__plan--prominent' : ''}${selected ? ' pricing-wireframe__plan--current' : ''}`}
    >
      <header>
        <div>
          <span>{Math.round(plan.allowance / 1000)}k tokens / month</span>
          <h2>{plan.name}</h2>
        </div>
        {selected ? (
          <Chip size="small" color="success" variant="soft">
            Current
          </Chip>
        ) : plan.id === 'team' ? (
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
          {plan.team ? ` · ${Math.max(2, seats)} seats` : ''}
        </span>
      </div>
      {plan.team && (
        <div className="pricing-wireframe__team-seats">
          <Slider
            label="Team seats"
            value={Math.max(2, seats)}
            minValue={2}
            maxValue={12}
            step={1}
            size="large"
            formatValue={(value) => `${value} seats`}
            onValueChange={(value) =>
              onAction({
                id: 'change-team-seats',
                values: { ...values, teamSeats: value },
              })
            }
          />
        </div>
      )}
      {selected && <PlanUsage plan={plan} used={tokensUsed} />}
      <ul>
        {plan.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <Button
        variant={prominent || plan.id === 'team' ? 'primary' : 'secondary'}
        size="large"
        fullWidth
        leading={
          <StarIcon size={16} aria-hidden="true" {...inspectionSourceAttributes(starIconSource)} />
        }
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

function PlanUsage({ plan, used }: { plan: Plan; used: number }) {
  const remainingTokens = Math.round((plan.allowance * Math.max(0, 100 - used)) / 100)
  const status =
    used >= 100 ? 'Allowance exhausted' : used >= 80 ? 'Allowance running low' : 'On track'
  return (
    <section
      className={`pricing-wireframe__usage${used >= 100 ? ' pricing-wireframe__usage--exhausted' : ''}`}
      style={{ '--pricing-usage': `${used}%` } as React.CSSProperties}
    >
      <header>
        <div>
          <span>Included token usage</span>
          <strong>{status}</strong>
        </div>
        <b>{used}%</b>
      </header>
      <div aria-hidden="true">
        <span />
      </div>
      <p>
        {used >= 100
          ? `All ${Math.round(plan.allowance / 1000)}k included tokens are used.`
          : `${remainingTokens.toLocaleString('en-US')} tokens remain this month.`}
      </p>
    </section>
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
    (plan) => plan.id === (currentPlan === 'none' ? 'team' : currentPlan),
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
            ? 'Team is the clearest place to start.'
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
              <small>{Math.round(plan.allowance / 1000)}k tokens / month</small>
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
  const tokensUsed = Number(values.tokensUsed ?? 0)
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
              ? currentPlan.team
                ? `${currentPlan.name} is working for ${seats} ${seats === 1 ? 'seat' : 'seats'}.`
                : `${currentPlan.name} is active on this account.`
              : 'Choose the capacity your team needs.'}
          </h1>
        </div>
        <p>Pricing adapts to what the account can do next, not to a generic plan table.</p>
      </header>
      <section className="pricing-wireframe__guided-summary">
        <div>
          <span>Current plan</span>
          <strong>{currentPlan?.name ?? 'None'}</strong>
          <small>
            {currentPlan
              ? `${Math.round(currentPlan.allowance / 1000)}k tokens / month`
              : 'No monthly allowance'}
          </small>
        </div>
        <div>
          <span>Account</span>
          <strong>{currentPlan?.team ? `${seats} seats` : currentPlan ? 'Individual' : '—'}</strong>
          <small>{currentPlan?.team ? 'Team billing' : 'Single billing account'}</small>
        </div>
        <div>
          <span>Billing</span>
          <strong>{values.annual ? 'Annual' : 'Monthly'}</strong>
          <small>{values.annual ? '20% lower monthly equivalent' : 'Flexible renewal'}</small>
        </div>
      </section>
      {currentPlan && <PlanUsage plan={currentPlan} used={tokensUsed} />}
      {currentPlanId === 'top' ? (
        <TokenAllowance purchased={tokens} values={values} onAction={onAction} />
      ) : (
        <section className="pricing-wireframe__next-step">
          <div>
            <span>Recommended next step</span>
            <h2>
              {currentPlan
                ? 'Unlock extra token capacity with Top.'
                : 'Start with Team and keep room to grow.'}
            </h2>
            <p>The recommendation changes when account entitlement changes.</p>
          </div>
          <Button
            variant="primary"
            size="large"
            onClick={() =>
              onAction(
                actionForPlan(currentPlan ? 'top' : 'team', {
                  ...values,
                  annual: true,
                }),
              )
            }
          >
            {currentPlan ? 'Upgrade to Top' : 'Choose Team'}
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
