<script setup lang="ts">
import '../../../styles.css'

withDefaults(
  defineProps<{
    label?: string
    color?: 'primary' | 'success' | 'warning' | 'error' | 'neutral'
    variant?: 'soft' | 'subtle' | 'outline'
  }>(),
  {
    label: 'Ready',
    color: 'primary',
    variant: 'soft',
  },
)
</script>

<template>
  <UBadge :color="color" :variant="variant">{{ label }}</UBadge>
</template>
