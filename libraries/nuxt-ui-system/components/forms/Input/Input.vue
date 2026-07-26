<script setup lang="ts">
import '../../../styles.css'

withDefaults(
  defineProps<{
    label?: string
    modelValue?: string
    placeholder?: string
    variant?: 'outline' | 'subtle'
    disabled?: boolean
  }>(),
  {
    label: 'Email',
    modelValue: '',
    placeholder: 'you@example.com',
    variant: 'outline',
    disabled: false,
  },
)

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <label class="nuxt-input">
    <span>{{ label }}</span>
    <UInput
      :model-value="modelValue"
      :placeholder="placeholder"
      :variant="variant"
      :disabled="disabled"
      @update:model-value="$emit('update:modelValue', String($event ?? ''))"
    />
  </label>
</template>

<style scoped>
.nuxt-input {
  display: grid;
  gap: 6px;
  width: min(280px, 100%);
  color: var(--ds-color-text-primary);
  font: 500 13px/1.3 var(--ds-typography-interface-family);
}
</style>
