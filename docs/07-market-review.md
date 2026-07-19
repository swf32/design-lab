# Конкурентный обзор

## Синтетический вывод

По состоянию на июль 2026 рынок ясно показывает несколько направлений: isolated component workbench, docs-as-code, design-system documentation, visual review, code components in visual editors, AI-native generation и MCP/context layers. Но прямого продукта, который бы объединял **локальный designer workspace + проектные артефакты + AI-ready filesystem model + pages/wireframes/decisions/rules** в единую систему, обзор не даёт. Это усиливает позиционирование Design Lab как новой комбинации уже проверенных паттернов. [\[12\]](https://storybook.js.org/?utm_source=chatgpt.com)

## Таблица сравнения

| Продукт | Scope | Code-first? | Local-first? | AI features | Best-fit use case | Gaps относительно Design Lab | Источники |
|----|----|---:|---:|----|----|----|----|
| Storybook | Изолированная разработка, тестирование и документация компонентов/страниц | Да | Да | Ограниченно; AI не ядро продукта | UI component workshop | Нет project-level entities, rules/decisions/workspace model | [\[13\]](https://storybook.js.org/?utm_source=chatgpt.com) |
| Bit | Компонентные workspace, composability, versioning, app shells, AI-native DX | Да | Частично | Да: AI-native workflow, AI agent integration | Большие composable codebases и DS libraries | Сильнее про dev platform, слабее про designer-first pages/wireframes | [\[14\]](https://bit.dev/docs/intro/?utm_source=chatgpt.com) |
| Backstage | Software catalog, docs-like-code, plugins, developer portal | Да | Обычно self-hosted | Не центр продукта | Каталог сервисов/библиотек и dev portal | Не visual workspace, не DS/page authoring | [\[15\]](https://backstage.io/docs/features/software-catalog/?utm_source=chatgpt.com) |
| Builder.io | Visual editor + real codebase/design system + AI + Figma flows | Частично | Нет | Да, AI core и Figma plugin | Совместная visual правка поверх кода | Больше про web publishing/editor, меньше про local filesystem workspace | [\[16\]](https://www.builder.io/c/docs/intro?utm_source=chatgpt.com) |
| UXPin Merge | Дизайн из React components, code as source of truth, DS docs | Да | Нет | Не ядро | Реалистичные прототипы на coded components | Облако, React-centric, не local-first project system | [\[17\]](https://www.uxpin.com/merge?utm_source=chatgpt.com) |
| Chromatic | Visual testing и UI review для Storybook | Да | Нет | Не про generation; review automation | Review и visual regression | Не authoring/workspace, зависит от Storybook/CI | [\[18\]](https://www.chromatic.com/?utm_source=chatgpt.com) |
| zeroheight | DS documentation, measurement, releases, MCP/AI context | Нет, скорее docs/system layer | Нет | Да: AI features, MCP access | DS documentation и measurement | Не local workspace, не page/wireframe authoring | [\[19\]](https://zeroheight.com/?utm_source=chatgpt.com) |
| Plasmic | Visual web builder, code components, loader/codegen, CMS | Частично | Нет | Косвенно | Web/app builder с codebase integration | Больше visual web builder, чем local designer OS | [\[20\]](https://docs.plasmic.app/learn/intro/?utm_source=chatgpt.com) |
| Anima | Figma/URL/prompt → code, playground, design-aware AI | Частично | Нет | Да, design-aware AI и API | Design-to-code и prototype-to-code | Сильнее про conversion/generation, слабее про structured workspace | [\[21\]](https://www.animaapp.com/?utm_source=chatgpt.com) |

## Что брать как вдохновение

От Storybook стоит брать **идею изолированных состояний, preview и файл рядом с компонентом**. От Bit — **workspace/model/extensibility/composability**. От Backstage — **docs-like-code и entity catalog mindset**. От zeroheight — **machine-readable docs, measurement и MCP thinking**. От Chromatic — **review mindset и visual diff как UX-паттерн**. От UXPin Merge, Plasmic, Builder и Anima — **уважение к реальным компонентам/контексту и сильные AI-assisted flows**, но не их облачную тяжесть. [\[22\]](https://storybook.js.org/?utm_source=chatgpt.com)

