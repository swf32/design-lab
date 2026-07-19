# Application Sidebar

Primary module navigation. It expands on hover while preserving the combined navigation width.

## Behavior

The collapsed rail keeps icons visible. Expansion reveals labels while the adjacent directory region yields the same amount of space, so total navigation width remains stable. Both grid tracks use the same duration and easing: the directory region never snaps after the rail animation. Direct pointer resizing temporarily disables that transition. `expanded` is an optional controlled presentation state for deterministic compositions and tests; normal application use may rely on hover disclosure.

Application-level Settings stays in the fixed footer and does not become a project module. Use `settingsActive` and `onSettings` to expose that destination while preserving the selected module behind it.

## Stories

`Hover disclosure` is a behavior story. `Shared navigation width` is an integration story with the adjacent directory region; the composition validates the cross-component width contract and is not an `AppSidebar` variant. Application shells can use `onExpandedChange` to synchronise their layout tracks with pointer disclosure.
