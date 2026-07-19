import { createContext, useContext, useMemo, type ReactNode } from 'react'

export const en = {
  'module.home':'Home','module.components':'Components','module.wireframes':'Wireframes','module.pages':'Pages','module.assets':'Assets','module.palette':'Palette','module.tokens':'Tokens','module.fonts':'Fonts',
  'nav.modules':'Design Lab modules','nav.addModule':'Add module','nav.settings':'Settings','source.none':'No project','source.createFirst':'Create your first project','source.localProject':'Local project','source.localLibrary':'Local library','source.create':'Create project',
  'directory.label':'Project entities','directory.add':'Add entity','directory.loading':'Reading entities…','directory.empty':'Nothing in this section yet.','directory.noProject':'Create a project first.','directory.resize':'Resize navigation','directory.localFilesystem':'Local filesystem','directory.search':'Search entities','directory.searchPlaceholder':'Search this module…','directory.noResults':'No matching entities.',
  'tree.expand':'Expand folder','tree.collapse':'Collapse folder','tree.color':'Choose icon color','tree.actions':'More actions','tree.actionsSoon':'Actions will appear here.',
  'colorPicker.color':'Color','colorPicker.presets':'Color presets','colorPicker.hex':'HEX','colorPicker.reset':'Use default color',
  'project.new':'New project','project.createTitle':'Create a design system','project.description':'Design Lab will create it in the sibling projects/ store. A name is enough.','project.name':'Name','project.placeholder':'For example, Klyp Design System','action.close':'Close','action.cancel':'Cancel','action.create':'Create project','action.creating':'Creating…','action.copy':'Copy','action.copied':'Copied','action.copyLink':'Copy link','action.openCode':'Open code',
  'empty.createFirst':'Create your first project','empty.projectDescription':'Projects live inside the Design Lab workspace, separately from the application.','empty.moduleDescription':'The selected module only reads entities from the active source.','status.loading':'Collecting filesystem data…','status.unavailable':'This view has not been assembled yet.','status.noEntities':'No entities in this section yet.',
  'catalog.inventory':'Live inventory','workbench.back':'Components','workbench.playground':'Playground','workbench.props':'Props','workbench.controlsMissing':'Controls will appear after the props contract is described.','workbench.propsApi':'Props API','workbench.documentation':'Documentation','workbench.changelog':'Changelog','workbench.name':'Name','workbench.type':'Type','workbench.default':'Default',
  'canvas.dark':'Dark grid','canvas.light':'Light grid','canvas.solid':'Solid color','canvas.dialog':'Solid canvas color','canvas.hex':'HEX',
  'theme.dark':'Use dark theme','theme.light':'Use light theme','settings.eyebrow':'Application','settings.title':'Settings','settings.mcp':'MCP and AI agents','settings.close':'Back to workspace',
} as const

export type MessageKey = keyof typeof en
export type Locale = 'en' | 'ru' | (string & {})
type Messages = Record<MessageKey,string>

export const ru: Messages = {
  ...en,
  'module.home':'Главная','module.components':'Компоненты','module.wireframes':'Вайрфреймы','module.pages':'Страницы','module.assets':'Ассеты','module.palette':'Палитра','module.tokens':'Токены','module.fonts':'Шрифты',
  'nav.modules':'Модули Design Lab','nav.addModule':'Добавить модуль','nav.settings':'Настройки','source.none':'Нет проекта','source.createFirst':'Создайте первый проект','source.localProject':'Локальный проект','source.localLibrary':'Локальная библиотека','source.create':'Создать проект',
  'directory.label':'Сущности проекта','directory.add':'Добавить сущность','directory.loading':'Читаю сущности…','directory.empty':'В этом разделе пока ничего нет.','directory.noProject':'Сначала создайте проект.','directory.resize':'Изменить ширину навигации','directory.search':'Поиск сущностей','directory.searchPlaceholder':'Поиск в модуле…','directory.noResults':'Ничего не найдено.',
  'tree.expand':'Развернуть папку','tree.collapse':'Свернуть папку','tree.color':'Выбрать цвет иконки','tree.actions':'Дополнительные действия','tree.actionsSoon':'Здесь появятся действия.',
  'colorPicker.color':'Цвет','colorPicker.presets':'Готовые цвета','colorPicker.hex':'HEX','colorPicker.reset':'Вернуть цвет по умолчанию',
  'project.new':'Новый проект','project.createTitle':'Создать дизайн-систему','project.name':'Название','action.close':'Закрыть','action.cancel':'Отмена','action.create':'Создать проект','action.creating':'Создаю…',
} as Messages

const dictionaries: Record<string,Messages> = { en: en as Messages, ru }
const I18nContext = createContext({locale:'en' as Locale,t:(key:MessageKey)=>en[key] as string})

export function DesignLabI18nProvider({ locale='en', messages, children }: { locale?:Locale; messages?:Partial<Messages>; children:ReactNode }) {
  const value = useMemo(() => {
    const dictionary = {...en,...(dictionaries[locale]??{}),...messages} as Messages
    return {locale,t:(key:MessageKey)=>dictionary[key]??en[key]}
  },[locale,messages])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useDesignLabI18n() { return useContext(I18nContext) }
