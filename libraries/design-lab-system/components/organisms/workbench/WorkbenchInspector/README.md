# Workbench Inspector

Shared developer-handoff inspector for fullscreen Component Playgrounds and page Wireframes. It
listens only inside the supplied `surfaceRef`, so review-shell actions remain usable and never become
accidental inspection targets.

Component roots produce copyable JSX from public inspection props. Named slots produce HTML.
Ordinary elements produce declarations from matching same-origin authored style rules, preserving
expressions such as `width: 100%` and `var(--token)` instead of reporting computed pixels or RGB.

Pointer hover previews targets on desktop. Pointer activation selects and pins the code popover on
desktop and touch while consuming the product click, so inspected links and controls never navigate
or mutate the screen. The pinned popover remains copyable while the pointer moves; activate another
target to replace it. Escape first clears a pinned selection and then turns Inspector off.

While Inspector is active, every explicitly marked Component root receives a quiet purple dashed
outline and every named slot receives a quiet pink dashed outline. This gives an immediate map of
Component composition before a specific target is selected. The selected Component, slot, and
raw-element identities use stronger purple, pink, and neutral dashed boundaries respectively.
