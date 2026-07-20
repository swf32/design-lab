import './SidebarMenuButton.stories.scss'

import { SIDEBAR_ICONS_ANIMATED, SidebarIcon } from '@klyp/icons/sidebar'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { SidebarMenuButton } from './SidebarMenuButton'

const meta = {
  title: 'Brand / SidebarMenuButton',
  component: SidebarMenuButton,
  tags: ['autodocs'],
  args: {
    label: 'Library',
    icon: <SidebarIcon name="library" />,
    size: 'md',
    active: false,
    disabled: false,
    collapsed: false,
    forceHovered: false,
  },
  argTypes: {
    label: { control: 'text' },
    size: { control: 'inline-radio', options: ['md', 'lg'] },
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
    collapsed: { control: 'boolean' },
    forceHovered: { control: 'boolean' },
    badge: { control: 'text' },
    lottieName: {
      control: 'select',
      options: [
        undefined,
        ...Object.values(SIDEBAR_ICONS_ANIMATED).filter((v, i, a) => a.indexOf(v) === i),
      ],
    },
    lottieSize: { control: false },
    icon: { control: false },
    tooltip: { control: false },
    href: { control: false },
    to: { control: false },
    linkComponent: { control: false },
    onClick: { control: false },
    ariaLabel: { control: false },
    className: { control: false },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SidebarMenuButton>

export default meta
type Story = StoryObj<typeof meta>

// Rail wrapper mirrors the production AppSidebar surface: 240px expanded /
// 52px collapsed (2×8 gutter + 36 slot), panel background, 8px gutter,
// 4px row gap. Forwards `className` so stories can swap the collapsed modifier.
function Rail({ children, className }: { children: ReactNode; className?: string }) {
  const base = 'klyp-SidebarMenuButton-stories__rail'
  return <div className={className ? `${base} ${className}` : base}>{children}</div>
}

export const Default: Story = {
  render: (args) => (
    <Rail>
      <SidebarMenuButton {...args} />
    </Rail>
  ),
}

export const States: Story = {
  render: () => (
    <Rail>
      <SidebarMenuButton icon={<SidebarIcon name="create" />} label="Default" />
      <SidebarMenuButton icon={<SidebarIcon name="editor" />} label="Hovered" forceHovered />
      <SidebarMenuButton icon={<SidebarIcon name="my-series" />} label="Active" active />
      <SidebarMenuButton
        icon={<SidebarIcon name="analytics" />}
        label="Disabled"
        badge="Soon"
        disabled
      />
    </Rail>
  ),
}

export const WithLottie: Story = {
  name: 'With Lottie (hover to play)',
  render: () => (
    <Rail>
      <SidebarMenuButton
        icon={<SidebarIcon name="create" />}
        lottieName={SIDEBAR_ICONS_ANIMATED.create}
        label="Chat"
      />
      <SidebarMenuButton
        icon={<SidebarIcon name="editor" />}
        lottieName={SIDEBAR_ICONS_ANIMATED.editor}
        label="Studio"
      />
      <SidebarMenuButton
        icon={<SidebarIcon name="my-series" />}
        lottieName={SIDEBAR_ICONS_ANIMATED['my-series']}
        label="Series"
      />
      <SidebarMenuButton
        icon={<SidebarIcon name="library" />}
        lottieName={SIDEBAR_ICONS_ANIMATED.library}
        label="Library"
      />
    </Rail>
  ),
}

export const FullRail: Story = {
  name: 'Full rail (production-like nav stack)',
  render: () => (
    <Rail>
      <SidebarMenuButton
        icon={<SidebarIcon name="create" />}
        lottieName={SIDEBAR_ICONS_ANIMATED.create}
        label="Chat"
      />
      <SidebarMenuButton
        icon={<SidebarIcon name="canvas" />}
        lottieName={SIDEBAR_ICONS_ANIMATED.canvas}
        label="Canvas"
      />
      <SidebarMenuButton
        icon={<SidebarIcon name="library" />}
        lottieName={SIDEBAR_ICONS_ANIMATED.library}
        label="Library"
        active
      />
      <div className="klyp-SidebarMenuButton-stories__sep" aria-hidden />
      <SidebarMenuButton
        icon={<SidebarIcon name="my-series" />}
        lottieName={SIDEBAR_ICONS_ANIMATED['my-series']}
        label="Series"
      />
      <SidebarMenuButton
        icon={<SidebarIcon name="editor" />}
        lottieName={SIDEBAR_ICONS_ANIMATED.editor}
        label="Studio"
      />
      <div className="klyp-SidebarMenuButton-stories__sep" aria-hidden />
      <SidebarMenuButton
        icon={<SidebarIcon name="analytics" />}
        label="Analytics"
        badge="Soon"
        disabled
      />
      <SidebarMenuButton
        icon={<SidebarIcon name="earnings" />}
        label="Earnings"
        badge="Soon"
        disabled
      />
    </Rail>
  ),
}

export const Collapsed: Story = {
  render: () => (
    <Rail className="klyp-SidebarMenuButton-stories__rail--collapsed">
      <SidebarMenuButton
        icon={<SidebarIcon name="create" />}
        lottieName={SIDEBAR_ICONS_ANIMATED.create}
        label="Chat"
        tooltip="Chat"
        collapsed
      />
      <SidebarMenuButton
        icon={<SidebarIcon name="editor" />}
        lottieName={SIDEBAR_ICONS_ANIMATED.editor}
        label="Studio"
        tooltip="Studio"
        active
        collapsed
      />
      <SidebarMenuButton
        icon={<SidebarIcon name="analytics" />}
        label="Analytics"
        badge="Soon"
        tooltip="Analytics"
        disabled
        collapsed
      />
    </Rail>
  ),
}

export const MobileSize: Story = {
  name: 'Mobile drawer size (lg)',
  render: () => (
    <Rail>
      <SidebarMenuButton
        size="lg"
        icon={<SidebarIcon name="create" />}
        lottieName={SIDEBAR_ICONS_ANIMATED.create}
        label="Chat"
      />
      <SidebarMenuButton
        size="lg"
        icon={<SidebarIcon name="pricing" />}
        lottieName={SIDEBAR_ICONS_ANIMATED.pricing}
        label="Pricing"
        active
      />
      <SidebarMenuButton
        size="lg"
        icon={<SidebarIcon name="referrals" />}
        lottieName={SIDEBAR_ICONS_ANIMATED.referrals}
        label="Referrals"
      />
    </Rail>
  ),
}
