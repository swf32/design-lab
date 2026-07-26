<script setup lang="ts">
import { computed } from 'vue'
import '../../../styles.css'

const props = withDefaults(
  defineProps<{
    label?: string
    variant?: 'primary' | 'secondary' | 'soft' | 'ghost'
    size?: 'small' | 'medium' | 'large'
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    label: 'Continue',
    variant: 'primary',
    size: 'medium',
    disabled: false,
    loading: false,
  },
)

defineEmits<{ click: [event: MouseEvent] }>()

const uiVariant = computed(() => {
  if (props.variant === 'secondary') return 'outline'
  if (props.variant === 'primary') return 'solid'
  return props.variant
})
const uiSize = computed(() => ({ small: 'sm', medium: 'md', large: 'lg' })[props.size])
</script>

<template>
  <UButton
    color="primary"
    :variant="uiVariant"
    :size="uiSize"
    :disabled="disabled"
    :loading="loading"
    @click="$emit('click', $event)"
  >
    {{ label }}
  </UButton>
</template>
