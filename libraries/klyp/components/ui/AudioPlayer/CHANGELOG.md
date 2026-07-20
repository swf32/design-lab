# AudioPlayer — changelog

## 2026-07-01 22:08 — stable-width rate button and time readouts

- What: Playback-rate pill and both time readouts now reserve their widest width via hidden in-flow sizer spans (grid-area 1/1) — cycling speed (`1×`→`1.25×`) or the readout growing (`--:--`→`0:12`, `9:59`→`10:00`) no longer resizes the button, so the flex:1 waveform track stops jumping and the canvas stops re-laying-out bars on every click.
- Why: Val's bug report "интерфейс немного скачет при переключении скорости воспроизведения" — root-caused to the content-sized rate label inside a width-locked chat card, verified by the multi-agent rootcause-hunt (2026-07-01).

## 2026-06-29 04:23 — baseline

- What: Baseline — tracked from repo init; no standalone component changes logged yet.
- Why: Establishing the per-artifact CHANGELOG baseline so every shipped DS artifact tracks changes from here on (history to date is repo init + incidental DS-wide sweeps only).

