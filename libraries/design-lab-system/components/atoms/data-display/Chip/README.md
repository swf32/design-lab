# Chip

Compact informational label for categories, statuses, and concise metadata. Its API follows the current HeroUI color and treatment model while using Design Lab semantic tokens.

## Colors

- `default` — neutral metadata;
- `accent` — highlighted product information;
- `success` — completed or healthy state;
- `warning` — attention without failure;
- `danger` — failed, destructive, or blocked state.

## Variants

`primary` is filled, `secondary` is outlined, `tertiary` is text-only, and `soft` uses a quiet tinted surface. Sizes are `small`, `medium`, and `large`.

```tsx
<Chip color="success" variant="soft">
  Ready
</Chip>
```

Chip is informational rather than interactive. Use a Button when clicking the surface performs an action.
