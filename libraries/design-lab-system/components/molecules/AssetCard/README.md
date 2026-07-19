# Asset Card

Catalog representation for an automatically discovered asset. It keeps filesystem identity visible and uses a real raster thumbnail when a safe local preview URL is available.

## Variants

- `icon` represents SVG and code-native TSX icons. Both receive a real SVG preview URL from the local renderer; TSX source is normalized without executing its React module.
- `image` represents raster images and may render `previewUrl`.
- `video` uses the shared Video asset icon until playable previews are introduced.
- `other` is the explicit fallback for supported files without a specialized presentation.

Asset Card does not move, rename, or mutate the source file. The filesystem remains the source of truth.

If a preview is unsupported or fails validation, the card falls back to its type icon instead of displaying a broken image.

The card is a native button so catalogs can use `onClick` for navigation. Set `selected` when its persistent route is active; the component exposes that state through `aria-current="page"`.
