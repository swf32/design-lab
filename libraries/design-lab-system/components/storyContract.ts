export type StoryExample = {
  label: string
  props: Record<string, unknown>
}

export type StoryDefinition = {
  id: string
  kind?: 'variant' | 'state' | 'behavior' | 'context' | 'integration' | 'accessibility'
  name: string
  description?: string
  interactive?: boolean
  examples?: StoryExample[]
}
