import {
  AddOutline,
  EditPencilOutline,
  ImageOutline,
  MagicStarOutline,
  Messages2Outline,
  MicrophoneOutline,
  SettingsOutline,
  TrashOutline,
  VideoOutline,
} from '@klyp/icons'
import { Button } from '@klyp/ui/Button'
import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import {
  CommandMenu,
  type CommandMenuCategory,
  CommandMenuDialog,
  type CommandMenuGroup,
  type CommandMenuItemAction,
} from './CommandMenu'

const PALETTE_GROUPS: CommandMenuGroup[] = [
  {
    id: 'create',
    heading: 'Create',
    category: 'actions',
    items: [
      { id: 'new-episode', label: 'New episode', icon: AddOutline, shortcut: 'cmd+n' },
      { id: 'new-series', label: 'New series', icon: MagicStarOutline },
      {
        id: 'record-voiceover',
        label: 'Record voiceover',
        icon: MicrophoneOutline,
        disabled: true,
      },
    ],
  },
  {
    id: 'generate',
    heading: 'Generate',
    category: 'media',
    items: [
      {
        id: 'generate-image',
        label: 'Generate image',
        icon: ImageOutline,
        keywords: ['picture', 'art'],
      },
      {
        id: 'generate-video',
        label: 'Generate video',
        icon: VideoOutline,
        keywords: ['clip', 'motion'],
      },
    ],
  },
  {
    id: 'navigate',
    heading: 'Navigate',
    category: 'navigation',
    items: [
      { id: 'go-chat', label: 'Go to Chat', icon: Messages2Outline },
      { id: 'open-settings', label: 'Open Settings', icon: SettingsOutline, shortcut: 'cmd+,' },
    ],
  },
]

// Color-coded chips — per-kind dots make categories glanceable
// (Val 2026-07-02: разные категории — разным цветом).
const CATEGORIES: CommandMenuCategory[] = [
  { id: 'actions', label: 'Actions', intent: 'blue' },
  { id: 'media', label: 'Media', intent: 'purple' },
  { id: 'navigation', label: 'Navigation', intent: 'teal' },
]

// Row kebab (⋯) actions — the ConversationHistory set (rename / delete).
const CONVERSATION_ACTIONS: CommandMenuItemAction[] = [
  { id: 'rename', label: 'Rename', icon: <EditPencilOutline width={16} height={16} /> },
  {
    id: 'delete',
    label: 'Delete',
    icon: <TrashOutline width={16} height={16} />,
    danger: true,
    separator: true,
  },
]

// Conversation-search demo data — the "resume a chat" register (flat list,
// relative-time hints that swap for the kebab on hover; grouping is the
// consumer's call via `heading`).
const CONVERSATIONS: CommandMenuGroup[] = [
  {
    id: 'recent',
    items: [
      {
        id: 'c1',
        label: 'Neon skyline hero shot for the pilot',
        hint: '2h ago',
        actions: CONVERSATION_ACTIONS,
      },
      {
        id: 'c2',
        label: 'Scene 4 — rooftop dialogue rewrite',
        hint: '5h ago',
        actions: CONVERSATION_ACTIONS,
      },
      {
        id: 'c3',
        label: 'Moodboard: retro-futuristic diner',
        hint: 'Yesterday',
        actions: CONVERSATION_ACTIONS,
      },
      {
        id: 'c4',
        label: 'Kling vs Seedance for the chase cut',
        hint: '3d ago',
        actions: CONVERSATION_ACTIONS,
      },
      {
        id: 'c5',
        label: 'Episode 2 cold-open beats',
        hint: 'Last week',
        actions: CONVERSATION_ACTIONS,
      },
    ],
  },
]

const meta = {
  component: CommandMenu,
  title: 'Brand / CommandMenu',
  tags: ['autodocs'],
  args: {
    variant: 'palette',
    groups: PALETTE_GROUPS,
    categories: CATEGORIES,
    isLoading: false,
    showFooter: true,
    showClear: true,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['palette', 'search'] },
    isLoading: { control: 'boolean' },
    showFooter: { control: 'boolean' },
    showClear: { control: 'boolean' },
    placeholder: { control: 'text' },
    ariaLabel: { control: 'text' },
    groups: { control: false },
    categories: { control: false },
    labels: { control: false },
    emptyState: { control: false },
    className: { control: false },
  },
  parameters: { playground: { wrapperStyle: { width: '100%', maxWidth: 640 } } },
} satisfies Meta<typeof CommandMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'Palette (full)',
  render: () => (
    <div style={{ width: '100%', maxWidth: 640 }}>
      <CommandMenu groups={PALETTE_GROUPS} categories={CATEGORIES} />
    </div>
  ),
}

export const ConversationSearch: Story = {
  render: () => (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <CommandMenu
        variant="search"
        groups={CONVERSATIONS}
        placeholder="Search conversations…"
        ariaLabel="Search conversations"
        onItemAction={() => {}}
      />
    </div>
  ),
}

export const Loading: Story = {
  render: () => (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <CommandMenu
        variant="search"
        groups={[]}
        isLoading
        placeholder="Search conversations…"
        ariaLabel="Search conversations"
      />
    </div>
  ),
}

function EmptyDemo() {
  const [query, setQuery] = useState('quantum flamingo')
  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <CommandMenu
        variant="search"
        groups={CONVERSATIONS}
        search={query}
        onSearchChange={setQuery}
        placeholder="Search conversations…"
        ariaLabel="Search conversations"
      />
    </div>
  )
}

export const Empty: Story = {
  name: 'Empty (no results)',
  render: () => <EmptyDemo />,
}

function DialogDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="secondary" onPress={() => setOpen(true)}>
        Open command menu ⌘K
      </Button>
      <CommandMenuDialog
        open={open}
        onOpenChange={setOpen}
        groups={PALETTE_GROUPS}
        categories={CATEGORIES}
        onSelect={() => setOpen(false)}
      />
    </>
  )
}

export const InDialog: Story = {
  render: () => <DialogDemo />,
}

export const Adaptive: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
      <div style={{ width: 280 }}>
        <CommandMenu groups={PALETTE_GROUPS} categories={CATEGORIES} />
      </div>
      <div style={{ width: 600 }}>
        <CommandMenu variant="search" groups={CONVERSATIONS} ariaLabel="Search conversations" />
      </div>
    </div>
  ),
}
