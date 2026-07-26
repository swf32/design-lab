<template>
  <div class="nuxt-action-field-preview" aria-hidden="true">
    <div>
      <span>Work email</span>
      <i>you@example.com</i>
    </div>
    <b>Join</b>
  </div>
</template>

<style scoped>
.nuxt-action-field-preview {
  width: min(208px, 100%);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 44px;
  align-items: end;
  gap: 8px;
  color: var(--ds-color-text-primary);
  font-family: var(--ds-typography-interface-family);
}

.nuxt-action-field-preview > div {
  min-width: 0;
  display: grid;
  gap: 6px;
}

.nuxt-action-field-preview span {
  font-size: 9px;
  font-weight: 600;
}

.nuxt-action-field-preview i,
.nuxt-action-field-preview b {
  min-height: 30px;
  display: flex;
  align-items: center;
  border-radius: var(--ds-corner-control);
  font-size: 9px;
  font-style: normal;
}

.nuxt-action-field-preview i {
  min-width: 0;
  overflow: hidden;
  padding: 0 10px;
  border: 1px solid var(--ds-color-border-default);
  color: var(--ds-color-text-secondary);
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nuxt-action-field-preview b {
  justify-content: center;
  padding: 0;
  color: var(--ds-color-canvas);
  background: var(--ds-color-accent-primary);
  font-weight: 600;
}
</style>
