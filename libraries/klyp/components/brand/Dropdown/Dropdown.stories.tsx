import {
  AudioOutline,
  FrameOutline,
  ImageOutline,
  Messages2Outline,
  TrashOutline,
  VideoOutline,
} from '@klyp/icons/outline'
import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { ProviderIcon } from '../ProviderIcon'
import { Dropdown, type DropdownOption } from './Dropdown'

const meta = {
  component: Dropdown,
  title: 'Brand / Molecules / Dropdown',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "Klyp's unified branded menu — RAC `Menu` under the hood via `@klyp/ui/DropdownMenu`. ONE data-driven component for action menus (selectionMode='none'), single-select pickers and multi-select filters (selectionMode + ItemIndicator). Selection is RAC-native, so a multi-select menu stays open while toggling. Rows reveal with a scoped staggered fade/rise. Click a trigger to open.",
      },
    },
  },
  args: {
    'aria-label': 'Menu',
    trigger: 'Options',
    options: [
      { id: 'rename', label: 'Rename' },
      { id: 'duplicate', label: 'Duplicate' },
      { id: 'delete', label: 'Delete', variant: 'danger' },
    ],
    selectionMode: 'none',
    side: 'bottom',
    align: 'start',
  },
  argTypes: {
    selectionMode: { control: 'inline-radio', options: ['none', 'single', 'multiple'] },
    indicator: { control: 'inline-radio', options: ['checkmark', 'dot', 'none'] },
    side: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    options: { control: false },
    trigger: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Dropdown>

export default meta
type Story = StoryObj<typeof meta>

const SOURCE_OPTIONS: DropdownOption[] = [
  { id: 'series', label: 'Series', icon: <VideoOutline /> },
  { id: 'chat', label: 'Chat', icon: <Messages2Outline /> },
  { id: 'canvas', label: 'Canvas', icon: <FrameOutline /> },
]

const MODELS: DropdownOption[] = [
  { id: 'seedance-2.0', label: 'Seedance 2.0', icon: <VideoOutline />, meta: 'Standard' },
  { id: 'kling-2.6', label: 'Kling 2.6', icon: <VideoOutline /> },
  { id: 'kling-3.0', label: 'Kling 3.0', icon: <VideoOutline /> },
  { id: 'kling-o1', label: 'Kling O1', icon: <VideoOutline />, meta: 'Default' },
  { id: 'gemini-3-pro', label: 'Gemini 3 Pro Image', icon: <ImageOutline />, meta: 'Latest' },
]

// ─── Default — action menu (selectionMode='none') ────────────────────────
export const Default: Story = {
  args: {
    'aria-label': 'Board actions',
    trigger: 'Actions',
    options: [
      { id: 'rename', label: 'Rename' },
      { id: 'duplicate', label: 'Duplicate' },
      { id: 'delete', label: 'Delete', variant: 'danger', icon: <TrashOutline /> },
    ],
  },
}

// ─── SingleSelect — value picker (dot indicator, closes on pick) ─────────
export const SingleSelect: Story = {
  render: (args) => {
    const [keys, setKeys] = useState<Set<string>>(new Set(['kling-o1']))
    return (
      <Dropdown
        {...args}
        aria-label="Model"
        trigger="Kling O1"
        options={MODELS}
        selectionMode="single"
        selectedKeys={keys}
        onSelectionChange={setKeys}
      />
    )
  },
}

// ─── MultiSelect — Library Source/Type filter (checkmarks, STAYS OPEN) ───
export const MultiSelect: Story = {
  render: (args) => {
    const [keys, setKeys] = useState<Set<string>>(new Set(['series', 'chat']))
    return (
      <Dropdown
        {...args}
        aria-label="Source"
        trigger="Source"
        options={SOURCE_OPTIONS}
        selectionMode="multiple"
        selectedKeys={keys}
        onSelectionChange={setKeys}
      />
    )
  },
}

// ─── WithDescriptions — two-line rows ────────────────────────────────────
export const WithDescriptions: Story = {
  args: {
    'aria-label': 'New chat',
    trigger: 'New chat',
    options: [
      {
        id: 'text',
        label: 'Text chat',
        description: 'Claude Sonnet · streaming',
        icon: <Messages2Outline />,
      },
      {
        id: 'image',
        label: 'Image generation',
        description: 'Gemini Flash · inline',
        icon: <ImageOutline />,
      },
      {
        id: 'video',
        label: 'Video generation',
        description: 'Seedance / Kling · async',
        icon: <VideoOutline />,
      },
    ],
  },
}

// ─── Grouped — section headers ───────────────────────────────────────────
export const Grouped: Story = {
  render: (args) => {
    const [keys, setKeys] = useState<Set<string>>(new Set(['kling-o1']))
    return (
      <Dropdown
        {...args}
        aria-label="Model"
        trigger="Pick a model"
        selectionMode="single"
        selectedKeys={keys}
        onSelectionChange={setKeys}
        options={[
          { id: 'kling-2.6', label: 'Kling 2.6', group: 'Kling', icon: <VideoOutline /> },
          { id: 'kling-o1', label: 'Kling O1', group: 'Kling', icon: <VideoOutline /> },
          { id: 'gemini-3-pro', label: 'Gemini 3 Pro', group: 'Google', icon: <ImageOutline /> },
          { id: 'seedance-2.0', label: 'Seedance 2.0', group: 'Bytedance', icon: <VideoOutline /> },
        ]}
      />
    )
  },
}

// ─── Stagger — longer list to show the cascade ───────────────────────────
export const Stagger: Story = {
  args: {
    'aria-label': 'Long list',
    trigger: 'Open long list',
    options: Array.from({ length: 12 }, (_, i) => ({
      id: `row-${i + 1}`,
      label: `Option ${i + 1}`,
    })),
  },
}

// ─── States — enabled / shortcut / disabled / danger matrix ──────────────
export const States: Story = {
  args: {
    'aria-label': 'States',
    trigger: 'States',
    options: [
      { id: 'enabled', label: 'Enabled item', icon: <ImageOutline /> },
      { id: 'shortcut', label: 'With shortcut', icon: <Messages2Outline />, shortcut: '⌘K' },
      { id: 'disabled', label: 'Disabled item', icon: <VideoOutline />, isDisabled: true },
      { id: 'danger', label: 'Delete', icon: <TrashOutline />, variant: 'danger' },
    ],
  },
}

// ─── FilterPill — multi-select filter with the built-in pill trigger ─────
export const FilterPill: Story = {
  render: (args) => {
    const [keys, setKeys] = useState<Set<string>>(new Set(['image']))
    return (
      <Dropdown
        {...args}
        aria-label="Type"
        triggerLabel="Type"
        activeCount={keys.size}
        selectionMode="multiple"
        selectedKeys={keys}
        onSelectionChange={setKeys}
        options={[
          { id: 'image', label: 'Image', icon: <ImageOutline /> },
          { id: 'video', label: 'Video', icon: <VideoOutline /> },
          { id: 'audio', label: 'Audio', icon: <AudioOutline /> },
        ]}
      />
    )
  },
}

// ─── ValuePicker — single-select; the pill shows the CURRENT value ────────
export const ValuePicker: Story = {
  render: (args) => {
    const [keys, setKeys] = useState<Set<string>>(new Set(['kling-o1']))
    const current = MODELS.find((m) => keys.has(m.id))
    return (
      <Dropdown
        {...args}
        aria-label="Model"
        triggerLabel={typeof current?.label === 'string' ? current.label : 'Model'}
        selectionMode="single"
        selectedKeys={keys}
        onSelectionChange={setKeys}
        options={MODELS}
      />
    )
  },
}

// ─── ModelPicker — value picker with colored provider LOGOS (chat composer) ─
// The pill trigger shows the SELECTED model's logo + name; rows carry the same
// ProviderIcon. This is the chat model-picker shape, on the unified Dropdown.
const MODEL_LOGO_OPTIONS: DropdownOption[] = [
  { id: 'seedance-2', label: 'Seedance 2.0', icon: <ProviderIcon provider="seedance" /> },
  { id: 'kling-2.6', label: 'Kling 2.6', icon: <ProviderIcon provider="kling" /> },
  { id: 'kling-3', label: 'Kling 3.0', icon: <ProviderIcon provider="kling" /> },
  { id: 'gpt-image', label: 'GPT Image', icon: <ProviderIcon provider="openai" /> },
  { id: 'gemini-3', label: 'Gemini 3', icon: <ProviderIcon provider="google" /> },
  { id: 'grok-imagine', label: 'Grok Imagine', icon: <ProviderIcon provider="xai" /> },
]

export const ModelPicker: Story = {
  render: (args) => {
    const [keys, setKeys] = useState<Set<string>>(new Set(['kling-2.6']))
    const current = MODEL_LOGO_OPTIONS.find((m) => keys.has(m.id))
    return (
      <Dropdown
        {...args}
        aria-label="Model"
        triggerIcon={current?.icon}
        triggerLabel={typeof current?.label === 'string' ? current.label : 'Model'}
        selectionMode="single"
        indicator="none"
        selectedKeys={keys}
        onSelectionChange={setKeys}
        options={MODEL_LOGO_OPTIONS}
      />
    )
  },
}
