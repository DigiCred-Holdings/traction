<template>
  <div
    v-if="workflows.length === 0"
    class="flex justify-content-center align-items-center h-full"
  >
    <p class="text-2xl font-bold">{{ $t('common.noRecordsFound') }}</p>
  </div>

  <DataTable
    v-else
    v-model:expanded-rows="expandedRows"
    v-model:filters="filter"
    :loading="loading"
    :value="workflows"
    :paginator="true"
    :rows="TABLE_OPT.ROWS_DEFAULT"
    :rows-per-page-options="TABLE_OPT.ROWS_OPTIONS"
    :global-filter-fields="['name']"
    selection-mode="single"
    data-key="workflowId"
    sort-field="name"
    :sort-order="-1"
    filter-display="menu"
  >
    <template #header>
      <div class="flex flex-wrap justify-content-between">
        <span class="text-xl font-bold">{{ $t('workflow.list') }}</span>
        <Button
          :label="$t('workflow.add')"
          icon="pi pi-plus"
          class="p-button"
          icon-pos="right"
          @click="$emit('add', webHookUrl)"
        />
      </div>
    </template>
    <template #empty>{{ $t('common.noRecordsFound') }}</template>
    <template #loading>{{ $t('common.loading') }}</template>
    <Column
      :sortable="true"
      field="name"
      :header="$t('common.name')"
      filter-field="name"
      :show-filter-match-modes="false"
    >
      <template #filter="{ filterModel, filterCallback }">
        <InputText
          v-model="filterModel.value"
          type="text"
          class="p-column-filter"
          placeholder="Search By Name"
          @input="filterCallback()"
        />
      </template>
    </Column>
    <Column
      :sortable="true"
      field="createdAt"
      :header="$t('common.createdAt')"
      filter-field="createdAt"
      :show-filter-match-modes="false"
    >
    </Column>
    <!-- <Column
        :sortable="true"
        field="status"
        :header="$t('common.status')"
        filter-field="status"
        :show-filter-match-modes="false"
      >
      <template #body="{ data }">
        <span :class="data.status === 'Active' ? 'badge-active' : 'badge-inactive'">{{ data.status ? data.status : "Inactive" }}</span>
      </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            type="text"
            class="p-column-filter"
            placeholder="Search By Status"
            @input="filterCallback()"
          />
        </template>
      </Column> -->
    <Column :sortable="false" :header="$t('common.actions')">
      <template #body="{ data }">
        <Button
          icon="pi pi-pencil"
          rounded
          :szie="large"
          class="p-button-text"
          @click="$emit('edit', data, webHookUrl)"
        />
      </template>
    </Column>
  </DataTable>
</template>
<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import { useToast } from 'vue-toastification';
import { useTenantStore } from '@/store';
import { storeToRefs } from 'pinia';
import { TABLE_OPT } from '@/helpers/constants';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';
import { TABLE_OPT } from '@/helpers/constants';
import { webhookService } from '@/services/webhookService';

const workflows = ref([]);
const toast = useToast();

defineEmits(['edit', 'add']);

const { tenantWallet } = storeToRefs(useTenantStore());
const tenantStore = useTenantStore();
const webHookUrl = ref(null);

const loadTenantSettings = async () => {
  try {
    await tenantStore.getTenantSubWallet();
    const webhookUrls = tenantWallet.value?.settings?.['wallet.webhook_urls'];
    console.log('webhookUrls', webhookUrls);
    if (webhookUrls && webhookUrls.length > 0) {
      webHookUrl.value = webhookUrls[0];
    } else {
      console.error('No webhook URLs found in tenant settings');
      toast.error('No webhook URLs found in tenant settings');
    }
  } catch (err) {
    console.error(err);
    toast.error(`Failure: ${err}`);
  }
};

const fetchWorkflows = async () => {
  try {
    if (webHookUrl.value) {
      workflows.value = await webhookService.getWorkflows(webHookUrl.value);
      console.log(workflows.value);
    }
  } catch (error) {
    console.error('Error fetching workflows:', error);
    workflows.value = [{}];
  }
};

onMounted(async () => {
  await loadTenantSettings();
  await fetchWorkflows();
});

const filter = ref({
  name: {
    value: null,
    matchMode: FilterMatchMode.CONTAINS,
  },
  createdAt: {
    value: null,
    matchMode: FilterMatchMode.CONTAINS,
  },
  status: {
    value: null,
    matchMode: FilterMatchMode.CONTAINS,
  },
});
</script>

<style scoped>
.container {
  padding: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
th,
td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}
.badge-active {
  color: #000000;
  background: #bbe9bb;
  border-radius: 20px;
  height: 26px;
  width: 70px;
  display: inline-block;
  text-align: center;
  line-height: 25px;
}
.badge-inactive {
  color: #000000;
  background: #e9bbbb;
  border-radius: 20px;
  height: 26px;
  width: 70px;
  display: inline-block;
  text-align: center;
  line-height: 25px; /* font-weight: 700; */
}
.btn-primary {
  padding: 8px 12px;
  background: #3c5973;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
