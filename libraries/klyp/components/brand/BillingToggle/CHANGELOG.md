# BillingToggle — changelog

## 2026-06-17 23:08 — md-outer-36-to-40 (inherited via TabSwitcher)

- What: no BillingToggle code change — its default md size now renders a 40px outer pill because TabSwitcher's md option-h went 30->34 (control-height baseline 36->40).
- Why: DS-wide control-height baseline bump 36->40 (control.size.lg); the Monthly/Annual pill stays in lockstep with neighbouring 40px controls.

## 2026-05-20 21:46 — save-badge-green-solid

- What: Save N% chip switched from `variant="subtle"` to `variant="solid"` on `intent="green"` — green filled background (green-900), light text.
- Why: the design lead — solid green reads as a stronger "deal" cue than the subtle pastel chip.

## 2026-05-20 21:44 — drop-save-badge-icon

- What: removed `MagicStarOutline` icon from the "Save N%" badge — badge is now text-only.
- Why: the design lead — icon felt visually noisy next to the small percentage chip; text alone reads cleaner.
