import type { Meta, StoryObj } from '../__shared/stories-types'
import { Spinner } from '../Spinner/Spinner'
import {
  Command,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
} from './Command'

const DEMO_CHILDREN = (
  <>
    <CommandInput placeholder="Type a command..." />
    <CommandList>
      <CommandEmpty>No results.</CommandEmpty>
      <CommandGroup heading="Actions">
        <CommandItem>New series</CommandItem>
        <CommandItem>New episode</CommandItem>
        <CommandItem>Generate scene image</CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Navigate">
        <CommandItem>Library</CommandItem>
        <CommandItem>Settings</CommandItem>
      </CommandGroup>
    </CommandList>
  </>
)

const meta = {
  title: 'UI / Command',
  component: Command,
  tags: ['autodocs'],
  parameters: { layout: 'centered', playground: { wrapperStyle: { width: 360 } } },
  args: { children: DEMO_CHILDREN, loop: false, vimBindings: true, shouldFilter: true },
  argTypes: {
    loop: { control: 'boolean' },
    vimBindings: { control: 'boolean' },
    shouldFilter: { control: 'boolean' },
    label: { control: 'text' },
    children: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Command>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Command style={{ width: 360, border: '1px solid var(--color-border-default)' }}>
      {DEMO_CHILDREN}
    </Command>
  ),
}

export const Loading: Story = {
  render: () => (
    <Command style={{ width: 360, border: '1px solid var(--color-border-default)' }}>
      <CommandInput placeholder="Type a command..." />
      <CommandList>
        <CommandLoading label="Loading results…">
          <Spinner size="sm" />
          <span>Loading results…</span>
        </CommandLoading>
      </CommandList>
    </Command>
  ),
}

export const Footer: Story = {
  render: () => (
    <Command style={{ width: 360, border: '1px solid var(--color-border-default)' }}>
      {DEMO_CHILDREN}
      <CommandFooter>
        <span>↑↓ navigate</span>
        <span>↵ select</span>
        <span>esc close</span>
      </CommandFooter>
    </Command>
  ),
}
