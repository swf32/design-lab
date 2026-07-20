# ModelInfoCard — changelog

## 2026-07-03 — registered in the /components catalog (beta)

- What: added the `model-info-card` registry entry (brand-molecule, status `beta`) — the component gets its own `/components/model-info-card` page with the 4 stories, source and this changelog.
- Why: Val 2026-07-03 — a separate component deserves a separate catalog page; `beta` until it survives the live composer check, then promote to `stable` (one-line registry change).

## 2026-07-02 19:04 — new component

- What: presentational model detail card — name + provider glyph, description, segment-bar metrics on the existing status tokens (success / warning / danger / info / neutral), capability fact chips, optional Configuration section (controlled segmented switcher, e.g. Reasoning Low/Medium/High).
- Why: the composer model picker's hover side-card (21st.dev model-selector pattern, Val 2026-07-02) — rides in the brand Dropdown's `renderDetail` slot; fed by frontend demo data until model metadata moves into the backend registry.
