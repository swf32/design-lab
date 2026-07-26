# Web stack coupling audit: что на самом деле ещё привязано к React/TSX

**Статус:** обновлено после реальной Nuxt UI/Vue вертикали, 2026-07-26. Это gap audit, а не
заявление о полной Vue/Svelte parity.

## Что было реально проверено

Нужно различать четыре разных уровня доказательства:

| Уровень            | Что сейчас действительно проверено                                                         | Чего это не доказывает                                           |
| ------------------ | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Filesystem fixture | `.vue`/`.svelte` обнаруживаются, получают technology, mount identity и raw source handoff  | что framework compiler вообще запускался                         |
| Profile fixture    | `.vue` entry связывается с ближайшим `package.json`/lockfile и отдельным runtime profile   | что Vue package/plugin совместимы и SFC собирается               |
| Supervisor fixture | fake runtime handles проверяют coalesced start, loopback, crash isolation, restart/dispose | что реальный Vite child process стартует и корректно завершается |
| Browser end-to-end | React compatibility capture и реальный Nuxt UI/Vue preview/Story capture проверены Chromium | что вся Vue matrix или Svelte runtime уже готовы                 |

Итого: **Vue execution теперь реально работает, Svelte execution не начат**. Nuxt UI/Vue запускается
с настоящими package/compiler plugin, SFC, controls, HMR и captures. Это всё равно не framework
parity score: незакрытые capabilities перечислены ниже и не должны имитироваться.

Committed `nuxt-ui-system` объявляет `vue`, `@vitejs/plugin-vue`, `@nuxt/ui` и собственный Vite.
Launcher резолвит Vite из owning package environment; физический workspace hoist не превращает
shell Vite в runtime dependency. `svelte` и `@sveltejs/vite-plugin-svelte` пока отсутствуют.

## Найденные stack-coupled поверхности

| Поверхность                | Текущее состояние                                                                                  | Привязка                                                                       | Что обязательно сделать                                                    |
| -------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Component discovery        | `.tsx`, `.vue`, `.svelte` strong-evidence files находятся                                          | public package exports, Vue/Svelte metadata и barrel semantics ещё не читаются | ecosystem-specific export/metadata analyzers + fixtures                    |
| Catalog preview            | React eager glob; Vue managed iframe рендерит `.preview.vue`; Svelte fallback                      | shell + managed Vue runtime                                                    | runtime provenance для React/Svelte                                        |
| Component detail live view | React manifest и Vue managed runtime; external iframe escape hatch                                  | `componentPresentation.ts`, `ModuleView.tsx`                                   | тот же RuntimeSurface для Svelte                                            |
| Stories                    | React modules; Vue normalized `.stories.json` enrichment                                            | React runtime + Vue runtime                                                    | CSF/ecosystem ingestion и event/state model                                |
| Component Playground       | React modules; Vue production args + отдельный draft Playground                                     | обе route views                                                                | сохранить framework-neutral shell, добавить Svelte                        |
| Controls                   | React props и Vue serializable args работают                                                        | `ModuleView.tsx`, managed runtime                                               | events/slots/snippets и URL persistence                                    |
| Story source/copy          | сериализует React nodes в JSX/TSX                                                                  | `componentRuntime.tsx`, `storySourcePrinter.mjs`                               | adapter-owned canonical usage printer for Vue/Svelte; no fake JSX          |
| Inspector                  | Babel transform instruments TS/TSX JSX callsites and React runtime registry                        | `scripts/inspectionTransform.mjs`, `@design-lab/system/inspection`             | Vue template/SFC and Svelte compiler analyzers; capability-specific depth  |
| Relations/compositionUses  | JS/TS и Vue `<script>` imports parsed; template semantics/Svelte ещё нет                            | `moduleEntities.mjs::parseComponentSourceImports`                              | Vue template и Svelte analyzers                                            |
| Component capture          | real React и Vue preview/story                                                                     | shared capture service + runtime descriptor                                    | Svelte runtime surface/browser E2E                                         |
| Wireframe runtime          | eager `*.wireframe.tsx` glob returning React nodes                                                 | `wireframes/registry.ts`, `WireframeView.tsx`                                  | runtime protocol renderer per framework                                    |
| Page runtime               | eager `*.page.tsx` glob returning React nodes                                                      | `pages/registry.ts`, `PageView.tsx`                                            | runtime protocol renderer per framework                                    |
| Wireframe/Page flows       | shell calls React renderer repeatedly and captures DOM clicks locally                              | `WireframeView`, `PageView`, `useFlowActionCapture`                            | action/event messages across iframe boundary; inert flow previews          |
| HMR/watcher                | React в shell graph; Vue child Vite HMR доказан                                                    | два временно разных runtime paths                                              | child baseline для React/Svelte и invalidation policy                      |
| Runtime errors             | React import failure может повредить shell; Vue локализован iframe/process                         | eager React против isolated Vue                                                | automated compile/runtime error fixtures                                   |
| External URL               | iframe exists, but no handshake, readiness, args, events, capture or inspection                    | `ModuleView.tsx` iframe                                                        | optional bridge negotiation; otherwise honest preview-only capability      |
| MCP/CLI                    | search/get/browse generic; screenshot tool намеренно Component preview/story-only и React-executable | `server/mcp/index.mjs`, `scripts/designlab.mjs`                              | capability response + Component preview/story через каждый adapter         |
| Rules/AI authoring         | Component rules and many diagnostics still require `.tsx`, ReactNode, JSX and React Story shape    | `rules/*`, `moduleEntities.mjs`                                                | adapter-neutral base contract plus framework-specific appendices           |
| Creation/scaffolding       | no framework-aware Component/Wireframe/Page creation pipeline                                      | onboarding/rules only                                                          | ask/detect target framework; create ecosystem-native files in chosen mount |
| URL identity               | selected framework implementation/runtime state is not preserved                                   | current routes identify entity only                                            | persist implementation/profile + args/state/mode without exposing ports    |

## Modules that are mostly shared — with caveats

### Tokens and Palette

Token JSON, semantic identity, modes and Palette remain one source of truth for React, Vue and
Svelte. CSS custom properties are web-compatible across them. Still required: prove that every
isolated runtime receives the same mode values and updates them without duplicating token data.

### Fonts

Font files, `fonts.json` and typography tokens are shared. Loading/injection belongs to each runtime,
so a browser fixture must verify actual computed family/weight in React, Vue and Svelte.

### Assets

Raster images, video and plain SVG are shared. **TSX code-native icons are not framework-neutral**:
Vue/Svelte cannot directly execute a React TSX icon. Options are a shared SVG source, Custom Element,
or explicit framework-specific implementations linked by semantic asset family. Design Lab must not
pretend that every item under Assets is equally executable in every framework.

### Search, filesystem and raw handoff

Mount resolution, safe file access, Catalog identity, raw source handoff and most MCP search/get are
framework-neutral. Canonical usage snippets, relations and deep inspection are not: they require
adapter-specific parsing/printing.

## Что было забыто в первом protocol slice

1. Первоначально не было настоящей Vue dependency/compiler/browser fixture. Теперь это исправлено
   committed Nuxt UI package; временная `.vue` fixture больше не выдаётся за runtime proof.
2. Не был отдельно проаудирован authoring contract: `COMPONENT_RULES.md` и server diagnostics всё
   ещё считают TSX preview/story/playground стандартом готовности.
3. Фраза «Assets общие» была слишком широкой: ordinary media общие, TSX icons — React code.
4. Relations, copied source и Inspector были объединены словом handoff, хотя raw source handoff уже
   generic, а semantic/deep handoff всё ещё JSX-specific.
5. Настоящая Nuxt UI Library теперь проверяет dependency resolution, plugin version, SFC, HMR,
   token modes, capture и process cleanup. Fonts/assets, CSS leakage и error fixtures ещё открыты.

## Обязательные реальные fixtures

Nuxt UI System теперь является первым committed real-world fixture. Для React/Svelte ещё нужны
симметричные packages, а Vue fixture необходимо расширить:

- `fixtures/web-parity/react`, `vue`, `svelte` с реальными package manifests и framework versions;
- одинаковая семантическая Button/Card implementation, минимум одна Story, props/state/event;
- одинаковые token modes, font, SVG/raster asset и один framework-native code icon case;
- Component preview/story; Wireframe screen/flow и Page screen/navigation проверяются позже как
  отдельная web-rendering фаза, а не MCP capture contract;
- намеренная compile error и runtime error для проверки изоляции;
- HMR change, runtime restart и close cleanup;
- Playwright assertions по DOM behavior и PNG metadata/hash/geometry;
- вызов тех же captures через UI route, CLI и MCP, а не только прямую service function.

Vue/Svelte нельзя отметить supported, пока соответствующий fixture не устанавливается в чистом
environment, не запускает настоящий compiler и не проходит всю вертикаль.

## Исправленный порядок работ

1. Закрыть оставшиеся Vue gaps: events/state, fonts/assets, errors, source printer/Inspector.
2. Создать реальный React fixture и перенести его на child runtime; это baseline регрессий.
3. Подключить framework-aware Story/controls/events и error/HMR tests к React baseline.
4. Закрыть Vue Wireframe/Page web-rendering, relations, source printing и Inspector capability.
5. Повторить без исключений для Svelte.
6. Только после зелёной matrix удалить eager globs и назвать framework supported.

Этот audit является входом в implementation checklist. Он не требует сделать все adapters
одновременно, но запрещает терять поверхность из поля зрения.
