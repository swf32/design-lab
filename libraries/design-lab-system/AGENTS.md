# System authoring instructions

Before changing this package, read and follow [`rules/SYSTEM_RULES.md`](rules/SYSTEM_RULES.md),
then read every entity rule relevant to the files being changed. These local rules are the shared
contract for designers, humans, and coding agents; do not replace them with agent-specific rules.

Preserve all entrypoints and exports required by `design-lab-pack.json` and the selected Design
Lab interface contract. Keep application behavior outside this presentation System. After every
contract-level change, validate the complete System against the real Design Lab application.
