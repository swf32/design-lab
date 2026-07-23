import type { IconProps } from './IconProps'

export function LightThemeIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 2.5V4M12 20V21.5M21.5 12H20M4 12H2.5M18.72 5.28L17.66 6.34M6.34 17.66L5.28 18.72M18.72 18.72L17.66 17.66M6.34 6.34L5.28 5.28"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
