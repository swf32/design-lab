import './ProviderIcon.scss'

// =====================================================================
// ProviderIcon — branded SVG logos for AI model providers.
//
// Pure visual atom. Caller resolves which `provider` to pass (see
// chat-side `inferProvider(modelId)` for ID-prefix taxonomy). Returns
// the official-looking logo for the matching provider, sized via the
// `size` prop. Fallback to a monogram badge for `other`.
//
// Logos inlined as React components (no external SVG files) so the
// bundle stays minimal and tree-shakes when individual providers are
// unused. Promote to `@klyp/icons` if the count grows past ~10.
// =====================================================================

export type ProviderKey =
  | 'anthropic'
  | 'openai'
  | 'google'
  | 'xai'
  | 'kling'
  | 'seedance'
  | 'elevenlabs'
  | 'other'

export const PROVIDER_LABELS: Record<ProviderKey, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  google: 'Google',
  xai: 'xAI',
  kling: 'Kling',
  seedance: 'Seedance',
  elevenlabs: 'ElevenLabs',
  other: 'Other',
}

/** Canonical render order for provider groups (e.g. inside ModelPickerModal). */
export const PROVIDER_ORDER: readonly ProviderKey[] = [
  'anthropic',
  'openai',
  'google',
  'xai',
  'kling',
  'seedance',
  'elevenlabs',
  'other',
] as const

// =====================================================================
// Logos
// =====================================================================

function AnthropicLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <g clipPath="url(#claude-clip)">
        <mask id="claude-mask" fill="#fff">
          <path d="m4.709 15.955 4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 0 1-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006Z" />
        </mask>
        <path
          fill="url(#claude-grad)"
          d="m4.709 15.955 4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 0 1-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006Z"
        />
      </g>
      <defs>
        <linearGradient
          id="claude-grad"
          x1="12"
          x2="12"
          y1="0"
          y2="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF9472" />
          <stop offset="1" stopColor="#D97757" />
        </linearGradient>
        <clipPath id="claude-clip">
          <path fill="#fff" d="M0 0h24v24H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

function OpenAILogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <g clipPath="url(#openai-clip)">
        <path
          fill="url(#openai-grad)"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 0 0-.856 0l-5.97 3.473Zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 0 1 .476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163l.001-.002ZM7.802 12.703l-1.95-1.142a.453.453 0 0 1-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.899ZM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128Zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.471-4.614 4.471Zm-5.637-5.303-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 0 1 4.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 0 1-.476 0Zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71a.794.794 0 0 0 .856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523Zm5.899 2.83a5.947 5.947 0 0 0 5.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947a5.65 5.65 0 0 0-1.88.31A5.962 5.962 0 0 0 10.205 0a5.947 5.947 0 0 0-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 0 0 4.162 1.713v-.002Z"
        />
      </g>
      <defs>
        <linearGradient
          id="openai-grad"
          x1="12"
          x2="12"
          y1="0"
          y2="23.787"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#999" />
        </linearGradient>
        <clipPath id="openai-clip">
          <path fill="#fff" d="M0 0h24v24H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

function GoogleLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#3186FF"
        d="M20.616 10.835a14.146 14.146 0 0 1-4.45-3.001 14.111 14.111 0 0 1-3.678-6.452.503.503 0 0 0-.975 0c-.63 2.44-1.9 4.668-3.679 6.452a14.155 14.155 0 0 1-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 0 0 0 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 0 1 4.45 3.001 14.113 14.113 0 0 1 3.679 6.453.502.502 0 0 0 .975 0c.172-.685.397-1.351.677-2.003a14.144 14.144 0 0 1 3.001-4.45 14.113 14.113 0 0 1 6.453-3.678.502.502 0 0 0 0-.975 13.24 13.24 0 0 1-2.003-.678Z"
      />
      <path
        fill="url(#gemini-a)"
        d="M20.616 10.835a14.146 14.146 0 0 1-4.45-3.001 14.111 14.111 0 0 1-3.678-6.452.503.503 0 0 0-.975 0c-.63 2.44-1.9 4.668-3.679 6.452a14.155 14.155 0 0 1-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 0 0 0 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 0 1 4.45 3.001 14.113 14.113 0 0 1 3.679 6.453.502.502 0 0 0 .975 0c.172-.685.397-1.351.677-2.003a14.144 14.144 0 0 1 3.001-4.45 14.113 14.113 0 0 1 6.453-3.678.502.502 0 0 0 0-.975 13.24 13.24 0 0 1-2.003-.678Z"
      />
      <path
        fill="url(#gemini-b)"
        d="M20.616 10.835a14.146 14.146 0 0 1-4.45-3.001 14.111 14.111 0 0 1-3.678-6.452.503.503 0 0 0-.975 0c-.63 2.44-1.9 4.668-3.679 6.452a14.155 14.155 0 0 1-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 0 0 0 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 0 1 4.45 3.001 14.113 14.113 0 0 1 3.679 6.453.502.502 0 0 0 .975 0c.172-.685.397-1.351.677-2.003a14.144 14.144 0 0 1 3.001-4.45 14.113 14.113 0 0 1 6.453-3.678.502.502 0 0 0 0-.975 13.24 13.24 0 0 1-2.003-.678Z"
      />
      <path
        fill="url(#gemini-c)"
        d="M20.616 10.835a14.146 14.146 0 0 1-4.45-3.001 14.111 14.111 0 0 1-3.678-6.452.503.503 0 0 0-.975 0c-.63 2.44-1.9 4.668-3.679 6.452a14.155 14.155 0 0 1-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 0 0 0 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 0 1 4.45 3.001 14.113 14.113 0 0 1 3.679 6.453.502.502 0 0 0 .975 0c.172-.685.397-1.351.677-2.003a14.144 14.144 0 0 1 3.001-4.45 14.113 14.113 0 0 1 6.453-3.678.502.502 0 0 0 0-.975 13.24 13.24 0 0 1-2.003-.678Z"
      />
      <defs>
        <linearGradient
          id="gemini-a"
          x1="7"
          x2="11"
          y1="15.5"
          y2="12"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#08B962" />
          <stop offset="1" stopColor="#08B962" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="gemini-b"
          x1="8"
          x2="11.5"
          y1="5.5"
          y2="11"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F94543" />
          <stop offset="1" stopColor="#F94543" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="gemini-c"
          x1="3.5"
          x2="17.5"
          y1="13.5"
          y2="12"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FABC12" />
          <stop offset=".46" stopColor="#FABC12" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function XaiLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 34 33"
      aria-hidden="true"
    >
      {/* xAI Grok mark (Aurora two-slash glyph), `currentColor` — same
          monochrome treatment as the ElevenLabs mark. Single source of truth:
          the chat-side local `GrokMark` override was retired in favour of this. */}
      <path
        fill="currentColor"
        d="M13.2371 21.0407L24.3186 12.8506C24.8619 12.4491 25.6384 12.6057 25.8973 13.2294C27.2597 16.5185 26.651 20.4712 23.9403 23.1851C21.2297 25.8989 17.4581 26.4941 14.0108 25.1386L10.2449 26.8843C15.6463 30.5806 22.2053 29.6665 26.304 25.5601C29.5551 22.3051 30.562 17.8683 29.6205 13.8673L29.629 13.8758C28.2637 7.99809 29.9647 5.64871 33.449 0.844576C33.5314 0.730667 33.6139 0.616757 33.6964 0.5L29.1113 5.09055V5.07631L13.2343 21.0436"
      />
      <path
        fill="currentColor"
        d="M10.9503 23.0313C7.07343 19.3235 7.74185 13.5853 11.0498 10.2763C13.4959 7.82722 17.5036 6.82767 21.0021 8.2971L24.7595 6.55998C24.0826 6.07017 23.215 5.54334 22.2195 5.17313C17.7198 3.31926 12.3326 4.24192 8.67479 7.90126C5.15635 11.4239 4.0499 16.8403 5.94992 21.4622C7.36924 24.9165 5.04257 27.3598 2.69884 29.826C1.86829 30.7002 1.0349 31.5745 0.36364 32.5L10.9474 23.0341"
      />
    </svg>
  )
}

function KlingLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <g clipPath="url(#kling-clip)">
        <path
          fill="url(#kling-b)"
          d="M5.412 13.775A23.195 23.195 0 0 1 7.41 9.32c3.17-5.492 7.795-8.757 10.33-7.294C12.038-1.266 4.598.944 1.122 6.964A13.378 13.378 0 0 0 .085 9.22c-.259.739.092 1.534.77 1.926l4.557 2.63v-.001Z"
        />
        <path
          fill="url(#kling-c)"
          d="M18.588 10.164a23.193 23.193 0 0 1-1.999 4.455c-3.17 5.492-7.795 8.758-10.33 7.294 5.703 3.293 13.143 1.082 16.619-4.938.415-.718.762-1.473 1.037-2.255.259-.738-.092-1.534-.77-1.925l-4.557-2.63v-.001Z"
        />
        <path
          fill="url(#kling-d)"
          d="M16.59 14.62c3.17-5.492 3.686-11.13 1.15-12.594C15.207.563 10.582 3.83 7.41 9.32c2.074-3.59 5.809-5.315 8.344-3.852 2.534 1.464 2.908 5.56.835 9.151l.001.001Z"
        />
        <path
          fill="url(#kling-e)"
          d="M7.41 9.32c-3.17 5.492-3.686 11.13-1.15 12.593 2.534 1.464 7.159-1.802 10.33-7.294-2.074 3.591-5.809 5.316-8.344 3.852-2.534-1.463-2.908-5.56-.835-9.15L7.41 9.32Z"
        />
      </g>
      <defs>
        <radialGradient
          id="kling-b"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(7.47772 -12.51022 17.14368 10.24728 5.173 13.637)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset=".095" stopColor="#FFF959" />
          <stop offset=".326" stopColor="#0DF35E" />
          <stop offset=".64" stopColor="#0BF2F9" />
          <stop offset="1" stopColor="#04A6F0" />
        </radialGradient>
        <radialGradient
          id="kling-c"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="rotate(120.868 6.491 10.491) scale(14.5747 19.9728)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset=".095" stopColor="#FFF959" />
          <stop offset=".326" stopColor="#0DF35E" />
          <stop offset=".64" stopColor="#0BF2F9" />
          <stop offset="1" stopColor="#04A6F0" />
        </radialGradient>
        <linearGradient
          id="kling-d"
          x1="15.578"
          x2="18.062"
          y1="1.798"
          y2="9.861"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#003EFF" />
          <stop offset="1" stopColor="#0BFFE7" />
        </linearGradient>
        <linearGradient
          id="kling-e"
          x1="8.422"
          x2="5.938"
          y1="22.142"
          y2="14.079"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#003EFF" />
          <stop offset="1" stopColor="#0BFFE7" />
        </linearGradient>
        <clipPath id="kling-clip">
          <path fill="#fff" d="M0 0h24v24H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

function SeedanceLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="url(#bd-a)"
        d="m14.944 18.587-1.704-.445V10.01l1.824-.462c1-.254 1.84-.461 1.88-.453.032 0 .056 2.235.056 4.972v4.973l-.176-.008c-.104 0-.952-.206-1.88-.445Z"
      />
      <path
        fill="url(#bd-b)"
        d="M7 16.542c0-2.736.024-4.98.064-4.98.032-.008.872.2 1.88.454l1.816.461-.016 4.05-.024 4.049-1.632.422c-.896.23-1.736.445-1.856.469L7 21.523v-4.981Z"
      />
      <path
        fill="url(#bd-c)"
        d="M19.24 12.477c0-9.03.008-9.515.144-9.475.072.024.784.207 1.576.406.792.207 1.576.405 1.744.445l.296.08-.016 8.56-.024 8.568-1.624.414c-.888.23-1.728.437-1.856.47l-.24.055v-9.523Z"
      />
      <path
        fill="url(#bd-d)"
        d="M1 12.509c0-4.678.024-8.505.064-8.505.032 0 .872.207 1.872.454l1.824.461v7.582c0 4.16-.016 7.574-.032 7.574-.024 0-.872.215-1.88.47L1 21.013v-8.504Z"
      />
      <defs>
        <linearGradient
          id="bd-a"
          x1="15.12"
          x2="15.12"
          y1="9.095"
          y2="19.04"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00C8D2" />
          <stop offset="1" stopColor="#00676C" />
        </linearGradient>
        <linearGradient
          id="bd-b"
          x1="8.88"
          x2="8.88"
          y1="11.562"
          y2="21.523"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3C8CFF" />
          <stop offset="1" stopColor="#245499" />
        </linearGradient>
        <linearGradient
          id="bd-c"
          x1="21.12"
          x2="21.12"
          y1="3"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#78E6DC" />
          <stop offset="1" stopColor="#43807A" />
        </linearGradient>
        <linearGradient
          id="bd-d"
          x1="2.88"
          x2="2.88"
          y1="4.004"
          y2="21.013"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#325AB4" />
          <stop offset="1" stopColor="#16274E" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function ElevenLabsLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {/* Two rounded vertical bars — ElevenLabs brand mark */}
      <rect x="7" y="3" width="4" height="18" rx="2" fill="currentColor" />
      <rect x="13" y="3" width="4" height="18" rx="2" fill="currentColor" />
    </svg>
  )
}

function OtherLogo() {
  return (
    <span aria-hidden="true" className="klyp-ProviderIcon__fallback">
      ?
    </span>
  )
}

const LOGO_BY_PROVIDER: Record<ProviderKey, () => React.JSX.Element> = {
  anthropic: AnthropicLogo,
  openai: OpenAILogo,
  google: GoogleLogo,
  xai: XaiLogo,
  kling: KlingLogo,
  seedance: SeedanceLogo,
  elevenlabs: ElevenLabsLogo,
  other: OtherLogo,
}

export interface ProviderIconProps {
  provider: ProviderKey
  /**
   * Render size:
   *   - `sm` (default, 16×16) — dense inline contexts (chip triggers).
   *   - `lg` (20×20) — list rows (picker modal).
   */
  size?: 'sm' | 'lg'
}

/**
 * Branded SVG logo for an AI model provider. Pure visual atom — caller
 * resolves the `provider` key (e.g. via chat-side `inferProvider(id)`).
 */
export function ProviderIcon({ provider, size = 'sm' }: ProviderIconProps) {
  const Logo = LOGO_BY_PROVIDER[provider]
  return (
    <span
      aria-hidden="true"
      className="klyp-ProviderIcon"
      data-provider={provider}
      data-size={size}
    >
      <Logo />
    </span>
  )
}

export default ProviderIcon
