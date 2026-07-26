# Tab Switcher

Selects one value from a small set of mutually exclusive options. Use the `segmented` variant when labels carry meaning and the compact `toggle` variant for two familiar icon-led modes.

## Semantics

`TabSwitcher` is a selection control, not navigation and not a boolean switch. It exposes a labelled group of pressed buttons, so it can represent interface theme, design-system mode, view density, or another reversible local preference.

Every icon-only option requires `accessibleLabel`. Product copy belongs to the caller and should come from the i18n dictionary.

`small` and `medium` geometry is viewport-invariant for both visual variants. Narrow layouts choose `fit`, `wrap`, or `scroll`; they do not silently resize the options.

Each option supports one of three content contracts:

- `label` for text only;
- `icon` plus `label` for a labelled icon;
- `icon` plus required `accessibleLabel` for icon-only controls.

The `segmented` variant supports all three. Prefer it for view modes such as Cards/List. The
`toggle` variant remains the compact two-option treatment for familiar paired modes such as
Light/Dark.

`iconSize` controls every option icon from the switcher boundary, so callers do not need to pass
different `size` props into individual SVG assets. It defaults to `14` for `small` and `16` for
`medium`; compact header controls may opt into `12` without reducing the button hit area.

Both `small` and `medium` sizes apply to both visual variants. In `toggle`, size changes the track and moving thumb as a unit; the selected option is not drawn as a segmented button.

At phone widths, each visual size grows by no more than four CSS pixels over desktop. This keeps dense workbench selectors compact instead of turning them into oversized mobile controls.

Use `overflow="wrap"` when the selector may occupy multiple rows, or `overflow="scroll"` when it must remain on one line. Scrollbars remain visible on desktop and hidden on phone viewports while touch scrolling stays available. The selected segment moves with a measured indicator, including between wrapped rows, and respects reduced-motion preferences.

The catalog preview opts into the shared preview-motion contract. Hovering or keyboard-focusing its Component Card moves both miniature selectors to their next illustrative state; leaving the card restores the baseline.

## Usage

```tsx
<TabSwitcher
  ariaLabel="Catalog layout"
  variant="segmented"
  iconSize={12}
  options={[
    { value: 'cards', icon: <CardsViewIcon />, accessibleLabel: 'Cards view' },
    { value: 'list', icon: <ListViewIcon />, accessibleLabel: 'List view' },
  ]}
  value={layout}
  onChange={setLayout}
/>
```

Use a native checkbox or switch when a setting is independently on or off. Use real tabs when selection controls an associated tab panel with tab keyboard semantics.
