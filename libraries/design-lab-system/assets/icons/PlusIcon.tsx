import type { IconProps } from './IconProps'

export function PlusIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}
