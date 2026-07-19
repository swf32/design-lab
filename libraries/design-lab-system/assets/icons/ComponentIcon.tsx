import type { IconProps } from './IconProps'

export function ComponentIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <rect
        x="11.9999"
        y="1.06057"
        width="6.04252"
        height="6.04252"
        rx="1.25"
        transform="rotate(45 11.9999 1.06057)"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="5.33331"
        y="7.72732"
        width="6.04252"
        height="6.04252"
        rx="1.25"
        transform="rotate(45 5.33331 7.72732)"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="18.6666"
        y="7.72732"
        width="6.04252"
        height="6.04252"
        rx="1.25"
        transform="rotate(45 18.6666 7.72732)"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="11.9999"
        y="14.394"
        width="6.04252"
        height="6.04252"
        rx="1.25"
        transform="rotate(45 11.9999 14.394)"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}
