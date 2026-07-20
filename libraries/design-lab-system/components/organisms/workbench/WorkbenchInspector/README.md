# Workbench Inspector

Shared developer-handoff inspector for fullscreen Component Playgrounds and page Wireframes. It
listens only inside the supplied `surfaceRef`, so review-shell actions remain usable and never become
accidental inspection targets.

The review-build source transform resolves ordinary Component imports against discovered manifests
and registers the exact TSX callsite automatically. Manifest-declared slot props register their
caller-supplied TSX subtree, so a rendered SVG icon hands off its Library import and `<StarIcon />`
usage rather than a generated `<path>`. Component and Wireframe authors add no Inspector attributes
and never duplicate source as a string.

Ordinary elements retain only an automatic source-file location in the runtime registry. The
Inspector asks the Node source analyzer for selectors in the `.scss` or `.css` imported by that
TSX file. The returned fragment preserves `$variables`, `@use` / `@import`, mixin calls, nesting,
`width: 100%`, and `var(--token)`. Browser CSSOM and computed styles are not handoff sources.

A slot owns its caller-supplied subtree, so hovering or selecting an SVG path inside a `leading`
icon resolves to the `leading` slot. Component identity remains on the rendered Component root;
ordinary descendants remain independently inspectable.

Pointer hover previews targets on desktop. Pointer activation selects and pins the code popover on
desktop and touch while consuming the product click, so inspected links and controls never navigate
or mutate the screen. The pinned popover remains copyable while the pointer moves; activate another
surface target once to clear it, then activate a target to create the next selection. Escape first
clears a pinned selection and then turns Inspector off.

While Inspector is active, every automatically discovered Component root receives a quiet purple
dashed 2px outline and every manifest-declared slot receives a quiet pink dashed outline. This gives an immediate map of
Component composition before a specific target is selected. The selected Component, slot, and
raw-element identities use stronger purple, pink, and neutral dashed boundaries respectively.
