<template>
  <Suspense>
    <!-- the suspense tag is so we can await any of these components.
         sidebar loads the tenant async -->
    <div class="layout-container">
      <nav
        class="layout-sidebar flex flex-column justify-content-between"
        :class="sidebarOpenClass"
      >
        <Sidebar />
        <img
          src="/img/digicred/logo-menu-bottom.png"
          class="logo-menu-bottom"
        />
      </nav>
      <div class="layout-page">
        <header class="layout-header">
          <Header />
        </header>
        <main class="layout-content">
          <MainCard>
            <router-view />
          </MainCard>
        </main>
        <footer class="bottom-0 layout-footer">
          <Footer />
        </footer>
      </div>
    </div>
  </Suspense>
</template>

<script setup lang="ts">
// Layout Components
import Footer from './Footer.vue';
import Header from './Header.vue';
import MainCard from './mainCard/MainCard.vue';
import Sidebar from './Sidebar.vue';

// State
import { storeToRefs } from 'pinia';
import { useCommonStore } from '@/store/commonStore';

const { sidebarOpenClass } = storeToRefs(useCommonStore());
</script>

<style lang="scss">
.logo-menu-bottom {
  border: 1px solid #424242;
  border-radius: 5px;
  padding: 15px;
}
@media (max-width: 1000px) {
  .logo-menu-bottom {
    padding: 5px;
  }
}
</style>
