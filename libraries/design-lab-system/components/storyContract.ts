export type StoryExample = {
  label: string
  props: Record<string, unknown>
  source?: string
  imports?: string[]
}

export type StoryDefinition = {
  id: string
  kind?: 'variant' | 'state' | 'behavior' | 'context' | 'integration' | 'accessibility'
  name: string
  description?: string
  interactive?: boolean
  imports?: string[]
  examples?: StoryExample[]
}
