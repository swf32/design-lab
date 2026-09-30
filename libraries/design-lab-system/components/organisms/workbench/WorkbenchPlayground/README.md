# Workbench Playground

Reusable component-detail playground that composes the live Canvas, global background control, module-owned controls, and optional event feedback.

## Layout contract

- `comfortable` is the default Canvas padding and protects full-width components from touching the Canvas edge.
- `compact` is intended for dense fixtures; `none` is reserved for components whose edge behavior is the subject of the story.
- The controls rail is caller-owned content so component-specific prop editors do not leak into this organism.
- Omit `controls` (or pass `null`) to hide the rail and give the Canvas the full width; do not leave an empty controls column.
- `controlsPosition="start"` supports the full Component Playground route; the existing Workbench detail keeps controls at the end.
- Background mode/color and source theme are controlled but independent preferences shared by all component workbenches.
- The light-grid stage uses `color.canvas-grid.light-text` for readable foreground in either application theme.
- A fullscreen concept route passes `className="dl-workbench-playground--fullscreen"`, `padding="none"`, and `label=""`; this System class owns its stage padding and safe-area tool placement while the application keeps route state and product rendering.
- The Canvas tools are marked as inspector UI; inspecting a specimen should not select the floating background control.

On phones the Canvas remains first and the controls rail moves below it regardless of desktop rail position.

```tsx
<WorkbenchPlayground
  mode={canvasMode}
  color={canvasColor}
  onModeChange={setCanvasMode}
  onColorChange={setCanvasColor}
  themes={sourceThemes}
  theme={sourceTheme}
  onThemeChange={setSourceTheme}
  controls={<ButtonControls />}
>
  <Button fullWidth>Continue</Button>
</WorkbenchPlayground>
```
