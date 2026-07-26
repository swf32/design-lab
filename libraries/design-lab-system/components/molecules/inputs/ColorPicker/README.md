# Color Picker

Compact color override control with a custom trigger, embedded saturation/brightness field, hue slider, preset swatches, editable HEX value, and nullable reset. It never opens the operating system color dialog.

Use a controlled `value` when color belongs to another entity. `null` means that the consumer's semantic default remains active. `open` and `onOpenChange` let composed controls coordinate the palette with their own selected state. The popover closes on outside pointer interaction or Escape; the saturation/brightness field supports pointer dragging and arrow-key adjustment.

Trigger, spectrum, presets, hue, HEX input, and reset geometry remain identical across viewport widths. The popover only clamps and repositions to stay inside the visual viewport.
