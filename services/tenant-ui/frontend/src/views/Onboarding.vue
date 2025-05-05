<template>
  <div class="row flex flex-wrap main-onboarding lg:ml-0 lg:mt-0">
    <!-- <MainCardContent :title="$t('onboarding.onboarding')">
      <Panel class="mb-5" header="Onboarding Form"> -->
    <div class="lg:col-6 col-12">
      <div class="step-title mb-2">
        {{ $t('onboarding.step1EnterStudentID') }}
      </div>
      <div class="step-description mb-5">
        {{ $t('onboarding.pleaseEnterTheStudent') }}
      </div>
      <form class="onboarding-form" @submit.prevent="submitForm">
        <div class="form-group student-id-group">
          <!-- <label for="studentId">{{ $t('onboarding.studentId') }}</label> -->
          <div class="input-and-button">
            <div class="field mt-3 w-full relative">
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
                  v-model="studentId"
                  type="text"
                  placeholder="Student ID"
                  name="studentId"
                  required
                />
              </IconField>
              <Button
                icon="pi pi-search"
                class="button-id-lookup"
                @click="handleIdLookUp"
              />
            </div>
            <!-- <Button
              :label="$t('onboarding.idLookup')"
              icon="pi pi-search"
              class="button-id-lookup"
              :disabled="!studentId || loading"
              @click="handleIdLookUp"
            /> -->
          </div>
          <div v-if="loading" class="center-content">
            <i class="pi pi-spin pi-spinner" style="font-size: 2em"></i>
            <p>{{ $t('onboarding.fetching') }}</p>
          </div>
          <div v-else-if="error" class="center-content">
            <p class="text-error">{{ errMessage }}</p>
          </div>
          <div v-else-if="studentFullName" class="center-content">
            <p class="text-success">{{ $t('onboarding.found') }}</p>
          </div>
          <div v-else-if="loadingQRCode" class="center-content">
            <i class="pi pi-spin pi-spinner" style="font-size: 2em"></i>
            <p>{{ $t('onboarding.loadingQRCode') }}</p>
          </div>
        </div>
        <div class="form-group full-name-group">
          <!-- <label for="fullName">{{ $t('onboarding.fullName') }}</label> -->
          <!-- <InputText
            id="fullName"
            v-model="fullName"
            required
            placeholder="Full Name"
          /> -->
          <div class="input-and-button">
            <div class="field w-full fullNameInputContent">
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
          </div>
        </div>
        <div class="form-actions flex justify-content-end">
          <Button
            :label="$t('onboarding.reset')"
            class="button-clear mr-2"
            :disabled="!studentId && !fullName && !error && !studentFullName"
            @click="clearForm"
          />
          <!-- icon="pi pi-check" -->
          <Button
            :label="$t('onboarding.submit')"
            class="px-6 button-submit"
            :disabled="!studentId || !fullName || !studentFullName"
            type="submit"
          />
        </div>
      </form>
      <!-- @click="clearForm" -->
      <!-- <Dialog
        v-model:visible="showModal"
        :modal="true"
        :style="{ width: '50vw' }"
        header=""
      >
        <div
          v-if="!qrCodeScanned && !contactAdded && !credentialIssued"
          class="qr-code-display"
        >
          <p>{{ $t('onboarding.scanQRCODE') }}</p>
          <QRCode :qr-content="invitation_url" />
        </div>
        <div
          v-else-if="qrCodeScanned && !contactAdded"
          class="left-aligned-content"
        >
          <i class="pi pi-spin pi-spinner" style="font-size: 1em"></i>
          <p>{{ $t('onboarding.qrScanned') }}</p>
        </div>
        <div v-else-if="contactAdded" class="left-aligned-content">
          <div class="status">
            <i class="pi pi-check" style="font-size: 1em; color: green"></i>
            <span style="font-size: 1em; color: green; margin-left: 0.5em">{{
              $t('onboarding.contactAdded')
            }}</span>
          </div>
          <div v-if="credentialIssued" class="status">
            <i class="pi pi-check" style="font-size: 1em; color: green"></i>
            <span style="font-size: 1em; color: green; margin-left: 0.5em">{{
              $t('onboarding.credentialOffered')
            }}</span>
            <div class="button-container"> -->
      <!-- @click="clearForm" -->
      <!-- <Button
                :label="$t('onboarding.return')"
                icon="pi pi-refresh"
                class="button-return"
              />
            </div>
          </div>
          <div v-else class="status">
            <i class="pi pi-spin pi-spinner" style="font-size: 1.5em"></i>
            <p style="font-size: 1.5em">
              {{ $t('onboarding.issuingStudentID') }}
            </p>
          </div>
        </div>
      </Dialog> -->
      <!-- </Panel>
    </MainCardContent> -->
    </div>
    <div class="lg:col-6 col-12">
      <div class="step-title mb-2 text-center">
        {{ $t('onboarding.step2:QRCode') }}
      </div>
      <div class="QRcode-empty">
        <div v-if="showModal">
          <QRCode :qr-content="invitation_url" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';
import { useI18n } from 'vue-i18n';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Panel from 'primevue/panel';
import MainCardContent from '@/components/layout/mainCard/MainCardContent.vue';
import QRCode from '@/components/common/QRCode.vue';
import Dialog from 'primevue/dialog';
import {
  useStudentStore,
  useConnectionStore,
  useIssuerStore,
  useConfigStore,
} from '@/store';
import { useToast } from 'vue-toastification';
import { storeToRefs } from 'pinia';
import { useTenantStore } from '@/store';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCardAccountDetailsOutline, mdiCardBulletedOutline } from '@mdi/js';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

const { t } = useI18n();
const studentId = ref('');
const fullName = ref('');
const loading = ref(false);
const error = ref(false);
let errMessage: string = '';
const invitation_url = ref('');
const showModal = ref(false);
const studentFullName = ref(false);
const loadingQRCode = ref(false);
let response: any = null;
const { createInvitation } = useConnectionStore();
const { idLookup } = useStudentStore();
const issuerStore = useIssuerStore();
const toast = useToast();
const { config } = storeToRefs(useConfigStore());
const qrCodeScanned = ref(false);
const contactAdded = ref(false);
const credentialIssued = ref(false);
const credentialOffered = ref(false);
const webHookUrl = ref(null);

let socket: any;

const initializeSocket = () => {
  const baseUrl = config.value.frontend.sisProxyPath;
  socket = io(`${baseUrl}`, {
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Connected to the websocket server.');
  });

  socket.on('connect_error', (err: any) => {
    console.error('Connection Error:', err);
  });

  socket.on('eventUpdate', async (data: any) => {
    console.log('Event received:', data);

    if (data.details?.state === 'request') {
      credentialOffered.value = false;
      qrCodeScanned.value = true;
    }

    if (data.details?.state === 'active' && !credentialOffered.value) {
      qrCodeScanned.value = false;
      contactAdded.value = true;
      console.log(`Student ${data.details.alias} successfully added!`);
      console.log('Issuing student ID....');
    }

    if (data.details?.state === 'offer_sent') {
      contactAdded.value = true;
      credentialIssued.value = true;
      credentialOffered.value = true;
      console.log('Student Received Student ID credential!');
    }
  });
};

onMounted(() => {
  initializeSocket();
  loadTenantSettings();
});
const { tenantWallet } = storeToRefs(useTenantStore());
const tenantStore = useTenantStore();
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

onUnmounted(() => {
  if (socket) {
    socket.disconnect();
  }
});

const submitForm = async () => {
  studentFullName.value = false;
  try {
    const result: any = await createInvitation(
      `${fullName.value} -studentID- ${studentId.value}`,
      false
    );
    if (result && result.invitation_url) {
      invitation_url.value = result.invitation_url;
      console.log(`Invitation URL: ${result.invitation_url}`);
      showModal.value = true;
    }
  } catch (err: any) {
    console.error('Error during invitation creation:', err.message);
  }
};

const clearForm = () => {
  studentId.value = '';
  fullName.value = '';
  error.value = false;
  showModal.value = false;
  invitation_url.value = '';
  studentFullName.value = false;
  qrCodeScanned.value = false;
  contactAdded.value = false;
  credentialIssued.value = false;
  credentialOffered.value = false;
};

const handleIdLookUp = async () => {
  error.value = false;
  fullName.value = '';
  studentFullName.value = false;
  loading.value = true;
  try {
    if (webHookUrl.value) {
      response = await idLookup(studentId.value, webHookUrl.value);
    } else {
      response = await idLookup(studentId.value);
    }
    if (response && response.studentIdCred) {
      console.log('response', response);
      fullName.value = response.studentIdCred.fullName;
      if (response.studentIdCred.fullName) {
        studentFullName.value = true;
      }
      loading.value = false;
    } else {
      errMessage = t('onboarding.notFound');
      throw new Error(t('onboarding.notFound'));
    }
  } catch (err: any) {
    console.error('Error during ID Lookup:', err.message);
    loading.value = false;
    error.value = true;
    errMessage = err.message;
  }
};
</script>

<style lang="scss" scoped>
.main-onboarding {
  background-color: #fff;
  color: $tenant-ui-new-text-on-primary;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0px 4px 10px rgba(66, 66, 66, 0.1);
  padding: 20px;
  .step-title {
    font-size: 24px;
    font-weight: 600;
    // &.qr-code-div {
    //   padding-left: 75px;
    // }
  }
  .step-description {
    font-size: 16px;
    font-weight: 400;
  }
  .icon-size {
    width: 18px;
    margin-top: -5px;
    color: #424242;
  }
  input {
    text-indent: 30px;
    background-color: #ffffff;
    border: 0;
    height: 42px;
    text-indent: 30px;
    box-shadow: 0px 4px 4px 0px rgba(66, 66, 66, 0.2);
    font-family: 'Open Sans';
  }
  .field .p-inputtext:focus {
    box-shadow: 0px 4px 4px 0px rgba(66, 66, 66, 0.2) !important;
  }
  .QRcode-empty {
    width: 300px;
    height: 300px;
    border: 4px solid #000;
    position: relative;
    // margin-left: 23px;
    margin: 40px auto;
    // margin-top: 20px;
    &:after {
      content: '';
      width: 300px;
      height: 60px;
      background: #ffffff;
      position: absolute;
      top: 120px;
      left: -4px;
    }
    &::before {
      content: '';
      width: 60px;
      height: 300px;
      background: #fff;
      position: absolute;
      top: -4px;
      left: 120px;
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
    z-index: 99999999999999;
    &:focus {
      box-shadow: none !important ;
    }
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
}
.onboarding-container {
  padding: 20px;
}

.onboarding-form {
  max-width: 650px;
}

// .form-group {
//   margin-bottom: 20px;
// }

.student-id-group .input-and-button {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.student-id-group input {
  width: 100%;
}

// .button-id-lookup {
//   margin-top: 8px;
//   width: auto;
// }

.form-group input {
  width: 100%;
}

label {
  display: block;
  margin-bottom: 5px;
}

// .form-actions {
//   display: flex;
//   justify-content: space-between;
// }

.button-clear {
  background-color: #e0e0e0;
  color: $tenant-ui-new-text-on-primary;
  border: none;
}

// button.button-submit {
//   margin-left: auto;
// }
button.button-submit,
button.button-submit:hover {
  box-shadow: 0px 4px 4px 0px rgba(66, 66, 66, 0.2);
  background-color: #6666cc !important;
  font-size: 16px;
  border: none;
  height: 42px;
}

.center-content {
  text-align: left;
  // margin-top: 20px;
  // padding: 10px;
  margin-bottom: 15px;
  border-radius: 5px;
}

.pi-spinner {
  font-size: 2em;
  color: #007bff;
  margin-bottom: 10px;
}

.text-error {
  color: #dc3545;
  // background-color: #f8d7da;
  // padding: 10px;
  // border: 1px solid #f5c6cb;
  // border-radius: 5px;
}

.text-success {
  color: #28a745;
  // background-color: #d4edda;
  // padding: 10px;
  // border: 1px solid #c3e6cb;
  // border-radius: 5px;
}

p {
  margin: 0;
  font-weight: bold;
}

// .qr-code-display {
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   text-align: center;
// }

.button-container {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: 1em;
}

@media (max-width: 768px) {
  .onboarding-form {
    max-width: 100%;
  }
  // .form-group input,
  // .form-actions button {
  //   width: 100%;
  // }
  // .form-actions {
  //   flex-direction: column;
  //   align-items: stretch;
  // }
  // .button-clear,
  // .button-submit {
  //   margin-top: 10px;
  // }
  // .button-submit {
  //   margin-left: 0;
  // }
  .student-id-group .input-and-button {
    align-items: stretch;
  }
  .qr-code-display {
    margin-top: 20px;
    text-align: center;
  }
}

@media (max-width: 991px) {
  .QRcode-empty {
    margin: 40px auto !important;
  }
}
</style>
