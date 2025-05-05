<template>
  <div class="row flex flex-wrap main-transcript lg:ml-0 lg:mt-0">
    <div class="xl:col-6 col-12">
      <div class="title mb-2">
        {{ $t('transcript.sendATranscript') }}
      </div>
      <div class="description mb-5">
        {{ $t('transcript.enterTheStudentID') }}
      </div>
      <form>
        <div class="field relative">
          <IconField icon-position="left">
            <InputIcon>
              <svg-icon
                type="mdi"
                :path="mdiCardAccountDetailsOutline"
                class="icon-size"
              ></svg-icon>
            </InputIcon>
            <InputText
              id="studentId"
              v-model="v$.studentID.$model"
              type="text"
              placeholder="Student ID"
              name="studentId"
              required
            />
          </IconField>
          <Button
            icon="pi pi-search"
            class="button-id-lookup"
            :disabled="!v$.studentID.$model || transcriptLoading"
            @click="getTranscript(v$.studentID.$model)"
          />
          <span v-if="transcriptLoading" class="inline-block mt-2 ml-2">
            <i class="pi pi-spin pi-spinner" style="font-size: 1.2em" />
          </span>
          <div v-if="transcriptContent === false" class="p-error">
            {{ $t('transcript.noTranscript') }}
          </div>
        </div>

        <div class="field fullNameInputContent">
          <IconField icon-position="left">
            <InputIcon>
              <svg-icon
                type="mdi"
                :path="mdiCardBulletedOutline"
                class="icon-size"
              ></svg-icon>
            </InputIcon>
            <InputText
              id="fullName"
              v-model="fullName"
              disabled
              type="text"
              placeholder="Full Name"
              name="fullName"
              required
              class="fullNameInput"
            />
          </IconField>
        </div>
        <div class="form-actions flex justify-content-end">
          <Button
            :label="$t('transcript.viewTranscript')"
            class="px-6 button-submit"
            :disabled="transcriptLoading || !transcriptContent"
            @click="
              transcriptContent && !transcriptLoading ? (visible = true) : null
            "
          />
        </div>
      </form>
    </div>
    <div class="xl:col-6 col-12">
      <div class="title mb-4 text-center">
        {{ $t('transcript.transcript') }}
      </div>
      <div class="transcript-img text-center">
        <img src="/img/transcript/transcriptTemp.png" />
      </div>
    </div>
  </div>

  <Dialog
    v-model:visible="visible"
    modal
    header="Transcript"
    :style="{ maxWidth: '100vw' }"
  >
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="taa-html mb-4" v-html="svg?.data"></div>

    <Button
      :label="$t('transcript.sendTranscript')"
      class="px-6 button-submit"
      :disabled="transcriptLoading || !transcriptContent"
      type="submit"
      @click="handleSubmit()"
    />
  </Dialog>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCardAccountDetailsOutline, mdiCardBulletedOutline } from '@mdi/js';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import { onMounted, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useToast } from 'vue-toastification';
import { useConnectionStore, useStudentStore, useTenantStore } from '@/store';
import { storeToRefs } from 'pinia';
import { useSisApi } from '@/store/sisApi';
import Dialog from 'primevue/dialog';
import { useIssuerStore } from '@/store/issuerStore';
const visible = ref(false);

const { getStudentInfo, idLookup } = useStudentStore();
const toast = useToast();
const fullName = ref('');
// Metadata
const metadataMap = ref();
// const isMetaData = ref(true);
// const metaDataLoading = ref(false);
// Form and Validation
// const connectionsList = ref();
const formFields = reactive({
  // selectedConnection: undefined as any,
  studentID: '',
});
const rules = {
  // selectedConnection: { required },
  studentID: { required },
  // studentID: {
  //   required: isMetaData.value ? false : required,
  // },
};
const v$ = useVuelidate(rules, formFields);
// State
// const connectionStore = useConnectionStore();
// const { connectionsDropdown, loading: connectionLoading } =
//   storeToRefs(useConnectionStore());

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
  console.log(metadataMap, 'metadataMapmetadataMap');
  payload.value = {
    auto_issue: true,
    auto_remove: false,
    // connection_id: formFields.selectedConnection.value,
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

// Transcript
const transcriptLoading = ref(false);
const transcriptContent = ref();
// Get transcript
const getTranscript = async (student_id: string) => {
  transcriptLoading.value = true;
  console.log(`webHookUrl.value: ${webHookUrl.value}`);
  if (webHookUrl.value) {
    (await getStudentInfo(student_id, webHookUrl.value))
      ? (transcriptContent.value = await getStudentInfo(
          student_id,
          webHookUrl.value
        ))
      : (transcriptContent.value = false);
  } else {
    const studentInfo = await getStudentInfo(student_id);
    if (studentInfo) {
      transcriptContent.value = studentInfo;
    } else {
      transcriptContent.value = false;
      transcriptLoading.value = false;
    }
  }
  if (transcriptContent.value) {
    console.log(
      `transcriptContent.value: ${transcriptContent.value.courseTranscript.length}`
    );
  }

  // There is a transcript but it's empty
  if (transcriptContent.value?.courseTranscript?.length === 0) {
    transcriptContent.value = false;
  }
  // console.log(isMetaData.value, 'isMetaData.value');
  if (transcriptContent.value) {
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
      console.log(`metadataMap.value: ${metadataMap.value.results}`);
      await createPayload();
    }
    fullName.value = `${metadataMap.value.results.first_name} ${metadataMap.value.results.last_name}`;
  }
  transcriptLoading.value = false;
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

const issuerStore = useIssuerStore();
const handleSubmit = async () => {
  try {
    await issuerStore.offerCredential(payload.value);
    toast.info('Transcript Sent');
  } catch (error) {
    toast.error(`Failure: ${error}`);
  } finally {
    // Reset values
    transcriptLoading.value = false;
    transcriptContent.value = '';
    payload.value = {};
    formFields.studentID = '';
  }
};

onMounted(async () => {
  credentialDefinitionId.value = (
    await sisApi.getHttp(`metadata/transcript-credential-definition-id`)
  ).data?.transcriptCredentialDefinitionId;
  svg.value = await sisApi.getHttp(`svg/generate`);
  loadTenantSettings();
});
</script>

<style lang="scss" scoped>
.main-transcript {
  background-color: #fff;
  color: $tenant-ui-new-text-on-primary;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0px 4px 10px rgba(66, 66, 66, 0.1);
  padding: 20px;
  overflow: hidden;
  .title {
    font-size: 24px;
    font-weight: 600;
  }
  .description {
    font-size: 16px;
    font-weight: 400;
  }
  .icon-size {
    width: 18px;
    margin-top: -4px;
    color: #424242;
  }
  form {
    max-width: 650px;
    input {
      text-indent: 30px;
      background-color: #ffffff;
      border: 0;
      height: 42px;
      text-indent: 30px;
      width: 100%;
      box-shadow: 0px 4px 4px 0px rgba(66, 66, 66, 0.2);
      font-family: 'Open Sans';
    }
    .fullNameInputContent .p-input-icon {
      opacity: 0.8;
      z-index: 1;
    }
    .fullNameInput {
      border: 1px solid #868686;
      box-shadow: none;
      opacity: 0.8;
      &:hover,
      &:focus {
        border: 1px solid #868686 !important;
      }
    }
    .button-id-lookup {
      position: absolute;
      top: 3px;
      right: 0;
      cursor: pointer;
      background-color: #fff;
      border: none;
      color: #424242;
      z-index: 999;
      &:focus {
        box-shadow: none !important ;
      }
    }
    /* remove outline on focus - chrome */
    .field .p-inputtext:focus {
      box-shadow: 0px 4px 4px 0px rgba(66, 66, 66, 0.2) !important;
    }
    button.button-submit,
    button.button-submit:hover {
      box-shadow: 0px 4px 4px 0px rgba(66, 66, 66, 0.2);
      background-color: #6666cc !important;
      font-size: 16px;
      border: none;
      height: 42px;
    }
  }
  .transcript-img {
    :deep(svg) {
      max-width: 100%;
      width: 100%;
      height: auto;
    }
    img {
      margin-bottom: -55px;
    }
  }
}

.p-dialog {
  button,
  button:hover {
    box-shadow: 0px 4px 4px 0px rgba(66, 66, 66, 0.2);
    background-color: #6666cc !important;
    font-size: 16px;
    border: none;
    height: 42px;
  }
}

.taa-html {
  :deep(svg) {
    border: 1px dashed gray;
    background-color: #eaeaea;
    padding: 1em;
  }
}
</style>
