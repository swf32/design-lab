import type { Meta, StoryObj } from '../__shared/stories-types'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './Accordion'

const meta = {
  title: 'UI / Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Accordion style={{ minWidth: 320 }}>
      <AccordionItem id="one">
        <AccordionTrigger>Section one</AccordionTrigger>
        <AccordionContent>First panel content goes here.</AccordionContent>
      </AccordionItem>
      <AccordionItem id="two">
        <AccordionTrigger>Section two</AccordionTrigger>
        <AccordionContent>Second panel content goes here.</AccordionContent>
      </AccordionItem>
      <AccordionItem id="three">
        <AccordionTrigger>Section three</AccordionTrigger>
        <AccordionContent>Third panel content goes here.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const MultipleOpen: Story = {
  render: () => (
    <Accordion
      allowsMultipleExpanded
      defaultExpandedKeys={['one', 'two']}
      style={{ minWidth: 320 }}
    >
      <AccordionItem id="one">
        <AccordionTrigger>Open by default</AccordionTrigger>
        <AccordionContent>Both panels can stay open at once.</AccordionContent>
      </AccordionItem>
      <AccordionItem id="two">
        <AccordionTrigger>Also open</AccordionTrigger>
        <AccordionContent>Second panel.</AccordionContent>
      </AccordionItem>
      <AccordionItem id="three">
        <AccordionTrigger>Closed</AccordionTrigger>
        <AccordionContent>Third panel.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Accordion style={{ minWidth: 320 }}>
      <AccordionItem id="one">
        <AccordionTrigger>Active</AccordionTrigger>
        <AccordionContent>This panel works.</AccordionContent>
      </AccordionItem>
      <AccordionItem id="two" isDisabled>
        <AccordionTrigger>Disabled</AccordionTrigger>
        <AccordionContent>Locked.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}
