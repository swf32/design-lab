import type { IconProps } from './IconProps'

export function DarkThemeIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M20.35 15.18A8.72 8.72 0 0 1 8.82 3.65 8.75 8.75 0 1 0 20.35 15.18Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
