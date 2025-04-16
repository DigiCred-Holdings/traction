<template>
  <MainCardContent :title="$t('onboarding.onboarding')">
    <Panel class="mb-5" header="Onboarding Form">
      <form class="onboarding-form" @submit.prevent="submitForm">
        <div class="form-group student-id-group">
          <label for="studentId">{{ $t('onboarding.studentId') }}</label>
          <div class="input-and-button">
            <InputText id="studentId" v-model="studentId" required />
            <Button
              :label="$t('onboarding.idLookup')"
              icon="pi pi-search"
              class="button-id-lookup"
              :disabled="!studentId || loading"
              @click="handleIdLookUp"
            />
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
        <div class="form-group">
          <label for="fullName">{{ $t('onboarding.fullName') }}</label>
          <InputText id="fullName" v-model="fullName" required />
        </div>
        <div class="form-actions">
          <Button
            :label="$t('onboarding.clear')"
            icon="pi pi-times"
            class="button-clear"
            :disabled="!studentId && !fullName && !error && !studentFullName"
            @click="clearForm"
          />

          <Button
            :label="$t('onboarding.submit')"
            icon="pi pi-check"
            class="button-submit"
            :disabled="!studentId || !fullName || !studentFullName"
            type="submit"
          />
        </div>
      </form>
      <Dialog
        v-model:visible="showModal"
        :modal="true"
        :style="{ width: '50vw' }"
        header=""
        @hide="clearForm"
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
            <div class="button-container">
              <Button
                :label="$t('onboarding.return')"
                icon="pi pi-refresh"
                class="button-return"
                @click="clearForm"
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
      </Dialog>
    </Panel>
  </MainCardContent>
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

<style scoped>
.onboarding-container {
  padding: 20px;
}

.onboarding-form {
  max-width: 650px;
}

.form-group {
  margin-bottom: 20px;
}

.student-id-group .input-and-button {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.student-id-group input {
  width: 100%;
}

.button-id-lookup {
  margin-top: 8px;
  width: auto;
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

.button-clear {
  margin-right: auto;
}

.button-submit {
  margin-left: auto;
}

.center-content {
  text-align: center;
  margin-top: 20px;
  padding: 10px;
  border-radius: 5px;
}

.pi-spinner {
  font-size: 2em;
  color: #007bff;
  margin-bottom: 10px;
}

.text-error {
  color: #dc3545;
  background-color: #f8d7da;
  padding: 10px;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
}

.text-success {
  color: #28a745;
  background-color: #d4edda;
  padding: 10px;
  border: 1px solid #c3e6cb;
  border-radius: 5px;
}

p {
  margin: 0;
  font-weight: bold;
}

.qr-code-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

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
  .form-group input,
  .form-actions button {
    width: 100%;
  }
  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .button-clear,
  .button-submit {
    margin-top: 10px;
  }
  .button-submit {
    margin-left: 0;
  }
  .student-id-group .input-and-button {
    align-items: stretch;
  }
  .qr-code-display {
    margin-top: 20px;
    text-align: center;
  }
}
</style>
