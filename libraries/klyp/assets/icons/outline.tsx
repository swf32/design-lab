/**
 * Outline-style brand icons. Sits alongside `bulk.tsx` (Iconsax bulk) +
 * `sidebar.tsx` (animated Lottie). Outline is the canonical default per
 * frontend.md icon policy (the design lead 2026-05-05) — bulk only on explicit ask.
 *
 * All exports are inline SVGs with `currentColor` fill so they tree-shake
 * and inherit color from CSS. Width/height are NOT set on the SVG — let
 * the consuming wrapper own size via CSS (`width: var(--icon-size-md);`).
 *
 * Opacity rule: if a muted state is needed, set `opacity` on the WRAPPER
 * (`<span class="…__iconWrap" style="opacity: 0.5">`), never on the SVG
 * paths. Per-stroke alpha makes outline crossings double-up visually.
 */

import type { SVGProps } from 'react'

type Props = SVGProps<SVGSVGElement>

/**
 * ✦ Magic-star — premium accent / generate / "use as prompt".
 *
 * Real iconsax `magic-star/outline` (support-like-question). Single magic
 * wand shape with the small handle in the lower-right. Replaces the
 * earlier hand-drawn two-sparkle version (2026-05-19, the design lead audit — that
 * glyph wasn't actually iconsax).
 */
export function MagicStarOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M13.0103 22.5005C12.4103 22.5005 11.4803 22.2105 10.5903 20.7505L8.83027 17.9005C8.66027 17.6205 8.14026 17.3505 7.82026 17.3705L4.48024 17.5405C2.48024 17.6405 1.78028 16.8105 1.53028 16.3105C1.28028 15.8105 1.06024 14.7405 2.36024 13.2205L4.34028 10.9205C4.54028 10.6805 4.65025 10.1605 4.56025 9.8605L3.55024 6.63052C3.04024 5.01052 3.61025 4.14053 3.99025 3.76053C4.37024 3.38053 5.25025 2.83051 6.87025 3.37051L9.82026 4.34052C10.0903 4.43052 10.5903 4.35052 10.8203 4.19052L13.9003 1.97052C15.3103 0.95052 16.3302 1.22052 16.8002 1.47052C17.2702 1.72052 18.0702 2.40053 18.0402 4.14053L17.9702 7.93051C17.9602 8.21051 18.1902 8.67052 18.4102 8.84052L20.8903 10.7205C22.2403 11.7505 22.2903 12.7805 22.2003 13.3105C22.1103 13.8405 21.7103 14.8005 20.0903 15.3005L16.8602 16.3105C16.5602 16.4005 16.1902 16.7905 16.1102 17.0905L15.3403 20.0305C14.8303 21.9605 13.8303 22.3905 13.2703 22.4705C13.2003 22.4905 13.1103 22.5005 13.0103 22.5005ZM7.85023 15.8705C8.71023 15.8705 9.66023 16.3905 10.1002 17.1105L11.8602 19.9605C12.3602 20.7805 12.8102 21.0305 13.0502 20.9905C13.2802 20.9605 13.6403 20.5805 13.8903 19.6605L14.6602 16.7205C14.8702 15.9205 15.6202 15.1305 16.4102 14.8905L19.6403 13.8805C20.2603 13.6905 20.6602 13.3805 20.7202 13.0605C20.7802 12.7405 20.5002 12.3205 19.9802 11.9205L17.5003 10.0405C16.8903 9.58053 16.4503 8.66051 16.4603 7.90051L16.5303 4.1105C16.5403 3.4405 16.3803 2.94053 16.0903 2.79053C15.8003 2.64053 15.3103 2.79051 14.7603 3.18051L11.6802 5.40051C11.0702 5.84051 10.0603 6.00053 9.33027 5.76053L6.38026 4.79053C5.76026 4.59053 5.26028 4.60051 5.03028 4.83051C4.80028 5.06051 4.78023 5.56051 4.97023 6.18051L5.98024 9.41052C6.23024 10.2005 6.01023 11.2705 5.47023 11.8905L3.49025 14.1905C2.86025 14.9205 2.76025 15.4305 2.87025 15.6405C2.97025 15.8505 3.45028 16.0805 4.40028 16.0305L7.74025 15.8605C7.78025 15.8705 7.82023 15.8705 7.85023 15.8705Z" />
      <path d="M21.9098 22.7502C21.7198 22.7502 21.5299 22.6802 21.3799 22.5302L18.3498 19.5002C18.0598 19.2102 18.0598 18.7302 18.3498 18.4402C18.6398 18.1502 19.1198 18.1502 19.4098 18.4402L22.4399 21.4702C22.7299 21.7602 22.7299 22.2402 22.4399 22.5302C22.2899 22.6802 22.0998 22.7502 21.9098 22.7502Z" />
    </svg>
  )
}

/** ✦ Star — premium tier / featured signal (the design lead 2026-05-05 — replaces Crown).
 *  Circle wrapper removed 2026-06-27 (Val) — the ring made the star tiny; the star
 *  now fills the box (scaled 1.5× about centre, strokeWidth 1 → 1.5 effective). */
export function CircleStarOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <g transform="translate(12 12) scale(1.5) translate(-12 -11.5)">
        <path
          d="M12.8596 7.47L13.7396 9.23C13.8596 9.47 14.1796 9.71 14.4496 9.75L16.0397 10.01C17.0597 10.18 17.2997 10.92 16.5597 11.65L15.3196 12.89C15.1096 13.1 14.9997 13.5 15.0597 13.79L15.4097 15.32C15.6897 16.53 15.0496 17 13.9696 16.37L12.4796 15.49C12.2096 15.33 11.7696 15.33 11.4896 15.49L9.99965 16.37C8.92965 17 8.27971 16.53 8.55971 15.32L8.90969 13.79C8.97969 13.5 8.85968 13.1 8.64968 12.89L7.40969 11.65C6.67969 10.92 6.91971 10.18 7.92971 10.01L9.51967 9.75C9.78967 9.71 10.0996 9.47 10.2196 9.23L11.0996 7.47C11.6096 6.51 12.3896 6.51 12.8596 7.47Z"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

/**
 * ⠿ Filter — horizontal sliders (iconsax `setting-4/linear`): two bars
 * each with a knob. Toolbar "more filters" trigger on the Library filter
 * popover — reads as "adjust / refine" (owner 2026-05-30: «типа полоски»),
 * cleaner than a funnel and not a cog (which reads as app settings).
 */
export function FilterOutline(props: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M22 6.5H16" />
      <path d="M6 6.5H2" />
      <path d="M10 10C11.933 10 13.5 8.433 13.5 6.5C13.5 4.567 11.933 3 10 3C8.067 3 6.5 4.567 6.5 6.5C6.5 8.433 8.067 10 10 10Z" />
      <path d="M22 17.5H18" />
      <path d="M8 17.5H2" />
      <path d="M14 21C15.933 21 17.5 19.433 17.5 17.5C17.5 15.567 15.933 14 14 14C12.067 14 10.5 15.567 10.5 17.5C10.5 19.433 12.067 21 14 21Z" />
    </svg>
  )
}

/**
 * ✦ Sparkles — two 4-point stars. AI-"generated" signal. Replaces the
 * crown on the Library "Generated" tab (owner 2026-05-30).
 */
export function SparklesOutline(props: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M7.56 2C7.56 5.11 10 7.56 13.12 7.56C10.01 7.56 7.56 10 7.56 13.12C7.56 10.01 5.12 7.56 2 7.56C5.11 7.56 7.56 5.12 7.56 2Z" />
      <path d="M16.4399 10.89C16.4399 14 18.8799 16.45 21.9999 16.45C18.8899 16.45 16.4399 18.89 16.4399 22.01C16.4399 18.9 13.9999 16.45 10.8799 16.45C13.9899 16.45 16.4399 14.01 16.4399 10.89Z" />
    </svg>
  )
}

/**
 * ↑ Send-arrow — bold up arrow for the composer submit / "Generate" action
 * (Val 2026-06-30). A STROKE glyph (round caps + joins, weight 2.6) — reads as a
 * "send" CTA, deliberately heavier than the thin filled nav Arrow* family below.
 */
export function SendArrowOutline(props: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M12 20V4m-8 8.167L12 4l8 8.167" />
    </svg>
  )
}

/**
 * ← Back-arrow — the send-arrow's left-pointing sibling (chat top-bar Back,
 * Val 2026-07-02). Same STROKE recipe as `SendArrowOutline` (round caps +
 * joins, weight 2.6) so paired chrome buttons read as one family — use this,
 * not the thin filled `ArrowLeftOutline`, next to composer-style controls.
 */
export function BackArrowOutline(props: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M20 12H4m8.167-8L4 12l8.167 8" />
    </svg>
  )
}

/** 💼 Wallet — USD balance / payout (iconsax money/outline/wallet-3). */
export function WalletOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M2 11.9096C1.59 11.9096 1.25 11.5696 1.25 11.1596V6.53961C1.25 4.08961 3.24 2.09961 5.69 2.09961H11.31C13.88 2.09961 15.75 3.80961 15.75 6.15961C15.75 6.56961 15.41 6.90961 15 6.90961C14.59 6.90961 14.25 6.56961 14.25 6.15961C14.25 4.39961 12.73 3.59961 11.31 3.59961H5.69C4.07 3.59961 2.75 4.91961 2.75 6.53961V11.1596C2.75 11.5696 2.41 11.9096 2 11.9096Z"
        fill="currentColor"
      />
      <path
        d="M16 21.9102H6C3.38 21.9102 1.25 19.7802 1.25 17.1602V10.1602C1.25 7.54016 3.38 5.41016 6 5.41016H16C18.62 5.41016 20.75 7.54016 20.75 10.1602V11.6102C20.75 12.0202 20.41 12.3602 20 12.3602H18.92C18.57 12.3602 18.25 12.4902 18.02 12.7302L18 12.7502C17.67 13.0702 17.54 13.5302 17.67 14.0002C17.82 14.5602 18.41 14.9602 19.07 14.9602H20C20.41 14.9602 20.75 15.3002 20.75 15.7102V17.1602C20.75 19.7802 18.62 21.9102 16 21.9102ZM6 6.90016C4.21 6.90016 2.75 8.36016 2.75 10.1502V17.1502C2.75 18.9402 4.21 20.4002 6 20.4002H16C17.79 20.4002 19.25 18.9402 19.25 17.1502V16.4502H19.07C17.72 16.4502 16.54 15.6002 16.22 14.3702C15.96 13.3902 16.24 12.3502 16.96 11.6602C17.48 11.1302 18.18 10.8402 18.93 10.8402H19.26V10.1402C19.26 8.35016 17.8 6.89016 16.01 6.89016H6V6.90016Z"
        fill="currentColor"
      />
      <path
        d="M20.9699 16.4604H19.0399C17.5299 16.4604 16.2499 15.3404 16.1299 13.9004C16.0499 13.0704 16.3499 12.2604 16.9499 11.6704C17.4599 11.1504 18.1599 10.8604 18.9099 10.8604H20.9599C21.9399 10.8604 22.7399 11.6504 22.7399 12.6304V14.6904C22.7399 15.6704 21.9399 16.4604 20.9599 16.4604H20.9699ZM18.9199 12.3604C18.5699 12.3604 18.2499 12.4904 18.0199 12.7304C17.7299 13.0104 17.5899 13.3904 17.6299 13.7704C17.6799 14.4304 18.3199 14.9604 19.0399 14.9604H20.9699C21.1199 14.9604 21.2499 14.8404 21.2499 14.6904V12.6304C21.2499 12.4804 21.1199 12.3604 20.9699 12.3604H18.9199Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** 🪙 Coins — token balance (stacked coins, the design lead 2026-05-06). */
export function CoinsOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M9.1607 12.63C7.8207 12.63 6.5607 12.46 5.4607 12.14C3.3607 11.51 2.0607 10.36 1.8007 8.87997C1.5407 7.40997 2.3707 5.86997 4.1307 4.56997C5.7407 3.36997 7.9907 2.46997 10.4707 2.03997C12.9407 1.59997 15.3607 1.67997 17.2907 2.24997C19.3907 2.87997 20.6907 4.02997 20.9507 5.50997C21.2107 6.97997 20.3807 8.51997 18.6207 9.81997C17.0107 11.02 14.7607 11.92 12.2807 12.35C11.2207 12.54 10.1707 12.63 9.1607 12.63ZM13.5807 3.25997C12.6607 3.25997 11.7007 3.34997 10.7207 3.51997C8.4707 3.91997 6.4507 4.71997 5.0207 5.77997C3.7607 6.71997 3.1207 7.74997 3.2707 8.62997C3.4207 9.50997 4.3807 10.26 5.8807 10.71C7.5907 11.22 9.7707 11.28 12.0107 10.88C14.2607 10.48 16.2807 9.67997 17.7107 8.61997C18.9707 7.67997 19.6107 6.64997 19.4607 5.76997C19.3107 4.88997 18.3507 4.13997 16.8507 3.68997C15.8907 3.39997 14.7707 3.25997 13.5807 3.25997Z" />
      <path d="M14.8101 17.44C13.8201 17.44 12.7801 17.35 11.7201 17.17C9.35009 16.75 7.19009 15.9 5.60009 14.77L5.39009 14.62C3.69009 13.36 2.85009 11.88 3.04009 10.45L3.14009 9.70995L4 10L4.53009 10.65C4.42009 11.47 5.00009 12.43 6.13009 13.31L6.30009 13.43C7.73009 14.5 9.75009 15.3 11.9901 15.7C15.4001 16.29 18.6601 15.81 20.0901 14.51C20.4601 14.18 20.6701 13.83 20.7301 13.45C20.9201 12.32 19.8201 10.95 17.8501 9.87995L17.1901 9.51995L18 8.5L18.5601 8.55995C21.1501 9.95995 22.5201 11.89 22.2101 13.7C22.0901 14.41 21.7201 15.06 21.1001 15.62C19.7901 16.8 17.4801 17.45 14.8201 17.45L14.8101 17.44Z" />
      <path d="M12.5305 22.25C7.08055 22.25 2.81055 19.95 2.81055 17.01C2.81055 15.61 3.76055 14.32 5.49055 13.36L6 13.5L6.88055 14.31L6.22055 14.67C4.99055 15.35 4.32055 16.18 4.32055 17.01C4.32055 18.78 7.70055 20.75 12.5405 20.75C17.3805 20.75 20.7605 18.78 20.7605 17.01C20.7605 16.52 20.5305 16.04 20.0705 15.57L19.5405 15.03L20.6105 13.98L21.1305 14.52C21.8605 15.27 22.2505 16.13 22.2505 17.01C22.2505 19.95 17.9805 22.25 12.5305 22.25Z" />
    </svg>
  )
}

/** 🪙 Coin — single coin (iconsax business/outline/coin). */
export function CoinOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z"
        fill="currentColor"
      />
      <path
        d="M12 10.18C11.59 10.18 11.25 9.83999 11.25 9.42999V8.57001C11.25 8.16001 11.59 7.82001 12 7.82001C12.41 7.82001 12.75 8.16001 12.75 8.57001V9.42999C12.75 9.83999 12.41 10.18 12 10.18Z"
        fill="currentColor"
      />
      <path
        d="M12 16.18C11.59 16.18 11.25 15.84 11.25 15.43V14.57C11.25 14.16 11.59 13.82 12 13.82C12.41 13.82 12.75 14.16 12.75 14.57V15.43C12.75 15.84 12.41 16.18 12 16.18Z"
        fill="currentColor"
      />
      <path
        d="M12.5103 15.33H11.5703C10.8803 15.33 10.2402 14.96 9.87024 14.35C9.65024 14 9.76024 13.54 10.1202 13.32C10.4802 13.1 10.9403 13.22 11.1503 13.57C11.2003 13.65 11.3403 13.83 11.5703 13.83H12.5103C12.7603 13.83 12.9603 13.63 12.9603 13.38C12.9603 13.18 12.8102 12.99 12.6102 12.94L11.0103 12.54C10.1303 12.31 9.53027 11.53 9.53027 10.64C9.53027 9.56 10.4102 8.69 11.4802 8.69H12.4302C13.1202 8.69 13.7302 9.04 14.1202 9.64C14.3402 9.99 14.2403 10.45 13.8903 10.68C13.5403 10.91 13.0802 10.8 12.8502 10.45C12.7702 10.33 12.6402 10.19 12.4202 10.19H11.4702C11.2302 10.19 11.0203 10.4 11.0203 10.64C11.0203 10.84 11.1702 11.03 11.3702 11.08L12.9702 11.48C13.8502 11.71 14.4503 12.49 14.4503 13.38C14.4603 14.46 13.5803 15.33 12.5103 15.33Z"
        fill="currentColor"
      />
      <path
        d="M15.6698 9.27998C15.4798 9.27998 15.2899 9.20998 15.1399 9.05998C14.8499 8.76998 14.8499 8.28999 15.1399 7.99999L15.8098 7.32999C16.0998 7.03999 16.5798 7.03999 16.8698 7.32999C17.1598 7.61999 17.1598 8.09999 16.8698 8.38999L16.1999 9.05998C16.0499 9.20998 15.8598 9.27998 15.6698 9.27998Z"
        fill="currentColor"
      />
      <path
        d="M7.66007 16.89C7.47007 16.89 7.2801 16.82 7.1301 16.67C6.8401 16.38 6.8401 15.9 7.1301 15.61L7.80008 14.94C8.09008 14.65 8.57008 14.65 8.86008 14.94C9.15008 15.23 9.15008 15.71 8.86008 16L8.1901 16.67C8.0401 16.82 7.85007 16.89 7.66007 16.89Z"
        fill="currentColor"
      />
      <path
        d="M8.5098 9.10001C8.3198 9.10001 8.12977 9.03001 7.97977 8.88001L7.30979 8.21001C7.01979 7.92001 7.01979 7.44 7.30979 7.15C7.59979 6.86 8.07978 6.86 8.36978 7.15L9.03977 7.82001C9.32977 8.11001 9.32977 8.59001 9.03977 8.88001C8.88977 9.03001 8.6998 9.10001 8.5098 9.10001Z"
        fill="currentColor"
      />
      <path
        d="M16.1601 17.07C15.9701 17.07 15.7802 17 15.6302 16.85L14.9602 16.18C14.6702 15.89 14.6702 15.41 14.9602 15.12C15.2502 14.83 15.7302 14.83 16.0202 15.12L16.6902 15.79C16.9802 16.08 16.9802 16.56 16.6902 16.85C16.5402 17 16.3501 17.07 16.1601 17.07Z"
        fill="currentColor"
      />
      <path
        d="M17.9998 12.75H17.0498C16.6398 12.75 16.2998 12.41 16.2998 12C16.2998 11.59 16.6398 11.25 17.0498 11.25H17.9998C18.4098 11.25 18.7498 11.59 18.7498 12C18.7498 12.41 18.4098 12.75 17.9998 12.75Z"
        fill="currentColor"
      />
      <path
        d="M6.95001 12.75H6C5.59 12.75 5.25 12.41 5.25 12C5.25 11.59 5.59 11.25 6 11.25H6.95001C7.36001 11.25 7.70001 11.59 7.70001 12C7.70001 12.41 7.36001 12.75 6.95001 12.75Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** 🎁 Gift — referral CTA (iconsax essential/outline/gift). */
export function GiftOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M17.2799 22.2496H6.71985C5.13985 22.2496 3.85986 20.9696 3.85986 19.3896V13.0596C3.85986 12.6496 4.19986 12.3096 4.60986 12.3096H19.3899C19.7999 12.3096 20.1399 12.6496 20.1399 13.0596V19.3896C20.1399 20.9696 18.8599 22.2496 17.2799 22.2496ZM5.35986 13.8096V19.3896C5.35986 20.1396 5.96985 20.7496 6.71985 20.7496H17.2799C18.0299 20.7496 18.6399 20.1396 18.6399 19.3896V13.8096H5.35986Z"
        fill="currentColor"
      />
      <path
        d="M19.39 13.8103H4.60999C3.02999 13.8103 1.75 12.6803 1.75 11.3003V9.54027C1.75 8.16027 3.02999 7.03027 4.60999 7.03027H19.39C20.97 7.03027 22.25 8.16027 22.25 9.54027V11.3003C22.25 12.6803 20.97 13.8103 19.39 13.8103ZM4.60999 8.53027C3.86999 8.53027 3.25 8.99027 3.25 9.54027V11.3003C3.25 11.8503 3.86999 12.3103 4.60999 12.3103H19.39C20.13 12.3103 20.75 11.8503 20.75 11.3003V9.54027C20.75 8.99027 20.13 8.53027 19.39 8.53027H4.60999Z"
        fill="currentColor"
      />
      <path
        d="M10.7301 8.52957C10.3201 8.52957 9.90006 8.46957 9.49006 8.38957C7.88006 8.07957 6.57009 6.97957 6.15009 5.58957C5.82009 4.48957 6.09009 3.40957 6.90009 2.60957C7.70009 1.81957 8.77005 1.56956 9.85005 1.89956C11.22 2.32956 12.3101 3.64957 12.6101 5.27957C12.7901 6.25957 12.8901 7.35958 12.2301 8.01958C11.8401 8.39958 11.3001 8.52957 10.7301 8.52957ZM8.93006 3.24957C8.62006 3.24957 8.28008 3.34957 7.95008 3.66957C7.43008 4.17957 7.47009 4.74956 7.58009 5.14956C7.84009 6.01957 8.70009 6.70957 9.77009 6.91957C10.9501 7.14957 11.15 6.96958 11.16 6.95958C11.17 6.94958 11.3501 6.74957 11.1301 5.55957C10.9301 4.47957 10.2401 3.59957 9.39008 3.33957C9.26008 3.27957 9.10006 3.24957 8.93006 3.24957Z"
        fill="currentColor"
      />
      <path
        d="M13.27 8.53004C12.7 8.53004 12.16 8.40005 11.77 8.02005C11.1 7.35005 11.2 6.26004 11.39 5.28004C11.69 3.66004 12.78 2.33004 14.15 1.90004C15.23 1.56004 16.2999 1.82004 17.0999 2.61004C17.9099 3.41004 18.1799 4.49004 17.8499 5.59004C17.4299 6.98004 16.12 8.08004 14.51 8.39004C14.1 8.46004 13.67 8.53004 13.27 8.53004ZM15.07 3.25004C14.9 3.25004 14.7399 3.28005 14.5999 3.33005C13.7499 3.60005 13.07 4.47005 12.86 5.55005C12.63 6.74005 12.82 6.95004 12.83 6.95004C12.84 6.95004 13.0399 7.14005 14.2199 6.91005C15.2899 6.70005 16.1499 6.01004 16.4099 5.14004C16.5299 4.75004 16.56 4.17005 16.04 3.66005C15.72 3.35005 15.38 3.25004 15.07 3.25004Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** ⚙ Settings — preferences (gear icon, the design lead 2026-05-06). */
export function SettingsOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12.8794V11.1194C2 10.0794 2.85 9.21945 3.9 9.21945C5.71 9.21945 6.45 7.93945 5.54 6.36945C5.02 5.46945 5.33 4.29945 6.24 3.77945L7.97 2.78945C8.76 2.31945 9.78 2.59945 10.25 3.38945L10.36 3.57945C11.26 5.14945 12.74 5.14945 13.65 3.57945L13.76 3.38945C14.23 2.59945 15.25 2.31945 16.04 2.78945L17.77 3.77945C18.68 4.29945 18.99 5.46945 18.47 6.36945C17.56 7.93945 18.3 9.21945 20.11 9.21945C21.15 9.21945 22.01 10.0694 22.01 11.1194V12.8794C22.01 13.9194 21.16 14.7794 20.11 14.7794C18.3 14.7794 17.56 16.0594 18.47 17.6294C18.99 18.5394 18.68 19.6994 17.77 20.2194L16.04 21.2094C15.25 21.6794 14.23 21.3994 13.76 20.6094L13.65 20.4194C12.75 18.8494 11.27 18.8494 10.36 20.4194L10.25 20.6094C9.78 21.3994 8.76 21.6794 7.97 21.2094L6.24 20.2194C5.33 19.6994 5.02 18.5294 5.54 17.6294C6.45 16.0594 5.71 14.7794 3.9 14.7794C2.85 14.7794 2 13.9194 2 12.8794Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** ⏻ Logout — sign out (iconsax arrow/linear/logout-02, the design lead 2026-05-06). */
export function LogoutOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M8.8999 7.56023C9.2099 3.96023 11.0599 2.49023 15.1099 2.49023H15.2399C19.7099 2.49023 21.4999 4.28023 21.4999 8.75023V15.2702C21.4999 19.7402 19.7099 21.5302 15.2399 21.5302H15.1099C11.0899 21.5302 9.2399 20.0802 8.9099 16.5402"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.0001 12H3.62012"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.85 8.65039L2.5 12.0004L5.85 15.3504"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * 🍪 Cookie — consent / privacy preferences glyph.
 *
 * Real iconsax `cookie/outline`: a round biscuit with a bitten/notched
 * top-right edge (the four chained cut-outs) and four chip dots inside.
 * Added 2026-06-04 for `<CookieBanner>` (the design lead approved adding
 * it to the shared set — single source for the consent surface).
 */
export function CookieOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M21.95 10.96C21.5 11.2 20.99 11.34 20.45 11.34C18.68 11.34 17.24 9.9 17.24 8.13C17.24 7.59 17.38 7.08 17.62 6.64C17.06 6.35 16.62 5.86 16.4 5.27C15.96 5.5 15.46 5.63 14.93 5.63C13.16 5.63 11.72 4.19 11.72 2.42C11.72 2.28 11.73 2.14 11.75 2.01C6.43 2.14 2.15 6.5 2.15 11.85C2.15 17.29 6.56 21.7 12 21.7C17.44 21.7 21.85 17.29 21.85 11.85C21.85 11.55 21.84 11.25 21.95 10.96Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 10.5H8.51"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 14.5H14.51"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 16H8.51"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 11.5H12.51"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * 📋 Copy — duplicate to clipboard.
 *
 * Real iconsax `copy/outline` (design-tools). Two rounded rectangles
 * where the foreground sits bottom-left and the background top-right.
 * Replaces the earlier mirrored variant (2026-05-19, the design lead audit).
 */
export function CopyOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M11.1 22.75H6.9C2.99 22.75 1.25 21.01 1.25 17.1V12.9C1.25 8.99 2.99 7.25 6.9 7.25H11.1C15.01 7.25 16.75 8.99 16.75 12.9V17.1C16.75 21.01 15.01 22.75 11.1 22.75ZM6.9 8.75C3.8 8.75 2.75 9.8 2.75 12.9V17.1C2.75 20.2 3.8 21.25 6.9 21.25H11.1C14.2 21.25 15.25 20.2 15.25 17.1V12.9C15.25 9.8 14.2 8.75 11.1 8.75H6.9Z" />
      <path d="M17.1 16.75H16C15.59 16.75 15.25 16.41 15.25 16V12.9C15.25 9.8 14.2 8.75 11.1 8.75H8C7.59 8.75 7.25 8.41 7.25 8V6.9C7.25 2.99 8.99 1.25 12.9 1.25H17.1C21.01 1.25 22.75 2.99 22.75 6.9V11.1C22.75 15.01 21.01 16.75 17.1 16.75ZM16.75 15.25H17.1C20.2 15.25 21.25 14.2 21.25 11.1V6.9C21.25 3.8 20.2 2.75 17.1 2.75H12.9C9.8 2.75 8.75 3.8 8.75 6.9V7.25H11.1C15.01 7.25 16.75 8.99 16.75 12.9V15.25Z" />
    </svg>
  )
}

/**
 * 🔗 Link — copy URL / external link (iconsax `link/outline`,
 * type-paragraph-character). Two horizontal capsules connected by a
 * short bar through the middle — the classic "web link" pictogram.
 * Used by chat MessageActions Copy-URL.
 */
export function LinkOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M16.5 18.25H14.99C14.58 18.25 14.24 17.91 14.24 17.5C14.24 17.09 14.58 16.75 14.99 16.75H16.5C19.12 16.75 21.25 14.62 21.25 12C21.25 9.38 19.12 7.25 16.5 7.25H15C14.59 7.25 14.25 6.91 14.25 6.5C14.25 6.09 14.58 5.75 15 5.75H16.5C19.95 5.75 22.75 8.55 22.75 12C22.75 15.45 19.95 18.25 16.5 18.25Z" />
      <path d="M9 18.25H7.5C4.05 18.25 1.25 15.45 1.25 12C1.25 8.55 4.05 5.75 7.5 5.75H9C9.41 5.75 9.75 6.09 9.75 6.5C9.75 6.91 9.41 7.25 9 7.25H7.5C4.88 7.25 2.75 9.38 2.75 12C2.75 14.62 4.88 16.75 7.5 16.75H9C9.41 16.75 9.75 17.09 9.75 17.5C9.75 17.91 9.41 18.25 9 18.25Z" />
      <path d="M16 12.75H8C7.59 12.75 7.25 12.41 7.25 12C7.25 11.59 7.59 11.25 8 11.25H16C16.41 11.25 16.75 11.59 16.75 12C16.75 12.41 16.41 12.75 16 12.75Z" />
    </svg>
  )
}

/** ✓ Check — copied confirmation / success / done. Bare full-size checkmark,
 *  no enclosing circle (ring removed 2026-06-27 (Val) — it shrank the tick).
 *  For the small selection tick use `TickOutline`. */
export function CheckOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M4 12.75L9.5 18.25L20 6.25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** ↑ Send-up — submit prompt / lift to composer (iconsax arrow/outline/up-5). */
export function SendUpOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12.0001 22.8606C11.5301 22.8606 11.1401 22.4806 11.1401 22.0006V2.00063C11.1401 1.53063 11.5201 1.14062 12.0001 1.14062C12.4801 1.14062 12.8601 1.52063 12.8601 2.00063V22.0006C12.8601 22.4706 12.4801 22.8606 12.0001 22.8606Z" />
      <path d="M17.3799 8.24008C17.1599 8.24008 16.9399 8.16008 16.7699 7.99008L11.9899 3.21008L7.20994 7.99008C6.87994 8.32008 6.32994 8.32008 5.99994 7.99008C5.66994 7.66008 5.66994 7.11008 5.99994 6.78008L11.3899 1.39008C11.7199 1.06008 12.2699 1.06008 12.5999 1.39008L17.9799 6.77008C18.3099 7.10008 18.3099 7.65008 17.9799 7.98008C17.8099 8.15008 17.5899 8.23008 17.3699 8.23008L17.3799 8.24008Z" />
    </svg>
  )
}

/**
 * ◻ Stop — halt streaming response. No direct iconsax outline match;
 * we reuse the rounded-square chrome from `essential/outline/edit-square`
 * (outer ring only) — clean, brand-consistent stop pictogram.
 */
export function StopOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17 22.75H7C3.83 22.75 1.25 20.17 1.25 17V7C1.25 3.83 3.83 1.25 7 1.25H17C20.17 1.25 22.75 3.83 22.75 7V17C22.75 20.17 20.17 22.75 17 22.75ZM7 2.75C4.66 2.75 2.75 4.66 2.75 7V17C2.75 19.34 4.66 21.25 7 21.25H17C19.34 21.25 21.25 19.34 21.25 17V7C21.25 4.66 19.34 2.75 17 2.75H7Z" />
    </svg>
  )
}

/**
 * ↺ Rotate-left — regenerate / retry.
 *
 * Real iconsax `rotate-left/outline` (arrow). Circular arrow loop with a
 * small inward arrow tip at the top-left signalling "go back / redo".
 * Replaces the earlier two-arc-with-line variant (2026-05-19, the design lead audit).
 */
export function RotateCcwOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 22.7496C6.79996 22.7496 2.57996 18.5196 2.57996 13.3296C2.57996 11.4596 3.12996 9.64965 4.16996 8.08965C4.39996 7.74965 4.86996 7.64965 5.20996 7.87965C5.54996 8.10965 5.64996 8.57965 5.41996 8.91965C4.54996 10.2196 4.08996 11.7496 4.08996 13.3196C4.08996 17.6896 7.63996 21.2396 12.01 21.2396C16.38 21.2396 19.93 17.6896 19.93 13.3196C19.93 8.94965 16.37 5.39965 12 5.39965C11.08 5.39965 10.18 5.52965 9.32996 5.78965C8.92996 5.90965 8.50996 5.68965 8.38996 5.28965C8.26996 4.88965 8.48996 4.46965 8.88996 4.34965C9.88996 4.04965 10.93 3.88965 12 3.88965C17.2 3.88965 21.42 8.11965 21.42 13.3096C21.42 18.4996 17.2 22.7496 12 22.7496Z" />
      <path d="M7.86999 6.07012C7.69999 6.07012 7.51999 6.01012 7.37999 5.89012C7.05999 5.61012 7.02999 5.14012 7.29999 4.83012L10.19 1.51012C10.46 1.20012 10.94 1.16012 11.25 1.44012C11.56 1.71012 11.59 2.19012 11.32 2.50012L8.42999 5.81012C8.27999 5.98012 8.06999 6.07012 7.86999 6.07012Z" />
      <path d="M11.24 8.53013C11.09 8.53013 10.93 8.48013 10.8 8.39013L7.41995 5.92013C7.08995 5.68013 7.01995 5.21013 7.25995 4.88013C7.49995 4.54013 7.96995 4.47013 8.30995 4.71013L11.68 7.17013C12.01 7.41013 12.09 7.88013 11.84 8.22013C11.7 8.43013 11.47 8.53013 11.24 8.53013Z" />
    </svg>
  )
}

/**
 * ✎ Edit-pencil — edit user message.
 *
 * Real iconsax `edit-2/outline` (content-edit). Diagonal pencil over a
 * horizontal underline rule. Replaces the earlier square-frame-with-
 * pencil variant (2026-05-19, the design lead audit). The export name stays
 * `EditPencilOutline` so existing imports don't churn.
 */
export function EditPencilOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M5.53999 19.5196C4.92999 19.5196 4.35999 19.3096 3.94999 18.9196C3.42999 18.4296 3.17999 17.6896 3.26999 16.8896L3.63999 13.6496C3.70999 13.0396 4.07999 12.2296 4.50999 11.7896L12.72 3.09956C14.77 0.929561 16.91 0.869561 19.08 2.91956C21.25 4.96956 21.31 7.10956 19.26 9.27956L11.05 17.9696C10.63 18.4196 9.84999 18.8396 9.23999 18.9396L6.01999 19.4896C5.84999 19.4996 5.69999 19.5196 5.53999 19.5196ZM15.93 2.90956C15.16 2.90956 14.49 3.38956 13.81 4.10956L5.59999 12.8096C5.39999 13.0196 5.16999 13.5196 5.12999 13.8096L4.75999 17.0496C4.71999 17.3796 4.79999 17.6496 4.97999 17.8196C5.15999 17.9896 5.42999 18.0496 5.75999 17.9996L8.97999 17.4496C9.26999 17.3996 9.74999 17.1396 9.94999 16.9296L18.16 8.23956C19.4 6.91956 19.85 5.69956 18.04 3.99956C17.24 3.22956 16.55 2.90956 15.93 2.90956Z" />
      <path d="M17.3399 10.9508C17.3199 10.9508 17.2899 10.9508 17.2699 10.9508C14.1499 10.6408 11.6399 8.27083 11.1599 5.17083C11.0999 4.76083 11.3799 4.38083 11.7899 4.31083C12.1999 4.25083 12.5799 4.53083 12.6499 4.94083C13.0299 7.36083 14.9899 9.22083 17.4299 9.46083C17.8399 9.50083 18.1399 9.87083 18.0999 10.2808C18.0499 10.6608 17.7199 10.9508 17.3399 10.9508Z" />
      <path d="M21 22.75H3C2.59 22.75 2.25 22.41 2.25 22C2.25 21.59 2.59 21.25 3 21.25H21C21.41 21.25 21.75 21.59 21.75 22C21.75 22.41 21.41 22.75 21 22.75Z" />
    </svg>
  )
}

/** ↓ Arrow-down — scroll-to-bottom FAB (iconsax arrow/outline/down-5). */
export function ArrowDownOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12.0001 22.8606C11.5301 22.8606 11.1401 22.4806 11.1401 22.0006V2.00063C11.1401 1.53063 11.5201 1.14062 12.0001 1.14062C12.4801 1.14062 12.8601 1.52063 12.8601 2.00063V22.0006C12.8601 22.4706 12.4801 22.8606 12.0001 22.8606Z" />
      <path d="M12.0002 22.8609C11.7802 22.8609 11.5602 22.7809 11.3902 22.6109L6.0102 17.2309C5.6802 16.9009 5.6802 16.3509 6.0102 16.0209C6.3402 15.6909 6.89019 15.6909 7.22019 16.0209L12.0002 20.8009L16.7802 16.0209C17.1102 15.6909 17.6602 15.6909 17.9902 16.0209C18.3202 16.3509 18.3202 16.9009 17.9902 17.2309L12.6102 22.6109C12.4402 22.7809 12.2202 22.8609 12.0002 22.8609Z" />
    </svg>
  )
}

/** ← Arrow-left — back / parent navigation (iconsax arrow/outline/left). */
export function ArrowLeftOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M22.0001 12.8606H2.00014C1.53014 12.8606 1.14014 12.4806 1.14014 12.0006C1.14014 11.5206 1.52014 11.1406 2.00014 11.1406H22.0001C22.4701 11.1406 22.8601 11.5206 22.8601 12.0006C22.8601 12.4806 22.4801 12.8606 22.0001 12.8606Z" />
      <path d="M7.38008 18.2409C7.16008 18.2409 6.94008 18.1609 6.77008 17.9909L1.39008 12.6109C1.06008 12.2809 1.06008 11.7309 1.39008 11.4009L6.77008 6.02094C7.11008 5.69094 7.65008 5.69094 7.98008 6.02094C8.31008 6.35094 8.31008 6.90094 7.98008 7.23094L3.20008 12.0109L7.98008 16.7909C8.31008 17.1209 8.31008 17.6709 7.98008 18.0009C7.81008 18.1709 7.59008 18.2509 7.37008 18.2509L7.38008 18.2409Z" />
    </svg>
  )
}

/** → Arrow-right — forward / continue (iconsax arrow/outline/arrow-right). */
export function ArrowRightOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M14.4301 18.8201C14.2401 18.8201 14.0501 18.7501 13.9001 18.6001C13.6101 18.3101 13.6101 17.8301 13.9001 17.5401L19.4401 12.0001L13.9001 6.46012C13.6101 6.17012 13.6101 5.69012 13.9001 5.40012C14.1901 5.11012 14.6701 5.11012 14.9601 5.40012L21.0301 11.4701C21.3201 11.7601 21.3201 12.2401 21.0301 12.5301L14.9601 18.6001C14.8101 18.7501 14.6201 18.8201 14.4301 18.8201Z" />
      <path d="M20.33 12.75H3.5C3.09 12.75 2.75 12.41 2.75 12C2.75 11.59 3.09 11.25 3.5 11.25H20.33C20.74 11.25 21.08 11.59 21.08 12C21.08 12.41 20.74 12.75 20.33 12.75Z" />
    </svg>
  )
}

/** ⓘ Info-circle — informational hint / advisory caption / Toast `info` icon
 *  (iconsax essential/outline/info-circle). Pure stroke variant (the design
 *  lead 2026-05-28 dedup — replaced the previous filled-paths variant. The
 *  separate `InfoCircleStroke` was removed; this is the single canonical
 *  info glyph). Visually identical at every size used in product. */
export function InfoCircleOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 25" fill="none" aria-hidden {...props}>
      <path
        d="M12 22.9102C17.5228 22.9102 22 18.433 22 12.9102C22 7.38731 17.5228 2.91016 12 2.91016C6.47715 2.91016 2 7.38731 2 12.9102C2 18.433 6.47715 22.9102 12 22.9102Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.99 8.2002H12.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.46 17.6202L13 17.5002C12.4 17.3502 11.98 16.8102 11.98 16.1902V12.3502C11.98 11.7102 11.53 11.1502 10.89 11.0202L10.54 10.9502"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** ⤴ Share — three-node share graph (iconsax essential/outline/share). */
export function ShareOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.6199 13.0703C20.2399 13.0703 19.9199 12.7803 19.8699 12.4003C19.6299 10.1403 18.4099 8.09035 16.5299 6.79035C16.1899 6.55035 16.1099 6.09035 16.3399 5.75035C16.5799 5.41035 17.0499 5.33035 17.3799 5.56035C19.6199 7.11035 21.0599 9.55035 21.3499 12.2403C21.3899 12.6503 21.0999 13.0203 20.6799 13.0703C20.6699 13.0703 20.6399 13.0703 20.6199 13.0703Z" />
      <path d="M3.48991 13.1193C3.45991 13.1193 3.43991 13.1193 3.40991 13.1193C2.99991 13.0693 2.69991 12.6993 2.73991 12.2893C3.00991 9.59928 4.43991 7.16928 6.64991 5.59928C6.98991 5.35928 7.45991 5.43928 7.69991 5.77928C7.93991 6.11928 7.85991 6.58928 7.51991 6.82928C5.65991 8.13928 4.45991 10.1893 4.22991 12.4493C4.19991 12.8293 3.86991 13.1193 3.48991 13.1193Z" />
      <path d="M12.06 22.61C10.58 22.61 9.16997 22.27 7.84997 21.61C7.47997 21.42 7.32997 20.97 7.51997 20.6C7.70997 20.23 8.15997 20.08 8.52997 20.27C10.69 21.36 13.29 21.38 15.47 20.33C15.84 20.15 16.29 20.31 16.47 20.68C16.65 21.05 16.49 21.5 16.12 21.68C14.84 22.3 13.48 22.61 12.06 22.61Z" />
      <path d="M12.06 8.44086C10.11 8.44086 8.53003 6.86086 8.53003 4.91086C8.53003 2.96086 10.11 1.38086 12.06 1.38086C14.01 1.38086 15.59 2.96086 15.59 4.91086C15.59 6.86086 14 8.44086 12.06 8.44086ZM12.06 2.89086C10.94 2.89086 10.03 3.80086 10.03 4.92086C10.03 6.04086 10.94 6.95086 12.06 6.95086C13.18 6.95086 14.09 6.04086 14.09 4.92086C14.09 3.80086 13.17 2.89086 12.06 2.89086Z" />
      <path d="M4.83005 20.6694C2.88005 20.6694 1.30005 19.0894 1.30005 17.1394C1.30005 15.1994 2.88005 13.6094 4.83005 13.6094C6.78005 13.6094 8.36005 15.1894 8.36005 17.1394C8.36005 19.0794 6.78005 20.6694 4.83005 20.6694ZM4.83005 15.1094C3.71005 15.1094 2.80005 16.0194 2.80005 17.1394C2.80005 18.2594 3.71005 19.1694 4.83005 19.1694C5.95005 19.1694 6.86005 18.2594 6.86005 17.1394C6.86005 16.0194 5.95005 15.1094 4.83005 15.1094Z" />
      <path d="M19.1699 20.6694C17.2199 20.6694 15.6399 19.0894 15.6399 17.1394C15.6399 15.1994 17.2199 13.6094 19.1699 13.6094C21.1199 13.6094 22.6999 15.1894 22.6999 17.1394C22.6899 19.0794 21.1099 20.6694 19.1699 20.6694ZM19.1699 15.1094C18.0499 15.1094 17.1399 16.0194 17.1399 17.1394C17.1399 18.2594 18.0499 19.1694 19.1699 19.1694C20.2899 19.1694 21.1999 18.2594 21.1999 17.1394C21.1899 16.0194 20.2899 15.1094 19.1699 15.1094Z" />
    </svg>
  )
}

/** ⌄ Chevron-down — dropdown / disclosure trigger (iconsax arrow/outline/arrow-down-1). */
export function ChevronDownOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M19.92 8.95L13.4 15.47C12.63 16.24 11.37 16.24 10.6 15.47L4.08 8.95"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** ▢│▢ Panels — generic "open editor panels" / sidebar / drawer affordance.
 *  Two stacked horizontal lanes inside a rounded square. Used by the
 *  mobile EditorActionFab to denote "the right panel is hiding here". */
export function PanelsOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 10V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/** 🖥️ Monitor — desktop computer with stand. Anchors the
 *  `<MobileStudioWarning>` "Best experience on PC" modal. */
export function MonitorOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 21h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 17v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/**
 * ☰ Wrap — toggle word-wrap in CodeBlock. Iconsax has no native wrap-glyph;
 * we use `essential/outline/text-align-right` (3 stacked text-lines inside a
 * box) as a wrap-affordance proxy — reads as "lines flowing inside a frame".
 */
export function WrapOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17.56 8.85998H12C11.59 8.85998 11.25 8.51998 11.25 8.10998C11.25 7.69998 11.59 7.35999 12 7.35999H17.56C17.97 7.35999 18.31 7.69998 18.31 8.10998C18.31 8.51998 17.97 8.85998 17.56 8.85998Z" />
      <path d="M17.5604 12.75H6.44043C6.03043 12.75 5.69043 12.41 5.69043 12C5.69043 11.59 6.03043 11.25 6.44043 11.25H17.5504C17.9604 11.25 18.3004 11.59 18.3004 12C18.3004 12.41 17.9604 12.75 17.5504 12.75H17.5604Z" />
      <path d="M12.0004 16.64H6.44043C6.03043 16.64 5.69043 16.3 5.69043 15.89C5.69043 15.48 6.03043 15.14 6.44043 15.14H12.0004C12.4104 15.14 12.7504 15.48 12.7504 15.89C12.7504 16.3 12.4104 16.64 12.0004 16.64Z" />
      <path d="M17 22.75H7C3.83 22.75 1.25 20.17 1.25 17V7C1.25 3.83 3.83 1.25 7 1.25H17C20.17 1.25 22.75 3.83 22.75 7V17C22.75 20.17 20.17 22.75 17 22.75ZM7 2.75C4.66 2.75 2.75 4.66 2.75 7V17C2.75 19.34 4.66 21.25 7 21.25H17C19.34 21.25 21.25 19.34 21.25 17V7C21.25 4.66 19.34 2.75 17 2.75H7Z" />
    </svg>
  )
}

/** ⛶ Maximize — fullscreen / expand affordance (iconsax video/outline/square-maximize — 4 corner arrows in rounded square). */
export function MaximizeOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M22.0001 9.42C21.5901 9.42 21.2501 9.08 21.2501 8.67V5C21.2501 3.76 20.2401 2.75 19.0001 2.75H15.3301C14.9201 2.75 14.5801 2.41 14.5801 2C14.5801 1.59 14.9201 1.25 15.3301 1.25H19.0001C21.0701 1.25 22.7501 2.93 22.7501 5V8.67C22.7501 9.08 22.4101 9.42 22.0001 9.42Z" />
      <path d="M8.67004 22.7501H5C2.93 22.7501 1.25 21.0701 1.25 19.0001V15.3301C1.25 14.9201 1.59 14.5801 2 14.5801C2.41 14.5801 2.75 14.9201 2.75 15.3301V19.0001C2.75 20.2401 3.76 21.2501 5 21.2501H8.67004C9.08004 21.2501 9.42004 21.5901 9.42004 22.0001C9.42004 22.4101 9.08004 22.7501 8.67004 22.7501Z" />
      <path d="M19.0001 22.7501H15.3301C14.9201 22.7501 14.5801 22.4101 14.5801 22.0001C14.5801 21.5901 14.9201 21.2501 15.3301 21.2501H19.0001C20.2401 21.2501 21.2501 20.2401 21.2501 19.0001V15.3301C21.2501 14.9201 21.5901 14.5801 22.0001 14.5801C22.4101 14.5801 22.7501 14.9201 22.7501 15.3301V19.0001C22.7501 21.0701 21.0701 22.7501 19.0001 22.7501Z" />
      <path d="M2 9.42C1.59 9.42 1.25 9.08 1.25 8.67V5C1.25 2.93 2.93 1.25 5 1.25H8.67004C9.08004 1.25 9.42004 1.59 9.42004 2C9.42004 2.41 9.08004 2.75 8.67004 2.75H5C3.76 2.75 2.75 3.76 2.75 5V8.67C2.75 9.08 2.41 9.42 2 9.42Z" />
      <path d="M18 9.75C17.59 9.75 17.25 9.41 17.25 9V6.75H15C14.59 6.75 14.25 6.41 14.25 6C14.25 5.59 14.59 5.25 15 5.25H18C18.41 5.25 18.75 5.59 18.75 6V9C18.75 9.41 18.41 9.75 18 9.75Z" />
      <path d="M14 10.7499C13.81 10.7499 13.6199 10.6799 13.4699 10.5299C13.1799 10.2399 13.1799 9.75994 13.4699 9.46994L17.4699 5.46994C17.7599 5.17994 18.24 5.17994 18.53 5.46994C18.82 5.75994 18.82 6.23994 18.53 6.52994L14.53 10.5299C14.38 10.6799 14.19 10.7499 14 10.7499Z" />
      <path d="M6 9.75C5.59 9.75 5.25 9.41 5.25 9V6C5.25 5.59 5.59 5.25 6 5.25H9C9.41 5.25 9.75 5.59 9.75 6C9.75 6.41 9.41 6.75 9 6.75H6.75V9C6.75 9.41 6.41 9.75 6 9.75Z" />
      <path d="M9.99997 10.7499C9.80997 10.7499 9.61994 10.6799 9.46994 10.5299L5.46994 6.52994C5.17994 6.23994 5.17994 5.75994 5.46994 5.46994C5.75994 5.17994 6.24 5.17994 6.53 5.46994L10.53 9.46994C10.82 9.75994 10.82 10.2399 10.53 10.5299C10.38 10.6799 10.19 10.7499 9.99997 10.7499Z" />
      <path d="M9 18.75H6C5.59 18.75 5.25 18.41 5.25 18V15C5.25 14.59 5.59 14.25 6 14.25C6.41 14.25 6.75 14.59 6.75 15V17.25H9C9.41 17.25 9.75 17.59 9.75 18C9.75 18.41 9.41 18.75 9 18.75Z" />
      <path d="M5.99997 18.7499C5.80997 18.7499 5.61994 18.6799 5.46994 18.5299C5.17994 18.2399 5.17994 17.7599 5.46994 17.4699L9.46994 13.4699C9.75994 13.1799 10.24 13.1799 10.53 13.4699C10.82 13.7599 10.82 14.2399 10.53 14.5299L6.53 18.5299C6.38 18.6799 6.18997 18.7499 5.99997 18.7499Z" />
      <path d="M18 18.75H15C14.59 18.75 14.25 18.41 14.25 18C14.25 17.59 14.59 17.25 15 17.25H17.25V15C17.25 14.59 17.59 14.25 18 14.25C18.41 14.25 18.75 14.59 18.75 15V18C18.75 18.41 18.41 18.75 18 18.75Z" />
      <path d="M18 18.7499C17.81 18.7499 17.6199 18.6799 17.4699 18.5299L13.4699 14.5299C13.1799 14.2399 13.1799 13.7599 13.4699 13.4699C13.7599 13.1799 14.24 13.1799 14.53 13.4699L18.53 17.4699C18.82 17.7599 18.82 18.2399 18.53 18.5299C18.38 18.6799 18.19 18.7499 18 18.7499Z" />
    </svg>
  )
}

/** ⛶ Expand — minimal outward expand (iconsax essential/outline/export).
 *  Rounded square + diagonal + two corner arrows. Distinct from
 *  `MaximizeOutline` (video/square-maximize, four corners). */
export function ExpandOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H15C20.43 1.25 22.75 3.57 22.75 9V15C22.75 20.43 20.43 22.75 15 22.75ZM9 2.75C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V9C21.25 4.39 19.61 2.75 15 2.75H9Z" />
      <path d="M5.99994 18.7495C5.80994 18.7495 5.61994 18.6795 5.46994 18.5295C5.17994 18.2395 5.17994 17.7595 5.46994 17.4695L17.4699 5.46945C17.7599 5.17945 18.2399 5.17945 18.5299 5.46945C18.8199 5.75945 18.8199 6.23945 18.5299 6.52945L6.52994 18.5295C6.37994 18.6795 6.18994 18.7495 5.99994 18.7495Z" />
      <path d="M18 10.75C17.59 10.75 17.25 10.41 17.25 10V6.75H14C13.59 6.75 13.25 6.41 13.25 6C13.25 5.59 13.59 5.25 14 5.25H18C18.41 5.25 18.75 5.59 18.75 6V10C18.75 10.41 18.41 10.75 18 10.75Z" />
      <path d="M10 18.75H6C5.59 18.75 5.25 18.41 5.25 18V14C5.25 13.59 5.59 13.25 6 13.25C6.41 13.25 6.75 13.59 6.75 14V17.25H10C10.41 17.25 10.75 17.59 10.75 18C10.75 18.41 10.41 18.75 10 18.75Z" />
    </svg>
  )
}

/** ✦ More-horizontal — kebab trailing action button.
 *
 * Three filled dots (no rounded-square frame). Iconsax has `3-dots-more`
 * in outline (hollow rings) + bold/bulk (dots wrapped in a rounded-square
 * container). Plain "filled dots, no frame" doesn't exist in their set,
 * so this icon redraws the geometry: 3 circles at cx 5/12/19, cy 12,
 * r 1.5 (matches Iconsax's 1.5px stroke weight when rendered filled).
 * Kept in this file (and named `…Outline`) so existing imports stay
 * stable; the visual is filled by design per the design lead 2026-05-19. */
export function MoreHorizontalOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <circle cx="5" cy="12" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="19" cy="12" r="1.75" />
    </svg>
  )
}

/**
 * ⠿ Drag handle — the canonical 2×3-dot grip affordance for reorderable
 * rows / cards (replaces the fragile literal braille glyph `⠿`). Same
 * `<circle fill="currentColor">` convention as MoreHorizontalOutline so it
 * tree-shakes and inherits colour + size from the wrapper.
 */
export function DragHandleOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <circle cx="9" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" />
      <circle cx="15" cy="6" r="1.6" />
      <circle cx="15" cy="12" r="1.6" />
      <circle cx="15" cy="18" r="1.6" />
    </svg>
  )
}

/** ✦ Trash — archive / soft-delete on card hover-actions (NOT hard delete in MVP). */
export function TrashOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M20.9999 6.73046C20.9799 6.73046 20.9499 6.73046 20.9199 6.73046C15.6299 6.20046 10.3499 6.00046 5.11992 6.53046L3.07992 6.73046C2.65992 6.77046 2.28992 6.47046 2.24992 6.05046C2.20992 5.63046 2.50992 5.27046 2.91992 5.23046L4.95992 5.03046C10.2799 4.49046 15.6699 4.70046 21.0699 5.23046C21.4799 5.27046 21.7799 5.64046 21.7399 6.05046C21.7099 6.44046 21.3799 6.73046 20.9999 6.73046Z"
        fill="currentColor"
      />
      <path
        d="M8.50001 5.72C8.46001 5.72 8.42001 5.72 8.37001 5.71C7.97001 5.64 7.69001 5.25 7.76001 4.85L7.98001 3.54C8.14001 2.58 8.36001 1.25 10.69 1.25H13.31C15.65 1.25 15.87 2.63 16.02 3.55L16.24 4.85C16.31 5.26 16.03 5.65 15.63 5.71C15.22 5.78 14.83 5.5 14.77 5.1L14.55 3.8C14.41 2.93 14.38 2.76 13.32 2.76H10.7C9.64001 2.76 9.62001 2.9 9.47001 3.79L9.24001 5.09C9.18001 5.46 8.86001 5.72 8.50001 5.72Z"
        fill="currentColor"
      />
      <path
        d="M15.2099 22.7496H8.7899C5.2999 22.7496 5.1599 20.8196 5.0499 19.2596L4.3999 9.18959C4.3699 8.77959 4.6899 8.41959 5.0999 8.38959C5.5199 8.36959 5.8699 8.67959 5.8999 9.08959L6.5499 19.1596C6.6599 20.6796 6.6999 21.2496 8.7899 21.2496H15.2099C17.3099 21.2496 17.3499 20.6796 17.4499 19.1596L18.0999 9.08959C18.1299 8.67959 18.4899 8.36959 18.8999 8.38959C19.3099 8.41959 19.6299 8.76959 19.5999 9.18959L18.9499 19.2596C18.8399 20.8196 18.6999 22.7496 15.2099 22.7496Z"
        fill="currentColor"
      />
      <path
        d="M13.6601 17.25H10.3301C9.92008 17.25 9.58008 16.91 9.58008 16.5C9.58008 16.09 9.92008 15.75 10.3301 15.75H13.6601C14.0701 15.75 14.4101 16.09 14.4101 16.5C14.4101 16.91 14.0701 17.25 13.6601 17.25Z"
        fill="currentColor"
      />
      <path
        d="M14.5 13.25H9.5C9.09 13.25 8.75 12.91 8.75 12.5C8.75 12.09 9.09 11.75 9.5 11.75H14.5C14.91 11.75 15.25 12.09 15.25 12.5C15.25 12.91 14.91 13.25 14.5 13.25Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** ✕ Close — cancel / dismiss / error indicator. Bare full-size cross, no
 *  enclosing circle (ring removed 2026-06-27 (Val) — it shrank the ✕). Used by
 *  selection-mode toolbar Cancel + Toast `error` icon. For a lighter close use `XOutline`. */
export function CloseCircleOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M5.5 5.5L18.5 18.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 5.5L5.5 18.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// === Canvas icons (added 2026-05-09 with Stage 3 atoms) ============================

/**
 * ✋ Hand / Pan — canvas pan tool. NO Iconsax outline match for hand-glyph;
 * custom geometric placeholder: 4 fingers + thumb on a rounded palm,
 * 1.5px stroke, drawn at the same proportions as other outline icons
 * (24×24 viewBox, mid-weight stroke). Visual review pending the design lead.
 */
export function HandOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      {/* index finger */}
      <path
        d="M9 11V5.5a1.25 1.25 0 0 1 2.5 0V11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* middle finger */}
      <path
        d="M11.5 11V4.25a1.25 1.25 0 0 1 2.5 0V11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* ring finger */}
      <path
        d="M14 11V5.5a1.25 1.25 0 0 1 2.5 0V11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* pinky + palm + thumb */}
      <path
        d="M16.5 11.5V8a1.25 1.25 0 0 1 2.5 0v8a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-5.196-3l-2.95-5.111a1.25 1.25 0 0 1 2.165-1.25L7 14.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** 🗒 Sticky-note — canvas sticky/text node (iconsax content-edit/outline/stickynote). */
export function StickyNoteOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M8 5.75C7.59 5.75 7.25 5.41 7.25 5V2C7.25 1.59 7.59 1.25 8 1.25C8.41 1.25 8.75 1.59 8.75 2V5C8.75 5.41 8.41 5.75 8 5.75Z" />
      <path d="M16 5.75C15.59 5.75 15.25 5.41 15.25 5V2C15.25 1.59 15.59 1.25 16 1.25C16.41 1.25 16.75 1.59 16.75 2V5C16.75 5.41 16.41 5.75 16 5.75Z" />
      <path d="M15 11.75H7C6.59 11.75 6.25 11.41 6.25 11C6.25 10.59 6.59 10.25 7 10.25H15C15.41 10.25 15.75 10.59 15.75 11C15.75 11.41 15.41 11.75 15 11.75Z" />
      <path d="M12 15.75H7C6.59 15.75 6.25 15.41 6.25 15C6.25 14.59 6.59 14.25 7 14.25H12C12.41 14.25 12.75 14.59 12.75 15C12.75 15.41 12.41 15.75 12 15.75Z" />
      <path d="M15 22.75H9C3.38 22.75 2.25 20.1 2.25 15.82V9.65C2.25 4.91 3.85 2.98 7.96 2.75H16C20.15 2.98 21.75 4.91 21.75 9.65V16C21.75 16.41 21.41 16.75 21 16.75C20.59 16.75 20.25 16.41 20.25 16V9.65C20.25 5.29 18.8 4.41 15.96 4.25H8C5.2 4.41 3.75 5.29 3.75 9.65V15.82C3.75 19.65 4.48 21.25 9 21.25H15C15.41 21.25 15.75 21.59 15.75 22C15.75 22.41 15.41 22.75 15 22.75Z" />
      <path d="M15 22.75C14.9 22.75 14.81 22.73 14.71 22.69C14.43 22.57 14.25 22.3 14.25 22V19C14.25 16.58 15.58 15.25 18 15.25H21C21.3 15.25 21.58 15.43 21.69 15.71C21.81 15.99 21.74 16.31 21.53 16.53L15.53 22.53C15.39 22.67 15.2 22.75 15 22.75ZM18 16.75C16.42 16.75 15.75 17.42 15.75 19V20.19L19.19 16.75H18Z" />
    </svg>
  )
}

/**
 * 🖼 Frame — canvas frame / group node (iconsax location/outline/picture-frame).
 * NOTE: glyph reads as "picture-on-easel" (rounded square with diagonal slash),
 * not strictly a frame container. Closest available outline-frame in Iconsax;
 * flag for visual review against `<NodeFrame>` group affordance.
 */
export function FrameOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H15C20.43 1.25 22.75 3.57 22.75 9V15C22.75 20.43 20.43 22.75 15 22.75ZM9 2.75C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V9C21.25 4.39 19.61 2.75 15 2.75H9Z" />
      <path d="M13.9501 22.7507C13.6101 22.7507 13.31 22.5207 13.22 22.1807L8.2701 2.18067C8.1701 1.78067 8.42009 1.37068 8.82009 1.27068C9.22009 1.17068 9.63006 1.41068 9.73006 1.82068L14.6801 21.8207C14.7801 22.2207 14.5301 22.6307 14.1301 22.7307C14.0701 22.7407 14.0101 22.7507 13.9501 22.7507Z" />
      <path d="M1.99985 15.7506C1.66985 15.7506 1.37988 15.5406 1.27988 15.2106C1.15988 14.8106 1.38983 14.4006 1.78983 14.2806L11.3199 11.5006C11.7199 11.3806 12.1299 11.6106 12.2499 12.0106C12.3699 12.4106 12.1398 12.8206 11.7398 12.9406L2.20987 15.7206C2.13987 15.7406 2.06985 15.7506 1.99985 15.7506Z" />
    </svg>
  )
}

/** ↪ Redo — redo last action (iconsax arrow/outline/redo-arrow). */
export function RedoOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M16.87 19.0596H8.87C5.7 19.0596 3.12 16.4796 3.12 13.3096C3.12 10.1396 5.7 7.55957 8.87 7.55957H19.87C20.28 7.55957 20.62 7.89957 20.62 8.30957C20.62 8.71957 20.28 9.05957 19.87 9.05957H8.87C6.53 9.05957 4.62 10.9696 4.62 13.3096C4.62 15.6496 6.53 17.5596 8.87 17.5596H16.87C17.28 17.5596 17.62 17.8996 17.62 18.3096C17.62 18.7196 17.29 19.0596 16.87 19.0596Z" />
      <path d="M17.57 11.5599C17.38 11.5599 17.19 11.4899 17.04 11.3399C16.75 11.0499 16.75 10.5699 17.04 10.2799L19.07 8.24988L17.04 6.21988C16.75 5.92988 16.75 5.44988 17.04 5.15988C17.33 4.86988 17.81 4.86988 18.1 5.15988L20.66 7.71988C20.95 8.00988 20.95 8.48988 20.66 8.77988L18.1 11.3399C17.95 11.4899 17.76 11.5599 17.57 11.5599Z" />
    </svg>
  )
}

/**
 * 📤 Gallery-export — copy / export image out of the surface.
 *
 * Real iconsax `gallery-export/outline` (video-audio-image). Photo frame
 * (with sun dot in the corner) plus a small up-arrow stub denoting
 * "send out / export". Used by chat MessageActions Copy-image.
 */
export function GalleryExportOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M9 10.75C7.48 10.75 6.25 9.52 6.25 8C6.25 6.48 7.48 5.25 9 5.25C10.52 5.25 11.75 6.48 11.75 8C11.75 9.52 10.52 10.75 9 10.75ZM9 6.75C8.31 6.75 7.75 7.31 7.75 8C7.75 8.69 8.31 9.25 9 9.25C9.69 9.25 10.25 8.69 10.25 8C10.25 7.31 9.69 6.75 9 6.75Z" />
      <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H13C13.41 1.25 13.75 1.59 13.75 2C13.75 2.41 13.41 2.75 13 2.75H9C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V10C21.25 9.59 21.59 9.25 22 9.25C22.41 9.25 22.75 9.59 22.75 10V15C22.75 20.43 20.43 22.75 15 22.75Z" />
      <path d="M18 8.74994C17.59 8.74994 17.25 8.40994 17.25 7.99994V1.99994C17.25 1.69994 17.43 1.41994 17.71 1.30994C17.99 1.19994 18.31 1.25994 18.53 1.46994L20.53 3.46994C20.82 3.75994 20.82 4.23994 20.53 4.52994C20.24 4.81994 19.76 4.81994 19.47 4.52994L18.75 3.80994V7.99994C18.75 8.40994 18.41 8.74994 18 8.74994Z" />
      <path d="M15.9999 4.75043C15.8099 4.75043 15.6199 4.68043 15.4699 4.53043C15.1799 4.24043 15.1799 3.76043 15.4699 3.47043L17.4699 1.47043C17.7599 1.18043 18.2399 1.18043 18.5299 1.47043C18.8199 1.76043 18.8199 2.24043 18.5299 2.53043L16.5299 4.53043C16.3799 4.68043 16.1899 4.75043 15.9999 4.75043Z" />
      <path d="M2.67005 19.6996C2.43005 19.6996 2.19005 19.5796 2.05005 19.3696C1.82005 19.0296 1.91005 18.5596 2.25005 18.3296L7.18005 15.0196C8.26005 14.2996 9.75005 14.3796 10.73 15.2096L11.06 15.4996C11.56 15.9296 12.41 15.9296 12.9 15.4996L17.06 11.9296C18.12 11.0196 19.7901 11.0196 20.8601 11.9296L22.49 13.3296C22.8 13.5996 22.84 14.0696 22.57 14.3896C22.3 14.6996 21.82 14.7396 21.51 14.4696L19.88 13.0696C19.38 12.6396 18.5401 12.6396 18.0401 13.0696L13.88 16.6396C12.82 17.5496 11.15 17.5496 10.08 16.6396L9.75005 16.3496C9.29005 15.9596 8.53005 15.9196 8.02005 16.2696L3.10005 19.5796C2.96005 19.6596 2.81005 19.6996 2.67005 19.6996Z" />
    </svg>
  )
}

/** 🖼 Image — image node / image generation (iconsax video-audio-image/outline/image). */
export function ImageOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.3601 22.7504H5.59011C4.07011 22.7504 2.68011 21.9804 1.88011 20.6804C1.08011 19.3804 1.01011 17.8004 1.69011 16.4304L3.41011 12.9804C3.97011 11.8604 4.87011 11.1604 5.88011 11.0504C6.89011 10.9404 7.92011 11.4404 8.70011 12.4104L8.92011 12.6904C9.36011 13.2304 9.87011 13.5204 10.3701 13.4704C10.8701 13.4304 11.3301 13.0704 11.6701 12.4604L13.5601 9.05042C14.3401 7.64042 15.3801 6.91041 16.5101 6.96041C17.6301 7.02041 18.5901 7.86041 19.2301 9.34042L22.3601 16.6504C22.9401 18.0004 22.8001 19.5404 21.9901 20.7704C21.1901 22.0204 19.8301 22.7504 18.3601 22.7504ZM6.16011 12.5504C6.12011 12.5504 6.08011 12.5504 6.04011 12.5604C5.54011 12.6104 5.08011 13.0104 4.75011 13.6604L3.03011 17.1104C2.58011 18.0004 2.63011 19.0504 3.15011 19.9004C3.67011 20.7504 4.59011 21.2604 5.59011 21.2604H18.3501C19.3301 21.2604 20.2001 20.7904 20.7401 19.9704C21.2801 19.1504 21.3701 18.1704 20.9801 17.2704L17.8501 9.96041C17.4701 9.06041 16.9401 8.51041 16.4301 8.49041C15.9601 8.46041 15.3501 8.96042 14.8701 9.81042L12.9801 13.2204C12.4001 14.2604 11.4901 14.9104 10.5001 15.0004C9.51011 15.0804 8.50011 14.6004 7.75011 13.6604L7.53011 13.3804C7.11011 12.8304 6.63011 12.5504 6.16011 12.5504Z" />
      <path d="M6.96997 8.75C4.90997 8.75 3.21997 7.07 3.21997 5C3.21997 2.93 4.89997 1.25 6.96997 1.25C9.03997 1.25 10.72 2.93 10.72 5C10.72 7.07 9.03997 8.75 6.96997 8.75ZM6.96997 2.75C5.72997 2.75 4.71997 3.76 4.71997 5C4.71997 6.24 5.72997 7.25 6.96997 7.25C8.20997 7.25 9.21997 6.24 9.21997 5C9.21997 3.76 8.20997 2.75 6.96997 2.75Z" />
    </svg>
  )
}

/** 🎬 Video — video node / video generation (iconsax video-audio-image/outline/video-play). */
export function VideoOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H15C20.43 1.25 22.75 3.57 22.75 9V15C22.75 20.43 20.43 22.75 15 22.75ZM9 2.75C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V9C21.25 4.39 19.61 2.75 15 2.75H9Z" />
      <path d="M21.48 7.86035H2.52002C2.11002 7.86035 1.77002 7.52035 1.77002 7.11035C1.77002 6.70035 2.10002 6.36035 2.52002 6.36035H21.48C21.89 6.36035 22.23 6.70035 22.23 7.11035C22.23 7.52035 21.9 7.86035 21.48 7.86035Z" />
      <path d="M8.52002 7.72035C8.11002 7.72035 7.77002 7.38035 7.77002 6.97035V2.11035C7.77002 1.70035 8.11002 1.36035 8.52002 1.36035C8.93002 1.36035 9.27002 1.70035 9.27002 2.11035V6.97035C9.27002 7.38035 8.93002 7.72035 8.52002 7.72035Z" />
      <path d="M15.48 7.27035C15.07 7.27035 14.73 6.93035 14.73 6.52035V2.11035C14.73 1.70035 15.07 1.36035 15.48 1.36035C15.89 1.36035 16.23 1.70035 16.23 2.11035V6.52035C16.23 6.94035 15.9 7.27035 15.48 7.27035Z" />
      <path d="M11.09 18.1203C10.73 18.1203 10.39 18.0303 10.08 17.8603C9.4 17.4603 9 16.6603 9 15.6503V13.2503C9 12.2403 9.4 11.4303 10.09 11.0303C10.78 10.6303 11.68 10.6903 12.55 11.2003L14.63 12.4003C15.5 12.9003 16.01 13.6503 16.01 14.4503C16.01 15.2503 15.5 16.0003 14.62 16.5003L12.54 17.7003C12.06 17.9803 11.56 18.1203 11.09 18.1203ZM11.1 12.2703C11 12.2703 10.91 12.2903 10.84 12.3303C10.63 12.4503 10.5 12.7903 10.5 13.2503V15.6503C10.5 16.1003 10.63 16.4403 10.84 16.5703C11.05 16.6903 11.41 16.6303 11.8 16.4003L13.88 15.2003C14.27 14.9703 14.51 14.6903 14.51 14.4503C14.51 14.2103 14.28 13.9303 13.88 13.7003L11.8 12.5003C11.54 12.3503 11.29 12.2703 11.1 12.2703Z" />
    </svg>
  )
}

/** 📝 Text — text node / chat modality marker (iconsax content-edit/outline/document-text). */
export function TextOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M16 22.75H8C4.35 22.75 2.25 20.65 2.25 17V7C2.25 3.35 4.35 1.25 8 1.25H16C19.65 1.25 21.75 3.35 21.75 7V17C21.75 20.65 19.65 22.75 16 22.75ZM8 2.75C5.14 2.75 3.75 4.14 3.75 7V17C3.75 19.86 5.14 21.25 8 21.25H16C18.86 21.25 20.25 19.86 20.25 17V7C20.25 4.14 18.86 2.75 16 2.75H8Z" />
      <path d="M18.5 9.25H16.5C14.98 9.25 13.75 8.02 13.75 6.5V4.5C13.75 4.09 14.09 3.75 14.5 3.75C14.91 3.75 15.25 4.09 15.25 4.5V6.5C15.25 7.19 15.81 7.75 16.5 7.75H18.5C18.91 7.75 19.25 8.09 19.25 8.5C19.25 8.91 18.91 9.25 18.5 9.25Z" />
      <path d="M12 13.75H8C7.59 13.75 7.25 13.41 7.25 13C7.25 12.59 7.59 12.25 8 12.25H12C12.41 12.25 12.75 12.59 12.75 13C12.75 13.41 12.41 13.75 12 13.75Z" />
      <path d="M16 17.75H8C7.59 17.75 7.25 17.41 7.25 17C7.25 16.59 7.59 16.25 8 16.25H16C16.41 16.25 16.75 16.59 16.75 17C16.75 17.41 16.41 17.75 16 17.75Z" />
    </svg>
  )
}

/**
 * 🎵 Audio — audio node / sound generation. NOTE: substituted from plan's
 * `audio` (no exact glyph) to `iconsax video-audio-image/outline/music`
 * — note + flag, reads as "music / audio source".
 */
export function AudioOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M6.27991 22.7498C4.14991 22.7498 2.40991 21.0098 2.40991 18.8798C2.40991 16.7498 4.14991 15.0098 6.27991 15.0098C8.40991 15.0098 10.1499 16.7498 10.1499 18.8798C10.1499 21.0098 8.40991 22.7498 6.27991 22.7498ZM6.27991 16.5098C4.96991 16.5098 3.90991 17.5698 3.90991 18.8798C3.90991 20.1898 4.96991 21.2498 6.27991 21.2498C7.58991 21.2498 8.64991 20.1898 8.64991 18.8798C8.64991 17.5698 7.58991 16.5098 6.27991 16.5098Z" />
      <path d="M9.3999 19.6296C8.9899 19.6296 8.6499 19.2896 8.6499 18.8796V6.29964C8.6499 4.71964 9.5999 3.47964 11.1199 3.06964L17.3599 1.36964C18.6299 1.01964 19.6999 1.14964 20.4499 1.72964C21.2099 2.30964 21.5899 3.27964 21.5899 4.60964V16.8096C21.5899 17.2196 21.2499 17.5596 20.8399 17.5596C20.4299 17.5596 20.0899 17.2196 20.0899 16.8096V4.59964C20.0899 4.01964 19.9899 3.25964 19.5399 2.91964C19.0499 2.53964 18.2099 2.68964 17.7499 2.81964L11.5099 4.51964C10.6399 4.75964 10.1499 5.40964 10.1499 6.30964V18.8896C10.1499 19.2896 9.8099 19.6296 9.3999 19.6296Z" />
      <path d="M17.7201 20.6697C15.5901 20.6697 13.8501 18.9297 13.8501 16.7997C13.8501 14.6697 15.5901 12.9297 17.7201 12.9297C19.8501 12.9297 21.5901 14.6697 21.5901 16.7997C21.5901 18.9297 19.8501 20.6697 17.7201 20.6697ZM17.7201 14.4297C16.4101 14.4297 15.3501 15.4897 15.3501 16.7997C15.3501 18.1097 16.4101 19.1697 17.7201 19.1697C19.0301 19.1697 20.0901 18.1097 20.0901 16.7997C20.0901 15.4897 19.0301 14.4297 17.7201 14.4297Z" />
      <path d="M9.40005 10.2703C9.07005 10.2703 8.77005 10.0503 8.68005 9.72027C8.57005 9.32027 8.80005 8.90027 9.20005 8.79027L20.64 5.67027C21.04 5.56027 21.45 5.80027 21.56 6.20027C21.67 6.60027 21.43 7.01027 21.03 7.12027L9.60005 10.2403C9.53005 10.2603 9.46005 10.2703 9.40005 10.2703Z" />
    </svg>
  )
}

/**
 * 🎤 Microphone — voice dictation trigger (iconsax video-audio-image/outline/
 * microphone). Capsule mic + stand arc + two sound lines. The idle glyph for
 * the VoiceDictation composer button (speech → editable text).
 */
export function MicrophoneOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 19.75C8.28 19.75 5.25 16.72 5.25 13V8C5.25 4.28 8.28 1.25 12 1.25C15.72 1.25 18.75 4.28 18.75 8V13C18.75 16.72 15.72 19.75 12 19.75ZM12 2.75C9.11 2.75 6.75 5.1 6.75 8V13C6.75 15.9 9.11 18.25 12 18.25C14.89 18.25 17.25 15.9 17.25 13V8C17.25 5.1 14.89 2.75 12 2.75Z" />
      <path d="M12 22.75C6.62 22.75 2.25 18.38 2.25 13V11C2.25 10.59 2.59 10.25 3 10.25C3.41 10.25 3.75 10.59 3.75 11V13C3.75 17.55 7.45 21.25 12 21.25C16.55 21.25 20.25 17.55 20.25 13V11C20.25 10.59 20.59 10.25 21 10.25C21.41 10.25 21.75 10.59 21.75 11V13C21.75 18.38 17.38 22.75 12 22.75Z" />
      <path d="M14.6101 8.22988C14.5301 8.22988 14.4401 8.21988 14.3501 8.18988C12.7401 7.60988 10.9701 7.60988 9.36012 8.18988C8.98012 8.32988 8.55012 8.12988 8.41012 7.73988C8.27012 7.34988 8.47012 6.91988 8.86012 6.77988C10.8001 6.07988 12.9301 6.07988 14.8701 6.77988C15.2601 6.91988 15.4601 7.34988 15.3201 7.73988C15.2101 8.04988 14.9201 8.22988 14.6101 8.22988Z" />
      <path d="M13.6999 11.2305C13.6399 11.2305 13.5699 11.2205 13.4999 11.2005C12.4299 10.9105 11.2999 10.9105 10.2299 11.2005C9.81992 11.3105 9.41992 11.0705 9.30992 10.6705C9.19992 10.2705 9.43992 9.86047 9.83992 9.75047C11.1699 9.39047 12.5699 9.39047 13.8999 9.75047C14.2999 9.86047 14.5399 10.2705 14.4299 10.6705C14.3299 11.0205 14.0299 11.2305 13.6999 11.2305Z" />
    </svg>
  )
}

/**
 * 🎤̸ Microphone-slash — mic access denied / muted (iconsax video-audio-image/
 * outline/microphone-slash). Mic + diagonal slash. Error / permission-denied
 * state for VoiceDictation.
 */
export function MicrophoneSlashOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M7.39 17.59C7.18 17.59 6.96 17.5 6.81 17.32C5.8 16.11 5.25 14.58 5.25 13V8C5.25 4.28 8.28 1.25 12 1.25C15.1 1.25 17.79 3.35 18.55 6.35C18.65 6.75 18.41 7.16 18.01 7.26C17.62 7.36 17.2 7.12 17.1 6.72C16.5 4.38 14.41 2.75 12 2.75C9.11 2.75 6.75 5.1 6.75 8V13C6.75 14.23 7.18 15.42 7.96 16.36C8.23 16.68 8.18 17.15 7.86 17.42C7.73 17.53 7.56 17.59 7.39 17.59Z" />
      <path d="M12.0001 19.7505C11.1901 19.7505 10.4001 19.6105 9.66008 19.3305C9.27008 19.1905 9.07008 18.7505 9.22008 18.3705C9.36008 17.9805 9.80008 17.7805 10.1801 17.9305C10.7601 18.1505 11.3801 18.2605 12.0001 18.2605C14.8901 18.2605 17.2501 15.9105 17.2501 13.0105V9.98047C17.2501 9.57047 17.5901 9.23047 18.0001 9.23047C18.4101 9.23047 18.7501 9.57047 18.7501 9.98047V13.0005C18.7501 16.7205 15.7201 19.7505 12.0001 19.7505Z" />
      <path d="M11.9999 22.7502C9.5199 22.7502 7.1599 21.8202 5.3499 20.1302C5.0499 19.8502 5.0299 19.3702 5.3099 19.0702C5.5899 18.7702 6.0699 18.7502 6.3699 19.0302C7.8999 20.4602 9.8999 21.2402 11.9899 21.2402C16.5399 21.2402 20.2399 17.5402 20.2399 12.9902V10.9902C20.2399 10.5802 20.5799 10.2402 20.9899 10.2402C21.3999 10.2402 21.7399 10.5802 21.7399 10.9902V12.9902C21.7499 18.3802 17.3799 22.7502 11.9999 22.7502Z" />
      <path d="M2.49994 22.7397C2.30994 22.7397 2.11994 22.6697 1.96994 22.5197C1.67994 22.2297 1.67994 21.7497 1.96994 21.4597L20.9699 2.45969C21.2599 2.16969 21.7399 2.16969 22.0299 2.45969C22.3199 2.74969 22.3199 3.22969 22.0299 3.51969L3.02994 22.5197C2.87994 22.6697 2.68994 22.7397 2.49994 22.7397Z" />
      <path d="M11.55 6.24977C11.14 6.24977 10.8 5.90977 10.8 5.49977V2.25977C10.8 1.84977 11.14 1.50977 11.55 1.50977C11.96 1.50977 12.3 1.84977 12.3 2.25977V5.49977C12.3 5.91977 11.96 6.24977 11.55 6.24977Z" />
      <path d="M8.5 8.25C8.09 8.25 7.75 7.91 7.75 7.5V3.5C7.75 3.09 8.09 2.75 8.5 2.75C8.91 2.75 9.25 3.09 9.25 3.5V7.5C9.25 7.91 8.91 8.25 8.5 8.25Z" />
    </svg>
  )
}

/** ⬆ Upload — upload reference / asset (iconsax content-edit/outline/document-upload). */
export function UploadOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M8.99994 17.7505C8.58994 17.7505 8.24994 17.4105 8.24994 17.0005V12.8105L7.52994 13.5305C7.23994 13.8205 6.75994 13.8205 6.46994 13.5305C6.17994 13.2405 6.17994 12.7605 6.46994 12.4705L8.46994 10.4705C8.67994 10.2605 9.00994 10.1905 9.28994 10.3105C9.56994 10.4205 9.74994 10.7005 9.74994 11.0005V17.0005C9.74994 17.4105 9.40994 17.7505 8.99994 17.7505Z" />
      <path d="M10.9999 13.7495C10.8099 13.7495 10.6199 13.6795 10.4699 13.5295L8.46994 11.5295C8.17994 11.2395 8.17994 10.7595 8.46994 10.4695C8.75994 10.1795 9.23994 10.1795 9.52994 10.4695L11.5299 12.4695C11.8199 12.7595 11.8199 13.2395 11.5299 13.5295C11.3799 13.6795 11.1899 13.7495 10.9999 13.7495Z" />
      <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H14C14.41 1.25 14.75 1.59 14.75 2C14.75 2.41 14.41 2.75 14 2.75H9C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V10C21.25 9.59 21.59 9.25 22 9.25C22.41 9.25 22.75 9.59 22.75 10V15C22.75 20.43 20.43 22.75 15 22.75Z" />
      <path d="M22 10.7505H18C14.58 10.7505 13.25 9.42048 13.25 6.00048V2.00048C13.25 1.70048 13.43 1.42048 13.71 1.31048C13.99 1.19048 14.31 1.26048 14.53 1.47048L22.53 9.47048C22.74 9.68048 22.81 10.0105 22.69 10.2905C22.57 10.5705 22.3 10.7505 22 10.7505ZM14.75 3.81048V6.00048C14.75 8.58048 15.42 9.25048 18 9.25048H20.19L14.75 3.81048Z" />
    </svg>
  )
}

/** ▶ Play — preview generation result (iconsax video-audio-image/outline/play). */
export function PlayOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M7.87 21.2805C7.08 21.2805 6.33 21.0905 5.67 20.7105C4.11 19.8105 3.25 17.9805 3.25 15.5705V8.44048C3.25 6.02048 4.11 4.20048 5.67 3.30048C7.23 2.40048 9.24 2.57048 11.34 3.78048L17.51 7.34048C19.6 8.55048 20.76 10.2105 20.76 12.0105C20.76 13.8105 19.61 15.4705 17.51 16.6805L11.34 20.2405C10.13 20.9305 8.95 21.2805 7.87 21.2805ZM7.87 4.22048C7.33 4.22048 6.85 4.34048 6.42 4.59048C5.34 5.21048 4.75 6.58048 4.75 8.44048V15.5605C4.75 17.4205 5.34 18.7805 6.42 19.4105C7.5 20.0405 8.98 19.8605 10.59 18.9305L16.76 15.3705C18.37 14.4405 19.26 13.2505 19.26 12.0005C19.26 10.7505 18.37 9.56048 16.76 8.63048L10.59 5.07048C9.61 4.51048 8.69 4.22048 7.87 4.22048Z" />
    </svg>
  )
}

/** ⬇ Download — save generation result (iconsax content-edit/outline/document-download). */
export function DownloadOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M9 17.75C8.9 17.75 8.81 17.73 8.71 17.69C8.43 17.58 8.25 17.3 8.25 17V11C8.25 10.59 8.59 10.25 9 10.25C9.41 10.25 9.75 10.59 9.75 11V15.19L10.47 14.47C10.76 14.18 11.24 14.18 11.53 14.47C11.82 14.76 11.82 15.24 11.53 15.53L9.53 17.53C9.39 17.67 9.19 17.75 9 17.75Z" />
      <path d="M8.99994 17.7495C8.80994 17.7495 8.61994 17.6795 8.46994 17.5295L6.46994 15.5295C6.17994 15.2395 6.17994 14.7595 6.46994 14.4695C6.75994 14.1795 7.23994 14.1795 7.52994 14.4695L9.52994 16.4695C9.81994 16.7595 9.81994 17.2395 9.52994 17.5295C9.37994 17.6795 9.18994 17.7495 8.99994 17.7495Z" />
      <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H14C14.41 1.25 14.75 1.59 14.75 2C14.75 2.41 14.41 2.75 14 2.75H9C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V10C21.25 9.59 21.59 9.25 22 9.25C22.41 9.25 22.75 9.59 22.75 10V15C22.75 20.43 20.43 22.75 15 22.75Z" />
      <path d="M22 10.7505H18C14.58 10.7505 13.25 9.42048 13.25 6.00048V2.00048C13.25 1.70048 13.43 1.42048 13.71 1.31048C13.99 1.19048 14.31 1.26048 14.53 1.47048L22.53 9.47048C22.74 9.68048 22.81 10.0105 22.69 10.2905C22.57 10.5705 22.3 10.7505 22 10.7505ZM14.75 3.81048V6.00048C14.75 8.58048 15.42 9.25048 18 9.25048H20.19L14.75 3.81048Z" />
    </svg>
  )
}

/** ↻ Regenerate — re-run generation with same prompt. Two circular refresh
 *  arrows that fill the box, no decorative outer ring (iconsax arrow/refresh-arrow;
 *  ring removed 2026-06-27 (Val) — it shrank the arrows). */
export function RegenerateOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M22 12C22 17.52 17.52 22 12 22C6.48 22 3.11 16.44 3.11 16.44M3.11 16.44H7.63M3.11 16.44V21.44M2 12C2 6.48 6.44 2 12 2C18.67 2 22 7.56 22 7.56M22 7.56V2.56M22 7.56H17.56"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** ⇄ Swap — exchange two things (e.g. start ↔ end frames). iconsax arrow-2/outline. */
export function SwapOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17.2788 11.2002C17.0888 11.2002 16.8988 11.1302 16.7488 10.9802C16.4588 10.6902 16.4588 10.2102 16.7488 9.9202L19.9388 6.7302L16.7488 3.54019C16.4588 3.25019 16.4588 2.7702 16.7488 2.4802C17.0387 2.1902 17.5187 2.1902 17.8087 2.4802L21.5288 6.20023C21.6688 6.34023 21.7488 6.5302 21.7488 6.7302C21.7488 6.9302 21.6688 7.12022 21.5288 7.26022L17.8087 10.9802C17.6587 11.1202 17.4688 11.2002 17.2788 11.2002Z" />
      <path d="M21 7.47998H3C2.59 7.47998 2.25 7.13998 2.25 6.72998C2.25 6.31998 2.59 5.97998 3 5.97998H21C21.41 5.97998 21.75 6.31998 21.75 6.72998C21.75 7.13998 21.41 7.47998 21 7.47998Z" />
      <path d="M6.71997 21.75C6.52997 21.75 6.34 21.68 6.19 21.53L2.46997 17.81C2.32997 17.67 2.25 17.48 2.25 17.28C2.25 17.08 2.32997 16.89 2.46997 16.75L6.19 13.03C6.48 12.74 6.96 12.74 7.25 13.03C7.54 13.32 7.54 13.8 7.25 14.09L4.06 17.28L7.25 20.4699C7.54 20.7599 7.54 21.24 7.25 21.53C7.11 21.68 6.91997 21.75 6.71997 21.75Z" />
      <path d="M21 18.02H3C2.59 18.02 2.25 17.68 2.25 17.27C2.25 16.86 2.59 16.52 3 16.52H21C21.41 16.52 21.75 16.86 21.75 17.27C21.75 17.68 21.41 18.02 21 18.02Z" />
    </svg>
  )
}

/**
 * 🔍 Search — magnifier for search fields and command palettes
 * (iconsax search/outline/search-normal-1 stroke). Circle + handle;
 * stroke inherits `currentColor` from the wrapper.
 */
export function SearchOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 22L20 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** 🔍+ Zoom-in — canvas zoom-in control (iconsax search/outline/search-zoom-in). */
export function ZoomInOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M10.9702 20.77C5.59021 20.77 1.22021 16.4 1.22021 11.02C1.22021 5.64002 5.59021 1.27002 10.9702 1.27002C16.3502 1.27002 20.7202 5.64002 20.7202 11.02C20.7202 16.4 16.3502 20.77 10.9702 20.77ZM10.9702 2.77002C6.42021 2.77002 2.72021 6.47002 2.72021 11.02C2.72021 15.57 6.42021 19.27 10.9702 19.27C15.5202 19.27 19.2202 15.57 19.2202 11.02C19.2202 6.47002 15.5202 2.77002 10.9702 2.77002Z" />
      <path d="M13.4702 11.77H8.47022C8.06022 11.77 7.72021 11.43 7.72021 11.02C7.72021 10.61 8.06022 10.27 8.47022 10.27H13.4702C13.8802 10.27 14.2202 10.61 14.2202 11.02C14.2202 11.43 13.8802 11.77 13.4702 11.77Z" />
      <path d="M10.9702 14.27C10.5602 14.27 10.2202 13.93 10.2202 13.52V8.52002C10.2202 8.11002 10.5602 7.77002 10.9702 7.77002C11.3802 7.77002 11.7202 8.11002 11.7202 8.52002V13.52C11.7202 13.93 11.3802 14.27 10.9702 14.27Z" />
      <path d="M20.1204 22.74C19.9304 22.74 19.7604 22.71 19.6304 22.67C19.1804 22.54 18.3804 22.09 18.1304 20.61C18.0004 19.82 18.2004 19.09 18.7004 18.59C19.1904 18.09 19.9104 17.88 20.6904 18.01C21.6904 18.16 22.4204 18.67 22.6804 19.4C22.9404 20.13 22.7004 20.99 22.0104 21.74C21.2904 22.54 20.6104 22.74 20.1204 22.74ZM19.6004 20.36C19.6904 20.9 19.8904 21.19 20.0504 21.23C20.2004 21.27 20.5204 21.14 20.8904 20.73C21.2404 20.35 21.3104 20.05 21.2504 19.9C21.2004 19.75 20.9604 19.56 20.4404 19.49C20.1404 19.45 19.9004 19.49 19.7504 19.65C19.6004 19.8 19.5404 20.06 19.6004 20.36Z" />
    </svg>
  )
}

/**
 * ➕ Add — primary "+" glyph (iconsax `add/outline`).
 *
 * Canonical plus-sign — vertical + horizontal rounded line. Used in
 * `+ New board` / `+ New X` primary CTAs across the app. Pairs with
 * `iconLeft` slot on `<Button>` or rendered standalone at icon-md size.
 */
export function AddOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 18.75C11.59 18.75 11.25 18.41 11.25 18V6C11.25 5.59 11.59 5.25 12 5.25C12.41 5.25 12.75 5.59 12.75 6V18C12.75 18.41 12.41 18.75 12 18.75Z" />
      <path d="M18 12.75H6C5.59 12.75 5.25 12.41 5.25 12C5.25 11.59 5.59 11.25 6 11.25H18C18.41 11.25 18.75 11.59 18.75 12C18.75 12.41 18.41 12.75 18 12.75Z" />
    </svg>
  )
}

/**
 * ➕▢ Message-add — "new chat" glyph: a rounded message box with a `+` inside
 * (iconsax `message-add` / `add-square`). Used as the new-chat action in the
 * sidebar Recents/Create row. Filled thin shapes (1.5-unit lines, matching the
 * stroke weight of the linear icons); `fill` rewired to `currentColor`.
 */
export function MessageAddOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M16 12.75H8C7.59 12.75 7.25 12.41 7.25 12C7.25 11.59 7.59 11.25 8 11.25H16C16.41 11.25 16.75 11.59 16.75 12C16.75 12.41 16.41 12.75 16 12.75Z" />
      <path d="M12 16.75C11.59 16.75 11.25 16.41 11.25 16V8C11.25 7.59 11.59 7.25 12 7.25C12.41 7.25 12.75 7.59 12.75 8V16C12.75 16.41 12.41 16.75 12 16.75Z" />
      <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H15C20.43 1.25 22.75 3.57 22.75 9V15C22.75 20.43 20.43 22.75 15 22.75ZM9 2.75C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V9C21.25 4.39 19.61 2.75 15 2.75H9Z" />
    </svg>
  )
}

/**
 * ➖ Minus — primary "−" glyph (iconsax `minus/outline`).
 *
 * The horizontal half of `AddOutline`. Used in stepper controls
 * (decrement) paired with `AddOutline` for increment.
 */
export function MinusOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18 12.75H6C5.59 12.75 5.25 12.41 5.25 12C5.25 11.59 5.59 11.25 6 11.25H18C18.41 11.25 18.75 11.59 18.75 12C18.75 12.41 18.41 12.75 18 12.75Z" />
    </svg>
  )
}

/** 🔍− Zoom-out — canvas zoom-out control (iconsax search/outline/search-zoom-out). */
export function ZoomOutOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M10.9702 20.77C5.59021 20.77 1.22021 16.4 1.22021 11.02C1.22021 5.64002 5.59021 1.27002 10.9702 1.27002C16.3502 1.27002 20.7202 5.64002 20.7202 11.02C20.7202 16.4 16.3502 20.77 10.9702 20.77ZM10.9702 2.77002C6.42021 2.77002 2.72021 6.47002 2.72021 11.02C2.72021 15.57 6.42021 19.27 10.9702 19.27C15.5202 19.27 19.2202 15.57 19.2202 11.02C19.2202 6.47002 15.5202 2.77002 10.9702 2.77002Z" />
      <path d="M13.4702 11.77H8.47022C8.06022 11.77 7.72021 11.43 7.72021 11.02C7.72021 10.61 8.06022 10.27 8.47022 10.27H13.4702C13.8802 10.27 14.2202 10.61 14.2202 11.02C14.2202 11.43 13.8802 11.77 13.4702 11.77Z" />
      <path d="M20.1204 22.74C19.9304 22.74 19.7604 22.71 19.6304 22.67C19.1804 22.54 18.3804 22.09 18.1304 20.61C18.0004 19.82 18.2004 19.09 18.7004 18.59C19.1904 18.09 19.9104 17.88 20.6904 18.01C21.6904 18.16 22.4204 18.67 22.6804 19.4C22.9404 20.13 22.7004 20.99 22.0104 21.74C21.2904 22.54 20.6104 22.74 20.1204 22.74ZM19.6004 20.36C19.6904 20.9 19.8904 21.19 20.0504 21.23C20.2004 21.27 20.5204 21.14 20.8904 20.73C21.2404 20.35 21.3104 20.05 21.2504 19.9C21.2004 19.75 20.9604 19.56 20.4404 19.49C20.1404 19.45 19.9004 19.49 19.7504 19.65C19.6004 19.8 19.5404 20.06 19.6004 20.36Z" />
    </svg>
  )
}

/** ✓ Tick — bare checkmark with no enclosing circle (iconsax arrow/outline/tick).
 * Use for confirm-action and selection-state visuals. The circle-wrapped
 * variant is `CheckOutline`. */
export function TickOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M9.5499 18.5801C9.3599 18.5801 9.1699 18.5101 9.0199 18.3601L4.7799 14.1201C4.4899 13.8301 4.4899 13.3501 4.7799 13.0601C5.0699 12.7701 5.5499 12.7701 5.8399 13.0601L9.5499 16.7701L18.1599 8.16013C18.4499 7.87013 18.9299 7.87013 19.2199 8.16013C19.5099 8.45013 19.5099 8.93013 19.2199 9.22013L10.0799 18.3601C9.9299 18.5101 9.7399 18.5801 9.5499 18.5801Z" />
    </svg>
  )
}

/** ♡ Heart (outline) — favourite affordance. Iconsax `heart` outline,
 * fill=currentColor on the outline path. For the filled variant
 * (selected/favourited state) use `HeartFillOutline`. */
export function HeartOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 21.6496C11.69 21.6496 11.39 21.6096 11.14 21.5196C7.32 20.2096 1.25 15.5596 1.25 8.68961C1.25 5.18961 4.08 2.34961 7.56 2.34961C9.25 2.34961 10.83 3.00961 12 4.18961C13.17 3.00961 14.75 2.34961 16.44 2.34961C19.92 2.34961 22.75 5.19961 22.75 8.68961C22.75 15.5696 16.68 20.2096 12.86 21.5196C12.61 21.6096 12.31 21.6496 12 21.6496ZM7.56 3.84961C4.91 3.84961 2.75 6.01961 2.75 8.68961C2.75 15.5196 9.32 19.3196 11.63 20.1096C11.81 20.1696 12.2 20.1696 12.38 20.1096C14.68 19.3196 21.26 15.5296 21.26 8.68961C21.26 6.01961 19.1 3.84961 16.45 3.84961C14.93 3.84961 13.52 4.55961 12.61 5.78961C12.33 6.16961 11.69 6.16961 11.41 5.78961C10.48 4.54961 9.08 3.84961 7.56 3.84961Z" />
    </svg>
  )
}

/** ♥ Heart (filled) — selected/favourited state for the heart affordance.
 * Iconsax `heart` bold. Same module as `HeartOutline` so the swap from
 * outline → filled on `data-selected` reads as a state change of the
 * same icon, not a new icon. */
export function HeartFillOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M16.44 3.09961C14.63 3.09961 13.01 3.97961 12 5.32961C10.99 3.97961 9.37 3.09961 7.56 3.09961C4.49 3.09961 2 5.59961 2 8.68961C2 9.87961 2.19 10.9796 2.52 11.9996C4.1 16.9996 8.97 19.9896 11.38 20.8096C11.72 20.9296 12.28 20.9296 12.62 20.8096C15.03 19.9896 19.9 16.9996 21.48 11.9996C21.81 10.9796 22 9.87961 22 8.68961C22 5.59961 19.51 3.09961 16.44 3.09961Z" />
    </svg>
  )
}

/** 💬 Messages — chat / conversation history, two overlapping speech bubbles
 * (iconsax messages/outline/messages-2). Used by the chat-history surfaces
 * (mobile nav-drawer "Chats" item, /chat history trigger). For the filled
 * variant (emphasis / active state) use `Messages2FillOutline`. */
export function Messages2Outline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M18.47 16.83L18.86 19.99C18.96 20.82 18.07 21.4 17.36 20.97L13.17 18.48C12.71 18.48 12.26 18.45 11.82 18.39C12.56 17.52 13 16.42 13 15.23C13 12.39 10.54 10.09 7.49997 10.09C6.33997 10.09 5.26997 10.42 4.37997 11C4.34997 10.75 4.33997 10.5 4.33997 10.24C4.33997 5.68999 8.28997 2 13.17 2C18.05 2 22 5.68999 22 10.24C22 12.94 20.61 15.33 18.47 16.83Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 15.2298C13 16.4198 12.56 17.5198 11.82 18.3898C10.83 19.5898 9.26 20.3598 7.5 20.3598L4.89 21.9098C4.45 22.1798 3.89 21.8098 3.95 21.2998L4.2 19.3298C2.86 18.3998 2 16.9098 2 15.2298C2 13.4698 2.94 11.9198 4.38 10.9998C5.27 10.4198 6.34 10.0898 7.5 10.0898C10.54 10.0898 13 12.3898 13 15.2298Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** 💬 Messages (filled) — bold variant of `Messages2Outline` (iconsax
 * messages/bold/messages-2). Same module as the outline so an outline →
 * filled swap reads as a state change of the same icon, not a new icon
 * (same pattern as `HeartOutline` / `HeartFillOutline`). Used by the
 * mobile chats trigger on /chat. */
export function Messages2FillOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17.8701 21.8698C17.5601 21.8698 17.2501 21.7898 16.9701 21.6198L12.9601 19.2397C12.5401 19.2297 12.1201 19.1998 11.7201 19.1398C11.4501 19.0998 11.2201 18.9197 11.1201 18.6597C11.0201 18.3997 11.0701 18.1197 11.2501 17.9097C11.9101 17.1397 12.2501 16.2197 12.2501 15.2397C12.2501 12.8197 10.1201 10.8497 7.50008 10.8497C6.52008 10.8497 5.58007 11.1198 4.79007 11.6398C4.57007 11.7798 4.30007 11.7998 4.06007 11.6898C3.83007 11.5798 3.66008 11.3597 3.63008 11.0997C3.60008 10.8197 3.58008 10.5398 3.58008 10.2498C3.58008 5.28976 7.88008 1.25977 13.1601 1.25977C18.4401 1.25977 22.7401 5.28976 22.7401 10.2498C22.7401 12.9698 21.4801 15.4697 19.2601 17.1797L19.6001 19.8998C19.6801 20.5798 19.3801 21.2198 18.8101 21.5898C18.5301 21.7698 18.2001 21.8698 17.8701 21.8698ZM13.1501 17.7297C13.2901 17.7197 13.4301 17.7598 13.5501 17.8398L17.7401 20.3298C17.8501 20.3998 17.9401 20.3698 18.0001 20.3298C18.0501 20.2998 18.1301 20.2198 18.1101 20.0798L17.7201 16.9197C17.6901 16.6397 17.8101 16.3698 18.0301 16.2098C20.0701 14.7798 21.2401 12.5997 21.2401 10.2297C21.2401 6.09974 17.6201 2.73975 13.1601 2.73975C8.87008 2.73975 5.35007 5.85979 5.09007 9.77979C5.84007 9.48979 6.65008 9.32977 7.49008 9.32977C10.9401 9.32977 13.7401 11.9697 13.7401 15.2197C13.7501 16.0997 13.5401 16.9497 13.1501 17.7297Z" />
      <path d="M4.57977 22.7498C4.31977 22.7498 4.06977 22.6798 3.83977 22.5298C3.38977 22.2398 3.14978 21.7398 3.20978 21.2098L3.40977 19.6698C2.05977 18.5698 1.25977 16.9398 1.25977 15.2298C1.25977 13.2798 2.27978 11.4598 3.98978 10.3698C5.01978 9.69981 6.23977 9.33984 7.50977 9.33984C10.9598 9.33984 13.7598 11.9798 13.7598 15.2298C13.7598 16.5498 13.2798 17.8498 12.3998 18.8798C11.2698 20.2498 9.57977 21.0498 7.71977 21.1098L5.27977 22.5598C5.05977 22.6898 4.81977 22.7498 4.57977 22.7498ZM7.49977 10.8398C6.51977 10.8398 5.57976 11.1098 4.78976 11.6298C3.50976 12.4498 2.74977 13.7898 2.74977 15.2298C2.74977 16.6198 3.42978 17.8898 4.62978 18.7098C4.85978 18.8698 4.97977 19.1398 4.94977 19.4198L4.72977 21.1298L7.11977 19.7098C7.23977 19.6398 7.36977 19.5998 7.49977 19.5998C8.96977 19.5998 10.3598 18.9698 11.2398 17.8998C11.8998 17.1198 12.2498 16.1998 12.2498 15.2198C12.2498 12.8098 10.1198 10.8398 7.49977 10.8398Z" />
    </svg>
  )
}

/** 🎧 Headphone — support / live help, headset with mic arm (iconsax
 * audio-square/outline/headphone). Reads as "talk to support" — used by the
 * ProfileMenu "Support" item (replaces the chat-bubble Messages glyph,
 * 2026-06-17). */
export function HeadphoneOutline(props: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      aria-hidden
      {...props}
    >
      <path d="M4.57996 17.4102H4.25C3.15 17.4102 2.25 16.5102 2.25 15.4102V12.9102C2.25 11.8102 3.15 10.9102 4.25 10.9102H4.57996C5.67996 10.9102 6.57996 11.8102 6.57996 12.9102V15.4102C6.57996 16.5202 5.68996 17.4102 4.57996 17.4102Z" />
      <path d="M4.42004 10.92V9.83C4.42004 5.64 7.81 2.25 12 2.25C16.19 2.25 19.58 5.64 19.58 9.83V10.91" />
      <path d="M13.08 21.7502H14.16C16.78 21.7502 18.97 19.8902 19.47 17.4102" />
      <path d="M19.75 17.4102H19.42C18.32 17.4102 17.42 16.5102 17.42 15.4102V12.9102C17.42 11.8102 18.32 10.9102 19.42 10.9102H19.75C20.85 10.9102 21.75 11.8102 21.75 12.9102V15.4102C21.75 16.5202 20.85 17.4102 19.75 17.4102Z" />
    </svg>
  )
}

// === Status / feedback icons (toasts, alerts, inline warnings) ====================
// Stroke-only outline glyphs — 1.5px stroke, rounded join/cap, 24×24 viewBox.
// Used by `<Toaster>` (per status type) and any inline warning surface.

/** ⚠ Danger — warning triangle with centred exclamation (iconsax essential/outline/danger).
 *  Used by Sonner `warning` toasts, InlineWarning blocks, quota meters. */
export function DangerOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M12 9V14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.0001 21.4093H5.94005C2.47005 21.4093 1.02005 18.9293 2.70005 15.8993L5.82006 10.2793L8.76006 4.9993C10.5401 1.7893 13.4601 1.7893 15.2401 4.9993L18.1801 10.2893L21.3001 15.9093C22.9801 18.9393 21.5201 21.4193 18.0601 21.4193H12.0001V21.4093Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.9945 17H12.0035"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// `TickCircleStroke` / `CloseCircleStroke` removed 2026-05-28: their geometry
// was inlined into the canonical `CheckOutline` / `CloseCircleOutline` exports
// above (both flipped to pure-stroke), so the separate `Stroke` variants are
// no longer needed. `InfoCircleStroke` removed for the same reason —
// `InfoCircleOutline` now uses the canonical stroke geometry directly.

/** ⬆ Export-up — rounded tray with arrow exiting upward (iconsax essential/outline/export-1).
 *  Used by the chat composer AttachButton ("upload / attach / share-out").
 *  Replaces the inline `+` glyph that previously sat in the AttachButton —
 *  upload-arrow communicates "bring something in" better than a bare plus,
 *  and it pairs visually with the Library picker modal that opens on click. */
export function ExportUpOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M16.44 8.90039C20.04 9.21039 21.51 11.0604 21.51 15.1104V15.2404C21.51 19.7104 19.72 21.5004 15.25 21.5004H8.73998C4.26998 21.5004 2.47998 19.7104 2.47998 15.2404V15.1104C2.47998 11.0904 3.92998 9.24039 7.46998 8.91039"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.0001V3.62012"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.3499 5.85L11.9999 2.5L8.6499 5.85"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** ↩ Forward-into-frame (iconsax "forward"), mirrored vertically (scaleY -1)
 *  via the wrapping `<g transform>`. Used for the chat "Insert in prompt"
 *  action — arrow into the frame reads as "drop this into the composer". */
export function ForwardFrameOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <g transform="translate(0 24) scale(1 -1)">
        <path
          d="M3 22C3 16.48 7.48 12 13 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
        />
        <path
          d="M11.14 15.8697L14.86 12.1497L11.14 8.42969"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 22H17C19.75 22 22 19.75 22 17V7C22 4.25 19.75 2 17 2H7C4.25 2 2 4.25 2 7V12.02"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

/** ✕ X (plain) — bare close glyph without an enclosing circle (iconsax essential/outline/close).
 *  Standalone `×` for modal/sheet/popover close affordances where the
 *  encircled `CloseCircleOutline` reads too heavy. Two 1.5px stroked bars
 *  rotated ±45° around centre. */
export function XOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M6 6L18 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** 💳✕ Card-remove — failed payment / card declined (iconsax money/outline/card-remove).
 *  Status illustration for `StatusDialog` danger tone (the Payment-Failed popup,
 *  DEV-919). Filled-region outline (same technique as MagicStarOutline) so it
 *  tints via `currentColor` from the consuming wrapper — no clipPath (dropped to
 *  avoid inlined-id collisions). */
export function CardRemoveOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M21.8999 10.7803H1.8999C1.4899 10.7803 1.1499 10.4403 1.1499 10.0303C1.1499 9.62027 1.4899 9.28027 1.8999 9.28027H21.8999C22.3099 9.28027 22.6499 9.62027 22.6499 10.0303C22.6499 10.4403 22.3199 10.7803 21.8999 10.7803Z" />
      <path d="M11.4599 21.28H6.34985C2.36985 21.28 1.1499 20.08 1.1499 16.14V7.92004C1.1499 4.77004 1.81989 3.02004 5.38989 2.81004C5.69989 2.80004 6.00985 2.79004 6.34985 2.79004H17.4599C21.4399 2.79004 22.6599 3.99004 22.6599 7.93004V12.34C22.6599 12.75 22.3199 13.09 21.9099 13.09C21.4999 13.09 21.1599 12.75 21.1599 12.34V7.93004C21.1599 4.84004 20.6099 4.29004 17.4599 4.29004H6.34985C6.02985 4.29004 5.7399 4.30004 5.4599 4.31004C3.2899 4.44004 2.6499 4.93004 2.6499 7.93004V16.15C2.6499 19.24 3.19985 19.79 6.34985 19.79H11.4599C11.8699 19.79 12.2099 20.13 12.2099 20.54C12.2099 20.95 11.8699 21.28 11.4599 21.28Z" />
      <path d="M17.8999 22.7803C15.2799 22.7803 13.1499 20.6503 13.1499 18.0303C13.1499 15.4103 15.2799 13.2803 17.8999 13.2803C20.5199 13.2803 22.6499 15.4103 22.6499 18.0303C22.6499 20.6503 20.5199 22.7803 17.8999 22.7803ZM17.8999 14.7803C16.1099 14.7803 14.6499 16.2403 14.6499 18.0303C14.6499 19.8203 16.1099 21.2803 17.8999 21.2803C19.6899 21.2803 21.1499 19.8203 21.1499 18.0303C21.1499 16.2403 19.6899 14.7803 17.8999 14.7803Z" />
      <path d="M18.9698 19.9005C18.7798 19.9005 18.5898 19.8305 18.4398 19.6805L16.3298 17.5705C16.0398 17.2805 16.0398 16.8005 16.3298 16.5105C16.6198 16.2205 17.0998 16.2205 17.3898 16.5105L19.4998 18.6205C19.7898 18.9105 19.7898 19.3905 19.4998 19.6805C19.3598 19.8205 19.1598 19.9005 18.9698 19.9005Z" />
      <path d="M16.83 19.92C16.64 19.92 16.45 19.85 16.3 19.7C16.01 19.41 16.01 18.93 16.3 18.64L18.41 16.53C18.7 16.24 19.18 16.24 19.47 16.53C19.76 16.82 19.76 17.3 19.47 17.59L17.36 19.7C17.22 19.85 17.03 19.92 16.83 19.92Z" />
      <path d="M9.8999 16.7803H5.8999C5.4899 16.7803 5.1499 16.4403 5.1499 16.0303C5.1499 15.6203 5.4899 15.2803 5.8999 15.2803H9.8999C10.3099 15.2803 10.6499 15.6203 10.6499 16.0303C10.6499 16.4403 10.3199 16.7803 9.8999 16.7803Z" />
    </svg>
  )
}

/**
 * 📥 Directbox — inbox / receiving tray (iconsax `directbox-default/outline`):
 * a box whose lid opens into a tray that catches an item. Used as the default
 * empty-state glyph for `DataTable` ("No results found") — reads as
 * "nothing has landed in the tray yet". Stroke-outline so it tints via
 * `currentColor` from the consuming wrapper; clipPath dropped to avoid
 * inlined-id collisions.
 */
export function DirectboxOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M7 12C3 12 3 13.79 3 16V17C3 19.76 3 22 8 22H16C20 22 21 19.76 21 17V16C21 13.79 21 12 17 12C16 12 15.72 12.21 15.2 12.6L14.18 13.68C13 14.94 11 14.94 9.81 13.68L8.8 12.6C8.28 12.21 8 12 7 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 12V6C19 3.79 19 2 15 2H9C5 2 5 3.79 5 6V12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * ⏰ Clock — current time / scheduled (iconsax `clock/outline`). Circle body
 * plus two hands pinned at centre. Base of the time family.
 */
export function ClockOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z" />
      <path d="M15.71 15.93C15.58 15.93 15.45 15.9 15.33 15.82L12.23 13.97C11.46 13.51 10.89 12.5 10.89 11.61V7.51C10.89 7.1 11.23 6.76 11.64 6.76C12.05 6.76 12.39 7.1 12.39 7.51V11.61C12.39 11.97 12.69 12.5 13 12.68L16.1 14.53C16.46 14.74 16.57 15.2 16.36 15.56C16.21 15.8 15.96 15.93 15.71 15.93Z" />
    </svg>
  )
}

/**
 * ◇ Diamond — premium / gem accent (provided glyph). Faceted stone outline plus
 * the girdle line across the top. Original `var(--fillg)` swapped to
 * `currentColor` and clipPath dropped per outline.tsx conventions.
 */
export function DiamondOutline(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M11.9998 22.6002C10.8898 22.6002 9.85982 22.1302 9.08982 21.2902L2.22982 13.7502C1.25982 12.6902 0.959818 10.8202 1.53982 9.51015L4.09983 3.75016C4.79983 2.18016 5.96983 1.41016 7.68983 1.41016H16.2798V2.16016V1.41016C17.9998 1.41016 19.1698 2.17016 19.8698 3.74016L22.4298 9.50016C23.0098 10.8102 22.7198 12.6802 21.7498 13.7402L14.8998 21.2902C14.1498 22.1302 13.1098 22.6002 11.9998 22.6002ZM16.2898 2.90016H7.69982C6.38982 2.90016 5.85982 3.48015 5.47982 4.35015L2.91982 10.1102C2.57982 10.8802 2.77982 12.1102 3.33982 12.7302L10.1998 20.2702C10.6798 20.8002 11.3198 21.0902 11.9998 21.0902C12.6798 21.0902 13.3198 20.8002 13.7998 20.2702L20.6498 12.7202C21.2198 12.0902 21.4198 10.8702 21.0698 10.1002L18.5098 4.34016C18.1298 3.48016 17.5998 2.90016 16.2898 2.90016Z" />
      <path d="M3.5 8.75023C3.09 8.75023 2.75 8.41023 2.75 8.00023C2.75 7.59023 3.09 7.25023 3.5 7.25023L20.5 7.24023C20.91 7.24023 21.25 7.58023 21.25 7.99023C21.25 8.40023 20.91 8.74023 20.5 8.74023L3.5 8.75023Z" />
    </svg>
  )
}
