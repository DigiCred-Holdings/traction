<template>
  <div class="row flex flex-wrap main-dashboard lg:m-0">
    <div class="col-12 lg:col-6 left-container lg:p-0">
      <Card
        title="Student IDs Issued"
        :value="
          String(summary.find((item) => item.kind === 'Credential')?.count || 0)
        "
      />
      <Card
        title="Transcripts Issued"
        :value="
          String(summary.find((item) => item.kind === 'Transcript')?.count || 0)
        "
      />
      <Card
        title="Messages"
        :value="
          String(summary.find((item) => item.kind === 'Message')?.count || 0)
        "
      />
      <Card
        title="Onboarded"
        :value="
          String(summary.find((item) => item.kind === 'Connection')?.count || 0)
        "
      />
      <!-- TODO: We need to get the invited and failed counts from the API -->
      <Card title="Invited" value="0" />
      <Card title="Failed" value="0" />
    </div>
    <div class="col-12 lg:col-6 right-container lg:py-0">
      <Chart
        :onboarded="
          Number(summary.find((item) => item.kind === 'Connection')?.count || 0)
        "
        :invited="0"
        :failed="0"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import axios from 'axios';
import Card from '@/components/dashbaord/Card.vue';
import Chart from '@/components/dashbaord/Chart.vue';
import { computed, onMounted, ref } from 'vue';
import { useTenantStore } from '@/store';
import { storeToRefs } from 'pinia';

interface SummaryItem {
  kind: 'Credential' | 'Transcript' | 'Message' | 'Connection';
  count: number;
}

const apiStatus = ref('Loading wallet data...');
const summary = ref<SummaryItem[]>([]);
const tenantStore = useTenantStore();
const { tenantWallet } = storeToRefs(useTenantStore());

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

const fetchSummaryData = async () => {
  try {
    const response = await axios.get<SummaryItem[]>('/api/items/summary');
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
