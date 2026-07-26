# Code Block

Displays fenced source code as a distinct documentation surface with a language label and optional copy action.

`CodeBlock` preserves whitespace and scrolls long lines inside its own boundary. Use inline Markdown code for identifiers and short values; use fenced Markdown code when the snippet is meant to be read or copied as source.

Set `collapsedLines` to keep long handoff fragments compact. The expand/collapse action appears only when the source exceeds that line count; copying always uses the complete source.

Collapsed and expanded disclosure states are reflected by `dl-code-block--collapsed` and `dl-code-block--expanded` on the root so composed surfaces can change emphasis without duplicating disclosure state.

Use `variant="code-only"` when the surrounding context already communicates the format. It removes the language header and places Copy and disclosure actions at the code surface's top-right.

Use `copyOnClick` when the complete fragment is itself the copy target, such as developer inspection
handoff.

## Usage

```tsx
<CodeBlock code={'const mode = "dark"'} language="tsx" />
```
