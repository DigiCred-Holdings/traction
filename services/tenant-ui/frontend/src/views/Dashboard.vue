<template>
  <div class="row flex flex-wrap main-dashboard lg:m-0 relative">
    <div class="col-12 lg:col-6 left-container lg:p-0">
      <Card
        title="Student IDs Issued"
        :value="
          String(summary.find((item) => item.kind === 'Credential')?.count || 0)
        "
      />
      <Card
        title="Onboarded"
        :value="
          String(summary.find((item) => item.kind === 'Connection')?.count || 0)
        "
      />
      <Card
        title="Invited"
        :value="
          String(summary.find((item) => item.kind === 'Invited')?.count || 0)
        "
      />
      <Card
        title="Failed"
        :value="
          String(summary.find((item) => item.kind === 'Failed')?.count || 0)
        "
      />
    </div>
    <div class="col-12 lg:col-6 right-container lg:py-0">
      <Chart
        :onboarded="
          Number(summary.find((item) => item.kind === 'Connection')?.count || 0)
        "
        :invited="
          Number(summary.find((item) => item.kind === 'Invited')?.count || 0)
        "
        :failed="0"
      />
    </div>
    <button
      class="p-button p-button-sm p-button-rounded p-button-text absolute bottom-0 right-0 mb-3 mr-3"
      style="z-index: 10"
      @click="fetchSummaryData(true)"
      v-tooltip.left="'Refresh Data'"
    >
      <i class="pi pi-refresh"></i></button
    >
  </div>
</template>
<script setup lang="ts">
import axios from 'axios';
import Card from '@/components/dashbaord/Card.vue';
import Chart from '@/components/dashbaord/Chart.vue';
import { computed, onMounted, ref } from 'vue';
import { useTenantStore } from '@/store';
import { storeToRefs } from 'pinia';
import { useTokenStore } from '@/store';
import Tooltip from 'primevue/tooltip';

interface SummaryItem {
  kind:
    | 'Credential'
    | 'Transcript'
    | 'Message'
    | 'Connection'
    | 'Invited'
    | 'Failed';
  count: number;
}

const apiStatus = ref('Loading wallet data...');
const summary = ref<SummaryItem[]>([]);
const tenantStore = useTenantStore();
const tokenStore = useTokenStore();
const { tenantWallet } = storeToRefs(useTenantStore());
const { token } = storeToRefs(useTokenStore());

const totalItems = computed(() =>
  summary.value.reduce((total, item) => total + item.count, 0)
);

onMounted(async () => {
  console.log('Dashboard component mounted');
  await loadTenantSettings();
  fetchSummaryData();
});

const loadTenantSettings = async () => {
  try {
    await tenantStore.getTenantSubWallet();
  } catch (error) {
    console.error('Failed to load tenant settings:', error);
  }
};

const fetchSummaryData = async (forceRefresh: boolean = false) => {
  try {
    let apiUrl = '/api/items/summary';
    if (forceRefresh) {
      apiUrl += '?forceRefresh=true';
      console.log('Dashboard: Forcing cache refresh');
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    };
    console.log(
      'Dashboard: Making API call with auth header:',
      config.headers.Authorization
    );

    const response = await axios.get<SummaryItem[]>(
      apiUrl, config
    );
    summary.value = response.data;
    console.log('Dashboard: Summary data received:', summary.value);

    // Update API status with credential count
    const credentialItem = summary.value.find(
      (item) => item.kind === 'Credential'
    );
    console.log('Dashboard: Credential item:', credentialItem);
    if (credentialItem) {
      apiStatus.value = `Found ${credentialItem.count} Credentials, ${totalItems.value} total items`;
    } else {
      apiStatus.value = `Found ${totalItems.value} total items`;
    }
  } catch (error: unknown) {
    console.error('Failed to fetch summary:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    apiStatus.value = `Error fetching summary: ${errorMessage}`;
  }
};
</script>
<style lang="scss">
.main-dashboard {
  .left-container {
    grid-gap: 10px;
    display: grid;
    grid-template-columns: 1fr 1fr;

    @media screen and (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }
}
</style>
