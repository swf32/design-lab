# AI workflows, onboarding, поиск, devtools и интеграции

## AI workflow modes

Рекомендуемая модель — три режима, не один.

| Режим | Что делает AI | Что делает человек | Разрешение на запись |
|----|----|----|----|
| Manual | Только отвечает, анализирует, предлагает план | Сам редактирует файлы | Нет |
| Assisted | Готовит draft файлов, diffs, changelog, notes | Подтверждает и применяет | Да, после подтверждения |
| Auto-propose with confirmation | Сам собирает контекст, предлагает изменения и impact summary | Подтверждает один или несколько patches | Да, но только через явный review |

Это хорошо сочетается с рынком: Builder, Bit, zeroheight и Anima уже смещаются в сторону AI-assisted workflows, но человеческое подтверждение остаётся центральным для качественного результата и управляемого drift. [\[7\]](https://www.builder.io/c/docs/intro?utm_source=chatgpt.com)

## Рекомендуемый базовый AI pipeline

    Выбор задачи
    → Сбор контекста (rules + relevant entities + embeddings)
    → Генерация draft
    → Проверки (rules / accessiblity / consistency)
    → Auto-fix proposal
    → Human confirmation
    → Write files
    → Update search index

## Onboarding и Figma

Для MVP нужно явно выбрать не “Figma import”, а **Figma as context**:

- вставка ссылки, изображений, текста задачи;
- AI считывает контекст и предлагает pages/wireframes/components;
- официального плагина, sync-слоя и двустороннего round-trip в MVP не требуется.

Это соответствует вашему направлению и при этом не игнорирует рынок: Builder, Anima и другие строят Figma→AI/code workflows, но они же показывают, сколько продуктовой сложности появляется, когда Figma становится частью постоянного контракта системы. [\[8\]](https://www.builder.io/c/docs/builder-figma-plugin?utm_source=chatgpt.com)

## Search и embeddings в MVP

Embeddings в MVP **нужны**. Причина не только в “модности”, а в том, что без semantic retrieval AI будет либо читать слишком мало, либо получать слишком большой, шумный контекст.

Рекомендуемый MVP-контур:

- индексировать: `components`, `pages`, `wireframes`, `rules`, `decisions`, `prompts`, `docs`;
- хранить embeddings локально внутри `.designlab/embeddings/`;
- строить retrieval-пакеты по типу задачи;
- иметь fallback на keyword search и backlinks;
- при записи файлов автоматически обновлять затронутые chunks.

Реализованный первый retrieval-срез использует нормализованные filesystem entities, authored `description / aliases / useWhen`, README fallback и детерминированный weighted lexical + fuzzy ranking. MCP и CLI возвращают relevance и descriptions, после чего отдельный `get` раскрывает stable ref. Это честный fallback, а не замена embeddings; multilingual embedding provider и reranking остаются следующим слоем.

## Devtools для pages

Это одна из наиболее дифференцирующих фич Design Lab.

**Инспектор/пипетка для page** должен уметь:

- показать, что под курсором: `component` или raw block;
- если это компонент — показать `name`, `variant`, `state`, `selected props`, источник библиотеки;
- если это raw block — показать CSS-like свойства и связанный token mapping;
- дать actions: **copy props**, **copy styles**, **open source entity**, **highlight token origin**, **find usages**.

MVP-состав инспектора:

| Возможность             | MVP | Next | Future |
|-------------------------|-----|------|--------|
| Hover highlight         | Да  |      |        |
| Entity type detection   | Да  |      |        |
| Component props panel   | Да  |      |        |
| Raw CSS-like panel      | Да  |      |        |
| Copy CSS / props        | Да  |      |        |
| Open component / token  | Да  |      |        |
| Token origin trace      |     | Да   |        |
| Export handoff snippets |     | Да   |        |
| Layout diff overlay     |     |      | Да     |

## Design analytics

Design analytics лучше сузить до понятной области, чтобы не превратить продукт в BI-платформу.

**MVP design analytics**:

- usage count компонентов в pages;
- orphaned entities;
- stale entities: давно не открывались / не обновлялись;
- coverage: сколько pages используют library components vs raw blocks;
- optional local activity log.

**Не в MVP**:

- полноценная product/web analytics;
- A/B experimentation engine;
- review presence, comments stream, organization dashboards.

zeroheight показывает рыночный спрос на measurement и adoption views: usage analytics, page insights, component adoption и design-system measurement уже считаются значимой частью зрелой системы. Это хороший аргумент включить **минимальные design analytics**, но не раскручивать тему слишком рано. [\[9\]](https://help.zeroheight.com/hc/en-us/articles/35886897039387-zeroheight-Analytics-Using-zeroheight-Analytics?utm_source=chatgpt.com)

## Collaboration и deploy

Для v0.2 стоит зафиксировать принцип:

- **локальная версия — single-user first**;
- **hosted mode — future layer**, а не ядро продукта.

Что можно отложить до hosted-фазы:

- комментарии;
- общий review feed;
- presence;
- branch awareness;
- связь локальной копии с центральным deploy.

Что можно предусмотреть архитектурно уже сейчас:

- локальный activity log;
- экспорт preview на статический route;
- entity IDs и stable references, чтобы hosted-слой позже не ломал файловую модель.

## Extensibility и plugins

Backstage и Bit явно показывают силу plugin/aspect модели: каталоги сущностей и workspace сильно выигрывают, когда расширяются плагинами, но базовый продукт не должен начинаться с “маркетплейса расширений”. [\[10\]](https://backstage.io/docs/plugins/?utm_source=chatgpt.com)

Рекомендация:

- **MVP**: внутренние extension points, но без публичного plugin SDK;
- **Next**: analyzers, importers, exporters, linters, inspectors;
- **Future**: полноценный plugin SDK и marketplace.

Минимальные точки расширения:

- file importers;
- lint rules;
- entity renderers;
- preview panels;
- exporters;
- AI task packs.

## Storybook / Story import policy

Storybook остаётся важным соседним инструментом: он документирует stories, isolated states и docs pages, а Chromatic добавляет visual testing и review. Но Design Lab не должен становиться “тонкой обёрткой над Storybook”. [\[11\]](https://storybook.js.org/?utm_source=chatgpt.com)

Рекомендуемая политика:

- **MVP**: read-only import из Storybook CSF/MDX, если это недорого;
- использовать stories как **контекст**, previews или стартовую документацию;
- не делать Storybook обязательным форматом;
- не делать двухстороннюю синхронизацию;
- если импорт сложный, можно оставить только **context ingestion**: “прочитать stories и docs, создать draft entity docs”.

## Роли и ACL

Решение для локального ядра должно быть жёстким:

> **В локальном Design Lab роли и ACL не внедряются.**

Причина не в том, что роли вообще не нужны, а в том, что на локальной файловой системе они создают ложное ощущение контроля. При появлении hosted-фазы это можно пересмотреть.
