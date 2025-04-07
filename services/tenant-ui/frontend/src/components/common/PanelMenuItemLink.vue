<template>
  <router-link
    v-if="props.item.route"
    v-slot="{ href, navigate, isActive }"
    :to="props.item.route"
    custom
  >
    <a
      :href="href"
      :class="['p-panelmenu-header-action', { active: isActive }]"
      @click="navigate"
    >
      <span class="p-menuitem-icon" :class="props.item.icon" />
      <span class="p-menuitem-text text-color">{{ props.item.label }}</span>
    </a>
  </router-link>
  <a
    v-else
    :href="props.item.url"
    :class="['p-panelmenu-header-action', { active: hasActiveChild }]"
    :target="props.item.target"
    @click="toggleDropdown"
  >
    <span class="p-menuitem-icon" :class="props.item.icon" />
    <span class="p-menuitem-text">{{ props.item.label }}</span>
    <span
      v-if="props.item.items"
      :class="[
        'ml-4 p-menuitem-icon-arrow',
        isOpen ? 'pi pi-angle-up' : 'pi pi-angle-down',
      ]"
    />
  </a>
</template>

<script setup lang="ts">
// See https://primevue.org/panelmenu/#router
import type { MenuItem } from 'primevue/menuitem';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const props = defineProps<{
  item: MenuItem;
}>();

const isOpen = ref(false);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

// Check if any child routes are active
const hasActiveChild = computed(() => {
  if (!props.item.items) return false;

  return props.item.items.some((item: MenuItem) => {
    if (item.route) {
      return route?.path?.startsWith(item.route.toString());
    }
    return false;
  });
});

// Watch for active children and open dropdown if needed
watch(hasActiveChild, (newValue) => {
  if (newValue && !isOpen.value) {
    isOpen.value = true;
  }
});

// Watch route changes to close dropdown when navigating away
watch(
  () => route?.path,
  (newPath) => {
    if (!hasActiveChild.value) {
      isOpen.value = false;
    }
  }
);
</script>

<style scoped lang="scss">
.p-panelmenu-header .p-panelmenu-header-content .p-panelmenu-header-action {
  &:hover {
    background-color: #e5e5e5;
  }
}

.p-panelmenu-header
  .p-panelmenu-header-content
  .p-panelmenu-header-action.active {
  background-color: $tenant-ui-new-accent-color;
  .p-menuitem-text,
  .p-menuitem-icon,
  .p-menuitem-icon-arrow {
    color: #fff !important;
  }
}

.p-menuitem-icon-arrow {
  transition: transform 0.2s;
}
@media (max-width: 1000px) {
  .p-menuitem-icon-arrow {
    margin-left: 0 !important;
  }
}

.p-panelmenu-content
  .p-menuitem
  .p-menuitem-content
  .p-panelmenu-header-action.active {
  .p-menuitem-text,
  .p-menuitem-icon {
    color: $tenant-ui-new-accent-color !important;
  }
}
</style>
