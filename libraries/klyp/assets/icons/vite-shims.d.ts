// Ambient shim for SCSS side-effect imports (`import './sidebar.scss'`) so
// tsup's dts pass — plain tsc, no vite/client types — type-checks. The
// consumer's Vite compiles the actual SCSS at build time.
//
// (The `import.meta.glob` shim that used to live here was removed 2026-06-01
// once sidebar.tsx switched from app-absolute globs to static imports of the
// package's own bundled Lottie JSON under ./assets/lottie/.)

declare module '*.scss'
