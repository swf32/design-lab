<script setup lang="ts">
import { ref } from 'vue'
import NuxtButton from '../../actions/Button/Button.vue'
import NuxtInput from '../../forms/Input/Input.vue'
import '../../../styles.css'

const props = withDefaults(
  defineProps<{
    label?: string
    placeholder?: string
    actionLabel?: string
    initialValue?: string
    disabled?: boolean
  }>(),
  {
    label: 'Work email',
    placeholder: 'you@example.com',
    actionLabel: 'Join waitlist',
    initialValue: '',
    disabled: false,
  },
)

const emit = defineEmits<{ submit: [value: string] }>()
const value = ref(props.initialValue)
</script>

<template>
  <form class="nuxt-action-field" @submit.prevent="emit('submit', value)">
    <NuxtInput
      v-model="value"
      :label="label"
      :placeholder="placeholder"
      :disabled="disabled"
    />
    <NuxtButton
      type="submit"
      :label="actionLabel"
      :disabled="disabled || !value"
      size="medium"
    />
  </form>
</template>

<style scoped>
.nuxt-action-field {
  width: min(420px, 100%);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 10px;
}
</style>
