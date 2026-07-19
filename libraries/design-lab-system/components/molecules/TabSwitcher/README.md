# Tab Switcher

Selects one value from a small set of mutually exclusive options. Use the `segmented` variant when labels carry meaning and the compact `toggle` variant for two familiar icon-led modes.

## Semantics

`TabSwitcher` is a selection control, not navigation and not a boolean switch. It exposes a labelled group of pressed buttons, so it can represent interface theme, design-system mode, view density, or another reversible local preference.

Every icon-only option requires `accessibleLabel`. Product copy belongs to the caller and should come from the i18n dictionary.

Both `small` and `medium` sizes apply to both visual variants. In `toggle`, size changes the track and moving thumb as a unit; the selected option is not drawn as a segmented button.

The catalog preview opts into the shared preview-motion contract. Hovering or keyboard-focusing its Component Card moves both miniature selectors to their next illustrative state; leaving the card restores the baseline.

## Usage

```tsx
<TabSwitcher
  ariaLabel="Design-system mode"
  options={modes.map((mode) => ({ value: mode, label: mode }))}
  value={mode}
  onChange={setMode}
/>
```

Use a native checkbox or switch when a setting is independently on or off. Use real tabs when selection controls an associated tab panel with tab keyboard semantics.
