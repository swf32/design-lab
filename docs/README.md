# Product Definition v0.2 для Design Lab

## Executive summary

**Design Lab** целесообразно определять как **локальное filesystem-first рабочее пространство
дизайн-систем**, которое подключается к существующему repository без переноса source или создаёт
canonical greenfield roots. Components, Wireframes, Pages, Tokens, Palette, Assets, Fonts, rules и
AI-контекст объединяются semantic contracts и relative source mounts, а не требованием одного
физического дерева. Это не универсальный адаптер любого кода, full IDE или буквальная копия Figma:
точная категория — **designer-first code workspace** с безопасным onboarding, AI-помощью и
framework adapters.

Ниже — уже не пересказ диалога, а нормализованная сводка того, каким на данный момент видится проект. Она основана на всём обсуждении и отражает текущую концепцию. 

## Содержание

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
- [Конкурентный обзор](07-market-review.md)
- [Roadmap, риски и пакетные AI-задачи](08-roadmap-risks-and-tasks.md)
