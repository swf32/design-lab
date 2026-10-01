# Видение, приоритеты и следующие шаги

> Срез: 2026-10-01. Это продуктовый компас, а не утверждение, что все функции готовы. [Оглавление](README.md) · [состояние кода](24-project-map-and-status.md) · [система интерфейса](25-interface-system-and-installation.md) · [детальный checklist](IMPLEMENTATION-CHECKLIST.md).

## Для кого и зачем

**Дизайнер, входящий в код**, должен подключить существующий проект без поиска `node_modules` и ручного переписывания файлов; увидеть реальные токены, компоненты и состояния; безопасно править систему и понимать, что изменилось. **Разработчик** должен получить живой каталог, правила, проверяемый AI-контекст и предсказуемую файловую модель, не создавая параллельный source of truth. Автор чужой интерфейсной системы должен иметь понятный путь создать, проверить и передать её другому человеку.

Критерий успеха проекта: человек может подключить repo или начать чистый, найти и изменить реальную сущность, увидеть результат в Design Lab, а другой человек может установить/обновить эту систему без ручного восстановления скрытых связей. Код и файлы остаются собственностью проекта; derived indexes можно пересоздать.

## Ближайший фокус: основа для сменяемых интерфейсных System

1. **Один источник собственной System.** Активная папка System используется одновременно оболочкой и каталогом. Это проверено в development checkout и установленном внешнем fixture. См. [D-090–D-093](DECISIONS.md) и [схему](25-interface-system-and-installation.md).
2. **Понятное авторство.** Skin подходит для публичных CSS variables; полная System может менять структуру и композицию Components, SVG, изображения, шрифты и токены. Scaffold даёт локальные rules/README с маршрутом через Settings; CLI остаётся необязательным. Settings позволяет создать, проверить и установить пакет, а папку внутри проекта выбрать просмотром каталогов. Проверка показывает следующий шаг, недостающие assets, а при ошибке TypeScript — файлы, строки и TS-коды с разделением System/consumer; полный лог доступен отдельно. После проверки установка сверяет скопированные файлы с просмотренной версией и требует повторной проверки изменённой папки. Следующий слой — диагностика динамических ссылок и выбор источника вне проекта без ручного пути.
3. **Проверяемый результат.** Настоящий Component в Workbench, иллюстративный Preview отдельно, dark/light, responsive states, focus, текстовые перегрузки и screenshots. Требования содержатся в [component rules](../rules/COMPONENT_RULES.md), [skin rules](../rules/SKIN_RULES.md) и [system rules](../rules/SYSTEM_RULES.md).
4. **Обновляемость.** Установка и апгрейд инструмента не должны стирать отредактированную System. Есть versioned contract, doctor, сравнение с default и startup preflight, который останавливает запуск с понятной диагностикой несовместимой System. Миграции будущих breaking contracts остаются открытыми.

## Вторая главная линия: Design Lab как устанавливаемый инструмент

Локальный tarball, CLI, интеграционная папка, read-only scan, применение, post-apply self-check, ограниченный repair managed rules/pointer, безопасное обновление default System и запуск на отдельных портах проверены в чистом внешнем репозитории. Read-only `designlab footprint` показывает setup files, project-owned System/mounts, дополнительные файлы и AGENTS pointer как основу будущего uninstall. Пакет закрыт для публикации (`private: true`). До registry release нужны само удаление, исправление сломанных config/mounts, миграции будущих контрактов и проверки на других платформах. См. [подробную модель](20-embedded-install-and-attach-mode.md) и [раздел об установке](25-interface-system-and-installation.md).

## Остальные направления

| Направление | Зачем | Состояние/источник |
| --- | --- | --- |
| Web parity | React, Vue и Svelte должны честно поддерживать те же ключевые пользовательские действия. | [Матрица](21-web-runtime-feature-parity.md), [аудит](22-web-stack-coupling-audit.md); Vue частично, Svelte нет. |
| AI context | Агент должен искать существующие сущности и правила прежде, чем генерировать новые. | [Контекст и MCP](09-ai-context-and-mcp.md); базовые gateway/CLI/read-only MCP есть, embeddings нет. |
| Wireframes/Pages | Связать состояния, контролы, flow и финальные экраны с кодом. | [Контракты](05-entities-and-file-contracts.md), [Canvas](13-user-flow-canvas-exploration.md); React-вертикаль есть, framework-neutral runtime ещё нет. |
| Совместная работа | Делать review и обмен без обязательного облака. | [Исследование](12-collaboration-and-deployment.md); будущая фаза. |
| Community gallery | Помочь находить проверенные Skin/System packs. | [Модель](23-interface-skins-systems-and-gallery.md); registry/UI ещё нет. |
| Нативные платформы | Дать handoff после зрелой web-вертикали. | [Стратегия](17-web-first-platform-strategy.md); заморожено до Web Definition of Done. |

## Приоритетный план с проверяемым результатом

### P0 — не потерять единую систему при переходе к package

- [x] Принять ownership активной System после установки: одна редактируемая папка проекта (D-093).
- [x] Выбрать первый relative path `design-lab/system/` и подключить его к setup, Library discovery и active interface resolver.
- [x] Довести package layout и установку из tarball до чистого внешнего repo, не смешивая инструмент с user-authored source.
- [x] Проверить единые imports/discovery и живое обновление shell и Workbench Canvas из активной папки в clean external repo.
- [x] Сделать первый read-only `system diff` активной System против bundled default с отчётом по файлам и Components.
- [x] Добавить базовую версию для трёхстороннего сравнения и безопасный upgrade flow с локальными правками: при пересечении изменений применение целиком блокируется (D-095); reset остаётся отдельным recovery действием. Созданные из default авторские копии System сохраняют baseline и могут пользоваться тем же upgrade после смены ID; независимые System без baseline обновляются автором отдельно.
- [ ] Доказать полный цикл clean install, restart, versioned upgrade и uninstall во внешнем fixture repo; attach и отдельный greenfield `Start clean` с dev проверены, как и patch upgrade с сохранением локальных правок System и reset. Repair/uninstall остаются открытыми.
- [x] Добавить read-only inventory для подготовки uninstall: различать setup files, project-owned System/mounts, дополнительные файлы и AGENTS pointer без удаления.

### P1 — простое создание и замена System

- [x] Убрать эксперимент Design Lab Glass System и вернуть прежнюю default System; визуальный редизайн пока не выполнять.
- [ ] Дать автору понятный стартовый System template и диагностировать отсутствие обязательных экспортов, assets и несовместимость. Обычные JS/TS импорты, буквальные `import()` и `new URL(..., import.meta.url)`, а также локальные CSS/SCSS `url()` отсутствующих медиа и шрифтов уже диагностируются; вычисляемые пути пока нет.
- [ ] Завершить перенос визуальных стилей из `design-lab/src` в System. Новые app-local visual CSS/SCSS declarations и прямые inline TSX visual styles уже блокируются; после переноса Canvas и секций Settings осталось 458 из исходных 501 CSS-записей, а 9 inline-записей и пределы проверки перечислены в [аудите ownership](27-interface-style-ownership-audit.md). Visual spacing и динамические inline styles ещё нужно охватить.
- [x] Проверить полный System fork, меняющий структуру Button и добавляющий SVG asset, в shell и Workbench; browser fixture подтверждает установку и общий executable source.
- [ ] Довести UI workflow Skin/System create/validate/install/use/doctor до полной диагностики. Выбор папки проекта и подсказки для известных ошибок проверки уже есть; внешний источник пока требует путь.
- [x] Показать в Settings doctor и diff активной System, создание копии System, read-only diff проверенной папки перед установкой, проверку/установку из локальной папки и восстановление bundled default после подтверждения.
- [x] Проверить изменение реального Component style одновременно в её Workbench specimen и shell; браузерная регрессия входит в `test:package:browser`.

### P2 — завершить attach и web adapters

- [ ] Довести mount resolver до watcher, runtime host и оставшихся scanners; расширить repair на случаи move/rename mounts. Post-apply self-check config/mounts/rules/System, повторная диагностика и repair отсутствующих managed files в Settings уже есть.
- [ ] Закрыть Vue gaps, перенести React на isolated runtime, затем добавить Svelte по [feature matrix](21-web-runtime-feature-parity.md).
- [ ] Убрать оставшиеся eager React registries после доказанной parity; сохранить честные capability errors.

### Позднее

- [ ] Gallery, локальный обмен и публикация community packs с проверкой совместимости и явным доверием к исполняемому коду.
- [ ] Отдельный визуальный редизайн после укрепления workflow создания и замены System.
- [ ] Embeddings, advanced AI writes, collaboration и Figma context workflows.
- [ ] Нативные adapters после web gate.

Это краткий приоритетный список; подробные и исторические задачи остаются в [implementation checklist](IMPLEMENTATION-CHECKLIST.md).

## Открытые продуктовые решения

| Вопрос | Что уже решено | Что надо определить при реализации |
| --- | --- | --- |
| Где живёт активная System? | Путь `design-lab/system/`; один редактируемый source. Default template находится в package `vendor/default-system/`. | Миграции контрактов будущих версий. |
| Как заменить папку без CLI? | В Settings есть создание копии текущей System, просмотр папок проекта, проверка и установка, а также восстановление default со snapshot. Ручная замена папки остаётся возможной. | Нужны выбор внешнего архива/папки без ввода пути и более полная диагностика. |
| Как не сломать авторскую систему при апгрейде? | D-095: трёхсторонний план, блокировка всего обновления при конфликтах, staging validation и snapshot. Settings даёт read-only сравнение текущих локального и bundled файлов по одному конфликту. | UI для ручного разрешения конфликтов и миграции контрактов. |
| Каким будет будущий редизайн? | Сейчас не выполняется; default look восстановлен. System может менять Component anatomy и assets при сохранении application contract. | Отдельный дизайн-бриф, когда автор вернётся к визуальному направлению. |
| Как обмениваться Systems? | Локальные папки и пакеты уже можно устанавливать; публичного сервиса нет. | Формат публикации, проверка совместимости и модель доверия к исполняемому коду. |

При новых **материальных** решениях: спросить пользователя с конкретными вариантами, записать итог в [DECISIONS.md](DECISIONS.md), обновить этот документ и [checklist](IMPLEMENTATION-CHECKLIST.md). Не выдавать исследовательскую гипотезу за готовый контракт.
