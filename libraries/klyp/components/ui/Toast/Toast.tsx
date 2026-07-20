import './Toast.scss'

import {
  CheckOutline,
  CloseCircleOutline,
  DangerOutline,
  InfoCircleOutline,
  RegenerateOutline,
} from '@klyp/icons/outline'
import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

// =====================================================================
// Toast — Klyp wrapper over the `sonner` toast library
// =====================================================================
// Sonner is a tree-shaken toast library — Klyp keeps using its `toast.*` API
// directly. We only rewrap the <Toaster> component on Klyp DTCG tokens.
//
// Exported as `Toaster` (sonner convention; matches every existing
// `import { Toaster } from '@klyp/ui'` consumer at the app root).
//
// Icons are sourced from `@klyp/icons/outline` (Iconsax outline is the
// canonical Klyp default — see `.claude/rules/frontend.md`). Per-type colour
// is applied in `Toast.scss` via `&[data-type='…'] svg`.

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="klyp-Toaster"
      icons={{
        success: <CheckOutline className="klyp-Toast__icon" />,
        info: <InfoCircleOutline className="klyp-Toast__icon" />,
        warning: <DangerOutline className="klyp-Toast__icon" />,
        error: <CloseCircleOutline className="klyp-Toast__icon" />,
        loading: <RegenerateOutline className="klyp-Toast__icon klyp-Toast__icon--spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--color-bg-surface)',
          '--normal-text': 'var(--color-fg-primary)',
          '--normal-border': 'var(--color-border-default)',
          '--border-radius': 'var(--r-card)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 'klyp-Toast',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
