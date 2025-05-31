<template>
  <div class="row flex flex-wrap main-dashboard lg:m-0 relative">
    <div class="col-12 lg:col-6 left-container lg:p-0">
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
        :failed="
          Number(summary.find((item) => item.kind === 'Failed')?.count || 0)
        "
        :studentIds="0"
        :transcripts="0"
      />
    </div>
    
    <div class="col-12 credentials-panel mt-4">
      <div class="p-card">
        <div class="p-card-header">
          <h3>Issued Credentials by Type</h3>
        </div>
        <div class="p-card-body">
          <div v-if="Object.keys(credentialsSummary).length === 0" class="no-credentials">
            <p>No credentials issued yet</p>
          </div>
          <div v-else class="credentials-grid">
            <div 
              v-for="(credData, credTag) in credentialsSummary" 
              :key="credTag"
              class="credential-item"
            >
              <div class="credential-tag">{{ credTag }}</div>
              <div class="credential-count">{{ credData.count }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <button
      class="p-button p-button-sm p-button-rounded p-button-text absolute bottom-0 right-0 mb-3 mr-3"
      style="z-index: 10"
      v-tooltip.left="'Refresh Data'"
      @click="fetchSummaryData(true)"
    >
      <i class="pi pi-refresh"></i>
    </button>
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
    | 'Message'
    | 'Connection'
    | 'Invited'
    | 'Failed';
  count: number;
}

interface CredentialDefSummary {
  [credDefTag: string]: {
    credDefId: string;
    tag: string;
    count: number;
    records: any[];
  };
}

const apiStatus = ref('Loading wallet data...');
const summary = ref<SummaryItem[]>([]);
const credentialsSummary = ref<CredentialDefSummary>({});
const tenantStore = useTenantStore();
const tokenStore = useTokenStore();
const { tenantWallet } = storeToRefs(useTenantStore());
const { token } = storeToRefs(useTokenStore());

const totalItems = computed(() =>
  summary.value.reduce((total, item) => total + item.count, 0)
);

const totalCredentials = computed(() =>
  Object.values(credentialsSummary.value).reduce((total, credData) => total + credData.count, 0)
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
    let credentialsApiUrl = '/api/credentials/summary';
    
    if (forceRefresh) {
      apiUrl += '?forceRefresh=true';
      credentialsApiUrl += '?forceRefresh=true';
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

    // Fetch both summary data and credentials summary in parallel
    const [summaryResponse, credentialsResponse] = await Promise.all([
      axios.get<SummaryItem[]>(apiUrl, config),
      axios.get<CredentialDefSummary>(credentialsApiUrl, config)
    ]);
    
    summary.value = summaryResponse.data;
    credentialsSummary.value = credentialsResponse.data;
    
    console.log('Dashboard: Summary data received:', summary.value);
    console.log('Dashboard: Credentials summary received:', credentialsSummary.value);

    // Update API status with credential count
    if (totalCredentials.value > 0) {
      const credentialTypes = Object.keys(credentialsSummary.value).join(', ');
      apiStatus.value = `Found ${totalCredentials.value} credentials (${credentialTypes}), ${totalItems.value} total connections`;
    } else {
      apiStatus.value = `Found ${totalItems.value} total connections, no credentials issued yet`;
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
  
  .credentials-panel {
    .p-card {
      background: var(--surface-card);
      border-radius: 6px;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
      
      .p-card-header {
        padding: 1.25rem 1.25rem 0 1.25rem;
        border-bottom: 1px solid var(--surface-border);
        margin-bottom: 1.25rem;
        
        h3 {
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-color);
        }
      }
      
      .p-card-body {
        padding: 0 1.25rem 1.25rem 1.25rem;
        
        .no-credentials {
          text-align: center;
          padding: 2rem;
          color: var(--text-color-secondary);
          
          p {
            margin: 0;
            font-style: italic;
          }
        }
        
        .credentials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          
          @media screen and (max-width: 600px) {
            grid-template-columns: 1fr;
          }
          
          .credential-item {
            background: var(--surface-ground);
            border: 1px solid var(--surface-border);
            border-radius: 6px;
            padding: 1rem;
            text-align: center;
            transition: all 0.2s ease;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            
            .credential-tag {
              font-size: 0.875rem;
              font-weight: 600;
              color: var(--text-color);
              margin-bottom: 0.5rem;
              word-break: break-word;
            }
            
            .credential-count {
              font-size: 1.5rem;
              font-weight: 700;
              color: var(--primary-color);
            }
          }
        }
      }
    }
  }
}
</style>
