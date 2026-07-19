# Roadmap, риски, открытые вопросы и batchable AI tasks

## Фазный MVP

Ниже — рекомендованный roadmap на три фазы, рассчитанный на web local-first продукт.

|  |
|:--:|
| <img src="docs/assets/media/image2.png" style="width:5.83333in;height:1.56636in" alt="Rendered Mermaid diagram 2" /> |

## Deliverables по фазам

| Фаза | Deliverables |
|----|----|
| Foundation | docs freeze, workspace model, project/library model, indexer, search, embeddings, base schema |
| Authoring | design foundation modules, components, wireframes/pages canvas, inspector |
| Intelligence and validation | rules/decisions/prompts, AI assisted flows, checks, export pack, docs artifacts |

## Риски и технические ограничения

Главный риск — **слишком рано перепутать продукт с IDE, облачной коллаборацией или design-to-code платформой**. Это размазывает MVP. Второй риск — **переусложнить файловые контракты**, превратив их в mini-framework. Третий риск — **не дать AI достаточного контекста**, если embeddings, правила и entity IDs останутся опциональной надстройкой. Четвёртый риск — **попытаться сделать impact analysis уровня IDE**, хотя продукт в первой фазе не должен решать всю задачу статического анализа. Пятый риск — **рано заходить в роли, ACL и hosted sync**, не доказав локальный цикл.

## Приоритизированные открытые вопросы

### Fundamental

| Приоритет | Вопрос | Почему важен |
|----|----|----|
| F1 | Какой канонический render/layout contract для pages и wireframes: JSON AST, TSX-like schema или гибрид? | Это влияет на inspector, AI writes, export и diff |
| F2 | Где проходит граница между component и raw block на canvas? | Без этого непонятны inspector и consistency checks |
| F3 | Как именно project подключает library: pinned version, copied snapshot или live link? | Влияет на versioning, overrides и updates |
| F4 | Что является минимальным preview/runtime для компонента? | Влияет на authoring и devtools |
| F5 | Нужен ли единый internal entity schema package? | Влияет на extensibility и indexing |

### MVP

| Приоритет | Вопрос | Почему важен |
|----|----|----|
| M1 | Какой локальный embeddings backend использовать и как обновлять индекс? | Влияет на AI и search |
| M2 | Насколько глубоким делать inspector: только props/CSS или ещё токены, usages, source chain? | Влияет на MVP scope |
| M3 | Импортировать ли Storybook CSF/MDX сразу или оставить только parsing context? | Влияет на объём интеграций |
| M4 | Какие проверки обязательны в MVP: consistency, a11y, naming, token usage? | Влияет на perceived value |
| M5 | Нужен ли в MVP экспорт страниц/спецификаций в HTML/JSON/PDF? | Влияет на handoff |

### Edge cases

| Приоритет | Вопрос | Почему важен |
|----|----|----|
| E1 | Как вести себя при массовом rename токенов и palette layer? | Влияет на future impact tooling |
| E2 | Что делать с несколькими библиотеками, которые конфликтуют по component names? | Влияет на library model |
| E3 | Нужен ли hosted comment system и sync c локальной копией? | Важен позже, но не сейчас |
| E4 | Как поддерживать multi-platform output contracts? | Слишком рано для MVP, но важно для future |
| E5 | Как эволюционировать local read-only MCP в guarded write и remote transports? | Базовый stdio adapter уже реализован; решение влияет на future AI integrations |

## Batchable AI tasks

Ниже — банк задач, которые можно отдавать LLM пакетами. Каждая задача должна генерировать **один конкретный markdown-файл или небольшой набор файлов**, а не “весь проект сразу”.

| Task | Section | Input artifacts | Expected output | Validation criteria |
|----|----|----|----|----|
| 1 | Executive summary | Все notes, competitor summary | `docs/EXECUTIVE-SUMMARY.md` | 1–2 страницы, чётко отделяет MVP и future |
| 2 | Vision | Product notes, principles | `docs/VISION.md` | Есть one-sentence definition, anti-goals, positioning |
| 3 | Users & problem | Existing notes, workflows | `docs/USERS-AND-PROBLEM.md` | Есть primary/secondary users и problem framing |
| 4 | Principles | Existing notes | `docs/PRINCIPLES.md` | Каждый принцип имеет rationale и consequence |
| 5 | Scope | Prior notes + this report | `docs/SCOPE-MVP-VS-FUTURE.md` | Есть таблица in/out, без серых зон |
| 6 | Workspace model | This report + file trees | `docs/WORKSPACE-MODEL.md` | Описаны Workspace/Project/Library и зависимости |
| 7 | Filesystem trees | This report | `docs/FILESYSTEM-TREES.md` | Есть canonical workspace и migration target |
| 8 | Components spec | Module table + examples | `docs/COMPONENTS.md` | Purpose/model/files/UX/feature phases присутствуют |
| 9 | Wireframes spec | Module table + examples | `docs/WIREFRAMES.md` | Есть multi-variant logic и transition to pages |
| 10 | Pages spec | Module table + inspector notes | `docs/PAGES.md` | Есть page vs wireframe distinction и handoff scope |
| 11 | Foundation spec | Tokens/palette/assets/fonts notes | `docs/TOKENS-PALETTE-ASSETS-FONTS.md` | Palette отделён от tokens |
| 12 | Rules/Decisions/Prompts | Notes + examples | `docs/RULES-DECISIONS-PROMPTS.md` | Есть file contracts и usage by AI |
| 13 | Search & embeddings | Retrieval notes | `docs/SEARCH-AND-EMBEDDINGS.md` | Есть indexing pipeline и chunk model |
| 14 | AI workflows | Workflow table | `docs/AI-WORKFLOWS.md` | Есть manual/assisted/auto-propose and confirmation |
| 15 | Onboarding & Figma | Figma policy notes | `docs/ONBOARDING-FIGMA.md` | Чётко зафиксировано “Figma as context” |
| 16 | Devtools inspector | Inspector requirements | `docs/DEVTOOLS-INSPECTOR.md` | Описаны hover, props, CSS, copy actions |
| 17 | Analytics | Design analytics notes | `docs/ANALYTICS.md` | Чётко отделены MVP metrics и hosted future |
| 18 | Collaboration & deploy | Collaboration notes | `docs/COLLABORATION-AND-DEPLOY.md` | Local vs hosted boundary ясна |
| 19 | Extensibility & Storybook | Plugin and Storybook policy | `docs/EXTENSIBILITY-AND-PLUGINS.md`, `docs/STORYBOOK-POLICY.md` | Storybook не становится core dependency |
| 20 | MCP strategy | MCP notes + competitor signals | `docs/09-ai-context-and-mcp.md` | Зафиксированы common gateway, local read-only MCP, CLI fallback и future remote/write boundary |
| 21 | Roadmap | This report + gantt | `docs/ROADMAP.md` | Есть 3 фазы, deliverables, exits |
| 22 | Risks | This report | `docs/RISKS-AND-CONSTRAINTS.md` | Есть top risks и mitigations |
| 23 | Open questions | This report | `docs/OPEN-QUESTIONS.md` | Есть fundamental/MVP/edge buckets |
| 24 | Changelog standard | This report | `docs/CHANGELOG-STANDARD.md` | Есть recommended format, examples and rules |

## Рекомендованный шаблон промпта для batch task

    # Task
    Собери файл `docs/COMPONENTS.md` для Design Lab.

    # Context
    - Product: local filesystem-first designer workspace
    - Use only information from provided notes
    - Respect existing distinctions: workspace/project/library, wireframes vs pages, palette over tokens, local no roles

    # Required structure
    - Purpose
    - Minimal data model
    - Recommended files
    - UX flow
    - MVP / Next / Future
    - Examples

    # Output format
    Valid Markdown only.

    # Validation
    - Do not invent cloud-only features
    - Do not mix Design Lab with production repo as default
    - Keep decisions consistent with v0.2 summary

## Рекомендуемая следующая фиксация решений

Чтобы v0.2 не начал снова расползаться, стоит зафиксировать следующие решения как уже принятые:

1.  **Default architecture**: standalone designer-first workspace.
2.  **Compatibility architecture**: optional `.designlab` mode.
3.  **Rules in MVP**: yes.
4.  **Embeddings in MVP**: yes.
5.  **External MCP in MVP**: local read-only stdio adapter over the internal context layer; no remote/auth/write surface yet.
6.  **Figma in MVP**: context only, no official importer/plugin.
7.  **Storybook**: optional read-only import/context only.
8.  **Local roles**: no roles/ACL.
9.  **Changelog**: `CHANGELOG.md` recommended standard.
10. **Pages inspector**: yes, MVP differentiator.

С таким набором Design Lab уже выглядит не как абстрактная идея, а как достаточно конкретный продуктовый объект: **локальный designer operating environment с файловыми сущностями, AI-контекстом, правилами и инспекцией страниц**, стоящий между design-system tooling, component workbench и AI-assisted interface authoring.

[\[1\]](https://storybook.js.org/?utm_source=chatgpt.com) [\[5\]](https://storybook.js.org/?utm_source=chatgpt.com) [\[11\]](https://storybook.js.org/?utm_source=chatgpt.com) [\[12\]](https://storybook.js.org/?utm_source=chatgpt.com) [\[13\]](https://storybook.js.org/?utm_source=chatgpt.com) [\[22\]](https://storybook.js.org/?utm_source=chatgpt.com) Storybook: Frontend workshop for UI development

<https://storybook.js.org/?utm_source=chatgpt.com>

[\[2\]](https://zeroheight.com/mcp/?utm_source=chatgpt.com) Design System Context for Coding Agents and AI Workflows

<https://zeroheight.com/mcp/?utm_source=chatgpt.com>

[\[3\]](https://www.builder.io/c/docs/builder-figma-plugin?utm_source=chatgpt.com) [\[8\]](https://www.builder.io/c/docs/builder-figma-plugin?utm_source=chatgpt.com) Builder Figma Plugin

<https://www.builder.io/c/docs/builder-figma-plugin?utm_source=chatgpt.com>

[\[4\]](https://storybook.js.org/docs/get-started/whats-a-story?utm_source=chatgpt.com) What's a story? \| Storybook docs

<https://storybook.js.org/docs/get-started/whats-a-story?utm_source=chatgpt.com>

[\[6\]](https://help.zeroheight.com/hc/en-us/articles/43780251357979-Using-the-remote-zeroheight-MCP-server?utm_source=chatgpt.com) Using the remote zeroheight MCP server

<https://help.zeroheight.com/hc/en-us/articles/43780251357979-Using-the-remote-zeroheight-MCP-server?utm_source=chatgpt.com>

[\[7\]](https://www.builder.io/c/docs/intro?utm_source=chatgpt.com) [\[16\]](https://www.builder.io/c/docs/intro?utm_source=chatgpt.com) Builder.io docs

<https://www.builder.io/c/docs/intro?utm_source=chatgpt.com>

[\[9\]](https://help.zeroheight.com/hc/en-us/articles/35886897039387-zeroheight-Analytics-Using-zeroheight-Analytics?utm_source=chatgpt.com) Using zeroheight Analytics

<https://help.zeroheight.com/hc/en-us/articles/35886897039387-zeroheight-Analytics-Using-zeroheight-Analytics?utm_source=chatgpt.com>

[\[10\]](https://backstage.io/docs/plugins/?utm_source=chatgpt.com) Introduction to Plugins (Legacy) \| Backstage Software Catalog ...

<https://backstage.io/docs/plugins/?utm_source=chatgpt.com>

[\[14\]](https://bit.dev/docs/intro/?utm_source=chatgpt.com) Introduction \| Bit

<https://bit.dev/docs/intro/?utm_source=chatgpt.com>

[\[15\]](https://backstage.io/docs/features/software-catalog/?utm_source=chatgpt.com) Backstage Software Catalog and Developer Platform

<https://backstage.io/docs/features/software-catalog/?utm_source=chatgpt.com>

[\[17\]](https://www.uxpin.com/merge?utm_source=chatgpt.com) UXPin Merge \| Design with React components. Visually.

<https://www.uxpin.com/merge?utm_source=chatgpt.com>

[\[18\]](https://www.chromatic.com/?utm_source=chatgpt.com) Frontend UI Testing & Review Platform for Teams • Chromatic

<https://www.chromatic.com/?utm_source=chatgpt.com>

[\[19\]](https://zeroheight.com/?utm_source=chatgpt.com) zeroheight - Design System Management for Teams Building ...

<https://zeroheight.com/?utm_source=chatgpt.com>

[\[20\]](https://docs.plasmic.app/learn/intro/?utm_source=chatgpt.com) Introduction to Plasmic

<https://docs.plasmic.app/learn/intro/?utm_source=chatgpt.com>

[\[21\]](https://www.animaapp.com/?utm_source=chatgpt.com) Anima: Build Websites & Apps with AI \| UX Design Agent ...

<https://www.animaapp.com/?utm_source=chatgpt.com>
