<template>
  <div class="dashboard-card">
    <div class="card-content">
      <div class="card-title pb-2">{{ props.title }}</div>
      <div class="card-value">{{ props.value }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});
</script>
<style lang="scss">
.dashboard-card {
  color: $tenant-ui-new-text-on-primary;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0px 4px 10px rgba(66, 66, 66, 0.1);
  padding: 20px;
  .card-title {
    font-size: 16px;
    font-weight: 400;
  }
  .card-value {
    font-size: 18px;
    font-weight: 600;
  }
}
</style>
