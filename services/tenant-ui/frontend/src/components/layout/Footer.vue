<template>
  <div class="traction-footer flex justify-content-end p-2 pr-3">
    {{ currentYear + '© DigiCred Holdings' }}
  </div>
</template>

<script setup lang="ts">
// import { storeToRefs } from 'pinia';
// import { useConfigStore } from '../../store';

// const { config } = storeToRefs(useConfigStore());
const currentYear = new Date().getFullYear();
</script>

<style lang="scss" scoped>
.traction-footer {
  background-color: #f5f5f5 !important;
  font-size: 0.7em;
  color: $tenant-ui-new-text-on-primary;
}
</style>
