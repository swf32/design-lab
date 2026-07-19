import type { IconProps } from './IconProps'

export function InspectIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M14.4 4.2 19.8 9.6M13.2 5.4l5.4 5.4M15.9 11.1l-7.7 7.7-3 .8.8-3 7.7-7.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m15.6 3 5.4 5.4-2.4 2.4-5.4-5.4L15.6 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M4 4v4M2 6h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
