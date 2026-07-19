# Модули, сущности и файловые контракты

## Общий принцип файловых контрактов

Для MVP контракт должен быть:

- человекочитаемым;
- достаточно простым для Git diff;
- достаточно структурированным для AI и индексатора;
- не завязанным на базу данных;
- не требующим обязательно TypeScript-кода для всех сущностей.

Поэтому лучший компромисс — **Markdown + JSON/YAML metadata + optional TSX/preview files**.

Верхнеуровневая структура Project/Library задаётся каноническим контрактом Design Lab и не настраивается вручную. Модули автоматически ищут известные типы сущностей внутри своих закреплённых каталогов; при необходимости пользователь может добавить локальные metadata-файлы рядом с сущностью, но не обязан поддерживать центральный реестр.

Производный индекс хранится отдельно, например в `.designlab/index/` и `.designlab/embeddings/`. Его строит локальный Node.js индексатор после изменений файлов. Такой индекс может быть кэширован и даже не коммититься в Git, но **не является источником истины** и должен всегда пересобираться из файлов проекта.

## Компоненты

| Поле | Рекомендация |
|----|----|
| Purpose | Хранить переиспользуемые UI-единицы с вариантами, состояниями, пропсами, preview и документацией |
| Minimal data model | `id`, `name`, `status`, `description`, `props[]`, `variants[]`, `states[]`, `slots[]`, `tokensUsed[]`, `dependsOn[]`, `usedBy[]`, `docsRef`, `changelogRef` |
| File examples | `Button.tsx`, `Button.meta.json` (опционально), `Button.preview.tsx`, `Button.stories.tsx`, `README.md`, `CHANGELOG.md`, `render.tsx` опционально |
| UX flow | Создать компонент → задать props/variants/states → собрать preview → сохранить docs → использовать на pages/wireframes |
| Features | **MVP**: metadata, static or optional manifest-declared animated preview, docs, changelog, usage refs. **Next**: Story import, composition playground. **Future**: cross-platform contracts |

Пример дерева:

    components/
    └── Button/
        ├── Button.tsx
        ├── Button.meta.json
        ├── Button.preview.tsx
        ├── Button.stories.tsx
        ├── README.md
        ├── CHANGELOG.md
        └── render.tsx

## Wireframes

| Поле | Рекомендация |
|----|----|
| Purpose | Фиксировать несколько черновых вариантов будущей страницы или потока |
| Minimal data model | `id`, `name`, `variants[]`, `notes`, `linkedPages[]`, `status`, `decisionRef` |
| File examples | `checkout.wireframe.json`, `notes.md`, `variant-a.json`, `variant-b.json` |
| UX flow | Создать wireframe → сделать A/B/C → сравнить → зафиксировать выбранное направление → превратить в page |
| Features | **MVP**: multi-variant canvas, notes, compare. **Next**: review state, comments. **Future**: experiments binding |

Пример дерева:

    wireframes/
    └── checkout/
        ├── wireframe.meta.json
        ├── variant-a.json
        ├── variant-b.json
        ├── variant-c.json
        └── notes.md

## Pages

| Поле | Рекомендация |
|----|----|
| Purpose | Хранить выбранный и более финализированный экран |
| Minimal data model | `id`, `name`, `layoutTree`, `componentRefs[]`, `tokenRefs[]`, `status`, `derivedFromWireframe`, `changelogRef`, `reviewState` |
| File examples | `Checkout.page.json`, `README.md`, `CHANGELOG.md` |
| UX flow | Создать page из wireframe или с нуля → собрать из components + local blocks → проверить rules → открыть inspector/handoff |
| Features | **MVP**: canvas, changelog, inspector. **Next**: review tools, richer exports. **Future**: impact trace and deeper handoff |

Пример дерева:

    pages/
    └── Checkout/
        ├── Checkout.page.json
        ├── README.md
        └── CHANGELOG.md

## Tokens

| Поле | Рекомендация |
|----|----|
| Purpose | Хранить системные значения: spacing, radii, typography sizes, semantic refs |
| Minimal data model | `name`, `category`, `value`, `semantic`, `aliases[]`, `themes[]` |
| File examples | `spacing.tokens.json`, `radius.tokens.json`, `typography.tokens.json` |
| UX flow | Создать/изменить token → обновить превью и связи → использовать в components/pages |
| Features | **MVP**: CRUD, usage references. **Next**: theme packs. **Future**: cross-library overrides |

## Palette

| Поле | Рекомендация |
|----|----|
| Purpose | Быть отдельным слоем поверх tokens для цветовой системы и брендинга |
| Minimal data model | `paletteName`, `swatches[]`, `semanticColorMap`, `themeVariants[]` |
| File examples | `brand.palette.json`, `dark.palette.json` |
| UX flow | Редактировать visual color layer → маппить в tokens → проверять контраст |
| Features | **MVP**: отдельный layer и semantic mapping. **Next**: theme comparison. **Future**: brand packs |

## Assets

| Поле | Рекомендация |
|----|----|
| Purpose | Хранить и каталогизировать изображения, иконки, иллюстрации, медиа |
| Minimal data model | `id`, `type`, `path`, `tags[]`, `usage[]`, `license?`, `variants[]` |
| File examples | `assets/index.json`, канонические папки `icons/`, `images/`, `videos/` и произвольные вложенные категории |
| UX flow | Импортировать asset → присвоить tags → использовать в components/pages |
| Features | **MVP**: library browser, basic tagging. **Next**: dedupe, alt-text suggestions. **Future**: semantic media search |

Иконка, появляющаяся при создании или изменении Component, сначала становится переиспользуемым code-native asset в каноническом `assets/icons/` активной Library и экспортируется через assets barrel. Component, preview и stories импортируют её оттуда; inline SVG paths, CSS-рисование и emoji/Unicode substitutes не являются допустимым способом добавить отсутствующую продуктовую иконку.

## Fonts

| Поле | Рекомендация |
|----|----|
| Purpose | Хранить font files, font families, weights, fallback chains |
| Minimal data model | `family`, `weights[]`, `styles[]`, `fallback`, `license?` |
| File examples | `fonts.json`, `Inter/Inter-Regular.woff2` |
| UX flow | Добавить семейство → задать mapping в typography tokens → preview |
| Features | **MVP**: registry + mapping. **Next**: loading diagnostics. **Future**: variable font tooling |

## Rules

| Поле | Рекомендация |
|----|----|
| Purpose | Фиксировать правила проектирования, которые читают и люди, и AI |
| Minimal data model | `title`, `scope`, `rule`, `rationale`, `examples`, `severity`, `appliesTo` |
| File examples | `accessibility.md`, `layout.md`, `content.md` |
| UX flow | Написать правило → индексировать → использовать в lint/AI prompt assembly |
| Features | **MVP**: markdown rules + category + severity. **Next**: lint bindings. **Future**: executable policies |

Пример файла:

    # Layout Rules

    ## Grid
    - Use 8px spacing scale for all base layouts.
    - Avoid mixed arbitrary gaps inside the same section.

    ## Components
    - Prefer existing Card and Stack components before raw containers.

## Decisions

| Поле | Рекомендация |
|----|----|
| Purpose | Хранить историю решений по принципу lightweight ADR |
| Minimal data model | `id`, `title`, `problem`, `options`, `decision`, `why`, `impact`, `date`, `links[]` |
| File examples | `2026-07-16-wireframes-vs-pages.md` |
| UX flow | Возник спорный вопрос → зафиксировать варианты и выбор → ссылаться из pages/components/rules |
| Features | **MVP**: markdown decisions. **Next**: backlinks and decision timeline. **Future**: review workflow |

## Prompts

| Поле | Рекомендация |
|----|----|
| Purpose | Хранить reusable prompt packs и task templates для AI |
| Minimal data model | `id`, `purpose`, `inputs`, `steps`, `constraints`, `outputFormat`, `validator` |
| File examples | `create-component.prompt.md`, `refine-page.prompt.md` |
| UX flow | Выбрать задачу → собрать контекст → применить template → получить draft/diff |
| Features | **MVP**: prompt library. **Next**: prompt packs per library. **Future**: execution graphs |

## Embeddings

| Поле | Рекомендация |
|----|----|
| Purpose | Давать semantic search и AI retrieval по проекту; не заменять файлы проекта ручным реестром |
| Minimal data model | `chunkId`, `entityType`, `entityRef`, `text`, `vector`, `updatedAt` |
| File examples | `.designlab/embeddings/*.jsonl`, `.designlab/index/chunks.json` |
| UX flow | Файлы меняются → Node.js watcher запускает индексатор → embeddings обновляются → поиск и AI используют контекст |
| Features | **MVP**: локальный индекс и semantic retrieval. **Next**: reranking. **Future**: cross-project graph |

## MCP

| Поле | Рекомендация |
|----|----|
| Purpose | Внешний протокол доступа AI-клиентов к контексту проекта |
| Minimal data model | `tools`, `resources`, `auth`, `query schema` |
| File examples | `design-lab/server/mcp/index.mjs`, общий `contextGateway.mjs`, CLI adapter |
| UX flow | Агент ищет по назначению → выбирает описание и relevance → раскрывает stable ref → получает проверенные import/props/docs |
| Features | **MVP**: local read-only stdio bridge и CLI fallback. **Next**: multilingual embeddings, resources и guarded write proposals. **Future**: remote/hosted server with auth |

zeroheight уже делает MCP-сервер, structured access и советы по оптимизации styleguides для AI, а Bit продвигает AI-native workflow и MCP-направление. Design Lab начинает с локального read-only adapter, не превращая первый срез в remote integration platform. [\[6\]](https://help.zeroheight.com/hc/en-us/articles/43780251357979-Using-the-remote-zeroheight-MCP-server?utm_source=chatgpt.com)

## Варианты changelog-контракта

Есть три реалистичных варианта.

| Вариант | Плюсы | Минусы |
|----|----|----|
| `CHANGELOG.md` рядом с сущностью | Человекочитаемо, Git-friendly, AI-friendly, просто | Меньше строгой типизации |
| `*.changelog.ts` | Удобно программно читать | Избыточно для дизайнерских артефактов, сильнее сцепляет с кодом |
| `history.jsonl` | Машиночитаемо, удобно для событий | Слабо для людей, нужен генератор читаемой истории |

**Рекомендация для MVP:** `CHANGELOG.md` как источник истины, плюс при желании — **автогенерируемый кэш-индекс** в `.designlab/index/` для ускорения UI.

## Шаблон `CHANGELOG.md`

    # CHANGELOG

    ## Unreleased
    - _Nothing yet_

    ## 2026-07-16
    ### Added
    - Added `loading` state
    - Added `iconRight` prop

    ### Changed
    - Updated focus style to use border instead of shadow
    - Adjusted `md` spacing token mapping

    ### Fixed
    - Fixed incorrect disabled contrast on dark palette

    ### Notes
    - This change affects Checkout and Payment pages

## Пример кратких записей

    # CHANGELOG

    ## 2026-07-12
    ### Added
    - Added destructive button variant

    ## 2026-07-10
    ### Changed
    - Renamed `secondaryGray` to `muted`

    ## 2026-07-08
    ### Fixed
    - Fixed icon alignment in compact mode
