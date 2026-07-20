import {
  EditPencilOutline,
  ImageOutline,
  MagicStarOutline,
  SearchBulk,
  ShareOutline,
  XBulk,
} from '@klyp/icons'
import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { Input } from '../Input/Input'
import { Spinner } from '../Spinner/Spinner'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from './InputGroup'

const meta = {
  title: 'UI / InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof InputGroup>

export default meta
type Story = StoryObj<typeof meta>

// Shared container width so every story renders at the same scale.
const FRAME_WIDTH = 360

// Vertical stack helper for multi-row stories.
function Stack({ children, gap = 12 }: { children: React.ReactNode; gap?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, width: FRAME_WIDTH }}>
      {children}
    </div>
  )
}

// === 1. Default — search with working clear button ===================
export const Default: Story = {
  render: function Render() {
    const [value, setValue] = useState('cinematic shot')
    return (
      <div style={{ width: FRAME_WIDTH }}>
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <SearchBulk aria-hidden="true" />
          </InputGroupAddon>
          <Input placeholder="Search…" value={value} onChange={(e) => setValue(e.target.value)} />
          {value.length > 0 && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                variant="ghost"
                aria-label="Clear"
                onClick={() => setValue('')}
              >
                <XBulk />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>
    )
  },
}

// === 2. Sizes — sm / md / lg stacked =================================
export const Sizes: Story = {
  render: () => (
    <Stack>
      <InputGroup size="sm">
        <InputGroupAddon align="inline-start">
          <SearchBulk aria-hidden="true" />
        </InputGroupAddon>
        <Input placeholder="Small (sm) — 28px" />
      </InputGroup>
      <InputGroup size="md">
        <InputGroupAddon align="inline-start">
          <SearchBulk aria-hidden="true" />
        </InputGroupAddon>
        <Input placeholder="Medium (md) — 32px" />
      </InputGroup>
      <InputGroup size="lg">
        <InputGroupAddon align="inline-start">
          <SearchBulk aria-hidden="true" />
        </InputGroupAddon>
        <Input placeholder="Large (lg) — 40px" />
      </InputGroup>
    </Stack>
  ),
}

// === 3. Variants — outline / filled / ghost ==========================
export const Variants: Story = {
  render: () => (
    <Stack>
      <InputGroup variant="outline">
        <InputGroupAddon align="inline-start">
          <SearchBulk aria-hidden="true" />
        </InputGroupAddon>
        <Input placeholder="Outline (default)" />
      </InputGroup>
      <InputGroup variant="filled">
        <InputGroupAddon align="inline-start">
          <SearchBulk aria-hidden="true" />
        </InputGroupAddon>
        <Input placeholder="Filled" />
      </InputGroup>
      <InputGroup variant="ghost">
        <InputGroupAddon align="inline-start">
          <SearchBulk aria-hidden="true" />
        </InputGroupAddon>
        <Input placeholder="Ghost — hover to reveal" />
      </InputGroup>
    </Stack>
  ),
}

// === 4. InlineAddons — leading, trailing, both, leading+text =========
export const InlineAddons: Story = {
  render: () => (
    <Stack>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <SearchBulk aria-hidden="true" />
        </InputGroupAddon>
        <Input placeholder="Leading icon only" />
      </InputGroup>

      <InputGroup>
        <Input placeholder="Trailing icon only" />
        <InputGroupAddon align="inline-end">
          <MagicStarOutline aria-hidden="true" />
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupAddon align="inline-start">
          <SearchBulk aria-hidden="true" />
        </InputGroupAddon>
        <Input placeholder="Both ends" />
        <InputGroupAddon align="inline-end">
          <MagicStarOutline aria-hidden="true" />
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupAddon align="inline-start">
          <ImageOutline aria-hidden="true" />
          <InputGroupText>Alt text</InputGroupText>
        </InputGroupAddon>
        <Input placeholder="Leading icon + label" />
      </InputGroup>
    </Stack>
  ),
}

// === 5. BlockAddons — full-width header + helper banner ==============
export const BlockAddons: Story = {
  render: () => (
    <div style={{ width: FRAME_WIDTH }}>
      <InputGroup>
        <InputGroupAddon align="block-start">
          <small>Email address</small>
        </InputGroupAddon>
        <Input placeholder="you@example.com" type="email" />
        <InputGroupAddon align="block-end">
          <small>We'll never share it.</small>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
}

// === 6. PrefixString — URL-with-protocol pattern =====================
export const PrefixString: Story = {
  render: () => (
    <div style={{ width: FRAME_WIDTH }}>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <Input placeholder="klyp.studio/series/welcome" />
      </InputGroup>
    </div>
  ),
}

// === 7. WithButton — sign-up-style trailing CTA ======================
export const WithButton: Story = {
  render: function Render() {
    const [value, setValue] = useState('')
    return (
      <div style={{ width: FRAME_WIDTH }}>
        <InputGroup>
          <Input
            placeholder="you@example.com"
            type="email"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="sm" variant="primary" type="submit">
              Subscribe
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    )
  },
}

// === 8. Loading — in-flight submit state =============================
export const Loading: Story = {
  render: () => (
    <div style={{ width: FRAME_WIDTH }}>
      <InputGroup data-loading="">
        <InputGroupAddon align="inline-start">
          <SearchBulk aria-hidden="true" />
        </InputGroupAddon>
        <Input placeholder="Indexing your library…" defaultValue="dragons in snow" readOnly />
        <InputGroupAddon align="inline-end">
          <Spinner size="sm" aria-label="Loading results" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
}

// === 9. Counter — block-end character counter for textarea ==========
export const Counter: Story = {
  render: function Render() {
    const LIMIT = 280
    const [value, setValue] = useState('A neon-lit alley in old Tashkent…')
    return (
      <div style={{ width: FRAME_WIDTH }}>
        <InputGroup>
          <InputGroupTextarea
            placeholder="Describe your scene…"
            rows={4}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={LIMIT}
          />
          <InputGroupAddon align="block-end">
            <small style={{ marginLeft: 'auto' }}>
              {value.length}/{LIMIT}
            </small>
          </InputGroupAddon>
        </InputGroup>
      </div>
    )
  },
}

// === 10. Textarea — multi-line group with toolbar row ===============
export const Textarea: Story = {
  render: () => (
    <div style={{ width: FRAME_WIDTH }}>
      <InputGroup>
        <InputGroupTextarea
          placeholder="Write a prompt…"
          rows={4}
          defaultValue="A long tracking shot through a misty forest."
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton size="icon-xs" variant="ghost" aria-label="Edit">
            <EditPencilOutline />
          </InputGroupButton>
          <InputGroupButton size="icon-xs" variant="ghost" aria-label="Attach image">
            <ImageOutline />
          </InputGroupButton>
          <InputGroupButton size="icon-xs" variant="ghost" aria-label="Insert link">
            <ShareOutline />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
}
