# Workbench Inspector

Shared developer-handoff inspector for fullscreen Component Playgrounds, Wireframes, Pages, and
Design Lab's own application shell. It listens only inside the supplied `surfaceRef`, so content
outside that explicit boundary remains untouched and Inspector actions never become accidental
inspection targets.

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

A raw `<img>`, `<video>`, or `<source>` host is not always inside a slot — a Page hero image is
often authored directly. When that element's `src`, `poster`, or `href` resolves to a locally
imported asset, the Inspector hands off the exact resolved import plus its usage (`import
heroImage from '@design-lab/system/assets/...'` and `src={heroImage}`) instead of falling back to
SCSS. An asset reached only through a literal string URL keeps the ordinary element identity,
since there is no import to reveal.

Pointer hover previews targets on desktop. The preview popover is intentionally non-interactive:
it uses a lighter workbench-glass surface with `backdrop-filter` blur and `pointer-events: none`, so
moving the eyedropper to the next target is never blocked by the previous card. Click or tap pins
the popover, switches it to the denser raised surface, and enables copy interaction while consuming
the product activation so inspected links and controls never navigate or mutate the screen. Activate
another surface target once to clear a pinned selection, then activate a target to create the next
one. Escape first clears a pinned selection and then turns Inspector off.

Once Inspector is active, a neutral `Hard Mode` action appears directly above it. Hard Mode is a
temporary visual diagnostic: it forces a neutral gray background onto every registered Component,
slot, and asset boundary with `!important`, then doubles the normal purple, pink, and teal overview
outline widths. The action turns red while enabled. Turning Inspector off also turns Hard Mode off;
it is intentionally absent from design-system source, saved review state, and shareable URLs.

The normal Design Lab shell mounts this same Inspector at its application root. Its own `src/**`
JSX uses a deliberately narrow compile-time pass: imported Library Component callsites receive
purple identity, while raw application hosts stay uninstrumented and appear as gaps in Hard Mode's
Component map. This avoids wrapping every shell `div`/`span` just to prove it is hardcoded.
Self-inspection adds no second registry or polling path; it reuses the existing session-local map.

While Inspector is active, every automatically discovered Component root receives a quiet purple
dashed 2px outline, every manifest-declared slot receives a quiet pink dashed outline, and every raw
image/video host with a resolved asset import receives a quiet teal dashed outline. This gives an
immediate map of Component composition and asset usage before a specific target is selected. The
selected Component, slot, asset, and raw-element identities use stronger purple, pink, teal, and
neutral dashed boundaries respectively.
