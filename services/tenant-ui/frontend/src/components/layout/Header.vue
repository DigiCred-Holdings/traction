<template>
  <Toolbar class="traction-header">
    <!-- <template #start>
      <div
        class="hamburger"
        :title="$t('layout.header.toggleSideMenu')"
        @click="toggleSidebar"
      >
        <i class="pi pi-bars p-toolbar-separator mr-2" />
      </div>
    </template> -->

    <template #start>
      <div class="">
        <h2 class="m-0">
          {{ title }}
        </h2>
      </div>
    </template>

    <template #end>
      <!-- <LocaleSwitcher /> -->
      <ProfileButton />
      <SessionTimer />
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
import Toolbar from 'primevue/toolbar';
import ProfileButton from '@/components/profile/ProfileButton.vue';
// import LocaleSwitcher from '../common/LocaleSwitcher.vue';
import SessionTimer from '../common/SessionTimer.vue';
import { useRoute } from 'vue-router';
// State
import { storeToRefs } from 'pinia';
import { useCommonStore } from '@/store/commonStore';
import { computed } from 'vue';

// Whether the sidebar is open or not
const { sidebarOpen } = storeToRefs(useCommonStore());
const route = useRoute();
const title = computed(() => route?.meta.title);
/**
 * Toggle the sidebar open or closed
 */
const toggleSidebar = () => {
  if (sidebarOpen.value === null) {
    /* This is the first click so check current page size */
    if (window.innerWidth > 1000) {
      sidebarOpen.value = false;
    } else {
      sidebarOpen.value = true;
    }
  } else if (sidebarOpen.value) {
    /* If the sidebar is open, close it */
    sidebarOpen.value = false;
  } else {
    /* If the sidebar is closed, open it */
    sidebarOpen.value = true;
  }
};
</script>

<style scoped lang="scss">
/* Make the hamburger button slightly reactive */
/* .hamburger {
  cursor: pointer;
  padding: 0.75rem;
  opacity: 0.5;
}
.hamburger:hover {
  transform: scale(1.2) translate(0, 0.1rem);
  transition: 0.2s ease-in-out;
  opacity: 1;
} */
h2 {
  font-size: 24px;
  color: $tenant-ui-new-text-on-primary;
}
.p-toolbar.p-component.traction-header {
  padding-left: 0.5em !important;
}
</style>
