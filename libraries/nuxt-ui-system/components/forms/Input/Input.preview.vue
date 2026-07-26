<template>
  <div class="nuxt-input-preview" aria-hidden="true">
    <span>Email</span>
    <div>you@example.com</div>
  </div>
</template>

<style scoped>
.nuxt-input-preview {
  display: grid;
  gap: 7px;
  width: min(190px, 100%);
  color: var(--ds-color-text-primary);
  font: 500 11px/1.2 var(--ds-typography-interface-family);
}

.nuxt-input-preview div {
  padding: 10px 12px;
  color: var(--ds-color-text-secondary);
  border: 1px solid var(--ds-color-border-default);
  border-radius: var(--ds-corner-control);
  background: var(--ds-color-surface-primary);
}
</style>
