<template>
  <div class="traction-sidebar">
    <div v-if="imageUrl" class="sidebar-logo">
      <img :src="imageUrl" class="logo-menu-top" />
    </div>
    <div v-else class="sidebar-wallet-name">
      {{ walletName }}
    </div>
    <PanelMenu :model="sidebarItems" class="mt-4">
      <template #item="{ item }">
        <PanelMenuItemLink :item="item" />
      </template>
    </PanelMenu>
  </div>
</template>

<script setup lang="ts">
import PanelMenu from 'primevue/panelmenu';
import PanelMenuItemLink from '../common/PanelMenuItemLink.vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useConfigStore, useTenantStore } from '../../store';
import { computed } from 'vue';

const { t } = useI18n();
const { config } = useConfigStore();
const { tenant, loading, tenantWallet } = storeToRefs(useTenantStore());

const imageUrl = computed(() => {
  return tenantWallet.value?.settings?.image_url || null;
});

const walletName = computed(() => {
  return tenantWallet.value?.settings['wallet.name'] || null;
});

const sidebarItems = [
  {
    label: t('dashboard.dashboard'),
    icon: 'pi pi-fw pi-chart-bar',
    route: '/dashboard',
  },
  {
    label: t('onboarding.onboarding'),
    icon: 'pi pi-fw pi-user-plus',
    route: '/onboarding',
  },
  {
    label: t('transcript.sendTranscript'),
    icon: 'pi pi-fw pi-book',
    route: '/transcript',
  },
  {
    label: t('workflow.workflow'),
    icon: 'pi pi-fw pi-file-edit',
    route: '/workflow-list',
  },
  {
    label: t('connect.connections.connections'),
    icon: 'pi pi-fw pi-users',
    items: [
      {
        label: t('connect.connections.connections'),
        icon: 'pi pi-fw pi-users',
        route: '/connections',
      },
      {
        label: t('connect.invitations.invitations'),
        icon: 'pi pi-fw pi-send',
        route: '/connections/invitations',
      },
    ],
  },
  {
    label: t('bulkIssue.bulkIssue'),
    icon: 'pi pi-fw pi-angle-double-up',
    route: '/bulkIssue',
  },
  {
    label: t('issue.issuance'),
    icon: 'pi pi-fw pi-credit-card',
    route: '/issuance/credentials',
  },
  {
    label: t('enrollment.enrollment'),
    icon: 'pi pi-fw pi-address-book',
    route: '/enrollment',
  },
  {
    label: t('verify.verification'),
    icon: 'pi pi-fw pi-check-square',
    route: '/verification/verifications',
  },
  {
    label: t('common.credentials'),
    icon: 'pi pi-fw pi-wallet',
    route: '/holder/credentials',
  },
  {
    label: t('configuration.configuration'),
    icon: 'pi pi-fw pi-file',
    items: [
      {
        label: t('configuration.schemas.storage'),
        icon: 'pi pi-fw pi-book',
        route: '/schemas',
      },
      {
        label: t('configuration.credentialDefinitions.storage'),
        icon: 'pi pi-fw pi-id-card',
        route: '/credentialDefinitions',
      },
      {
        label: t('configuration.oca.oca'),
        icon: 'pi pi-fw pi-compass',
        route: '/oca',
      },
    ],
  },
  {
    label: t('messages.messages'),
    icon: 'pi pi-fw pi-envelope',
    route: '/messages/recent',
  },
  {
    label: 'Broadcast',
    icon: 'pi pi-fw pi-megaphone',
    route: '/messages-new',
  },
  {
    label: t('about.about'),
    icon: 'pi pi-fw pi-question-circle',
    route: '/about',
  },
];

if (config?.frontend?.logStreamUrl) {
  sidebarItems.push({
    label: t('log.log'),
    icon: 'pi pi-fw pi-file',
    route: '/log',
  });
}
</script>

<style lang="scss">
.traction-sidebar {
  .sidebar-logo {
    .logo-menu-top {
      width: 100%;
      max-height: 100px;
      object-fit: cover;
      object-position: center;
    }
  }

  .sidebar-wallet-name {
    padding: 10px;
    text-align: center;
    font-size: 1.2rem;
    font-weight: 600;
    color: $tenant-ui-new-text-on-primary;
    word-break: break-word;
  }
}
</style>
