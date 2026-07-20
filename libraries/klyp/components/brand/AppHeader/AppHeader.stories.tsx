import type { Meta, StoryObj } from '../__shared/stories-types'
import { AppHeader } from './AppHeader'

// =====================================================================
// AppHeader stories — Storybook + catalog Preview surface
// =====================================================================
// 4 stories: Default (authed klyp), Unauthenticated (Sign in pill in
// authSlot), WithUpgrade (full cluster: bell + upgrade + avatar),
// Marketing (transparent header against a hero gradient — illustrates
// the stuck-on-scroll behavior even though stories iframes don't scroll).

const meta = {
  component: AppHeader,
  title: 'Brand / AppHeader',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AppHeader>

export default meta
type Story = StoryObj<typeof meta>

const DEFAULT_LINKS = [
  { label: 'Create', to: '/chat' },
  { label: 'Series', to: '/series' },
  { label: 'Pricing', to: '/pricing' },
]

function AvatarStub() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'var(--color-bg-surface-solid)',
        border: '1px solid var(--color-border-subtle)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-fg-primary)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-12)',
        fontWeight: 500,
      }}
    >
      VK
    </div>
  )
}

function SignInPillStub() {
  return (
    <button
      type="button"
      style={{
        height: 'var(--space-32)',
        padding: '0 var(--padding-control-x)',
        border: 0,
        borderRadius: 'var(--r-chip)',
        background: 'transparent',
        color: 'var(--color-fg-accent)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-14)',
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      Sign in
    </button>
  )
}

function UpgradeStub() {
  return (
    <button
      type="button"
      style={{
        height: 'var(--space-32)',
        padding: '0 var(--space-12)',
        border: 0,
        borderRadius: 'var(--r-chip)',
        background:
          'linear-gradient(135deg, var(--color-fg-accent), color-mix(in srgb, var(--color-fg-accent), white 20%))',
        color: 'var(--color-bg-canvas)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-13)',
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      ✨ Upgrade
    </button>
  )
}

function BellStub() {
  return (
    <button
      type="button"
      aria-label="Notifications"
      style={{
        width: 32,
        height: 32,
        padding: 0,
        border: 0,
        borderRadius: 'var(--r-chip)',
        background: 'transparent',
        color: 'var(--color-fg-muted)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 8a6 6 0 1 1 12 0c0 4 1 5 1 7H5c0-2 1-3 1-7z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M10 19a2 2 0 0 0 4 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  )
}

export const Default: Story = {
  args: {
    links: DEFAULT_LINKS,
    currentPath: '/chat',
    authSlot: <AvatarStub />,
  },
}

export const Unauthenticated: Story = {
  args: {
    links: DEFAULT_LINKS,
    currentPath: '/pricing',
    authSlot: <SignInPillStub />,
  },
}

export const WithUpgrade: Story = {
  args: {
    links: DEFAULT_LINKS,
    currentPath: '/series',
    notificationsSlot: <BellStub />,
    upgradeSlot: <UpgradeStub />,
    authSlot: <AvatarStub />,
  },
}

export const MarketingTransparent: Story = {
  args: {
    links: DEFAULT_LINKS,
    currentPath: '/pricing',
    upgradeSlot: <UpgradeStub />,
    authSlot: <SignInPillStub />,
    transparent: true,
  },
  decorators: [
    (Story) => (
      <div
        style={{
          minHeight: 240,
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--color-fg-accent), transparent 80%) 0%, transparent 100%)',
        }}
      >
        <Story />
        <div
          style={{
            padding: 'var(--space-24)',
            color: 'var(--color-fg-muted)',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--font-size-14)',
          }}
        >
          Transparent header at top of page. Scroll past the 1px sentinel to see glass + blur +
          bottom hairline fade in (visible in real app, not in stories iframe).
        </div>
      </div>
    ),
  ],
}
