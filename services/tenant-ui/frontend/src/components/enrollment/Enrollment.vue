<template>
  <DataTable
    v-model:expanded-rows="expandedRows"
    v-model:filters="filter"
    :loading="loading"
    :value="enrollments"
    :paginator="true"
    :rows="TABLE_OPT.ROWS_DEFAULT"
    :rows-per-page-options="TABLE_OPT.ROWS_OPTIONS"
    :global-filter-fields="['enrollment_id']"
    selection-mode="single"
    data-key="enrollment_id"
    sort-field="enrollment_id"
    :sort-order="-1"
    filter-display="menu"
  >
    <template #header>
      <div class="flex flex-wrap justify-content-between">
        <span class="text-xl font-bold">{{ $t('enrollment.list') }}</span>
      </div>
    </template>
    <template #empty>{{ $t('common.noRecordsFound') }}</template>
    <template #loading>{{ $t('common.loading') }}</template>
    <Column
      :sortable="true"
      field="enrollment_id"
      :header="$t('enrollment.id')"
      filter-field="ID"
      :show-filter-match-modes="false"
    >
      <template #filter="{ filterModel, filterCallback }">
        <InputText
          v-model="filterModel.value"
          type="text"
          class="p-column-filter"
          placeholder="Search By ID"
          @input="filterCallback()"
        />
      </template>
    </Column>
    <Column
      :sortable="true"
      field="student_full_name"
      :header="$t('enrollment.fullName')"
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
      field="school_name"
      :header="$t('enrollment.schoolName')"
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
      field="enrollment_status"
      :header="$t('common.status')"
      filter-field="status"
      :show-filter-match-modes="false"
    >
      <template #filter="{ filterModel, filterCallback }">
        <InputText
          v-model="filterModel.value"
          type="text"
          class="p-column-filter"
          placeholder="Search By Status"
          @input="filterCallback()"
        />
      </template>
    </Column>
    <Column :sortable="false" :header="$t('common.actions')">
      <template #body="{ data }">
        <Button
          icon="pi pi-angle-right"
          rounded
          :szie="large"
          class="p-button-text"
          @click="handleDialog(data)"
        />
      </template>
    </Column>
  </DataTable>
  <Dialog
    v-model:visible="showDialog"
    modal
    :style="{ width: '50vw' }"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
  >
    <EnrollmentForm :enrollment="selectedEnrollment" />
  </Dialog>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import { useToast } from 'vue-toastification';
import { useTenantStore } from '@/store';
import { storeToRefs } from 'pinia';
import { TABLE_OPT } from '@/helpers/constants';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import EnrollmentForm from './EnrollmentForm.vue';

const toast = useToast();

const enrollments = ref(null);
const { tenantWallet } = storeToRefs(useTenantStore());
const tenantStore = useTenantStore();
const webhookUrl = ref(null);
const webhookKey = ref(null);

const loadTenantSettings = async () => {
  try {
    await tenantStore.getTenantSubWallet();
    const webhooks = tenantWallet.value?.settings?.['wallet.webhook_urls'][0];
    console.log('webhooks', webhooks);
    if (webhooks.length > 0) {
      if (webhooks.match(/#/g)) {
        webhookUrl.value = webhooks.substring(0, webhooks.indexOf('#'));
        webhookKey.value = webhooks.substring(webhooks.indexOf('#') + 1);
      } else {
        webhookUrl.value = webhooks;
        webhookKey.value = '';
      }
    } else {
      console.error('No webhook URLs found in tenant settings');
      toast.error('No webhook URLs found in tenant settings');
    }
  } catch (err) {
    console.error(err);
    toast.error(`Failure: ${err}`);
  }
};

const fetchEnrollements = async () => {
  try {
    if (webhookUrl.value) {
      const url = `${webhookUrl.value}/enrollment`;
      console.log('webhookUrl: ' + webhookUrl.value);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': webhookKey.value,
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      enrollments.value = await response.json();
      console.log('enrollment: ' + enrollments.value);
    }
  } catch (error) {
    console.error('Error fetching enrollments:', error);
  }
};

onMounted(async () => {
  await loadTenantSettings();
  await fetchEnrollements();
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

//Dialog

const showDialog = ref(false);
const selectedEnrollment = ref(null);
const handleDialog = async (enrollment) => {
  selectedEnrollment.value = enrollment;
  showDialog.value = true;
};
</script>

<style scoped lang="scss">
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
  background: $tenant-ui-new-accent-color;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
