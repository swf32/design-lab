# Workbench Inspector

Shared developer-handoff inspector for fullscreen Component Playgrounds and page Wireframes. It
listens only inside the supplied `surfaceRef`, so review-shell actions remain usable and never become
accidental inspection targets.

Component roots produce copyable JSX from public inspection props. Named slots produce HTML.
Ordinary elements produce declarations from matching same-origin authored style rules, preserving
expressions such as `width: 100%` and `var(--token)` instead of reporting computed pixels or RGB.

Pointer hover previews targets on desktop. Pointer activation selects on desktop and touch. Escape
turns Inspector off. Component, slot, and raw-element identities use purple, pink, and neutral dashed
boundaries respectively.
