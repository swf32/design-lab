# Kbd — changelog

## 2026-07-02 00:45 — real keycap proportions (sm 10→16px, md 12→20px) + "Ctrl" as text

- What: size boxes grew to keycap proportions — `sm` height/min-width `--space-10` → `--space-16`, `md` `--space-12` → `--space-20`; fonts/padding unchanged. All consumers (slash-palette footer, script-syntax-drawer, CommandMenu shortcuts/footer) get the taller chips automatically. SYMBOLS `ctrl` now renders the text "Ctrl" instead of the mac-only '⌃' caret.
- Why: Val (command-palette review): the 10/12px boxes were shorter than their own glyphs — keycaps read as squished text («кнопки маленькие уёбищные»); the '⌃' caret on Windows was mistaken for an up-arrow («что за птичка вверх?») — Windows/Linux convention is the word "Ctrl".

## 2026-06-29 04:23 — baseline-tracked-from-init

- What: Baseline — tracked from repo init; no standalone component changes logged yet.
- Why: Establishing the per-artifact CHANGELOG baseline so every shipped DS artifact tracks changes from here on (history to date is repo init + incidental DS-wide sweeps only).

