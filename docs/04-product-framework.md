# Продуктовая рамка

## Видение

Design Lab — это **пространство для дизайнеров, а не оболочка над реальным продом**. Оно должно быть достаточно структурированным, чтобы AI и правила реально работали, и достаточно локальным, чтобы не требовать сервера, CI/CD, enterprise-ролей и интеграционной платформы уже в MVP.

Ключевое видение можно зафиксировать так:

> **Design Lab — это локальная продуктовая лаборатория, где кодоподобные файлы являются источником истины для дизайнерских сущностей, а AI работает не “поверх хаоса”, а внутри явно определённой файловой и семантической модели.**

## Целевые пользователи

Первичные пользователи — продуктовые и UI/UX-дизайнеры, особенно те, кому тесно в “чистом макете”, но кто не хочет переносить свою работу в production-код. Вторичные пользователи — дизайн-лиды и системные дизайнеры, которым важны правила, переиспользование, версии, changelog и история решений. Третичные пользователи — инженеры, аналитики и продукт-менеджеры, но уже как читатели, ревьюеры и получатели handoff, а не как владельцы инструмента.

## Проблема

Сегодня нужные артефакты разнесены по разным плоскостям: визуальная работа живёт в Figma, документация — в zeroheight/Notion/Confluence/Storybook, компоненты — в коде либо библиотеке, визуальный регресс — в Chromatic, design-to-code — в Builder/Anima/Plasmic, а AI пытается действовать без единой модели контекста. Это создаёт разрыв между **намерением**, **документацией**, **вариантами**, **проверками**, **использованием** и **историей решений**. Storybook, Bit, Backstage, zeroheight, Builder, UXPin Merge, Plasmic и Anima по отдельности показывают, что рынок уже признаёт ценность изолированных компонентов, docs-as-code, machine-readable context и AI-assisted workflows, но целостный “designer-first local workspace” пока остаётся пустой нишей. [\[5\]](https://storybook.js.org/?utm_source=chatgpt.com)

## Принципы

| Принцип | Практический смысл |
|----|----|
| Local-first | Всё должно работать локально без обязательного back-end |
| Filesystem-first | Файлы и папки — источник истины; БД и облако не обязательны |
| Designer-first | Production-код не смешивается с основным режимом продукта |
| AI subordinate to rules | AI не пишет “как хочет”, а подчиняется библиотекам, правилам и контексту |
| Confirm before write | Любая запись AI по умолчанию требует подтверждения или diff-review |
| Markdown-first для знаний | Правила, решения, changelog и prompts должны быть человеком читаемы |
| Progressive formality | Можно начать с малого, не заполняя всё сразу |
| No forced process | Продукт помогает соблюдать систему, но не превращается в бюрократию |

## Локальный runtime: Node.js

Design Lab — локальное веб-приложение, но браузер сам по себе не может читать, создавать или отслеживать файлы произвольного репозитория. Поэтому в MVP рядом с UI нужен **локальный Node.js-процесс**: Vite/dev server или отдельный локальный API.

```text
Design Lab UI (браузер, React / TypeScript / SCSS)
        ↓
локальный Node.js API / dev server
        ↓
файловая система workspace
```

Node.js runtime отвечает за ограниченный набор инфраструктурных задач: сканирование директорий, наблюдение за изменениями, чтение и создание файлов по явному действию пользователя, запуск индексации и отдачу данных UI. Он не делает Design Lab IDE и не становится отдельным источником истины: все продуктовые артефакты по-прежнему живут в обычных файлах workspace.

В частности, этот слой позволяет поддержать один и тот же результат тремя способами: вручную создать файлы, попросить AI создать их через IDE/терминал или воспользоваться формой в Design Lab. После добавления, удаления или переименования файлов интерфейс должен обновиться автоматически.

## Scope

Ниже — рекомендуемая граница между MVP и последующими фазами.

| Область | В MVP | Следом | Дальше |
|----|----|----|----|
| Workspace / Projects / Libraries | Да | Улучшения зависимостей | Federation и multi-repo |
| Local runtime | Node.js dev server / local API, файловый watcher и индексатор | Выделяемые background jobs | Desktop shell или hosted runtime |
| Components | Да | Story import, richer previews | Multi-platform render contracts |
| Wireframes / Pages | Да | Flows, richer handoff | Глубокий impact analysis |
| Tokens / Palette / Assets / Fonts | Да | Theme packs | Cross-platform packs |
| Rules / Decisions / Prompts | Да | Шаблоны и lint packs | Team governance |
| Search / Embeddings | Да | Better ranking | Cross-workspace semantic graph |
| AI workflows | Да | Multi-step plans | Autonomous multi-agent flows |
| Figma | Только context | AI ingest | Round-trip / plugin |
| Storybook | Read-only import если дёшево | Better mapping | Two-way sync не нужен |
| Devtools inspector | Да | Copy snippets, trace token origins | Rich handoff / CSS map |
| Analytics | Базовые design analytics | Preview/deploy metrics | Hosted product analytics |
| Collaboration / comments | Нет | Hosted preview + comments | Presence, mentions, review queues |
| Roles / ACL | Нет | Только при hosted | Enterprise model |
| External MCP | Local read-only stdio adapter | Embeddings, richer resources, guarded writes | Remote/hosted MCP with auth |

## Модель workspace, project и library

Корневая директория workspace является общей локальной территорией. В ней приложение `design-lab/`, пользовательские `projects/` и переиспользуемые `libraries/` лежат рядом. Пользователь не выбирает абсолютные пути: при создании Project достаточно названия, а папка создаётся автоматически в `projects/<slug>/`.

## Рекомендуемая модель

**Workspace** — верхнеуровневая папка/контейнер Design Lab, где лежат настройки приложения, проекты, библиотеки, кэш, templates и плагины.\
**Project** — рабочая единица конкретного продукта, сервиса, сайта, приложения или задачи.\
**Library** — переиспользуемая база токенов, компонентов, ассетов, шаблонов правил и паттернов, которую можно подключать к нескольким проектам.

Для вашей текущей философии лучше всего выглядит такая логика:

- **дефолт** — designer-first canonical workspace;
- **существующая дизайн-система** — миграция файлов в канонический Project/Library, а не настройка произвольных путей;
- **не включать в MVP** multi-repo federation и сложную распределённую архитектуру.

## Mermaid-диаграмма отношений

|  |
|:--:|
| <img src="docs/assets/media/image1.png" style="width:5.83333in;height:4.01492in" alt="Rendered Mermaid diagram 1" /> |

## Рекомендуемое дерево docs

Это и есть **экспортируемый документ-сет**, который удобно хранить в `docs/` и обновлять частями.

    docs/
    ├── EXECUTIVE-SUMMARY.md
    ├── VISION.md
    ├── USERS-AND-PROBLEM.md
    ├── PRINCIPLES.md
    ├── SCOPE-MVP-VS-FUTURE.md
    ├── WORKSPACE-MODEL.md
    ├── FILESYSTEM-TREES.md
    ├── COMPONENTS.md
    ├── WIREFRAMES.md
    ├── PAGES.md
    ├── TOKENS-PALETTE-ASSETS-FONTS.md
    ├── RULES-DECISIONS-PROMPTS.md
    ├── SEARCH-AND-EMBEDDINGS.md
    ├── AI-WORKFLOWS.md
    ├── ONBOARDING-FIGMA.md
    ├── DEVTOOLS-INSPECTOR.md
    ├── ANALYTICS.md
    ├── COLLABORATION-AND-DEPLOY.md
    ├── EXTENSIBILITY-AND-PLUGINS.md
    ├── STORYBOOK-POLICY.md
    ├── MCP-STRATEGY.md
    ├── ROADMAP.md
    ├── RISKS-AND-CONSTRAINTS.md
    ├── OPEN-QUESTIONS.md
    └── AI-TASK-BATCHES.md

## Канонический workspace

Это **рекомендуемый основной режим** для MVP.

    design-lab-workspace/
    ├── design-lab/           # само приложение
    │   ├── src/
    │   ├── server/
    │   ├── package.json
    │   ├── .designlab/
    │   │   ├── projects.json
    │   │   └── settings/
    │   └── templates/
    ├── libraries/
    │   ├── core-ds/
    │   │   ├── library.json
    │   │   ├── tokens/
    │   │   ├── palette/
    │   │   ├── fonts/
    │   │   ├── assets/
    │   │   │   ├── icons/
    │   │   │   ├── images/
    │   │   │   └── videos/
    │   │   ├── components/
    │   │   ├── rules/
    │   │   └── decisions/
    │   └── icons/
    └── projects/
        ├── mobile-banking/
        │   ├── project.json
        │   ├── tokens/
        │   ├── palette/
        │   ├── fonts/
        │   ├── assets/
        │   │   ├── icons/
        │   │   ├── images/
        │   │   └── videos/
        │   ├── components/
        │   ├── wireframes/
        │   ├── pages/
        │   ├── rules/
        │   ├── decisions/
        │   ├── prompts/
        │   ├── docs/
        │   └── .designlab/
        │       ├── embeddings/
        │       ├── index/
        │       ├── cache/
        │       └── previews/
        └── gov-portal/

## Миграция существующей дизайн-системы

Design Lab не открывает существующий репозиторий как произвольный источник. Для подключения готовой дизайн-системы её сущности переносятся в канонический Project или Library:

    projects/imported-system/
    ├── project.json
    ├── tokens/
    ├── palette/
    ├── fonts/
    ├── assets/
    ├── components/
    ├── rules/
    ├── decisions/
    └── docs/

Перенос может выполняться вручную, импортёром или AI, но результат всегда один и тот же: файлы соответствуют контракту Design Lab. Настройки путей до произвольных `src/components` или token-файлов не существует.

## Рекомендация по выбору режима

Для v0.2 правильно зафиксировать так:

- **Рекомендуемый дефолт**: canonical designer-first workspace.
- **Подключение существующей системы**: явная миграция в Project/Library.
- **Не проектировать сейчас**: multi-repo federation, central hosted source-of-truth, repo orchestration.
