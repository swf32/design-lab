<template>
  <div class="nuxt-badge-preview" aria-hidden="true">
    <span>Ready</span>
    <span>Review</span>
    <span>Blocked</span>
  </div>
</template>

<style scoped>
.nuxt-badge-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  font: 600 10px/1 var(--ds-typography-interface-family);
}

.nuxt-badge-preview span {
  padding: 6px 9px;
  color: var(--ds-color-text-primary);
  border: 1px solid color-mix(in srgb, var(--ds-color-accent-primary), transparent 60%);
  border-radius: 999px;
  background: color-mix(in srgb, var(--ds-color-accent-primary), transparent 86%);
}
</style>
