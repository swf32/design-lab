# Slot Placeholder

Transparent visual marker for an available Component composition slot. It uses the stable pink
inspection identity, a dashed boundary, and the canonical `PlusIcon` insertion marker.

Slot Placeholder is documentation and design tooling, not customer-facing empty-state content. Set
`width` and `height` to any valid CSS dimension. Their default value is `100%`, so the marker fills a
parent-owned slot; pass pixels or another explicit unit when the slot has a fixed footprint.

```tsx
<SlotPlaceholder width="100%" height="64px" />
```

For a compact icon slot:

```tsx
<Button leading={<SlotPlaceholder width="14px" height="14px" />}>Create</Button>
```
