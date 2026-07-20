/* biome-ignore-all lint/a11y/noSvgWithoutTitle: decorative icons rendered
 * adjacent to visible labels (RailItem children, Toggle label). SVGs use
 * `role="presentation"` + `aria-hidden="true"` per WAI-ARIA decorative
 * pattern — they don't need their own accessible name and shouldn't add
 * to the a11y tree. */

/**
 * SidebarRail icon registry — 6 Iconsax-bulk SVGs inlined.
 *
 * Why inlined: nav rail icons are render-critical (above the fold every
 * route), so we avoid an extra dynamic-import waterfall. Bulk variant per
 * `Creator Platform/.claude/rules/frontend.md` Icons section.
 *
 * Path source: `mcp__iconsax__get_icon` (verified 2026-04-27 polish pass).
 * `white` → `currentColor` so active state inherits text color (gold).
 *
 * Bulk-secondary `opacity` raised from Iconsax stock 0.4 → 0.7 for
 * dark-surface legibility on `--surface-shell` (#0F0F0F). Stock 0.4 is
 * calibrated for white backgrounds — fades to ~25% perceived on dark.
 */

import './sidebar.scss'

import LottieImport, { type LottieRefCurrentProps } from 'lottie-react'
import { useReducedMotion } from 'motion/react'
import {
  type ComponentType,
  type CSSProperties,
  type SVGProps,
  useEffect,
  useRef,
  useState,
} from 'react'

type IconProps = SVGProps<SVGSVGElement>

export type SidebarIconName =
  | 'library'
  | 'editor'
  | 'create'
  | 'my-series'
  | 'canvas'
  | 'analytics'
  | 'earnings'
  | 'referrals'
  | 'pricing'
  | 'sidebar'
  | 'sidebar-right'

/** Standard svg attribute set. Decorative — actual accessible name comes
 *  from the visible label adjacent to the icon (e.g. `<RailItem>` label).
 *  `aria-hidden="true"` removes the icon from the a11y tree. */
const baseSvgProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  role: 'presentation',
  'aria-hidden': true,
  focusable: false,
} as const

/** Iconsax `gallery` (bulk). */
function GalleryBulk(props: IconProps) {
  return (
    <svg {...baseSvgProps} {...props}>
      <path
        opacity="0.7"
        d="M22 7.81V13.9L20.37 12.5C19.59 11.83 18.33 11.83 17.55 12.5L13.39 16.07C12.61 16.74 11.35 16.74 10.57 16.07L10.23 15.79C9.52 15.17 8.39 15.11 7.59 15.65L2.67 18.95L2.56 19.03C2.19 18.23 2 17.28 2 16.19V7.81C2 4.17 4.17 2 7.81 2H16.19C19.83 2 22 4.17 22 7.81Z"
        fill="currentColor"
      />
      <path
        d="M9 10.38C10.31 10.38 11.38 9.31 11.38 8C11.38 6.69 10.31 5.62 9 5.62C7.69 5.62 6.62 6.69 6.62 8C6.62 9.31 7.69 10.38 9 10.38Z"
        fill="currentColor"
      />
      <path
        d="M22 13.9V16.19C22 19.83 19.83 22 16.19 22H7.81C5.26 22 3.42 20.93 2.56 19.03L2.67 18.95L7.59 15.65C8.39 15.11 9.52 15.17 10.23 15.79L10.57 16.07C11.35 16.74 12.61 16.74 13.39 16.07L17.55 12.5C18.33 11.83 19.59 11.83 20.37 12.5L22 13.9Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** Custom `studio` (bulk) — film/tape strips with sparkle accent.
 *  Replaces the prior Iconsax `edit-2` icon when the rail item was renamed
 *  Editor → Studio (2026-04-29). Two background tape segments use the
 *  bulk-secondary opacity 0.7 (raised from stock 0.4) per dark-surface
 *  legibility convention at the top of this file. The sparkle on the right
 *  is the full-opacity accent. */
function StudioBulk(props: IconProps) {
  return (
    <svg {...baseSvgProps} {...props}>
      <path d="M5.71001 6.55002H1.64001V9.79002H5.71001V6.55002Z" fill="currentColor" />
      <path
        d="M5.71003 5.15999V1.26999C3.58003 1.65999 2.19003 3.03999 1.78003 5.14999H5.68003C5.68003 5.14999 5.70003 5.14999 5.71003 5.14999V5.15999Z"
        fill="currentColor"
      />
      <path
        d="M5.71001 14.51V11.19H1.64001V14.49H5.60001C5.60001 14.49 5.67001 14.51 5.71001 14.52V14.51Z"
        fill="currentColor"
      />
      <path
        d="M20.1801 5.15001C19.7801 3.10001 18.4701 1.76001 16.4501 1.32001V5.15001H20.1801Z"
        fill="currentColor"
      />
      <path
        opacity="0.7"
        d="M15.05 9.79V1.16C15.05 1.16 14.95 1.16 14.89 1.16H7.10999V9.8H15.05V9.79Z"
        fill="currentColor"
      />
      <path
        d="M5.60004 15.89H1.79004C2.22004 17.96 3.60004 19.32 5.71004 19.71V15.87C5.71004 15.87 5.64004 15.89 5.60004 15.89Z"
        fill="currentColor"
      />
      <path d="M20.3201 6.55002H16.4501V9.79002H20.3201V6.55002Z" fill="currentColor" />
      <path
        d="M17.8401 12.41C18.6101 12.41 19.2701 12.85 19.5301 13.54L19.5801 13.68L19.8001 14.49H20.3201V11.19H16.4501V13.11C16.7801 12.69 17.2801 12.41 17.8401 12.41Z"
        fill="currentColor"
      />
      <path
        opacity="0.7"
        d="M11.96 18.34C11.96 17.52 12.49 16.81 13.31 16.58L14.54 16.26C14.73 16.21 14.9 16.12 15.05 16.02V11.19H7.10999V19.83H12.73C12.25 19.5 11.96 18.96 11.96 18.34Z"
        fill="currentColor"
      />
      <path
        d="M22.36 18.37C22.36 18.46 22.31 18.66 22.07 18.74L20.8 19.09C19.71 19.39 18.89 20.21 18.59 21.3L18.25 22.54C18.17 22.82 17.95 22.85 17.85 22.85C17.75 22.85 17.53 22.82 17.45 22.54L17.11 21.29C16.81 20.21 15.98 19.39 14.9 19.09L13.65 18.75C13.38 18.67 13.35 18.44 13.35 18.35C13.35 18.25 13.38 18.02 13.65 17.94L14.91 17.61C15.99 17.3 16.81 16.48 17.11 15.4L17.47 14.09C17.56 13.87 17.76 13.84 17.85 13.84C17.94 13.84 18.15 13.87 18.23 14.07L18.59 15.39C18.89 16.47 19.72 17.29 20.8 17.6L22.09 17.95C22.35 18.05 22.36 18.28 22.36 18.36V18.37Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** Iconsax `chart-square` (linear). Used for the disabled "Coming Soon"
 *  Analytics rail item — linear variant matches the visual rhythm of the
 *  animated linear-stroke Lottie icons in the active group above. Stroke
 *  width 1.5 is identical to the Lottie source files (`"w": 1.5`). */
function ChartSquareLinear(props: IconProps) {
  return (
    <svg {...baseSvgProps} {...props}>
      <path
        d="M7 10.7402V13.9402"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 9V15.68"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 10.7402V13.9402"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Iconsax `empty-wallet-tick` (linear). Used for the disabled "Coming
 *  Soon" Earnings rail item — wallet body + small ✓ check badge below.
 *  Linear strokes match the animated rail icon set; stroke-width 1.5
 *  identical to Lottie source. */
function EmptyWalletTickLinear(props: IconProps) {
  return (
    <svg {...baseSvgProps} {...props}>
      <path
        d="M18.04 13.55C17.62 13.96 17.38 14.55 17.44 15.18C17.53 16.26 18.52 17.05 19.6 17.05H21.5V18.24C21.5 20.31 19.81 22 17.74 22H7.63C7.94 21.74 8.21 21.42 8.42 21.06C8.79 20.46 9 19.75 9 19C9 16.79 7.21 15 5 15C4.06 15 3.19 15.33 2.5 15.88V11.51C2.5 9.44 4.19 7.75 6.26 7.75H17.74C19.81 7.75 21.5 9.44 21.5 11.51V12.95H19.48C18.92 12.95 18.41 13.17 18.04 13.55Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 12.41V7.84C2.5 6.65 3.23 5.59 4.34 5.17L12.28 2.17C13.52 1.7 14.85 2.62 14.85 3.95V7.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.56 13.97V16.03C22.56 16.58 22.12 17.03 21.56 17.05H19.6C18.52 17.05 17.53 16.26 17.44 15.18C17.38 14.55 17.62 13.96 18.04 13.55C18.41 13.17 18.92 12.95 19.48 12.95H21.56C22.12 12.97 22.56 13.42 22.56 13.97Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 12H14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 19C9 19.75 8.79 20.46 8.42 21.06C8.21 21.42 7.94 21.74 7.63 22C6.93 22.63 6.01 23 5 23C3.54 23 2.27 22.22 1.58 21.06C1.21 20.46 1 19.75 1 19C1 17.74 1.58 16.61 2.5 15.88C3.19 15.33 4.06 15 5 15C7.21 15 9 16.79 9 19Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.44 19L4.43 19.99L6.56 18.02"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Iconsax `profile-2user` (linear). Used for the disabled "Coming Soon"
 *  Referrals rail item — two profile silhouettes (you + invitee). Linear
 *  strokes match the animated rail icon set; stroke-width 1.5 identical
 *  to Lottie source. */
function Profile2UserLinear(props: IconProps) {
  return (
    <svg {...baseSvgProps} {...props}>
      <path
        d="M9.16 10.87C9.06 10.86 8.94 10.86 8.83 10.87C6.45 10.79 4.56 8.84 4.56 6.44C4.56 3.99 6.54 2 9 2C11.45 2 13.44 3.99 13.44 6.44C13.43 8.84 11.54 10.79 9.16 10.87Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.41 4C18.35 4 19.91 5.57 19.91 7.5C19.91 9.39 18.41 10.93 16.54 11C16.46 10.99 16.37 10.99 16.28 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.16 14.56C1.74 16.18 1.74 18.82 4.16 20.43C6.91 22.27 11.42 22.27 14.17 20.43C16.59 18.81 16.59 16.17 14.17 14.56C11.43 12.73 6.92 12.73 4.16 14.56Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.34 20C19.06 19.85 19.74 19.56 20.3 19.13C21.86 17.96 21.86 16.03 20.3 14.86C19.75 14.44 19.08 14.16 18.37 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Iconsax `video-square` (bulk). Background opacity stock 0.4 → 0.7
 *  per dark-surface legibility note at top of file. Inner play-triangle
 *  is the accent (full opacity), outer rounded square is the body. */
function VideoSquareBulk(props: IconProps) {
  return (
    <svg {...baseSvgProps} {...props}>
      <path
        opacity="0.7"
        d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2Z"
        fill="currentColor"
      />
      <path
        d="M9.1001 12.0005V10.5205C9.1001 8.61048 10.4501 7.84048 12.1001 8.79048L13.3801 9.53048L14.6601 10.2705C16.3101 11.2205 16.3101 12.7805 14.6601 13.7305L13.3801 14.4705L12.1001 15.2105C10.4501 16.1605 9.1001 15.3805 9.1001 13.4805V12.0005Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** Custom `create` (bulk) — speech bubble with sparkle accent. Used for the
 *  Create rail entry (AI chat surface). Background bubble is bulk-secondary
 *  at opacity 0.7 (raised from stock 0.4 per dark-surface legibility).
 *  Foreground bubble + sparkle are the full-opacity accent. */
function CreateBulk(props: IconProps) {
  return (
    <svg {...baseSvgProps} {...props}>
      <path
        d="M12.01 16.11C12.01 17.33 11.56 18.46 10.8 19.35C9.79 20.58 8.18 21.37 6.37 21.37L3.7 22.96C3.25 23.24 2.68 22.86 2.74 22.33L3 20.31C1.63 19.36 0.75 17.83 0.75 16.11C0.75 14.39 1.71 12.72 3.19 11.78C4.1 11.19 5.2 10.85 6.39 10.85C9.51 10.85 12.01 13.2 12.01 16.11Z"
        fill="currentColor"
      />
      <path
        opacity="0.7"
        d="M20.87 8.75999L20.52 9.99999C20.3 10.8 19.6 11.34 18.77 11.34C17.94 11.34 17.24 10.81 17.02 9.99999L16.68 8.75999C16.51 8.15999 16.05 7.69999 15.45 7.52999L14.18 7.18999C13.4 6.96999 12.87 6.26999 12.87 5.44999C12.87 4.62999 13.4 3.91999 14.22 3.68999L15.45 3.36999C15.57 3.33999 15.67 3.28999 15.77 3.23999C14.67 2.79999 13.46 2.54999 12.19 2.54999C7.91 2.54999 4.32 5.32999 3.39 9.05999C3.3 9.44999 3.67 9.79999 4.05 9.66999C4.79 9.41999 5.58 9.29999 6.39 9.29999C10.35 9.29999 13.56 12.35 13.56 16.1C13.56 17.17 13.28 18.23 12.77 19.17C12.64 19.42 12.7 19.72 12.94 19.87L16.49 21.98C17.22 22.42 18.13 21.83 18.03 20.98L17.63 17.74C19.82 16.2 21.25 13.75 21.25 10.99C21.25 10.19 21.12 9.41999 20.9 8.68999C20.9 8.70999 20.88 8.72999 20.87 8.75999Z"
        fill="currentColor"
      />
      <path
        d="M23.27 5.48001C23.27 5.57001 23.22 5.77001 22.98 5.85001L21.71 6.20001C20.62 6.50001 19.8 7.32001 19.5 8.41001L19.16 9.65001C19.08 9.93001 18.86 9.96001 18.76 9.96001C18.66 9.96001 18.44 9.93001 18.36 9.65001L18.02 8.40001C17.72 7.32001 16.89 6.50001 15.81 6.20001L14.56 5.86001C14.29 5.78001 14.26 5.55001 14.26 5.46001C14.26 5.36001 14.29 5.13001 14.56 5.05001L15.82 4.72001C16.9 4.41001 17.72 3.59001 18.02 2.51001L18.38 1.20001C18.47 0.980012 18.67 0.950012 18.76 0.950012C18.85 0.950012 19.06 0.980012 19.14 1.18001L19.5 2.50001C19.8 3.58001 20.63 4.40001 21.71 4.71001L23 5.06001C23.26 5.16001 23.27 5.39001 23.27 5.47001V5.48001Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** Custom `canvas` (linear) — 4 rounded corner-dots + central rounded square.
 *  Static fallback that paints during the brief window before
 *  `SidebarLottie` loads `sidebar-canvas.json` (lazy import). Geometry mirrors
 *  the Lottie source (corners at 23×23 layer-space [4,4]/[19,4]/[4,19]/[19,19]
 *  with 5×5 rounded shapes; center 16×16 rounded square at [11.5,11.5]) but
 *  rendered as plain `<rect>`s without elastic / rotation animation. Stroke
 *  width 1.5 matches the Lottie source `"w": 1.5`. */
function CanvasLinear(props: IconProps) {
  return (
    <svg {...baseSvgProps} {...props}>
      <rect
        x="1.5"
        y="1.5"
        width="5"
        height="5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="16.5"
        y="1.5"
        width="5"
        height="5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="1.5"
        y="16.5"
        width="5"
        height="5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="16.5"
        y="16.5"
        width="5"
        height="5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="3.5"
        y="3.5"
        width="16"
        height="16"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Iconsax `sidebar-left` (bulk) — toggle indicator. CSS flips to point right
 *  on expand via `scaleX(-1)`. */
function SidebarLeftBulk(props: IconProps) {
  return (
    <svg {...baseSvgProps} {...props}>
      <path
        opacity="0.7"
        d="M22 7.81V16.19C22 19.83 19.83 22 16.19 22H7.81C7.61 22 7.41 21.99 7.22 21.98C5.99 21.9 4.95 21.55 4.13 20.95C3.71 20.66 3.34 20.29 3.05 19.87C2.36 18.92 2 17.68 2 16.19V7.81C2 4.37 3.94 2.24 7.22 2.03C7.41 2.01 7.61 2 7.81 2H16.19C17.68 2 18.92 2.36 19.87 3.05C20.29 3.34 20.66 3.71 20.95 4.13C21.64 5.08 22 6.32 22 7.81Z"
        fill="currentColor"
      />
      <path
        d="M8.72 2V22H7.81C7.61 22 7.41 21.99 7.22 21.98V2.03C7.41 2.01 7.61 2 7.81 2H8.72Z"
        fill="currentColor"
      />
      <path
        d="M14.97 15.31C14.78 15.31 14.59 15.24 14.44 15.09L11.88 12.53C11.59 12.24 11.59 11.76 11.88 11.47L14.44 8.91C14.73 8.62 15.21 8.62 15.5 8.91C15.79 9.2 15.79 9.68 15.5 9.97L13.48 12L15.51 14.03C15.8 14.32 15.8 14.8 15.51 15.09C15.36 15.24 15.17 15.31 14.97 15.31Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** Iconsax `sidebar-right` (bulk) — toggle indicator when collapsed.
 *  Mirror of `SidebarLeftBulk`. We swap the React component on state
 *  change instead of CSS-flipping the SVG, so the icon never animates
 *  through `scaleX(0)` (which briefly collapses it to invisible). */
function SidebarRightBulk(props: IconProps) {
  return (
    <svg {...baseSvgProps} {...props}>
      <path
        opacity="0.7"
        d="M2 7.81V16.19C2 19.83 4.17 22 7.81 22H16.19C16.39 22 16.59 21.99 16.78 21.98C18.01 21.9 19.05 21.55 19.87 20.95C20.29 20.66 20.66 20.29 20.95 19.87C21.64 18.92 22 17.68 22 16.19V7.81C22 4.37 20.06 2.24 16.78 2.03C16.59 2.01 16.39 2 16.19 2H7.81C6.32 2 5.08 2.36 4.13 3.05C3.71 3.34 3.34 3.71 3.05 4.13C2.36 5.08 2 6.32 2 7.81Z"
        fill="currentColor"
      />
      <path
        d="M15.28 2V22H16.19C16.39 22 16.59 21.99 16.78 21.98V2.03C16.59 2.01 16.39 2 16.19 2H15.28Z"
        fill="currentColor"
      />
      <path
        d="M9.03 15.31C9.22 15.31 9.41 15.24 9.56 15.09L12.12 12.53C12.41 12.24 12.41 11.76 12.12 11.47L9.56 8.91C9.27 8.62 8.79 8.62 8.5 8.91C8.21 9.2 8.21 9.68 8.5 9.97L10.52 12L8.5 14.03C8.21 14.32 8.21 14.8 8.5 15.09C8.64 15.24 8.83 15.31 9.03 15.31Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** Iconsax `discount-shape` (linear). Static fallback for the Pricing rail
 *  item — squircle price-tag with a percent slash (two dots + diagonal).
 *  Paints during the lazy-import window before `SidebarLottie` loads
 *  `sidebar-pricing.json`; geometry + stroke-width 1.5 mirror the Lottie
 *  source so the static→animated handoff is seamless. */
function DiscountShapeLinear(props: IconProps) {
  return (
    <svg {...baseSvgProps} {...props}>
      <path
        d="M3.9889 14.6604L2.46891 13.1404C1.84891 12.5204 1.84891 11.5004 2.46891 10.8804L3.9889 9.36039C4.2489 9.10039 4.4589 8.59038 4.4589 8.23038V6.08036C4.4589 5.20036 5.1789 4.48038 6.0589 4.48038H8.2089C8.5689 4.48038 9.0789 4.27041 9.3389 4.01041L10.8589 2.49039C11.4789 1.87039 12.4989 1.87039 13.1189 2.49039L14.6389 4.01041C14.8989 4.27041 15.4089 4.48038 15.7689 4.48038H17.9189C18.7989 4.48038 19.5189 5.20036 19.5189 6.08036V8.23038C19.5189 8.59038 19.7289 9.10039 19.9889 9.36039L21.5089 10.8804C22.1289 11.5004 22.1289 12.5204 21.5089 13.1404L19.9889 14.6604C19.7289 14.9204 19.5189 15.4304 19.5189 15.7904V17.9403C19.5189 18.8203 18.7989 19.5404 17.9189 19.5404H15.7689C15.4089 19.5404 14.8989 19.7504 14.6389 20.0104L13.1189 21.5304C12.4989 22.1504 11.4789 22.1504 10.8589 21.5304L9.3389 20.0104C9.0789 19.7504 8.5689 19.5404 8.2089 19.5404H6.0589C5.1789 19.5404 4.4589 18.8203 4.4589 17.9403V15.7904C4.4589 15.4204 4.2489 14.9104 3.9889 14.6604Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 15L15 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.4945 14.5H14.5035"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.49451 9.5H9.50349"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Public registry — string-keyed lookup; primitive consumers reference by name. */
export const SIDEBAR_ICONS = {
  library: GalleryBulk,
  editor: StudioBulk,
  create: CreateBulk,
  'my-series': VideoSquareBulk,
  // Linear (outline) — disabled "Coming Soon" group. Visually consistent
  // with the animated linear-stroke Lottie icons in the active group.
  // `canvas` is also disabled but ships an animated Lottie variant alongside
  // the static fallback (see `SIDEBAR_ICONS_ANIMATED` below) — the static
  // SVG only paints during the lazy-import window before Lottie boots.
  canvas: CanvasLinear,
  analytics: ChartSquareLinear,
  earnings: EmptyWalletTickLinear,
  referrals: Profile2UserLinear,
  pricing: DiscountShapeLinear,
  sidebar: SidebarLeftBulk,
  'sidebar-right': SidebarRightBulk,
} as const satisfies Record<SidebarIconName, ComponentType<IconProps>>

/**
 * Render a rail icon by name. Use as `<SidebarIcon name="library" />`. Pass any
 * SVG prop (className, style) to forward to the underlying SVG.
 */
export function SidebarIcon({ name, ...props }: { name: SidebarIconName } & IconProps) {
  const Icon = SIDEBAR_ICONS[name]
  return <Icon {...props} />
}

// =====================================================================
// Animated rail icons — Lottie hover variants
// =====================================================================
//
// Source: `Claude/iconsax/Animated/` (linear-stroke Iconsax variants
// with elastic/morph keyframes). Copied into `src/assets/icons-animated/`
// with `rail-` prefix at session 2026-05-02 to avoid collision with the
// legacy 500+ Iconsax animated set already in that folder.
//
// Visual style note: animated variants are **linear-stroke** (different
// from the static `SIDEBAR_ICONS` bulk SVGs above). Stroke color inherits
// `currentColor` via CSS rule in `Sidebar.scss` — so default/hover/
// active state colors cascade naturally without needing recolorLottie
// (which clones JSON on each change). Static bulk used as load-time
// fallback only.
//
// Animation triggered by parent element (the entire Sidebar link/button),
// not by hover on the icon itself — see `SidebarLottie.play` controlled prop.

const LottieComp =
  (LottieImport as unknown as { default?: typeof LottieImport }).default ?? LottieImport

// Lazy Lottie loaders — static imports of the package's OWN bundled JSON
// (moved into the package 2026-06-01 under ./assets/lottie/). The previous
// version used `import.meta.glob('/src/assets/icons-animated/sidebar-*.json')`,
// an app-absolute path that does NOT resolve once @klyp/icons ships as a
// package (Vite doesn't transform import.meta.glob inside node_modules).
// Each entry code-splits into its own chunk; only the requested name loads.
const railLottieIndex: Record<string, () => Promise<{ default: object }>> = {
  'sidebar-bottom': () => import('./assets/lottie/sidebar-bottom.json'),
  'sidebar-canvas': () => import('./assets/lottie/sidebar-canvas.json'),
  'sidebar-chat': () => import('./assets/lottie/sidebar-chat.json'),
  'sidebar-create': () => import('./assets/lottie/sidebar-create.json'),
  'sidebar-editor': () => import('./assets/lottie/sidebar-editor.json'),
  'sidebar-left': () => import('./assets/lottie/sidebar-left.json'),
  'sidebar-library': () => import('./assets/lottie/sidebar-library.json'),
  'sidebar-my-series': () => import('./assets/lottie/sidebar-my-series.json'),
  'sidebar-pricing': () => import('./assets/lottie/sidebar-pricing.json'),
  'sidebar-refer-friend': () => import('./assets/lottie/sidebar-refer-friend.json'),
  'sidebar-referrals': () => import('./assets/lottie/sidebar-referrals.json'),
  'sidebar-right': () => import('./assets/lottie/sidebar-right.json'),
  'sidebar-sign-in': () => import('./assets/lottie/sidebar-sign-in.json'),
  'sidebar-toggle': () => import('./assets/lottie/sidebar-toggle.json'),
  'sidebar-top': () => import('./assets/lottie/sidebar-top.json'),
}

// NOTE: `railLottieRawIndex` (an eager `?raw` glob) was removed 2026-06-01.
// Its only consumer was `AnimatedIconCard` in the legacy
// `apps/web/src/routes/components.tsx`, deleted in the 2026-05-12 catalog
// rewrite. Confirmed dead by repo-wide grep. The catalog renders raw JSON
// from its own app-side assets, not from this package.

/** Maps `SidebarIconName` (or `'toggle'` for the collapse button) → Lottie file
 *  name without `.json`. `undefined` for an entry means use the static
 *  `SIDEBAR_ICONS` SVG (no animated variant available).
 *
 *  Disabled rail items (`analytics`, `earnings`, `referrals`) intentionally
 *  omitted — they don't react to hover anyway. */
export const SIDEBAR_ICONS_ANIMATED = {
  create: 'sidebar-create',
  editor: 'sidebar-editor',
  'my-series': 'sidebar-my-series',
  library: 'sidebar-library',
  // Canvas is currently shipped as a `disabled` rail item (Coming Soon badge)
  // — `SidebarNavItem` renders the disabled branch without `onMouseEnter`
  // wiring, so `play` stays false and the Lottie sits on its idle frame.
  // Mapping is set ahead of time so flipping `disabled: false` on the
  // rail item later automatically enables the hover-driven elastic playback
  // without a second registry edit.
  canvas: 'sidebar-canvas',
  // Referrals — animated profile+invitation glyph (path morph + bouncing
  // figure on hover). the design lead 2026-05-17. Active rail item in the account
  // group; the disabled-branch hover wiring in Sidebar.tsx (added the
  // same day) means even when this slot is `disabled: true` the Lottie
  // still previews on hover. The gift-share Lottie
  // (`sidebar-refer-friend.json`) belongs to `<SidebarReferralCTA>` in
  // the Sidebar footer — it doesn't share this rail slot.
  referrals: 'sidebar-referrals',
  // Pricing — animated discount-tag glyph (elastic squircle rotate + percent
  // slash). Surfaced in the MOBILE drawer only (`MOBILE_DRAWER_ITEMS` in
  // apps/web __root.tsx) — the AppHeader Pricing nav collapses into the
  // mobile sidebar at <768px and plays this on tap/hover. Not on the desktop
  // rail (`DEFAULT_SIDEBAR_ITEMS` has no Pricing entry).
  pricing: 'sidebar-pricing',
  toggle: 'sidebar-toggle',
} as const satisfies Partial<Record<SidebarIconName | 'toggle', string>>

export type SidebarAnimatedKey = keyof typeof SIDEBAR_ICONS_ANIMATED

type SidebarLottieProps = {
  /** Lottie file name without `.json` (e.g. `'sidebar-create'`). */
  name: string
  /** Controlled play state. `true` = play from frame 0; `false` = stop. */
  play: boolean
  /** Pixel size of the rendered SVG square. */
  size?: number
  /** Playback speed (1 = source speed). Default 1.5 for snappy hover feedback. */
  speed?: number
}

/** Lottie wrapper with **controlled play** prop — meant for cases where the
 *  parent element (link, button, card) drives the hover state, not the icon
 *  itself. Stroke color inherits `currentColor` via CSS in the consuming
 *  component (e.g. `.klyp-SidebarMenuButton__icon svg * { stroke: currentColor }`).
 *
 *  Respects `prefers-reduced-motion` — animation disabled when user preference
 *  is set; first frame renders as a static idle pose. */
export function SidebarLottie({ name, play, size = 22, speed = 1.5 }: SidebarLottieProps) {
  const ref = useRef<LottieRefCurrentProps>(null)
  const reduceMotion = useReducedMotion()
  const [data, setData] = useState<object | null>(null)

  useEffect(() => {
    let cancelled = false
    const loader = railLottieIndex[name]
    if (!loader) {
      console.warn(`[SidebarLottie] missing animation: ${name}`)
      return
    }
    loader().then((mod) => {
      if (!cancelled) setData(mod.default)
    })
    return () => {
      cancelled = true
    }
  }, [name])

  useEffect(() => {
    if (!data || reduceMotion) return
    if (play) {
      ref.current?.setSpeed(speed)
      ref.current?.goToAndPlay(0, true)
    } else {
      ref.current?.stop()
    }
  }, [play, data, reduceMotion, speed])

  // Only set the CSS-var inline when the caller overrides the default
  // 22px size; default usage stays style-free (linter respects this).
  const sizeStyle: CSSProperties | undefined =
    size === 22 ? undefined : ({ '--rail-lottie-size': `${size}px` } as CSSProperties)

  return data ? (
    <span className="klyp-SidebarLottie" style={sizeStyle}>
      <LottieComp lottieRef={ref} animationData={data} autoplay={false} loop={false} />
    </span>
  ) : null
}
