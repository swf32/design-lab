import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { OtpInput } from './OtpInput'

const meta = {
  title: 'UI / OtpInput',
  component: OtpInput,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof OtpInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [code, setCode] = useState('')
    return <OtpInput value={code} onChange={setCode} aria-label="Verification code" />
  },
}

export const Filled: Story = {
  render: () => {
    const [code, setCode] = useState('123')
    return <OtpInput value={code} onChange={setCode} aria-label="Verification code" />
  },
}

export const Complete: Story = {
  render: () => {
    const [code, setCode] = useState('123456')
    return <OtpInput value={code} onChange={setCode} aria-label="Verification code" />
  },
}

export const Invalid: Story = {
  render: () => {
    const [code, setCode] = useState('000000')
    return (
      <OtpInput
        value={code}
        onChange={setCode}
        hasError
        aria-label="Verification code"
        aria-describedby="otp-error"
      />
    )
  },
}

export const Success: Story = {
  render: () => {
    const [code, setCode] = useState('654321')
    return <OtpInput value={code} onChange={setCode} isSuccess aria-label="Verification code" />
  },
}

export const Disabled: Story = {
  render: () => {
    const [code, setCode] = useState('123456')
    return <OtpInput value={code} onChange={setCode} disabled aria-label="Verification code" />
  },
}

export const CustomLength: Story = {
  render: () => {
    const [code, setCode] = useState('')
    return <OtpInput value={code} onChange={setCode} length={4} aria-label="4-digit PIN" />
  },
}
