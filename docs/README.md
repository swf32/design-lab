# Product Definition v0.2 для Design Lab

## Executive summary

**Design Lab** целесообразно определять как **локальное, filesystem-first хранилище и рабочее пространство дизайн-систем**, в котором компоненты, wireframes, pages, токены, палитры, ассеты, шрифты, правила, решения, prompts и AI-контекст существуют по единому каноническому файловому контракту. Его не стоит позиционировать как адаптер любого production-репозитория, замену Figma во всех сценариях или full IDE. Более точная категория — **designer-first canonical workspace** с сильной структурой файлов, AI-помощью и расширяемостью.

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
- [Конкурентный обзор](07-market-review.md)
- [Roadmap, риски и пакетные AI-задачи](08-roadmap-risks-and-tasks.md)
