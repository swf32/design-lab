# Design Lab asset rules

This file is the shared source of truth for creating or changing images, video, SVG, and code-native icon assets.

## Canonical source and discovery

Assets live under the active Project or Library `assets/` directory. `icons/`, `images/`, and `videos/` are conventional semantic folders; further nesting is arbitrary. The asset file is discovered recursively without a central asset registry.

Do not create a separate Icons module. Code-native TSX icons, SVG, raster images, and video remain Asset entities.

## Adjacent semantic metadata

An asset may have an automatically discovered sidecar named `<AssetStem>.meta.json` next to the file. For example:

```text
assets/icons/ArrowLeftIcon.tsx
assets/icons/ArrowLeftIcon.meta.json
```

The sidecar may define:

- `description` — what the asset depicts or communicates;
- `aliases` — common search names;
- `useWhen` and `avoidWhen` — appropriate and misleading contexts;
- `tags` — domain, subject, mood, action, or media vocabulary;
- `alt` — concise accessible text for meaningful visual media;
- `license` — known licensing or attribution information.

Sidecars improve semantics but are never required for basic discovery. Default `design-lab-system` assets should include authored semantic metadata. Do not duplicate dimensions, extension, path, preview URL, or other facts already derived from the asset file.

## Code-native icons

Use an existing semantic icon whenever it fits. A new product icon is a reusable TSX asset in `assets/icons/`, not inline SVG inside a Component and not a CSS or Unicode substitute.

`assets/icons/index.ts` is generated recursively from code-native icon files during dev, build, and test. Adding the icon file is sufficient; never edit the barrel by hand. The Library manifest supplies the canonical icon import root, so MCP and CLI can return imports such as:

```ts
import { ArrowLeftIcon } from '@design-lab/system/icons'
```

Decorative instances are hidden from assistive technology. Interactive icon-only controls need an accessible name supplied by the control, not baked into the vector asset.

## Images and video

Write descriptions from visible content and intended subject matter, not only from filenames. `alt` describes the meaningful visual result; it does not include “image of.” Decorative media may omit `alt` metadata when the consumer deliberately supplies empty alternative text.

Do not invent license claims. Record `license` only when provenance is known.

## Verification

After changing assets:

1. verify automatic Assets discovery and safe preview fallback;
2. regenerate/check the icon barrel for code-native icons;
3. search a natural-language intent through MCP or CLI;
4. resolve the entity and verify its path, metadata, and canonical import when applicable.
