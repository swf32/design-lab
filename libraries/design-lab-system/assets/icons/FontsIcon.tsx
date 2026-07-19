import type { IconProps } from './IconProps'
export function FontsIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M2 5.36V3.85C2 2.83 2.83 2 3.85 2h12.92c1.02 0 1.85.83 1.85 1.85v1.51M10.31 17.53V2.75M6.91 17.53h5.58M13.69 9.77h7.01c.73 0 1.32.59 1.32 1.32v.8M16.09 20.86V10.3M13.95 20.86h4.28"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
