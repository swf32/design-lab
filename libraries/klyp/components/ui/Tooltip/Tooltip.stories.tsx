import {
  ArrowDownOutline,
  ArrowLeftOutline,
  ArrowRightOutline,
  ChevronDownOutline,
  CloseCircleOutline,
  InfoCircleOutline,
  MagicStarOutline,
} from '@klyp/icons/outline'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { Avatar, AvatarFallback } from '../Avatar/Avatar'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { Tooltip, TooltipContent, TooltipTrigger } from './Tooltip'

const meta = {
  title: 'UI / Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  // Playground controls (FE-team convention) — the catalog ComponentPlayground
  // drives the bare component from `args`/`argTypes` over the ROOT's REAL props
  // only. Tooltip is compound (root TooltipTrigger + Trigger + Content): the
  // trigger + content are supplied as DEFAULT `children` ReactNode args (a bare
  // root renders nothing on its own), and `defaultOpen` defaults to `true` so it
  // shows in the STATIC catalog without hover. Live controls are the root's real
  // scalar props: `defaultOpen`/`isOpen` → boolean; `delay`/`closeDelay` → range.
  // Tone / shape / arrow / side / maxWidth live on TooltipContent (a different
  // component) — they're showcased in the stories below, not playground controls.
  args: {
    defaultOpen: true,
    delay: 0,
    closeDelay: 0,
    children: (
      <>
        <TooltipTrigger>
          <Button variant="secondary">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Click to continue</TooltipContent>
      </>
    ),
  },
  argTypes: {
    defaultOpen: { control: 'boolean' },
    isOpen: { control: 'boolean' },
    delay: { control: { type: 'range', min: 0, max: 1500, step: 50 } },
    closeDelay: { control: { type: 'range', min: 0, max: 1500, step: 50 } },
  },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

// === T1 — default with arrow =========================================
export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="secondary">Default — with arrow</Button>
      </TooltipTrigger>
      <TooltipContent>Click to continue</TooltipContent>
    </Tooltip>
  ),
}

// === T3 — without arrow ==============================================
export const WithoutArrow: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="secondary">Without arrow</Button>
      </TooltipTrigger>
      <TooltipContent arrow={false}>This tooltip has no arrow</TooltipContent>
    </Tooltip>
  ),
}

// === T9 — pill shape =================================================
export const Pill: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="secondary">Pill</Button>
      </TooltipTrigger>
      <TooltipContent shape="pill">This tooltip is pill-shaped</TooltipContent>
    </Tooltip>
  ),
}

// === T4 — text + inline Badge ========================================
export const WithBadge: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="secondary">Badge</Button>
      </TooltipTrigger>
      <TooltipContent>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          <span>$99/month per user</span>
          <Badge intent="accent" variant="subtle" size="sm">
            Popular
          </Badge>
        </span>
      </TooltipContent>
    </Tooltip>
  ),
}

// === T5 — avatar + name ==============================================
export const WithAvatar: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="secondary">Avatar</Button>
      </TooltipTrigger>
      <TooltipContent>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          <Avatar size="xs">
            <AvatarFallback>VP</AvatarFallback>
          </Avatar>
          <span>Vansh Patel</span>
        </span>
      </TooltipContent>
    </Tooltip>
  ),
}

// === T6 — info card (title + description) ============================
export const LearnMore: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="secondary">Learn More</Button>
      </TooltipTrigger>
      <TooltipContent maxWidth={256}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
            <InfoCircleOutline width={14} height={14} aria-hidden />
            <span style={{ fontSize: 'var(--font-size-13)' }}>Helpful information</span>
          </div>
          <p
            style={{
              margin: 0,
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--color-fg-muted)',
              lineHeight: 'var(--line-height-normal)',
            }}
          >
            This section provides extra context to help you understand the feature. Use it as a
            quick guide while navigating.
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  ),
}

// === T7 — danger tone with icon ======================================
export const Warning: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="secondary">Warning</Button>
      </TooltipTrigger>
      <TooltipContent tone="danger" maxWidth={256}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-6)' }}>
          <CloseCircleOutline
            width={14}
            height={14}
            aria-hidden
            style={{ flexShrink: 0, marginTop: 2 }}
          />
          <span
            style={{
              fontWeight: 'var(--font-weight-regular)',
              lineHeight: 'var(--line-height-normal)',
            }}
          >
            Please double-check your inputs before proceeding. Small mistakes can affect the final
            outcome.
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  ),
}

// === T8 — tip with magic star (lightbulb analogue) ===================
export const Tip: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="secondary">Tip</Button>
      </TooltipTrigger>
      <TooltipContent maxWidth={280}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-6)' }}>
          <MagicStarOutline
            width={14}
            height={14}
            aria-hidden
            style={{ color: 'var(--color-fg-accent)', flexShrink: 0 }}
          />
          <span>Use keyboard shortcuts to speed up your workflow.</span>
        </span>
      </TooltipContent>
    </Tooltip>
  ),
}

// === T10 — four placements ===========================================
export const Sides: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
      <Tooltip>
        <TooltipTrigger>
          <Button variant="secondary" aria-label="left">
            <ArrowLeftOutline width={14} height={14} aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">Tooltip on left</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <Button variant="secondary" aria-label="top">
            <ChevronDownOutline
              width={14}
              height={14}
              aria-hidden
              style={{ transform: 'rotate(180deg)' }}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Tooltip on top</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <Button variant="secondary" aria-label="bottom">
            <ArrowDownOutline width={14} height={14} aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Tooltip on bottom</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <Button variant="secondary" aria-label="right">
            <ArrowRightOutline width={14} height={14} aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Tooltip on right</TooltipContent>
      </Tooltip>
    </div>
  ),
}

// === Bonus — all tones grid ==========================================
export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
      {(['default', 'danger', 'warning', 'success', 'info'] as const).map((tone) => (
        <Tooltip key={tone} defaultOpen>
          <TooltipTrigger>
            <Button variant="secondary">{tone}</Button>
          </TooltipTrigger>
          <TooltipContent tone={tone}>{tone} tone</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
}

// === Icon slot — tone signalled by more than colour (WCAG 1.4.1) =====
export const WithIcon: Story = {
  name: 'Tone with icon slot',
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="secondary">Icon slot</Button>
      </TooltipTrigger>
      <TooltipContent tone="info" icon={InfoCircleOutline}>
        In progress — check back soon
      </TooltipContent>
    </Tooltip>
  ),
}
