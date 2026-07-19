# Workbench Playground

Reusable component-detail playground that composes the live Canvas, global background control, module-owned controls, and optional event feedback.

## Layout contract

- `comfortable` is the default Canvas padding and protects full-width components from touching the Canvas edge.
- `compact` is intended for dense fixtures; `none` is reserved for components whose edge behavior is the subject of the story.
- The controls rail is caller-owned content so component-specific prop editors do not leak into this organism.
- `controlsPosition="start"` supports the full Component Playground route; the existing Workbench detail keeps controls at the end.
- Background mode and color are controlled preferences shared by all component workbenches.

On phones the Canvas remains first and the controls rail moves below it regardless of desktop rail position.

```tsx
<WorkbenchPlayground
  mode={canvasMode}
  color={canvasColor}
  onModeChange={setCanvasMode}
  onColorChange={setCanvasColor}
  controls={<ButtonControls />}
>
  <Button fullWidth>Continue</Button>
</WorkbenchPlayground>
```
