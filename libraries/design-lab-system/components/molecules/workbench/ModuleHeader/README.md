# Module Header

Shared identity header for module indexes and component workbenches. It gives the page title the strongest visual role and combines it with a structural eyebrow and one contextual trailing role: count, source metadata, or actions.

When `onBack` is present, the header renders the Library `Button` with a semantic left-arrow asset and a 40px minimum hit area. `backLabel` names the action; use “Back” for history navigation and a destination-specific label only when the action always opens that destination.

The source metadata is secondary context, not a breadcrumb. Long eyebrow and metadata values truncate without pushing actions or the page title outside the header.

Workbench back navigation is a context story because it verifies the header inside the component-detail flow. Keyboard focus remains visible in both token themes.
