# Code Block

Displays fenced source code as a distinct documentation surface with a language label and optional copy action.

`CodeBlock` preserves whitespace and scrolls long lines inside its own boundary. Use inline Markdown code for identifiers and short values; use fenced Markdown code when the snippet is meant to be read or copied as source.

## Usage

```tsx
<CodeBlock code={'const mode = "dark"'} language="tsx" />
```
