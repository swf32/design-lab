# Action Field

Use Action Field when one short value and its action belong together. It imports the Library's
real Input and Button implementations, so Design Lab derives both `uses` relations from source.

```vue
<script setup lang="ts">
import ActionField from '@design-lab/nuxt-ui-system/components/compositions/ActionField/ActionField.vue'
</script>

<template>
  <ActionField action-label="Join waitlist" @submit="joinWaitlist" />
</template>
```
