import { createElement, useState } from 'react'
import type { StoryExample } from '../../../storyContract'
import { CanvasBackgroundControl, type CanvasMode } from './CanvasBackgroundControl'

function CanvasBackgroundControlFixture({
  mode: initialMode,
  color: initialColor,
  themes,
  initialTheme,
}: {
  mode: CanvasMode
  color: string
  themes?: string[]
  initialTheme?: string
}) {
  const [mode, setMode] = useState(initialMode)
  const [color, setColor] = useState(initialColor)
  const [theme, setTheme] = useState(initialTheme ?? themes?.[0] ?? 'default')

  return createElement(CanvasBackgroundControl, {
    mode,
    color,
    onModeChange: setMode,
    onColorChange: setColor,
    themes,
    theme,
    onThemeChange: setTheme,
  })
}

export function renderStoryExample(example: StoryExample) {
  return createElement(CanvasBackgroundControlFixture, {
    mode: String(example.props.mode ?? 'dark-grid') as CanvasMode,
    color: String(example.props.color ?? '#264653'),
    themes: example.props.themes ? ['blue', 'red', 'white'] : undefined,
    initialTheme: String(example.props.theme ?? 'blue'),
  })
}

export const stories = [
  {
    id: 'modes',
    kind: 'behavior',
    name: 'Compact mode disclosure',
    description:
      'Only the selected background is visible at rest; hover or keyboard focus reveals every mode.',
    interactive: true,
    examples: [
      { label: 'Dark grid', props: { mode: 'dark-grid' } },
      { label: 'Light grid', props: { mode: 'light-grid' } },
      { label: 'Solid', props: { mode: 'solid', color: '#264653' } },
    ],
  },
  {
    id: 'source-themes',
    kind: 'behavior',
    name: 'Source theme disclosure',
    description:
      'Hover or focus reveals arbitrary themes discovered from the active design system beside the independent Canvas background.',
    interactive: true,
    examples: [{ label: 'Blue, red, white', props: { themes: true, theme: 'blue' } }],
  },
  {
    id: 'picker',
    kind: 'behavior',
    name: 'Solid color picker',
    description: 'Choose saturation, brightness, hue, a preset, or a valid six-digit HEX value.',
    interactive: true,
    examples: [{ label: 'Open', props: { mode: 'solid' } }],
  },
]
