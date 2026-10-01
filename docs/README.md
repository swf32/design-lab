# Документация Design Lab

> Срез состояния: 2026-10-01. Если возвращаетесь после перерыва, начните с [карты проекта](24-project-map-and-status.md). Различайте **реализовано**, **принятое решение**, **план** и **исследование**: ранние страницы сохраняют историю и местами описывают заменённые гипотезы.

## Быстрый маршрут

1. [Что такое Design Lab, что работает и где код](24-project-map-and-status.md).
2. [Собственный интерфейс, Skin, System и установка](25-interface-system-and-installation.md).
3. [Видение, приоритеты и открытые вопросы](26-vision-and-next-steps.md).
4. [Подробный checklist](IMPLEMENTATION-CHECKLIST.md) и [принятые решения](DECISIONS.md).
5. [Текущий план поставки P0/P1 и проверяемый прогресс](28-delivery-board.md).

## Полная карта документов

- [Рабочий implementation checklist](IMPLEMENTATION-CHECKLIST.md)
- [Принятые продуктовые и архитектурные решения](DECISIONS.md)
- [Концепция и принципы](01-foundation.md)
- [Модули](02-modules.md)
- [Онбординг, процессы и MVP](03-workflows-and-mvp.md)
- [Продуктовая рамка и модель workspace](04-product-framework.md)
- [Сущности и файловые контракты](05-entities-and-file-contracts.md)
- [AI-процессы и интеграции](06-ai-workflows-and-integrations.md)
- [AI context gateway, поиск, MCP и CLI](09-ai-context-and-mcp.md)
- [Inspection architecture: AST pipeline и style analyzer](10-inspection-architecture.md)
- [Local HTTP API reference](11-server-api.md)
- [Collaboration и deployment: видение и архитектурные дыры](12-collaboration-and-deployment.md)
- [User-flow Canvas: аудит, гипотезы и варианты решений (не принято)](13-user-flow-canvas-exploration.md)
- [Универсальная архитектура токенов и варианты хранения](14-token-architecture.md)
- [Multiplatform Components: React/Vue/Web/SwiftUI/Compose (техническое исследование)](15-multiplatform-components-exploration.md)
- [Multiplatform Components: активный implementation plan](16-multiplatform-implementation-plan.md)
- [Web-first platform strategy: Components, Wireframes и Pages](17-web-first-platform-strategy.md)
- [Web runtime architecture: managed isolated runtimes](18-web-runtime-architecture-options.md)
- [Dependencies и Libraries](19-dependencies-and-libraries.md)
- [Embedded install и attach mode](20-embedded-install-and-attach-mode.md)
- [Web runtime feature parity: React, Vue и Svelte](21-web-runtime-feature-parity.md)
- [Web stack coupling audit: оставшиеся React/TSX-зависимости](22-web-stack-coupling-audit.md)
- [Interface Skins, Systems и community gallery](23-interface-skins-systems-and-gallery.md)
- [Карта проекта и честный статус](24-project-map-and-status.md)
- [Собственная интерфейсная система и установка](25-interface-system-and-installation.md)
- [Видение и следующие шаги](26-vision-and-next-steps.md)
- [Граница стилей приложения и System: аудит и проверка](27-interface-style-ownership-audit.md)
- [План поставки P0/P1 и прогресс](28-delivery-board.md)
- [Конкурентный обзор](07-market-review.md)
- [Roadmap, риски и пакетные AI-задачи](08-roadmap-risks-and-tasks.md)

## Правила чтения

- [AGENTS.md](../AGENTS.md) и [rules/](../rules/) задают обязательные контракты при изменении сущностей.
- [DECISIONS.md](DECISIONS.md) хранит принятые решения; поздняя поправка заменяет противоречащую часть раннего решения.
- [IMPLEMENTATION-CHECKLIST.md](IMPLEMENTATION-CHECKLIST.md) хранит детальные задачи; поздний открытый gap может уточнять раннюю отметку `[x]`.
- Код и тесты подтверждают фактическое поведение. Открывайте весь репозиторий как Obsidian vault, чтобы работали ссылки из `docs/` на код и правила уровнем выше.
