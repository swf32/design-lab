# Slider

Token-driven native range input for selecting one numeric value from a bounded interval. Its anatomy follows the HeroUI pattern: an optional label and output share the header, while fill, track, and thumb form one clear control below.

## Usage

```tsx
<Slider
  label="Volume"
  value={volume}
  onValueChange={setVolume}
  minValue={0}
  maxValue={100}
/>
```

The component supports controlled and uncontrolled values, native keyboard interaction, form attributes, custom output formatting, three sizes, and the shared semantic color scale.

Use `formatValue` for domain output such as percentages or units. Keep an accessible `label` or supply `aria-label` when the visible label is omitted.
