import './SidebarShell.stories.scss'

import { AddOutline, MessageAddOutline, SearchOutline } from '@klyp/icons'
import { SIDEBAR_ICONS_ANIMATED, SidebarIcon, type SidebarIconName } from '@klyp/icons/sidebar'
import { Avatar, AvatarFallback } from '@klyp/ui/Avatar'
import { Button } from '@klyp/ui/Button'
import { ToolButton } from '@klyp/ui/ToolButton'
import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { ConversationRow, type ConversationRowItem } from '../ConversationRow'
import { SidebarMenuButton } from '../SidebarMenuButton'
import {
  SidebarGroupHeader,
  SidebarShell,
  SidebarShellFooter,
  SidebarShellHeader,
  SidebarShellNav,
  SidebarShellNavItem,
  SidebarToggle,
} from './SidebarShell'

const meta = {
  title: 'Brand / SidebarShell',
  component: SidebarShell,
  tags: ['autodocs'],
  args: {
    expanded: true,
    children: null,
  },
  argTypes: {
    expanded: { control: 'boolean' },
    ariaLabel: { control: false },
    id: { control: false },
    children: { control: false },
    className: { control: false },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SidebarShell>

export default meta
type Story = StoryObj<typeof meta>

// ── Demo data ─────────────────────────────────────────────────────────
const NAV: Array<{
  id: string
  label: string
  iconName: SidebarIconName
  lottieName?: string
  lottieSize?: number
  sectionBreak?: boolean
}> = [
  { id: 'create', label: 'Chat', iconName: 'create', lottieName: 'sidebar-chat', lottieSize: 26 },
  { id: 'canvas', label: 'Canvas', iconName: 'canvas', lottieName: SIDEBAR_ICONS_ANIMATED.canvas },
  {
    id: 'library',
    label: 'Library',
    iconName: 'library',
    lottieName: SIDEBAR_ICONS_ANIMATED.library,
  },
  {
    id: 'my-series',
    label: 'Series',
    iconName: 'my-series',
    lottieName: SIDEBAR_ICONS_ANIMATED['my-series'],
    sectionBreak: true,
  },
  { id: 'editor', label: 'Studio', iconName: 'editor', lottieName: SIDEBAR_ICONS_ANIMATED.editor },
  {
    id: 'pricing',
    label: 'Pricing',
    iconName: 'pricing',
    lottieName: SIDEBAR_ICONS_ANIMATED.pricing,
    sectionBreak: true,
  },
  {
    id: 'referrals',
    label: 'Referrals',
    iconName: 'referrals',
    lottieName: SIDEBAR_ICONS_ANIMATED.referrals,
  },
]

const CHATS: ConversationRowItem[] = [
  { id: 'c1', title: 'Neon skyline hero shot', lastMessageAt: 0, pinnedAt: 1 },
  { id: 'c2', title: 'A cinematic wide landscape of the valley', lastMessageAt: 0 },
  { id: 'c3', title: 'Bring the image to life — subtle wind', lastMessageAt: 0 },
  { id: 'c4', title: 'Editorial-quality product photo', lastMessageAt: 0, status: 'pending' },
  { id: 'c5', title: 'Scene: the food vanishes in one bite', lastMessageAt: 0 },
]

const ROW_LABELS = {
  rename: 'Rename',
  pin: 'Pin',
  unpin: 'Unpin',
  delete: 'Delete',
  generating: 'Generating',
  actionsFor: (title: string) => `Actions for ${title}`,
}

const noop = () => {}

// ── Full production-like sidebar, interactive ────────────────────────
function DemoSidebar({ initialExpanded = true }: { initialExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(initialExpanded)
  const [active, setActive] = useState('create')
  const [recentsOpen, setRecentsOpen] = useState(true)

  return (
    <div className="klyp-SidebarShell-stories__frame" data-expanded={expanded ? 'true' : 'false'}>
      <SidebarShell expanded={expanded} ariaLabel="Sidebar demo">
        <SidebarShellHeader>
          <span className="klyp-SidebarShell-stories__logo" aria-hidden>
            {/* BrandMark needs the app's /logo-crown.png asset — a plain glyph
             *  stands in so the story is asset-independent. */}
            <SidebarIcon name="create" width={22} height={22} />
            <span className="klyp-SidebarShell-stories__wordmark">Klyp</span>
          </span>
          <SidebarToggle expanded={expanded} onPress={() => setExpanded(!expanded)} />
        </SidebarShellHeader>

        <SidebarShellNav ariaLabel="Primary demo navigation">
          {NAV.map((item) => (
            <SidebarShellNavItem key={item.id} sectionBreak={item.sectionBreak}>
              <SidebarMenuButton
                label={item.label}
                icon={<SidebarIcon name={item.iconName} />}
                lottieName={item.lottieName}
                lottieSize={item.lottieSize}
                active={active === item.id}
                collapsed={!expanded}
                tooltip={item.label}
                onClick={() => setActive(item.id)}
              />
              {item.id === 'create' && expanded ? (
                <span className="klyp-SidebarShell-stories__rowActions">
                  <ToolButton
                    variant="bare"
                    size="xs"
                    icon={SearchOutline}
                    iconSize={14}
                    label="Search chats"
                    onPress={noop}
                  />
                  <ToolButton
                    variant="bare"
                    size="xs"
                    icon={MessageAddOutline}
                    iconSize={14}
                    label="New chat"
                    onPress={noop}
                  />
                </span>
              ) : null}
            </SidebarShellNavItem>
          ))}
        </SidebarShellNav>

        {/* Recents — free-form content between nav and footer (the app's
         *  AppSidebarRecents equivalent, on frozen demo conversations). */}
        <div className="klyp-SidebarShell-stories__recents">
          <SidebarGroupHeader
            label="Recents"
            expanded={recentsOpen}
            onToggle={() => setRecentsOpen(!recentsOpen)}
            trailing={
              <Button variant="ghost" size="xs">
                <AddOutline width={13} height={13} aria-hidden />
                New chat
              </Button>
            }
          />
          {recentsOpen ? (
            <div className="klyp-SidebarShell-stories__recentsList">
              {CHATS.map((c) => (
                <ConversationRow
                  key={c.id}
                  item={c}
                  active={c.id === 'c2'}
                  showPinMark
                  labels={ROW_LABELS}
                  onSelect={noop}
                  onStartRename={noop}
                  onPin={noop}
                  onDelete={noop}
                  onRenameChange={noop}
                  onRenameCommit={noop}
                  onRenameCancel={noop}
                />
              ))}
            </div>
          ) : null}
        </div>

        <SidebarShellFooter>
          <div className="klyp-SidebarShell-stories__profile">
            <Avatar size="default">
              <AvatarFallback>DU</AvatarFallback>
            </Avatar>
            <span className="klyp-SidebarShell-stories__profileText">
              <span className="klyp-SidebarShell-stories__profileName">Demo User</span>
              <span className="klyp-SidebarShell-stories__profileTier">Free</span>
            </span>
          </div>
        </SidebarShellFooter>
      </SidebarShell>
    </div>
  )
}

export const FullSidebar: Story = {
  name: 'Full sidebar (interactive — collapse, nav, Recents)',
  render: () => <DemoSidebar />,
}

export const Collapsed: Story = {
  render: () => <DemoSidebar initialExpanded={false} />,
}

// ── Mobile drawer panel — the MobileNavDrawer composition (lg rows) ──
export const MobileDrawer: Story = {
  name: 'Mobile drawer panel (216px, lg rows)',
  render: () => (
    <div className="klyp-SidebarShell-stories__drawer">
      <SidebarShell ariaLabel="Mobile navigation demo">
        <SidebarShellNav ariaLabel="Primary mobile demo navigation">
          {NAV.map((item, i) => (
            <SidebarShellNavItem key={item.id} sectionBreak={item.sectionBreak}>
              <SidebarMenuButton
                size="lg"
                label={item.label}
                icon={<SidebarIcon name={item.iconName} />}
                lottieName={item.lottieName}
                lottieSize={item.lottieSize ?? 22}
                active={i === 0}
                onClick={noop}
              />
            </SidebarShellNavItem>
          ))}
        </SidebarShellNav>
        <div className="klyp-SidebarShell-stories__drawerSpacer" aria-hidden />
        <SidebarShellFooter>
          <div className="klyp-SidebarShell-stories__profile">
            <Avatar size="default">
              <AvatarFallback>DU</AvatarFallback>
            </Avatar>
            <span className="klyp-SidebarShell-stories__profileText">
              <span className="klyp-SidebarShell-stories__profileName">Demo User</span>
              <span className="klyp-SidebarShell-stories__profileTier">Free</span>
            </span>
          </div>
        </SidebarShellFooter>
      </SidebarShell>
    </div>
  ),
}

// ── Bare chassis — the slots themselves, no product content ──────────
export const BareChassis: Story = {
  name: 'Bare chassis (slots only)',
  render: () => (
    <div className="klyp-SidebarShell-stories__frame" data-expanded="true">
      <SidebarShell ariaLabel="Bare shell demo">
        <SidebarShellHeader>
          <span className="klyp-SidebarShell-stories__slotGhost">header</span>
        </SidebarShellHeader>
        <SidebarShellNav ariaLabel="Demo slots">
          <SidebarShellNavItem>
            <span className="klyp-SidebarShell-stories__slotGhost">nav item</span>
          </SidebarShellNavItem>
          <SidebarShellNavItem sectionBreak>
            <span className="klyp-SidebarShell-stories__slotGhost">nav item (section break)</span>
          </SidebarShellNavItem>
        </SidebarShellNav>
        <div className="klyp-SidebarShell-stories__slotGhost" data-grow>
          content
        </div>
        <SidebarShellFooter>
          <span className="klyp-SidebarShell-stories__slotGhost">footer</span>
        </SidebarShellFooter>
      </SidebarShell>
    </div>
  ),
}

// ── Kit pieces in isolation — SidebarToggle + SidebarGroupHeader ─────
function GroupHeaderDemo() {
  const [expanded, setExpanded] = useState(true)
  return (
    <SidebarGroupHeader
      label="Recents"
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
      trailing={
        <Button variant="ghost" size="xs">
          <AddOutline width={13} height={13} aria-hidden />
          New chat
        </Button>
      }
    />
  )
}

export const KitPieces: Story = {
  name: 'Kit pieces (toggle + group header)',
  render: () => (
    <div className="klyp-SidebarShell-stories__pieces">
      <div className="klyp-SidebarShell-stories__piecesRow">
        <SidebarToggle expanded onPress={noop} />
        <SidebarToggle expanded={false} onPress={noop} />
      </div>
      <div className="klyp-SidebarShell-stories__piecesRail">
        <GroupHeaderDemo />
        <SidebarGroupHeader label="Pinned" expanded={false} />
      </div>
    </div>
  ),
}
