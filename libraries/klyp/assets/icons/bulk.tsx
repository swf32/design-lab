import type { SVGProps } from 'react'

/**
 * @deprecated 2026-05-14 — all 45 bulk icon implementations removed per
 * the design lead. The prior handmade duo-tones never matched any canonical Iconsax
 * pack, and attempted Iconsax-extraction migrations didn't land cleanly
 * either. Each export below now renders `null` so existing ~70 call-sites
 * compile but visually paint nothing — replace each call-site with the
 * outline equivalent from `@klyp/icons/outline` (or remove the icon
 * entirely if it isn't needed). This file will be deleted once the
 * call-site migration is complete.
 *
 * Migration path per consumer:
 *   `import { XBulk } from '@klyp/icons/bulk'`  →
 *   `import { CloseCircleOutline } from '@klyp/icons/outline'`
 * (etc. — pick the closest outline shape per visual intent).
 */

type IconProps = SVGProps<SVGSVGElement>

// All bulk exports below render `null`. The argument is kept to preserve
// the call-site signature `<XBulk {...props} />` without TS errors. Each
// function is one line so the deprecation is visually obvious in the
// file too.
//
// Underscore prefix on the unused arg silences Biome's `noUnusedVariables`
// rule (project convention, see `.claude/rules/frontend.md`).

const noIcon = (_props: IconProps) => null

export const SparklesBulk = noIcon
export const Loader2Bulk = noIcon
export const PlayBulk = noIcon
export const AlertTriangleBulk = noIcon
export const CheckCircleBulk = noIcon
export const ArchiveBulk = noIcon
export const PlusBulk = noIcon
export const RotateCwBulk = noIcon
export const UploadCloudBulk = noIcon
export const ImageBulk = noIcon
export const TrashBulk = noIcon
export const ChevronRightBulk = noIcon
export const RefreshBulk = noIcon
export const ArrowLeftBulk = noIcon
export const ArrowRightBulk = noIcon
export const BookmarkBulk = noIcon
export const CloseBulk = noIcon
export const XBulk = noIcon
export const CheckBulk = noIcon
export const ChevronDownBulk = noIcon
export const ChevronLeftBulk = noIcon
export const CircleBulk = noIcon
export const CircleUserBulk = noIcon
export const UserBulk = noIcon
export const CommandBulk = noIcon
export const FilmBulk = noIcon
export const TextFileBulk = noIcon
export const FileBulk = noIcon
export const FolderOpenBulk = noIcon
export const HeartBulk = noIcon
export const InfoBulk = noIcon
export const MapPinBulk = noIcon
export const MoreHorizontalBulk = noIcon
export const Music2Bulk = noIcon
export const OctagonXBulk = noIcon
export const PaletteBulk = noIcon
export const SearchBulk = noIcon
export const ShirtBulk = noIcon
export const StarBulk = noIcon
export const UploadBulk = noIcon
export const Code1Bulk = noIcon
export const ZapBulk = noIcon
export const UsersBulk = noIcon
export const VideoBulk = noIcon
export const MegaphoneBulk = noIcon

/** 🪙 Coins (BULK, two-tone iconsax money/coins) — token balance / top-up /
 *  insufficient-funds. Front coin (secondary) at 0.4 opacity; tints via
 *  `currentColor` (mask + clip-path dropped — full-viewBox no-ops that only
 *  risked duplicate ids). */
export function CoinsBulk(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path
        opacity="0.4"
        d="M12.1442 11.6456C17.0229 10.7856 20.6289 8.10875 20.1984 5.66668C19.7679 3.22462 15.464 1.94211 10.5853 2.80213C5.70655 3.66214 2.1006 6.339 2.53108 8.78107C2.96157 11.2231 7.26548 12.5056 12.1442 11.6456Z"
      />
      <path d="M18.2124 9.21045C20.4411 10.4104 21.7399 12.0305 21.48 13.5601C21.38 14.12 21.0701 14.6203 20.6001 15.0503C19.0301 16.4702 15.6198 17.0694 11.8599 16.4194C9.4201 15.9794 7.31006 15.1001 5.85011 14.0103H5.84035C4.43456 12.9807 3.64606 11.7547 3.78566 10.5757C5.48508 11.7825 8.66834 12.2586 12.1441 11.646C14.6119 11.211 16.7536 10.3097 18.2124 9.21045Z" />
      <path
        opacity="0.4"
        d="M5.84985 14.0103C7.30976 15.1001 9.41995 15.9794 11.8596 16.4194C15.6153 17.0687 19.0216 16.4707 20.594 15.0542C21.1714 15.6432 21.5002 16.3119 21.5002 17.0103C21.4997 19.49 17.48 21.4994 12.5305 21.4995C7.58087 21.4995 3.56034 19.49 3.55981 17.0103C3.55981 15.8604 4.43007 14.8002 5.84985 14.0103Z"
      />
    </svg>
  )
}

/** 💳✕ Card-remove (BULK, two-tone) — failed payment / card declined
 *  (canonical iconsax money/bulk/card-remove). Re-introduced as a REAL
 *  implementation per explicit design-lead request (DEV-919). Card body
 *  (secondary) at 0.4 opacity; tints via `currentColor`. */
export function CardRemoveBulk(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.8999 15.0303C16.6899 15.0303 14.8999 16.8203 14.8999 19.0303C14.8999 21.2403 16.6899 23.0303 18.8999 23.0303C21.1099 23.0303 22.8999 21.2403 22.8999 19.0303C22.8999 16.8203 21.1099 15.0303 18.8999 15.0303ZM20.4999 20.6803C20.3499 20.8303 20.1598 20.9003 19.9698 20.9003C19.7798 20.9003 19.5899 20.8303 19.4399 20.6803L18.9099 20.1503L18.3599 20.7003C18.2099 20.8503 18.0199 20.9203 17.8299 20.9203C17.6399 20.9203 17.4499 20.8503 17.2999 20.7003C17.0099 20.4103 17.0099 19.9303 17.2999 19.6403L17.8499 19.0903L17.3199 18.5603C17.0299 18.2703 17.0299 17.7903 17.3199 17.5003C17.6099 17.2103 18.0899 17.2103 18.3799 17.5003L18.9099 18.0303L19.4099 17.5303C19.6999 17.2403 20.1798 17.2403 20.4698 17.5303C20.7598 17.8203 20.7598 18.3003 20.4698 18.5903L19.9698 19.0903L20.4999 19.6203C20.7899 19.9103 20.7899 20.3903 20.4999 20.6803Z" />
      <path d="M22 7.54039V9.00039H2V7.54039C2 5.25039 3.86002 3.40039 6.15002 3.40039H17.85C20.14 3.40039 22 5.25039 22 7.54039Z" />
      <path
        opacity="0.4"
        d="M2 9V16.46C2 18.75 3.85001 20.6 6.14001 20.6H12.4C12.98 20.6 13.48 20.11 13.43 19.53C13.29 18 13.78 16.34 15.14 15.02C15.7 14.47 16.39 14.05 17.14 13.81C18.39 13.41 19.6 13.46 20.67 13.82C21.32 14.04 22 13.57 22 12.88V9H2ZM8 17.25H6C5.59 17.25 5.25 16.91 5.25 16.5C5.25 16.09 5.59 15.75 6 15.75H8C8.41 15.75 8.75 16.09 8.75 16.5C8.75 16.91 8.41 17.25 8 17.25Z"
      />
      <path d="M8.75 16.5C8.75 16.91 8.41 17.25 8 17.25H6C5.59 17.25 5.25 16.91 5.25 16.5C5.25 16.09 5.59 15.75 6 15.75H8C8.41 15.75 8.75 16.09 8.75 16.5Z" />
    </svg>
  )
}

/**
 * 🎤 Microphone (bulk / two-tone) — solid mic capsule + the stand-arc at 0.4
 * opacity (canonical Iconsax bulk `microphone`). Re-introduced as a REAL bulk
 * impl (same precedent as `CardRemoveBulk`) per Val's explicit request — it's
 * the idle/recording glyph for the `VoiceDictation` composer button. The
 * per-path 0.4 is the intended duo-tone (filled regions don't overlap, so the
 * outline-stroke-doubling caveat does not apply here).
 */
export function MicrophoneBulk(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path
        opacity="0.4"
        d="M19.1202 9.12035C18.7302 9.12035 18.4202 9.43035 18.4202 9.82035V11.4004C18.4202 14.9404 15.5402 17.8204 12.0002 17.8204C8.46018 17.8204 5.58018 14.9404 5.58018 11.4004V9.81035C5.58018 9.42035 5.27018 9.11035 4.88018 9.11035C4.49018 9.11035 4.18018 9.42035 4.18018 9.81035V11.3904C4.18018 15.4604 7.31018 18.8104 11.3002 19.1704V21.3004C11.3002 21.6904 11.6102 22.0004 12.0002 22.0004C12.3902 22.0004 12.7002 21.6904 12.7002 21.3004V19.1704C16.6802 18.8204 19.8202 15.4604 19.8202 11.3904V9.81035C19.8102 9.43035 19.5002 9.12035 19.1202 9.12035Z"
      />
      <path d="M12.0001 2C9.56008 2 7.58008 3.98 7.58008 6.42V11.54C7.58008 13.98 9.56008 15.96 12.0001 15.96C14.4401 15.96 16.4201 13.98 16.4201 11.54V6.42C16.4201 3.98 14.4401 2 12.0001 2ZM13.3101 8.95C13.2401 9.21 13.0101 9.38 12.7501 9.38C12.7001 9.38 12.6501 9.37 12.6001 9.36C12.2101 9.25 11.8001 9.25 11.4101 9.36C11.0901 9.45 10.7801 9.26 10.7001 8.95C10.6101 8.64 10.8001 8.32 11.1101 8.24C11.7001 8.08 12.3201 8.08 12.9101 8.24C13.2101 8.32 13.3901 8.64 13.3101 8.95ZM13.8401 7.01C13.7501 7.25 13.5301 7.39 13.2901 7.39C13.2201 7.39 13.1601 7.38 13.0901 7.36C12.3901 7.1 11.6101 7.1 10.9101 7.36C10.6101 7.47 10.2701 7.31 10.1601 7.01C10.0501 6.71 10.2101 6.37 10.5101 6.27C11.4701 5.92 12.5301 5.92 13.4901 6.27C13.7901 6.38 13.9501 6.71 13.8401 7.01Z" />
    </svg>
  )
}
