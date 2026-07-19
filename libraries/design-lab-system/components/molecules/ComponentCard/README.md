# Component Card

Inventory entry that combines a live preview, component identity, source entry and variant summary.

The card is a single interactive target. Its preview slot accepts an illustrative `ComponentThumbnail`, while selection communicates the current catalog entity. `Catalog row` is a context story rather than a card variant.

Set `previewAnimated` only when the component manifest declares `previewMotion`. The card then exposes the shared hover/focus trigger to the authored preview; it does not invent motion or animate generic fallbacks.
