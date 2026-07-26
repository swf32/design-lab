<template>
  <div class="nuxt-button-preview" aria-hidden="true">
    <span class="nuxt-button-preview__primary">Continue</span>
    <span class="nuxt-button-preview__secondary">Back</span>
  </div>
</template>

<style scoped>
.nuxt-button-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 100%;
  color: var(--ds-color-text-primary);
  font: 600 12px/1 var(--ds-typography-interface-family);
}

.nuxt-button-preview span {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: var(--ds-corner-control);
}

.nuxt-button-preview__primary {
  color: var(--ds-color-canvas);
  background: var(--ds-color-accent-primary);
}

.nuxt-button-preview__secondary {
  border: 1px solid var(--ds-color-border-default);
  background: var(--ds-color-surface-primary);
}
</style>
