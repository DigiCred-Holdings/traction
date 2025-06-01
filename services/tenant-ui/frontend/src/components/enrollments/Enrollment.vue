<template>
  <DataTable
    v-model:expanded-rows="expandedRows"
    v-model:filters="filter"
    :loading="loading"
    :value="enrollments"
    :paginator="true"
    :rows="TABLE_OPT.ROWS_DEFAULT"
    :rows-per-page-options="TABLE_OPT.ROWS_OPTIONS"
    :global-filter-fields="[
      'student_number',
      'student_full_name',
      'school_name',
      'enrollment_status',
    ]"
    selection-mode="single"
    data-key="enrollment_id"
    sort-field="enrollment_id"
    :sort-order="-1"
    filter-display="menu"
  >
    <template #header>
      <div class="flex justify-content-between">
        <div class="flex justify-content-start">
          <span class="text-xl font-bold">{{
            $t('enrollments.enrollments')
          }}</span>
        </div>
        <div class="flex justify-content-end">
          <button
            v-tooltip.left="'Refresh Data'"
            rounded
            class="p-button p-button-sm p-button-text mr-3 p-button-rounded"
            style="z-index: 10"
            @click="fetchEnrollements()"
          >
            <i class="pi pi-refresh" style="color: #6666cc"></i>
          </button>
          <IconField icon-position="left">
            <InputIcon><i class="pi pi-search" /></InputIcon>
            <InputText
              v-model="filter.global.value"
              :placeholder="$t('enrollments.search')"
              style="color: #6666cc"
            />
          </IconField>
        </div>
      </div>
    </template>
    <template #empty>{{ $t('common.noRecordsFound') }}</template>
    <template #loading>{{ $t('common.loading') }}</template>
    <Column
      field="student_number"
      :header="$t('enrollments.studentId')"
      :show-filter-match-modes="false"
      filter-field="student_number"
    >
    </Column>
    <Column
      field="student_full_name"
      :header="$t('enrollments.name')"
      :show-filter-match-modes="false"
      :sortable="true"
    >
    </Column>
    <Column
      field="school_name"
      :header="$t('enrollments.school')"
      :show-filter-match-modes="false"
    >
    </Column>
    <Column :header="$t('enrollments.status')" :sortable="true">
      <template #body="{ data }">
        {{
          data.enrollment_status.charAt(0).toUpperCase() +
          data.enrollment_status.slice(1)
        }}
      </template>
    </Column>
    <Column
      field="created_at"
      :header="$t('enrollments.applicationDate')"
      :show-filter-match-modes="false"
      :sortable="true"
    >
      <template #body="{ data }">
        {{ formatDate(data.created_at) }}
      </template>
    </Column>
    <Column :sortable="false" :header="$t('common.actions')">
      <template #body="{ data }">
        <div class="row-actions">
          <Button
            icon="pi pi-trash"
            style="color: #6666cc"
            severity="danger"
            rounded
            size="large"
            class="p-button-text"
            @click="handleDelete(data)"
          />
          <Button
            icon="pi pi-angle-right"
            style="color: #6666cc"
            rounded
            size="large"
            class="p-button-text"
            @click="$emit('select', data)"
          />
        </div>
      </template>
    </Column>
  </DataTable>
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
import InputIcon from 'primevue/inputicon';
import IconField from 'primevue/iconfield';

defineEmits(['select']);
const toast = useToast();
const enrollments = ref(null);
const { tenantWallet } = storeToRefs(useTenantStore());
const tenantStore = useTenantStore();
const webhookUrl = ref(null);
const webhookKey = ref(null);
const formatDate = (date) => {
  const options = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  };
  return new Date(date).toLocaleDateString('en-US', options);
};
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
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
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
  student_number: {
    value: null,
    matchMode: FilterMatchMode.CONTAINS,
  },
});

const handleDelete = async (enrollment) => {
  const confirmed = confirm(
    `Are you sure you want to delete the enrollment for ${enrollment.student_full_name}?`
  );
  if (confirmed) {
    try {
      if (webhookUrl.value) {
        const url = `${webhookUrl.value}/enrollment/${enrollment.enrollment_id}`;
        console.log('url: ' + url);
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': webhookKey.value,
          },
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        toast.success(
          `Enrollment for ${enrollment.student_full_name} deleted successfully`
        );
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  }
};
</script>

<style scoped lang="scss">
:deep(th, td) {
  padding: 10px !important;
  text-align: left !important;
  border-bottom: 1px solid #ddd !important;
}

:deep(.p-datatable-tbody > tr) {
  .row-actions {
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }

  &:hover {
    .row-actions {
      opacity: 1;
    }
  }
}
</style>
