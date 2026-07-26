import type { ComponentImplementation, ModuleData } from './api/projects'

type ComponentEntity = Extract<ModuleData, { kind: 'components' }>['components'][number]

export type ComponentPresentation =
  | { kind: 'react'; implementation: ComponentImplementation }
  | { kind: 'managed'; implementation: ComponentImplementation }
  | { kind: 'external'; implementation: ComponentImplementation; url: string }
  | { kind: 'catalog'; implementation: ComponentImplementation }

export function componentHasCapability(
  component: ComponentEntity,
  capability: ComponentImplementation['capabilities'][number],
) {
  return component.capabilities.includes(capability)
}

export function componentPresentation(component: ComponentEntity): ComponentPresentation {
  if (
    component.adapter === 'react-manifest' &&
    component.entry &&
    componentHasCapability(component, 'live-preview')
  )
    return { kind: 'react', implementation: component.implementation }
  if (
    component.adapter === 'vue-sfc' &&
    component.entry &&
    componentHasCapability(component, 'live-preview')
  )
    return { kind: 'managed', implementation: component.implementation }
  if (
    component.implementation.locator.kind === 'external-url' &&
    componentHasCapability(component, 'live-preview')
  )
    return {
      kind: 'external',
      implementation: component.implementation,
      url: component.implementation.locator.url,
    }
  return { kind: 'catalog', implementation: component.implementation }
}
