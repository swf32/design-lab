# Input

Input is the atomic text-entry family for single-line text, search, and multiline content. It keeps field anatomy and accessibility consistent while preserving the native `input` or `textarea` element.

## Control kinds

- `text` renders an `input` and accepts native input types such as `email`, `url`, `password`, and `number`;
- `search` renders `input type="search"` with the shared Search icon;
- `textarea` renders a native `textarea` for longer content.

Use a visible `label` by default. `visuallyHideLabel` is only for layouts where equivalent surrounding context remains clear; the accessible label is still rendered. Placeholder text is an example, never a label replacement.

## Feedback and states

`helperText` explains format or consequence. `errorMessage` takes precedence, sets `aria-invalid`, connects through `aria-describedby`, and is announced with `role="alert"`. Validate after blur or submission rather than showing errors before the user has had a chance to finish.

Disabled fields are unavailable. Read-only fields remain focusable and selectable. Do not use these states interchangeably.

## Composition

Use `startAdornment` and `endAdornment` for short, non-essential context such as a unit or namespace. Search supplies its own decorative search icon unless `startAdornment` overrides it. Interactive actions in an adornment must provide their own accessible name and should remain at least 44 by 44 CSS pixels in touch layouts.

`showCount` displays the current value length and optional `maxLength`. Sizes apply to all three control kinds; textarea sizes change minimum block height while `rows` can express content needs.

```tsx
<Input
  variant="search"
  label="Search components"
  placeholder="Button, dialog, navigation…"
  helperText="Searches names and component metadata."
/>

<Input
  variant="textarea"
  label="Description"
  maxLength={160}
  showCount
  rows={5}
/>
```
