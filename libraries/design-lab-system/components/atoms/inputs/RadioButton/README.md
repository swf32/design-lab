# Radio Button

Native single-choice control with a visible label, optional description, three sizes, and five semantic colors.

Use multiple Radio Buttons with the same `name` when exactly one option may be selected. The component keeps the native `<input type="radio">` in the activation area, so arrow-key navigation, form submission, focus, and screen-reader semantics work without a parallel JavaScript selection model.

## Usage

```tsx
<RadioButton name="release" value="draft" label="Draft" />
<RadioButton name="release" value="published" label="Published" defaultChecked />
```

`default` is neutral; `accent` is the standard selection color. Use `success`, `warning`, and `danger` only when the choice itself carries that semantic meaning.
