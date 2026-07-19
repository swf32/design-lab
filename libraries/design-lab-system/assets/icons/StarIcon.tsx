import type { IconProps } from './IconProps'
export function StarIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 22.75a.75.75 0 0 1-.75-.69c-.64-8.41-.9-8.67-9.31-9.31a.75.75 0 0 1 0-1.5c8.41-.64 8.67-.9 9.31-9.31a.75.75 0 0 1 1.5 0c.64 8.41.9 8.67 9.31 9.31a.75.75 0 0 1 0 1.5c-8.41.64-8.67.9-9.31 9.31a.75.75 0 0 1-.75.69Zm-4.18-10.75c2.43.62 3.56 1.75 4.18 4.18.62-2.44 1.75-3.56 4.18-4.18-2.43-.62-3.56-1.75-4.18-4.18-.62 2.44-1.75 3.57-4.18 4.18Z"
        fill="currentColor"
      />
    </svg>
  )
}
