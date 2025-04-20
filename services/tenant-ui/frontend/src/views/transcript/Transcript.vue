<template>
  <MainCardContent :title="$t('transcript.transcript')">
    <Panel class="mb-5" header="Transcript Form">
      <form
        class="transcript-form"
        @submit.prevent="handleSubmit(!v$.$invalid)"
      >
        <!-- Connection -->
        <div class="field mt-5">
          <label
            for="selectedConnection"
            :class="{
              'p-error': v$.selectedConnection.$invalid && submitted,
            }"
            >{{ $t('common.connectionName') }}
            <ProgressSpinner v-if="connectionLoading" />
          </label>
          <div class="flex align-items-center">
            <AutoComplete
              id="selectedConnection"
              v-model="v$.selectedConnection.$model"
              class="w-full"
              :disabled="connectionLoading"
              :suggestions="connectionsList"
              :dropdown="true"
              option-label="label"
              force-selection
              @complete="searchConnections($event)"
            />
            <span v-if="metaDataLoading" class="ml-2">
              <i class="pi pi-spin pi-spinner" style="font-size: 1.2em" />
            </span>
          </div>

          <small
            v-if="v$.selectedConnection.$invalid && submitted"
            class="p-error"
            >{{ v$.selectedConnection.required.$message }}</small
          >
          <div v-if="!isMetaData" class="field">
            <span class="p-error"> {{ $t('transcript.noMetaData') }}</span>
            <label for="studentID" class="mt-2">{{
              $t('transcript.studentID')
            }}</label>
            <InputText
              id="studentID"
              v-model="v$.studentID.$model"
              required
              @input="transcriptContent = ''"
            />
            <Button
              :label="$t('transcript.findTranscript')"
              icon="pi pi-search"
              class="ml-2"
              :disabled="!v$.studentID.$model || transcriptLoading"
              @click="getTranscript(v$.studentID.$model)"
            />
            <span v-if="transcriptLoading" class="ml-2">
              <i class="pi pi-spin pi-spinner" style="font-size: 1.2em" />
            </span>
            <div v-if="transcriptContent === false" class="p-error">
              {{ $t('transcript.noTranscript') }}
            </div>
          </div>
          <div
            v-if="transcriptContent && !transcriptLoading"
            class="pt-4 transcriptContent"
          >
            <!-- TODO: 'v-html' directive can lead to XSS attack. -->
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div class="taa-html mb-4" v-html="svg?.data" />
            <!-- <Card>
              <template #content>
                <div>
                  <strong>{{ `${$t('transcript.studentID')}: ` }}</strong>
                  {{ metadataMap?.results?.student_id }}
                </div>
                <div>
                  <strong>{{ `${$t('transcript.firstName')}: ` }}</strong>
                  {{ metadataMap?.results?.first_name }}
                </div>
                <div>
                  <strong>{{ `${$t('transcript.lastName')}: ` }}</strong
                  >{{ metadataMap?.results?.last_name }}
                </div>
                <hr />
                <div
                  v-for="(course, index) in transcriptContent?.courseTranscript"
                  :key="index"
                >
                  <div v-for="(value, key) in course" :key="key">
                    <strong>{{ `${updateKey(key)}:` }}</strong>
                    {{ value }}
                  </div>
                  <hr
                    v-if="
                      index !== transcriptContent?.courseTranscript?.length - 1
                    "
                  />
                </div>
              </template>
            </Card> -->
          </div>

          <Button
            type="submit"
            label="Send Transcript"
            icon="pi pi-check"
            class="mt-5"
            :disabled="
              connectionLoading || transcriptLoading || !transcriptContent
            "
            :loading="connectionLoading"
          />
        </div>
      </form>
    </Panel>
  </MainCardContent>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useStudentStore, useConnectionStore, useIssuerStore } from '@/store';
import Panel from 'primevue/panel';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import AutoComplete from 'primevue/autocomplete';
import Card from 'primevue/card';
import MainCardContent from '@/components/layout/mainCard/MainCardContent.vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import useGetItem from '@/composables/useGetItem';
import { API_PATH } from '@/helpers/constants';
import { useToast } from 'vue-toastification';
import { useSisApi } from '@/store/sisApi';
import { useTenantStore } from '@/store';

const { getStudentInfo, idLookup } = useStudentStore();

const toast = useToast();

// Metadata
const metadataMap = ref();
const isMetaData = ref(true);
const metaDataLoading = ref(false);

// Form and Validation
const connectionsList = ref();
const formFields = reactive({
  selectedConnection: undefined as any,
  studentID: '',
});
const rules = {
  selectedConnection: { required },
  studentID: {
    required: isMetaData.value ? false : required,
  },
};
const v$ = useVuelidate(rules, formFields);
// State
const connectionStore = useConnectionStore();
const { connectionsDropdown, loading: connectionLoading } =
  storeToRefs(useConnectionStore());

const searchConnections = (event: any) => {
  if (!event.query.trim().length) {
    connectionsList.value = [...(connectionsDropdown as any).value];
  } else {
    connectionsList.value = (connectionsDropdown.value as any).filter(
      (connection: any) => {
        return connection.label
          .toLowerCase()
          .includes(event.query.toLowerCase());
      }
    );
  }
};

// Get Metadata
const fetchMetadata = async (connection_id: string) => {
  metaDataLoading.value = true;
  const { item, fetchItem } = useGetItem(
    API_PATH.CONNECTIONS_METADATA(connection_id)
  );
  await fetchItem();
  if (item.value?.results?.student_id) {
    metadataMap.value = item.value;
    await getTranscript(metadataMap.value.results.student_id);
    await createPayload();
  } else {
    isMetaData.value = false;
  }
  metaDataLoading.value = false;
};

// Get webHookUrl
const { tenantWallet } = storeToRefs(useTenantStore());
const tenantStore = useTenantStore();
const webHookUrl = ref(null);
const loadTenantSettings = async () => {
  Promise.all([tenantStore.getTenantSubWallet()])
    .then(() => {
      webHookUrl.value = tenantWallet.value.settings['wallet.webhook_urls'][0];
    })
    .catch((err: any) => {
      console.error(err);
      toast.error(`Failure: ${err}`);
    });
};

// Transcript
const transcriptLoading = ref(false);
const transcriptContent = ref();
// Get transcript
const getTranscript = async (student_id: string) => {
  transcriptLoading.value = true;
  if (webHookUrl.value) {
    (await getStudentInfo(student_id, webHookUrl.value))
      ? (transcriptContent.value = await getStudentInfo(
          student_id,
          webHookUrl.value
        ))
      : (transcriptContent.value = false);
  } else {
    (await getStudentInfo(student_id))
      ? (transcriptContent.value = await getStudentInfo(student_id))
      : (transcriptContent.value = false);
  }

  // There is a transcript but it's empty
  if (transcriptContent.value?.courseTranscript?.length === 0) {
    transcriptContent.value = false;
  }
  if (isMetaData.value === false && transcriptContent.value) {
    let studentInfo;
    if (webHookUrl.value) {
      studentInfo = await idLookup(student_id, webHookUrl.value);
    } else {
      studentInfo = await idLookup(student_id);
    }

    if (studentInfo) {
      metadataMap.value = {
        results: {
          last_name: studentInfo.studentIdCred?.lastName,
          first_name: studentInfo.studentIdCred?.firstName,
          student_id: studentInfo.studentIdCred?.studentsId,
        },
      };
      await createPayload();
    }
  }
  transcriptLoading.value = false;
};

// Payload
const payload = ref();
const sisApi = useSisApi();
const credentialDefinitionId = ref();
const svg = ref();
// Create payload
const createPayload = async () => {
  const GPA =
    transcriptContent.value?.studentCumulativeTranscript[0]?.cumulativeGradePointAverage?.toString() ??
    '';
  payload.value = {
    auto_issue: true,
    auto_remove: false,
    connection_id: formFields.selectedConnection.value,
    cred_def_id: credentialDefinitionId.value,
    credential_preview: {
      '@type': 'issue-credential/1.0/credential-preview',
      attributes: [
        {
          name: 'Last',
          value: metadataMap.value?.results?.last_name,
        },
        {
          name: 'First',
          value: metadataMap.value?.results?.first_name,
        },
        {
          name: 'Expiration',
          value: '20250101',
        },
        {
          name: 'StudentID',
          value: metadataMap.value?.results?.student_id,
        },
        {
          name: 'Middle',
          value: '',
        },
        {
          name: 'Transcript',
          value: JSON.stringify(transcriptContent.value?.courseTranscript),
        },
        {
          name: 'School',
          value: 'Cape Fear Community College',
        },
        {
          name: 'GPA',
          value: GPA,
        },
      ],
    },
    trace: false,
  };
};

// Submit
const issuerStore = useIssuerStore();
const submitted = ref(false);
// Submit function
const handleSubmit = async (isFormValid: boolean) => {
  submitted.value = true;
  if (!isFormValid) {
    return;
  }
  try {
    await issuerStore.offerCredential(payload.value);
    toast.info('Transcript Sent');
  } catch (error) {
    toast.error(`Failure: ${error}`);
  } finally {
    submitted.value = false;
    // Reset values
    transcriptLoading.value = false;
    transcriptContent.value = '';
    isMetaData.value = true;
    payload.value = {};
    // Clear dropdown and reset form fields
    formFields.selectedConnection = undefined;
    connectionsList.value = [];
    formFields.studentID = '';
  }
};

// Convert the key to title case and insert space before capital letters after lowercase letters
const updateKey = (input: any) =>
  input
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (str: string) => str.toUpperCase());

watch(
  () => formFields.selectedConnection,
  () => {
    if (formFields.selectedConnection) {
      // Reset values
      transcriptLoading.value = false;
      transcriptContent.value = '';
      isMetaData.value = true;
      payload.value = {};
      fetchMetadata(formFields.selectedConnection.value);
    }
  },
  { deep: true }
);

onMounted(async () => {
  connectionStore.listConnections().catch((err) => {
    console.error(`Failure: ${err}`);
  });
  credentialDefinitionId.value = (
    await sisApi.getHttp(`metadata/transcript-credential-definition-id`)
  ).data?.transcriptCredentialDefinitionId;
  svg.value = await sisApi.getHttp(`svg/generate`);
  loadTenantSettings();
});
</script>

<style scoped>
.transcript-form {
  max-width: 650px;
}

.form-group {
  margin-bottom: 20px;
}

.transcript-group .input-and-button {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.transcript-group input {
  width: 100%;
}

.form-group input {
  width: 100%;
}

label {
  display: block;
  margin-bottom: 5px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
}

.button-submit {
  margin-left: auto;
}

:deep(.transcriptContent .vjs-tree-node) {
  line-height: 14px !important;
}
:deep(.transcriptContent .vjs-tree-node) {
  font-size: 12px !important;
}

@media (max-width: 768px) {
  .transcript-form {
    max-width: 100%;
  }
  .form-group input,
  .form-actions button {
    width: 100%;
  }
  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .button-submit {
    margin-top: 10px;
  }
  .button-submit {
    margin-left: 0;
  }
  .transcript-group .input-and-button {
    align-items: stretch;
  }
}
</style>
