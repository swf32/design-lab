import { type SVGProps, useId } from 'react'
import './CryptoLogo.scss'

/**
 * Brand-accurate inline SVG logos for the crypto tokens + networks we
 * support (USDT / USDC / TRX / ETH / SOL / POL / BASE / ARB) plus optional
 * network-badge overlay (TRC20 / ERC20) at the bottom-right.
 *
 * Designs from the canonical reference at
 * `apps/web/src/features/referrals/withdraw/shared/components/crypto-logo.tsx`
 * — gradient fills + drop shadow + white inner-glyph + subtle white ring,
 * viewBox `0 0 64 64`.
 *
 * CRITICAL: every SVG <defs> id (linearGradient, clipPath, filter, mask)
 * is namespaced per instance via React's `useId()`. Without that, the
 * second instance of any logo on the same page would inherit the first
 * instance's defs (browsers resolve `url(#a)` against the first match in
 * the document) — visible breakage when two logos render on one screen.
 *
 * Brand colours pinned to official kits:
 *   - USDT (Tether)    #26A17B → #2FD29F gradient
 *   - USDC (Circle)    #3E73C4 solid
 *   - TRX  (Tron)      #FF5672 → #EF0027 gradient
 *   - ETH  (Ethereum)  #627EEA → #A3B6FF gradient
 *   - SOL  (Solana)    #00FFA3 → #DC1FFF bars on dark disc
 *   - POL  (Polygon)   #6C00F6 → #5900CA gradient
 *   - BASE (Base)      #0052FF → #0041CB gradient
 *   - ARB  (Arbitrum)  #12AAFF + #213147 hex shield
 *
 * SOL / POL / BASE / ARB are the chain logos for the USDC-payout networks
 * (DEV-920). Canonical glyph source remains the withdraw-flow reference
 * `apps/web/src/features/referrals/withdraw/shared/components/crypto-logo.tsx`.
 */

export type CryptoTicker = 'USDT' | 'USDC' | 'TRX' | 'ETH' | 'SOL' | 'POL' | 'BASE' | 'ARB'

export type CryptoNetwork = 'TRC20' | 'ERC20'

export interface CryptoLogoProps {
  ticker: CryptoTicker
  /** Logical size — maps to width + height in px. */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Small network mark overlaid at the bottom-right of the main logo. */
  withNetworkBadge?: CryptoNetwork
  className?: string
}

const NETWORK_TO_TICKER: Record<CryptoNetwork, CryptoTicker> = {
  TRC20: 'TRX',
  ERC20: 'ETH',
}

export function CryptoLogo({ ticker, size = 'md', withNetworkBadge, className }: CryptoLogoProps) {
  const rootClass = ['klyp-CryptoLogo', className].filter(Boolean).join(' ')

  return (
    <span className={rootClass} data-size={size} data-ticker={ticker}>
      <CryptoGlyph ticker={ticker} className="klyp-CryptoLogo__svg" />
      {withNetworkBadge && (
        <span className="klyp-CryptoLogo__badge" data-network={withNetworkBadge} aria-hidden="true">
          <CryptoGlyph
            ticker={NETWORK_TO_TICKER[withNetworkBadge]}
            className="klyp-CryptoLogo__svg"
          />
        </span>
      )}
    </span>
  )
}

export default CryptoLogo

// ────────────────────────────────────────────────────────────────────────
// SVG glyph (no wrapping span). Used internally by <CryptoLogo> for the
// main mark + the bottom-right network badge — and exported standalone so
// the components catalog can render each ticker as a pure <svg> tile and
// copy raw SVG markup. Width / height default to inheriting from the
// parent's CSS; pass them as props to size explicitly.
// ────────────────────────────────────────────────────────────────────────

export interface CryptoGlyphProps extends SVGProps<SVGSVGElement> {
  ticker: CryptoTicker
}

export function CryptoGlyph({ ticker, ...svgProps }: CryptoGlyphProps) {
  const id = useId()
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false" {...svgProps}>
      {resolveLogo(ticker, id)}
    </svg>
  )
}

function resolveLogo(ticker: CryptoTicker, id: string) {
  switch (ticker) {
    case 'USDT':
      return <UsdtPaths id={id} />
    case 'USDC':
      return <UsdcPaths id={id} />
    case 'TRX':
      return <TronPaths id={id} />
    case 'ETH':
      return <EthPaths id={id} />
    case 'SOL':
      return <SolanaPaths id={id} />
    case 'POL':
      return <PolygonPaths id={id} />
    case 'BASE':
      return <BasePaths id={id} />
    case 'ARB':
      return <ArbitrumPaths id={id} />
    default: {
      // Exhaustiveness guard — a new CryptoTicker without a glyph is a
      // compile error here, not a silent blank <svg>.
      const _exhaustive: never = ticker
      return _exhaustive
    }
  }
}

// ============ SOLANA ==================================================

function SolanaPaths({ id }: { id: string }) {
  return (
    <>
      <g clipPath={`url(#${id}-a)`}>
        <path
          fill={`url(#${id}-b)`}
          d="M32 64c17.673 0 32-14.327 32-32C64 14.327 49.673 0 32 0 14.327 0 0 14.327 0 32c0 17.673 14.327 32 32 32Z"
        />
        <path
          stroke={`url(#${id}-c)`}
          strokeOpacity={0.05}
          strokeWidth={4}
          d="M32 2c16.569 0 30 13.431 30 30 0 16.569-13.431 30-30 30C15.431 62 2 48.569 2 32 2 15.431 15.431 2 32 2Z"
        />
        <g filter={`url(#${id}-d)`}>
          <path
            fill={`url(#${id}-e)`}
            d="M19.849 38.107c.217-.208.516-.329.833-.329H49.41c.525 0 .787.607.416.962l-5.675 5.43a1.2 1.2 0 0 1-.833.33H14.59c-.525 0-.787-.606-.416-.962l5.675-5.43Z"
          />
          <path
            stroke="#fff"
            strokeOpacity={0.3}
            d="M20.682 38.278H49.41c.032 0 .049.008.059.015.011.008.02.019.026.031a.047.047 0 0 1 .004.026c0 .002-.002.012-.019.029l-5.674 5.43a.706.706 0 0 1-.488.19H14.59a.101.101 0 0 1-.059-.014.074.074 0 0 1-.026-.031.05.05 0 0 1-.005-.026c0-.003.003-.013.02-.029l5.674-5.43a.706.706 0 0 1 .488-.19Z"
          />
          <path
            fill={`url(#${id}-f)`}
            d="M19.849 17.83c.226-.209.525-.33.833-.33H49.41c.525 0 .787.606.416.962l-5.675 5.43a1.2 1.2 0 0 1-.833.33H14.59c-.525 0-.787-.607-.416-.962l5.675-5.43Z"
          />
          <path
            stroke="#fff"
            strokeOpacity={0.3}
            d="M20.682 18H49.41c.032 0 .049.008.059.015.011.007.02.019.026.03a.047.047 0 0 1 .004.027c0 .002-.002.012-.019.029l-5.674 5.43a.706.706 0 0 1-.488.19H14.59a.102.102 0 0 1-.059-.014.075.075 0 0 1-.026-.031.049.049 0 0 1-.005-.027c0-.002.003-.012.02-.028l5.668-5.424a.739.739 0 0 1 .494-.197Z"
          />
          <path
            fill={`url(#${id}-g)`}
            d="M44.151 27.903a1.205 1.205 0 0 0-.833-.329H14.59c-.525 0-.787.607-.416.962l5.675 5.43a1.2 1.2 0 0 0 .833.33H49.41c.525 0 .787-.606.416-.961l-5.675-5.432Z"
          />
          <path
            stroke="#fff"
            strokeOpacity={0.3}
            d="M14.59 28.074h28.728a.71.71 0 0 1 .488.19l5.675 5.431c.016.016.018.026.018.029 0 .004.001.014-.004.026a.074.074 0 0 1-.026.031.102.102 0 0 1-.059.015H20.682a.706.706 0 0 1-.488-.19l-5.674-5.431c-.018-.017-.02-.027-.02-.029 0-.004 0-.014.005-.026a.074.074 0 0 1 .026-.031.102.102 0 0 1 .059-.015Z"
          />
        </g>
      </g>
      <defs>
        <linearGradient
          id={`${id}-b`}
          x1="32"
          x2="32"
          y1="0"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1D1D1D" />
          <stop offset="1" stopColor="#0A0A0A" />
        </linearGradient>
        <linearGradient
          id={`${id}-c`}
          x1="32"
          x2="32"
          y1="0"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity={0.1} />
        </linearGradient>
        <linearGradient
          id={`${id}-e`}
          x1="46.665"
          x2="28.121"
          y1="14.255"
          y2="51.37"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFA3" />
          <stop offset="1" stopColor="#DC1FFF" />
        </linearGradient>
        <linearGradient
          id={`${id}-f`}
          x1="37.972"
          x2="19.428"
          y1="9.912"
          y2="47.026"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFA3" />
          <stop offset="1" stopColor="#DC1FFF" />
        </linearGradient>
        <linearGradient
          id={`${id}-g`}
          x1="42.291"
          x2="23.747"
          y1="12.07"
          y2="49.184"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFA3" />
          <stop offset="1" stopColor="#DC1FFF" />
        </linearGradient>
        <clipPath id={`${id}-a`}>
          <path fill="#fff" d="M0 0h64v64H0z" />
        </clipPath>
        <filter
          id={`${id}-d`}
          width="48"
          height="39"
          x="8"
          y="13.5"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={2} />
          <feGaussianBlur stdDeviation={3} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="BackgroundImageFix" result="effect1" />
          <feBlend in="SourceGraphic" in2="effect1" result="shape" />
        </filter>
      </defs>
    </>
  )
}

// ============ POLYGON =================================================

function PolygonPaths({ id }: { id: string }) {
  return (
    <>
      <g clipPath={`url(#${id}-a)`}>
        <path
          fill={`url(#${id}-b)`}
          d="M32 64c17.673 0 32-14.327 32-32C64 14.327 49.673 0 32 0 14.327 0 0 14.327 0 32c0 17.673 14.327 32 32 32Z"
        />
        <path
          stroke={`url(#${id}-c)`}
          strokeOpacity={0.3}
          strokeWidth={4}
          d="M32 2c16.569 0 30 13.431 30 30 0 16.569-13.431 30-30 30C15.431 62 2 48.569 2 32 2 15.431 15.431 2 32 2Z"
        />
        <g filter={`url(#${id}-d)`}>
          <path
            fill="#fff"
            fillOpacity={0.8}
            d="M27.628 26.508a.5.5 0 0 0-.245-.43l-3.157-1.871a.5.5 0 0 0-.51 0l-10.47 6.206a.5.5 0 0 0-.246.43v12.391a.5.5 0 0 0 .246.43l10.47 6.186a.5.5 0 0 0 .51 0l10.47-6.185a.5.5 0 0 0 .246-.43V23.647a.5.5 0 0 1 .245-.43l5.588-3.302a.5.5 0 0 1 .509 0l5.587 3.302a.5.5 0 0 1 .246.43v6.625a.5.5 0 0 1-.246.43l-5.587 3.303a.5.5 0 0 1-.51 0l-2.647-1.57a.5.5 0 0 0-.755.43v4.603a.5.5 0 0 0 .245.43l3.158 1.872a.5.5 0 0 0 .509 0l10.47-6.184a.5.5 0 0 0 .246-.431v-12.39a.5.5 0 0 0-.246-.43l-10.47-6.186a.5.5 0 0 0-.51 0l-10.47 6.185a.5.5 0 0 0-.246.43v19.587a.5.5 0 0 1-.245.43l-5.588 3.302a.5.5 0 0 1-.509 0l-5.587-3.302a.5.5 0 0 1-.246-.43v-6.648a.5.5 0 0 1 .246-.43l5.587-3.302a.5.5 0 0 1 .51 0l2.647 1.57a.5.5 0 0 0 .755-.43v-4.604Z"
          />
          <path
            stroke="#fff"
            strokeOpacity={0.3}
            d="M27.628 26.508a.5.5 0 0 0-.245-.43l-3.157-1.871a.5.5 0 0 0-.51 0l-10.47 6.206a.5.5 0 0 0-.246.43v12.391a.5.5 0 0 0 .246.43l10.47 6.186a.5.5 0 0 0 .51 0l10.47-6.185a.5.5 0 0 0 .246-.43V23.647a.5.5 0 0 1 .245-.43l5.588-3.302a.5.5 0 0 1 .509 0l5.587 3.302a.5.5 0 0 1 .246.43v6.625a.5.5 0 0 1-.246.43l-5.587 3.303a.5.5 0 0 1-.51 0l-2.647-1.57a.5.5 0 0 0-.755.43v4.603a.5.5 0 0 0 .245.43l3.158 1.872a.5.5 0 0 0 .509 0l10.47-6.184a.5.5 0 0 0 .246-.431v-12.39a.5.5 0 0 0-.246-.43l-10.47-6.186a.5.5 0 0 0-.51 0l-10.47 6.185a.5.5 0 0 0-.246.43v19.587a.5.5 0 0 1-.245.43l-5.588 3.302a.5.5 0 0 1-.509 0l-5.587-3.302a.5.5 0 0 1-.246-.43v-6.648a.5.5 0 0 1 .246-.43l5.587-3.302a.5.5 0 0 1 .51 0l2.647 1.57a.5.5 0 0 0 .755-.43v-4.604Z"
          />
        </g>
      </g>
      <defs>
        <linearGradient
          id={`${id}-b`}
          x1="32"
          x2="32"
          y1="0"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6C00F6" />
          <stop offset="1" stopColor="#5900CA" />
        </linearGradient>
        <linearGradient
          id={`${id}-c`}
          x1="32"
          x2="32"
          y1="0"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity={0.1} />
        </linearGradient>
        <clipPath id={`${id}-a`}>
          <path fill="#fff" d="M0 0h64v64H0z" />
        </clipPath>
        <filter
          id={`${id}-d`}
          width="52"
          height="48.839"
          x="6.5"
          y="9.581"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={2} />
          <feGaussianBlur stdDeviation={3} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="BackgroundImageFix" result="effect1" />
          <feBlend in="SourceGraphic" in2="effect1" result="shape" />
        </filter>
      </defs>
    </>
  )
}

// ============ BASE ====================================================

function BasePaths({ id }: { id: string }) {
  return (
    <>
      <g clipPath={`url(#${id}-a)`}>
        <path
          fill={`url(#${id}-b)`}
          d="M32 64c17.673 0 32-14.327 32-32C64 14.327 49.673 0 32 0 14.327 0 0 14.327 0 32c0 17.673 14.327 32 32 32Z"
        />
        <path
          stroke={`url(#${id}-c)`}
          strokeOpacity={0.3}
          strokeWidth={4}
          d="M32 2c16.569 0 30 13.431 30 30 0 16.569-13.431 30-30 30C15.431 62 2 48.569 2 32 2 15.431 15.431 2 32 2Z"
        />
        <g filter={`url(#${id}-d)`}>
          <path
            fill="#fff"
            fillOpacity={0.8}
            d="M32.467 51C42.979 51 51.5 42.494 51.5 32s-8.521-19-19.033-19c-9.788 0-17.849 7.375-18.914 16.86a.49.49 0 0 0 .49.543h24.114a.5.5 0 0 1 .5.5v2.194a.5.5 0 0 1-.5.5H14.044a.49.49 0 0 0-.491.542C14.618 43.625 22.679 51 32.467 51Z"
          />
          <path
            stroke="#fff"
            strokeOpacity={0.3}
            d="M32.467 51C42.979 51 51.5 42.494 51.5 32s-8.521-19-19.033-19c-9.788 0-17.849 7.375-18.914 16.86a.49.49 0 0 0 .49.543h24.114a.5.5 0 0 1 .5.5v2.194a.5.5 0 0 1-.5.5H14.044a.49.49 0 0 0-.491.542C14.618 43.625 22.679 51 32.467 51Z"
          />
        </g>
      </g>
      <defs>
        <linearGradient
          id={`${id}-b`}
          x1="32"
          x2="32"
          y1="0"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0052FF" />
          <stop offset="1" stopColor="#0041CB" />
        </linearGradient>
        <linearGradient
          id={`${id}-c`}
          x1="32"
          x2="32"
          y1="0"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity={0.1} />
        </linearGradient>
        <clipPath id={`${id}-a`}>
          <path fill="#fff" d="M0 0h64v64H0z" />
        </clipPath>
        <filter
          id={`${id}-d`}
          width="50.95"
          height="51"
          x="7.05"
          y="8.5"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={2} />
          <feGaussianBlur stdDeviation={3} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="BackgroundImageFix" result="effect1" />
          <feBlend in="SourceGraphic" in2="effect1" result="shape" />
        </filter>
      </defs>
    </>
  )
}

// ============ ARBITRUM ================================================

function ArbitrumPaths({ id }: { id: string }) {
  return (
    <>
      <g clipPath={`url(#${id}-a)`}>
        <path
          fill={`url(#${id}-b)`}
          d="M6.259 44.528V19.42c0-1.614.834-3.074 2.224-3.894L29.937 2.972a4.402 4.402 0 0 1 4.423 0l21.455 12.554a4.51 4.51 0 0 1 2.224 3.894v25.108a4.488 4.488 0 0 1-2.224 3.895L34.36 60.977a4.402 4.402 0 0 1-4.423 0L8.483 48.423c-1.365-.794-2.199-2.28-2.199-3.895h-.025Z"
        />
        <g filter={`url(#${id}-c)`}>
          <path
            fill="#12AAFF"
            d="M36.811 27.107 33.753 18.6a1.241 1.241 0 0 1 0-.742l5.257-14.63L45.1 6.79l-7.303 20.317a.524.524 0 0 1-.986 0Z"
          />
          <path
            stroke="#fff"
            strokeOpacity={0.3}
            d="m37.317 26.95.004-.005.01-.018L44.487 7.01l-5.211-3.047-5.046 14.043a.785.785 0 0 0-.027.339l.025.099 3.049 8.482c.004.01.008.016.01.018a.02.02 0 0 0 .003.004.025.025 0 0 0 .013.003.025.025 0 0 0 .013-.003Z"
          />
          <path
            fill="#12AAFF"
            d="M42.952 41.403a.524.524 0 0 1-.986 0l-3.058-8.506a1.241 1.241 0 0 1 0-.743l8.618-23.955 6.09 3.56-10.664 29.618v.026Z"
          />
          <path
            stroke="#fff"
            strokeOpacity={0.3}
            d="m42.467 41.247.015-.04 10.522-29.225-5.212-3.048-8.406 23.37a.787.787 0 0 0-.027.338l.025.099 3.049 8.482c.004.01.008.017.01.019a.022.022 0 0 0 .003.004.025.025 0 0 0 .013.003l.008-.002Z"
          />
        </g>
        <path
          fill={`url(#${id}-d)`}
          d="M32.136 60.029a.843.843 0 0 0 .43-.128l23.198-13.58c.278-.153.43-.46.43-.768V18.396a.93.93 0 0 0-.43-.77L32.566 4.049a.844.844 0 0 0-.43-.128.843.843 0 0 0-.43.128L8.508 17.627a.873.873 0 0 0-.43.768V45.58a.93.93 0 0 0 .43.768l23.198 13.58a.843.843 0 0 0 .43.127v-.025Zm0 3.971a4.755 4.755 0 0 1-2.4-.64l-23.2-13.58a4.844 4.844 0 0 1-2.4-4.201V18.42c0-1.742.91-3.33 2.4-4.202L29.737.641a4.689 4.689 0 0 1 2.4-.641c.834 0 1.643.205 2.4.64l23.2 13.58c1.49.87 2.4 2.459 2.4 4.201V45.58c0 1.742-.91 3.33-2.4 4.202L34.51 63.359a4.689 4.689 0 0 1-2.4.641h.025Z"
        />
        <path fill="#213147" d="m16.771 8.173 2.148 5.944 4.296-3.613-4.018-3.74-2.426 1.409Z" />
        <g filter={`url(#${id}-e)`}>
          <path
            fill="#fff"
            d="M30.165 47.5h-5.888c-.43 0-.834-.281-.986-.691l-12.61-35.05 6.09-3.56 13.9 38.61c.126.358-.127.717-.48.717l-.026-.026Z"
          />
          <path
            stroke="#fff"
            strokeOpacity={0.3}
            d="M24.277 47h5.925c0-.005 0-.013-.003-.024L16.504 8.934l-5.213 3.047 12.47 34.66c.082.212.3.36.516.36Z"
          />
          <path
            fill="#fff"
            d="M40.475 47.5h-5.888c-.43 0-.834-.281-.985-.691L19.197 6.789l6.09-3.56 15.669 43.58c.126.358-.127.717-.48.717V47.5Z"
          />
          <path
            stroke="#fff"
            strokeOpacity={0.3}
            d="M34.587 47h5.9c0-.005 0-.013-.004-.025L25.021 3.963l-5.212 3.048 14.262 39.63c.082.212.3.36.516.36Z"
          />
        </g>
      </g>
      <defs>
        <linearGradient
          id={`${id}-b`}
          x1="32.149"
          x2="32.149"
          y1="61.572"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#385379" />
          <stop offset="1" stopColor="#213147" />
        </linearGradient>
        <linearGradient
          id={`${id}-d`}
          x1="32.136"
          x2="32.136"
          y1="64"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#597487" />
          <stop offset="1" stopColor="#9DCCED" />
        </linearGradient>
        <clipPath id={`${id}-a`}>
          <path fill="#fff" d="M0 0h64v64H0z" />
        </clipPath>
        <filter
          id={`${id}-c`}
          width="31.92"
          height="50.52"
          x="27.697"
          y="-.772"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={2} />
          <feGaussianBlur stdDeviation={3} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="BackgroundImageFix" result="effect1" />
          <feBlend in="SourceGraphic" in2="effect1" result="shape" />
        </filter>
        <filter
          id={`${id}-e`}
          width="42.307"
          height="56.298"
          x="4.681"
          y="-.772"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={2} />
          <feGaussianBlur stdDeviation={3} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="BackgroundImageFix" result="effect1" />
          <feBlend in="SourceGraphic" in2="effect1" result="shape" />
        </filter>
      </defs>
    </>
  )
}

// ============ USDT ====================================================

function UsdtPaths({ id }: { id: string }) {
  const clipId = `${id}-clip`
  const fillId = `${id}-fill`
  const ringId = `${id}-ring`
  const shadowId = `${id}-shadow`
  return (
    <>
      <g clipPath={`url(#${clipId})`}>
        <path
          fill={`url(#${fillId})`}
          d="M32 64c17.673 0 32-14.327 32-32C64 14.327 49.673 0 32 0 14.327 0 0 14.327 0 32c0 17.673 14.327 32 32 32Z"
        />
        <path
          stroke={`url(#${ringId})`}
          strokeOpacity={0.3}
          strokeWidth={4}
          d="M32 2c16.569 0 30 13.431 30 30 0 16.569-13.431 30-30 30C15.431 62 2 48.569 2 32 2 15.431 15.431 2 32 2Z"
        />
        <g filter={`url(#${shadowId})`}>
          <path
            fill="#fff"
            fillOpacity={0.8}
            fillRule="evenodd"
            d="M35.844 34.766v-.004c-.22.016-1.354.084-3.884.084-2.02 0-3.442-.06-3.942-.084v.006c-7.776-.342-13.58-1.696-13.58-3.316 0-1.618 5.804-2.972 13.58-3.32v4.356c0 .525.405.96.93.985.728.035 1.776.069 3.046.069 1.335 0 2.301-.03 2.937-.061a.965.965 0 0 0 .913-.974v-4.371c7.76.346 13.55 1.7 13.55 3.316 0 1.62-5.79 2.97-13.55 3.314Zm0-7.18v-3.732a1 1 0 0 1 1-1h7.828a2 2 0 0 0 2-2v-3.216a2 2 0 0 0-2-2H19.19a2 2 0 0 0-2 2v3.216a2 2 0 0 0 2 2h7.828a1 1 0 0 1 1 1v3.73c-8.8.404-15.418 2.148-15.418 4.236 0 2.088 6.618 3.83 15.418 4.236V49.22a2 2 0 0 0 2 2h3.826a2 2 0 0 0 2-2V36.052c8.786-.404 15.388-2.146 15.388-4.232 0-2.086-6.602-3.828-15.388-4.234Z"
            clipRule="evenodd"
          />
        </g>
      </g>
      <defs>
        <linearGradient id={fillId} x1="32" x2="32" y1="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2FD29F" />
          <stop offset="1" stopColor="#26A17B" />
        </linearGradient>
        <linearGradient id={ringId} x1="32" x2="32" y1="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity={0.1} />
        </linearGradient>
        <clipPath id={clipId}>
          <path fill="#fff" d="M0 0h64v64H0z" />
        </clipPath>
        <filter
          id={shadowId}
          x="6.6"
          y="11.638"
          width="50.632"
          height="47.582"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={2} />
          <feGaussianBlur stdDeviation={3} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="BackgroundImageFix" result="effect1" />
          <feBlend in="SourceGraphic" in2="effect1" result="shape" />
        </filter>
      </defs>
    </>
  )
}

// ============ USDC ====================================================

function UsdcPaths({ id }: { id: string }) {
  const clipId = `${id}-clip`
  const ringId = `${id}-ring`
  const shadowId = `${id}-shadow`
  const maskId = `${id}-mask`
  return (
    <>
      <g clipPath={`url(#${clipId})`}>
        <path
          fill="#3E73C4"
          d="M32 64c17.673 0 32-14.327 32-32C64 14.327 49.673 0 32 0 14.327 0 0 14.327 0 32c0 17.673 14.327 32 32 32Z"
        />
        <path
          stroke={`url(#${ringId})`}
          strokeOpacity={0.3}
          strokeWidth={4}
          d="M32 2c16.569 0 30 13.431 30 30 0 16.569-13.431 30-30 30C15.431 62 2 48.569 2 32 2 15.431 15.431 2 32 2Z"
        />
        <g filter={`url(#${shadowId})`}>
          <mask id={maskId} fill="#fff">
            <path d="M37.608 11.606c.12-.483.608-.728 1.096-.484 6.704 2.184 12.068 7.404 14.26 14.324a21.793 21.793 0 0 1-6.767 23.342 21.791 21.791 0 0 1-7.493 4.092c-.122.12-.366.12-.488.12-.488-.122-.73-.486-.73-.97v-1.7c0-.608.242-.972.73-1.214 4.998-1.822 9.02-5.705 10.848-10.804 3.536-9.346-1.34-19.906-10.848-23.306-.366-.244-.73-.728-.73-1.214v-1.7c0-.242 0-.364.122-.486ZM25.784 11c.488.122.73.486.73.97v1.7c0 .608-.242.972-.73 1.214-4.998 1.822-9.02 5.704-10.848 10.805-3.536 9.345 1.34 19.905 10.848 23.305.366.244.73.728.73 1.092v1.7c0 .242 0 .367-.122.486-.12.486-.608.727-1.096.486-6.826-2.184-12.068-7.404-14.26-14.204a21.792 21.792 0 0 1 14.26-27.434c.122-.12.366-.12.488-.12Zm7.07 6.313c.608.122.974.485.974.971v2.912a6.08 6.08 0 0 1 5.486 4.978v.12a.834.834 0 0 1-.524.792.832.832 0 0 1-.33.058h-1.95a.917.917 0 0 1-.854-.606c-.608-1.822-1.828-2.55-4.022-2.55-2.436 0-3.656 1.092-3.656 2.792 0 1.7.73 2.67 4.386 3.155 5.12.609 7.68 2.065 7.68 6.313l-.007.303c-.147 3.13-2.544 5.542-6.087 6.129v2.916c-.122.606-.488.97-.974.97h-1.83c-.608-.12-.974-.486-.974-.97v-2.914c-4.021-.608-5.974-2.792-6.46-5.828v-.12a.833.833 0 0 1 .852-.85h2.072c.366 0 .734.244.854.728.366 1.822 1.462 3.155 4.632 3.156 2.316 0 4.022-1.336 4.022-3.276 0-1.942-1.096-2.672-4.51-3.278-5.12-.608-7.556-2.186-7.556-6.19 0-3.036 2.314-5.464 5.972-5.948v-2.792c.122-.608.488-.971.974-.971h1.83Z" />
          </mask>
          <path
            fill="#fff"
            fillOpacity={0.8}
            d="M37.608 11.606c.12-.483.608-.728 1.096-.484 6.704 2.184 12.068 7.404 14.26 14.324a21.793 21.793 0 0 1-6.767 23.342 21.791 21.791 0 0 1-7.493 4.092c-.122.12-.366.12-.488.12-.488-.122-.73-.486-.73-.97v-1.7c0-.608.242-.972.73-1.214 4.998-1.822 9.02-5.705 10.848-10.804 3.536-9.346-1.34-19.906-10.848-23.306-.366-.244-.73-.728-.73-1.214v-1.7c0-.242 0-.364.122-.486ZM25.784 11c.488.122.73.486.73.97v1.7c0 .608-.242.972-.73 1.214-4.998 1.822-9.02 5.704-10.848 10.805-3.536 9.345 1.34 19.905 10.848 23.305.366.244.73.728.73 1.092v1.7c0 .242 0 .367-.122.486-.12.486-.608.727-1.096.486-6.826-2.184-12.068-7.404-14.26-14.204a21.792 21.792 0 0 1 14.26-27.434c.122-.12.366-.12.488-.12Zm7.07 6.313c.608.122.974.485.974.971v2.912a6.08 6.08 0 0 1 5.486 4.978v.12a.834.834 0 0 1-.524.792.832.832 0 0 1-.33.058h-1.95a.917.917 0 0 1-.854-.606c-.608-1.822-1.828-2.55-4.022-2.55-2.436 0-3.656 1.092-3.656 2.792 0 1.7.73 2.67 4.386 3.155 5.12.609 7.68 2.065 7.68 6.313l-.007.303c-.147 3.13-2.544 5.542-6.087 6.129v2.916c-.122.606-.488.97-.974.97h-1.83c-.608-.12-.974-.486-.974-.97v-2.914c-4.021-.608-5.974-2.792-6.46-5.828v-.12a.833.833 0 0 1 .852-.85h2.072c.366 0 .734.244.854.728.366 1.822 1.462 3.155 4.632 3.156 2.316 0 4.022-1.336 4.022-3.276 0-1.942-1.096-2.672-4.51-3.278-5.12-.608-7.556-2.186-7.556-6.19 0-3.036 2.314-5.464 5.972-5.948v-2.792c.122-.608.488-.971.974-.971h1.83Z"
          />
        </g>
      </g>
      <defs>
        <linearGradient id={ringId} x1="32" x2="32" y1="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity={0.1} />
        </linearGradient>
        <clipPath id={clipId}>
          <path fill="#fff" d="M0 0h64v64H0z" />
        </clipPath>
        <filter
          id={shadowId}
          x="4.001"
          y="7"
          width="55.998"
          height="54"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={2} />
          <feGaussianBlur stdDeviation={3} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="BackgroundImageFix" result="effect1" />
          <feBlend in="SourceGraphic" in2="effect1" result="shape" />
        </filter>
      </defs>
    </>
  )
}

// ============ TRON ====================================================

function TronPaths({ id }: { id: string }) {
  const clipId = `${id}-clip`
  const fillId = `${id}-fill`
  const ringId = `${id}-ring`
  const shadowId = `${id}-shadow`
  return (
    <>
      <g clipPath={`url(#${clipId})`}>
        <path
          fill={`url(#${fillId})`}
          d="M32 64c17.673 0 32-14.327 32-32C64 14.327 49.673 0 32 0 14.327 0 0 14.327 0 32c0 17.673 14.327 32 32 32Z"
        />
        <path
          stroke={`url(#${ringId})`}
          strokeOpacity={0.3}
          strokeWidth={4}
          d="M32 2c16.569 0 30 13.431 30 30 0 16.569-13.431 30-30 30C15.431 62 2 48.569 2 32 2 15.431 15.431 2 32 2Z"
        />
        <g filter={`url(#${shadowId})`}>
          <path
            fill="#fff"
            fillOpacity={0.8}
            d="M43.972 19.928a.5.5 0 0 0-.254-.129l-27.829-5.121a.5.5 0 0 0-.555.676L29.877 51.95a.5.5 0 0 0 .851.133l20.333-24.774a.5.5 0 0 0-.042-.68l-7.047-6.7Zm-.914 2.523a.5.5 0 0 1 .665.022l3.379 3.212a.5.5 0 0 1-.256.855l-9.24 1.672c-.506.092-.804-.547-.41-.876l5.862-4.885Zm-9.623 5.395a.5.5 0 0 1-.639 0L21.863 18.78c-.396-.328-.097-.97.41-.876l17.87 3.288a.5.5 0 0 1 .23.876l-6.938 5.779ZM32 29.806a.5.5 0 0 1 .177.445L30.37 45.19c-.062.514-.77.605-.961.124l-9.742-24.521c-.191-.482.385-.9.784-.57L32 29.806Zm2.086 1.45a.5.5 0 0 1 .407-.432l11.672-2.112a.5.5 0 0 1 .476.81L33.253 45.83c-.318.386-.943.12-.883-.377l1.716-14.197Z"
          />
        </g>
      </g>
      <defs>
        <linearGradient id={fillId} x1="32" x2="32" y1="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF5672" />
          <stop offset="1" stopColor="#EF0027" />
        </linearGradient>
        <linearGradient id={ringId} x1="32" x2="32" y1="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity={0.1} />
        </linearGradient>
        <clipPath id={clipId}>
          <path fill="#fff" d="M0 0h64v64H0z" />
        </clipPath>
        <filter
          id={shadowId}
          x="8.797"
          y="10.169"
          width="48.878"
          height="50.597"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={2} />
          <feGaussianBlur stdDeviation={3} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="BackgroundImageFix" result="effect1" />
          <feBlend in="SourceGraphic" in2="effect1" result="shape" />
        </filter>
      </defs>
    </>
  )
}

// ============ ETH =====================================================

function EthPaths({ id }: { id: string }) {
  const clipId = `${id}-clip`
  const fillId = `${id}-fill`
  const ringId = `${id}-ring`
  const shadowId = `${id}-shadow`
  return (
    <>
      <g clipPath={`url(#${clipId})`}>
        <path
          fill={`url(#${fillId})`}
          d="M32 64c17.673 0 32-14.327 32-32C64 14.327 49.673 0 32 0 14.327 0 0 14.327 0 32c0 17.673 14.327 32 32 32Z"
        />
        <path
          stroke={`url(#${ringId})`}
          strokeOpacity={0.3}
          strokeWidth={4}
          d="M32 2c16.569 0 30 13.431 30 30 0 16.569-13.431 30-30 30C15.431 62 2 48.569 2 32 2 15.431 15.431 2 32 2Z"
        />
        <g filter={`url(#${shadowId})`}>
          <path fill="#fff" fillOpacity={0.602} d="M32.996 8v17.74l14.994 6.7L32.996 8Z" />
          <path fill="#fff" d="M32.996 8 18 32.44l14.996-6.7V8Z" />
          <path fill="#fff" fillOpacity={0.602} d="M32.996 43.936V55.99L48 35.232l-15.004 8.704Z" />
          <path fill="#fff" d="M32.996 55.99V43.934L18 35.232 32.996 55.99Z" />
          <path
            fill="#fff"
            fillOpacity={0.2}
            d="M32.996 41.146 47.99 32.44l-14.994-6.696v15.402Z"
          />
          <path fill="#fff" fillOpacity={0.602} d="m18 32.44 14.996 8.706V25.744L18 32.44Z" />
        </g>
      </g>
      <defs>
        <linearGradient id={fillId} x1="32" x2="32" y1="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A3B6FF" />
          <stop offset="1" stopColor="#627EEA" />
        </linearGradient>
        <linearGradient id={ringId} x1="32" x2="32" y1="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity={0.1} />
        </linearGradient>
        <clipPath id={clipId}>
          <path fill="#fff" d="M0 0h64v64H0z" />
        </clipPath>
        <filter
          id={shadowId}
          x="12"
          y="4"
          width="42"
          height="59.99"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={2} />
          <feGaussianBlur stdDeviation={3} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="BackgroundImageFix" result="effect1" />
          <feBlend in="SourceGraphic" in2="effect1" result="shape" />
        </filter>
      </defs>
    </>
  )
}
