# Checkbox

Token-driven boolean control built on a native checkbox. Use `label` and `description` for standalone form composition, or provide an accessible name when the control is placed inside `ControlField`.

## Behavior

- Supports controlled and uncontrolled native input behavior.
- `indeterminate` updates the native DOM property and has a distinct visual state.
- The hidden native input retains focus, keyboard, form, and assistive-technology semantics.
- `small` is intended for dense inspector rows; `medium` is the standard form size.

```tsx
<Checkbox
  checked={enabled}
  onChange={(event) => setEnabled(event.target.checked)}
  label="Include documentation"
/>
```
