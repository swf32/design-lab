# Dialog

Accessible modal shell for consumer-supplied tasks. `Dialog` owns the top-layer surface, backdrop, heading relationship, optional close action, Escape/backdrop dismissal, focus entry, and focus restoration. The consumer owns product copy, forms, validation, and footer actions through slots.

Keep `open` controlled. A dismissible dialog calls `onClose` from Close, Escape, or backdrop interaction. Set `dismissible={false}` only when leaving would invalidate a required flow, and always provide a visible action that completes or otherwise exits that flow.

Workbench Stories start with a launcher instead of mounting an open modal immediately. This keeps Component documentation navigable and proves both entry and exit behavior.
