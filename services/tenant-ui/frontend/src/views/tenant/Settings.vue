<template>
  <div class="main-settings mr-2">
    <form class="pt-4 pb-4" @submit.prevent="handleSubmit(!v$.$invalid)">
      <div v-if="loading" class="loading-overlay">
        <ProgressSpinner />
      </div>
      <div class="grid align-items-start">
        <div class="col-12 md:col-6 p-4">
          <div class="title pb-2">{{ t('settings.tenantProfile') }}</div>
          <div class="description mb-4">
            {{ t('settings.profileInformation') }}
          </div>
          <div class="settings-form">
            <!-- Tenant ID -->
            <div class="field">
              <InputText
                id="tenantId"
                class="w-full"
                :placeholder="$t('profile.tenantId')"
                readonly
                :value="tenant.tenant_id"
              />
            </div>
            <!-- Wallet ID -->
            <div class="field">
              <InputText
                id="walletId"
                class="w-full"
                :placeholder="$t('common.walletId')"
                readonly
                :value="tenant.wallet_id"
              />
            </div>
            <!-- Wallet Label -->
            <div class="field">
              <InputText
                id="walletLabel"
                v-model="v$.walletLabel.$model"
                :placeholder="$t('profile.walletLabel')"
                class="w-full"
                :class="{ 'p-invalid': v$.walletLabel.$invalid && submitted }"
              />
              <span v-if="v$.walletLabel.$error && submitted">
                <span
                  v-for="(error, index) of v$.walletLabel.$errors"
                  :key="index"
                >
                  <small class="p-error">{{ error.$message }}</small>
                </span>
              </span>
            </div>
            <!-- Name -->
            <div class="field">
              <InputText
                id="nameField"
                class="w-full"
                :placeholder="$t('profile.name')"
                readonly
                :value="tenant.tenant_name"
              />
            </div>
            <!-- Email -->
            <div class="field">
              <InputText
                id="contactfield"
                v-model="v$.contact_email.$model"
                :placeholder="$t('profile.contact')"
                class="w-full"
                :class="{ 'p-invalid': v$.contact_email.$invalid && submitted }"
              />
              <span v-if="v$.contact_email.$error && submitted">
                <span
                  v-for="(error, index) of v$.contact_email.$errors"
                  :key="index"
                >
                  <small class="p-error">{{ error.$message }}</small>
                </span>
              </span>
            </div>
          </div>
        </div>

        <div class="col-12 md:col-6 p-4">
          <div class="title pb-2">{{ t('settings.walletInformation') }}</div>
          <div class="description mb-4">{{ t('settings.walletDetails') }}</div>
          <div class="settings-form">
            <!-- Image URL -->
            <div class="field">
              <InputText
                id="imageUrl"
                v-model="v$.imageUrl.$model"
                class="w-full"
                :placeholder="$t('settings.logoUrl')"
                :class="{ 'p-invalid': v$.imageUrl.$invalid && submitted }"
              />
              <span v-if="v$.imageUrl.$error && submitted">
                <span
                  v-for="(error, index) of v$.imageUrl.$errors"
                  :key="index"
                >
                  <small class="p-error">{{ error.$message }}</small>
                </span>
              </span>
            </div>

            <!-- Webhooks -->
            <TransitionGroup appear name="wh">
              <div
                v-for="(webhook, index) of formFields.webhooks"
                :key="index"
                class="grid align-items-start"
              >
                <div class="col-12 md:col-5">
                  <div class="field">
                    <InputText
                      id="webhookUrl"
                      v-model="webhook.webhookUrl"
                      :placeholder="$t('profile.webHookUrl')"
                      class="w-full"
                    />
                  </div>
                </div>
                <div class="col-12 md:col-7">
                  <div class="field flex">
                    <Password
                      id="webhookKey"
                      v-model="webhook.webhookKey"
                      :placeholder="$t('profile.webHookKey')"
                      toggle-mask
                      :feedback="false"
                      class="flex-grow-1"
                    />

                    <Button
                      title="Delete this webhook"
                      icon="pi pi-times"
                      class="ml-2 btn-webhook"
                      text
                      rounded
                      @click="() => removeWebhook(index)"
                    />

                    <Button
                      title="Add another webhook"
                      class="add ml-2 btn-webhook"
                      icon="pi pi-plus-circle"
                      text
                      rounded
                      @click="addWebhook"
                    />
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>
      <div class="button-form flex justify-content-end align-items-center pr-3">
        <Button
          :disabled="loading || !hasChanges"
          :loading="loading"
          label="Save"
          type="submit"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required, email, url } from '@vuelidate/validators';
import { storeToRefs } from 'pinia';
import { useTenantStore } from '@/store';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Password from 'primevue/password';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'vue-toastification';

interface Webhook {
  webhookUrl: string;
  webhookKey: string;
}

interface FormFields {
  webhooks: Webhook[];
  walletLabel: string;
  contact_email: string;
  imageUrl: string;
  ACAPY_AUTO_ACCEPT_INVITES: boolean;
  ACAPY_AUTO_ACCEPT_REQUESTS: boolean;
  ACAPY_AUTO_PING_CONNECTION: boolean;
  ACAPY_AUTO_REQUEST_ENDORSEMENT: boolean;
  ACAPY_AUTO_RESPOND_CREDENTIAL_OFFER: boolean;
  ACAPY_AUTO_RESPOND_CREDENTIAL_REQUEST: boolean;
  ACAPY_AUTO_RESPOND_MESSAGES: boolean;
  ACAPY_AUTO_VERIFY_PRESENTATION: boolean;
  ACAPY_AUTO_WRITE_TRANSACTIONS: boolean;
  ACAPY_CREATE_REVOCATION_TRANSACTIONS: boolean;
  ACAPY_ENDORSER_ROLE: string;
  ACAPY_INVITE_PUBLIC: boolean;
  ACAPY_LOG_LEVEL: string;
  ACAPY_MONITOR_PING: boolean;
  ACAPY_NOTIFY_REVOCATION: boolean;
  ACAPY_PUBLIC_INVITES: boolean;
}

const { t } = useI18n();
const toast = useToast();

// State setup
const tenantStore = useTenantStore();
const { tenant, loading, serverConfig, tenantDefaultSettings, tenantWallet } =
  storeToRefs(useTenantStore());
const tenantWalletwithExtraSettings = ref<any>(null);
const submitted = ref(false);
const initialFormState = ref<FormFields | null>(null);

// Form Fields and Validation
const formFields = reactive<FormFields>({
  webhooks: [{ webhookUrl: '', webhookKey: '' }],
  walletLabel: '',
  contact_email: '',
  imageUrl: '',
  ACAPY_AUTO_ACCEPT_INVITES: false,
  ACAPY_AUTO_ACCEPT_REQUESTS: false,
  ACAPY_AUTO_PING_CONNECTION: false,
  ACAPY_AUTO_REQUEST_ENDORSEMENT: false,
  ACAPY_AUTO_RESPOND_CREDENTIAL_OFFER: false,
  ACAPY_AUTO_RESPOND_CREDENTIAL_REQUEST: false,
  ACAPY_AUTO_RESPOND_MESSAGES: false,
  ACAPY_AUTO_VERIFY_PRESENTATION: false,
  ACAPY_AUTO_WRITE_TRANSACTIONS: false,
  ACAPY_CREATE_REVOCATION_TRANSACTIONS: false,
  ACAPY_ENDORSER_ROLE: 'author',
  ACAPY_INVITE_PUBLIC: false,
  ACAPY_LOG_LEVEL: 'info',
  ACAPY_MONITOR_PING: false,
  ACAPY_NOTIFY_REVOCATION: false,
  ACAPY_PUBLIC_INVITES: false,
});

// Computed property to check if form has changes
const hasChanges = computed(() => {
  if (!initialFormState.value) return false;

  // Compare webhooks
  const currentWebhooks = JSON.stringify(formFields.webhooks);
  const initialWebhooks = JSON.stringify(initialFormState.value.webhooks);
  if (currentWebhooks !== initialWebhooks) return true;

  // Compare other fields
  const fieldsToCompare: (keyof FormFields)[] = [
    'walletLabel',
    'contact_email',
    'imageUrl',
    'ACAPY_AUTO_ACCEPT_INVITES',
    'ACAPY_AUTO_ACCEPT_REQUESTS',
    'ACAPY_AUTO_PING_CONNECTION',
    'ACAPY_AUTO_REQUEST_ENDORSEMENT',
    'ACAPY_AUTO_RESPOND_CREDENTIAL_OFFER',
    'ACAPY_AUTO_RESPOND_CREDENTIAL_REQUEST',
    'ACAPY_AUTO_RESPOND_MESSAGES',
    'ACAPY_AUTO_VERIFY_PRESENTATION',
    'ACAPY_AUTO_WRITE_TRANSACTIONS',
    'ACAPY_CREATE_REVOCATION_TRANSACTIONS',
    'ACAPY_ENDORSER_ROLE',
    'ACAPY_INVITE_PUBLIC',
    'ACAPY_LOG_LEVEL',
    'ACAPY_MONITOR_PING',
    'ACAPY_NOTIFY_REVOCATION',
    'ACAPY_PUBLIC_INVITES',
  ];

  return fieldsToCompare.some(
    (field) => formFields[field] !== initialFormState.value![field]
  );
});

const rules = {
  webhooks: {
    $each: {
      webhookKey: {},
      webhookUrl: { url },
    },
  },
  walletLabel: { required },
  contact_email: { required, email },
  imageUrl: { url },
};

const v$ = useVuelidate(rules, formFields);

// Get Tenant Configuration
const loadTenantSettings = async () => {
  try {
    await Promise.all([
      tenantStore.getSelf(),
      tenantStore.getTenantSubWallet(),
      tenantStore.getTenantDefaultSettings(),
      tenantStore.getServerConfig(),
    ]);

    // set the local form settings
    const settingMap = tenantWallet.value.settings
      ? { ...tenantDefaultSettings.value, ...tenantWallet.value.settings }
      : tenantDefaultSettings.value;

    tenantWalletwithExtraSettings.value = {
      ...tenantWallet.value,
      settings: settingMap,
    };

    // Update form fields
    const updatedFields = {
      walletLabel: tenantWallet.value.settings.default_label,
      contact_email: tenant.value.contact_email,
      imageUrl: tenantWallet.value.settings.image_url,
      ACAPY_AUTO_ACCEPT_INVITES: settingMap['debug.auto_accept_invites'],
      ACAPY_AUTO_ACCEPT_REQUESTS: settingMap['debug.auto_accept_requests'],
      ACAPY_AUTO_PING_CONNECTION: settingMap['auto_ping_connection'],
      ACAPY_AUTO_REQUEST_ENDORSEMENT: settingMap['endorser.auto_request'],
      ACAPY_AUTO_RESPOND_CREDENTIAL_OFFER:
        settingMap['debug.auto_respond_credential_offer'],
      ACAPY_AUTO_RESPOND_CREDENTIAL_REQUEST:
        settingMap['debug.auto_respond_credential_request'],
      ACAPY_AUTO_RESPOND_MESSAGES: settingMap['debug.auto_respond_messages'],
      ACAPY_AUTO_VERIFY_PRESENTATION:
        settingMap['debug.auto_verify_presentation'],
      ACAPY_AUTO_WRITE_TRANSACTIONS: settingMap['endorser.auto_write'],
      ACAPY_ENDORSER_ROLE: settingMap['endorser.author']
        ? 'author'
        : settingMap['endorser.endorser']
          ? 'endorser'
          : 'none',
      ACAPY_INVITE_PUBLIC: settingMap['debug.invite_public'],
      ACAPY_LOG_LEVEL: settingMap['log.level'],
      ACAPY_MONITOR_PING: settingMap['debug.monitor_ping'],
      ACAPY_NOTIFY_REVOCATION: settingMap['revocation.notify'],
      ACAPY_PUBLIC_INVITES: settingMap['public_invites'],
      ACAPY_CREATE_REVOCATION_TRANSACTIONS:
        settingMap['endorser.auto_create_rev_reg'],
    };

    Object.assign(formFields, updatedFields);

    // Handle webhooks
    formFields.webhooks = [];
    const webHookUrls = tenantWallet.value.settings['wallet.webhook_urls'];

    if (webHookUrls?.length) {
      webHookUrls.forEach((whItem: string) => {
        const [webhookUrl, webhookKey] = whItem.split('#');
        formFields.webhooks.push({
          webhookUrl: webhookUrl || '',
          webhookKey: webhookKey || '',
        });
      });
    }

    if (formFields.webhooks.length === 0) {
      formFields.webhooks.push({ webhookUrl: '', webhookKey: '' });
    }

    // Store initial state after loading
    initialFormState.value = JSON.parse(JSON.stringify(formFields));
  } catch (err) {
    console.error('Failed to load tenant settings:', err);
    toast.error(`Failed to load settings: ${err}`);
  }
};

onMounted(() => {
  loadTenantSettings();
});

// Webhook management
const addWebhook = () => {
  formFields.webhooks.push({ webhookUrl: '', webhookKey: '' });
};

const removeWebhook = (index: number) => {
  formFields.webhooks.splice(index, 1);
  if (formFields.webhooks.length === 0) {
    addWebhook();
  }
};

// Form submission
const handleSubmit = async (isFormValid: boolean) => {
  submitted.value = true;

  if (!isFormValid) {
    return;
  }

  try {
    const webhooks = formFields.webhooks
      .filter((wh) => wh.webhookUrl.trim())
      .map((wh) => {
        const url = wh.webhookUrl.trim();
        return wh.webhookKey.trim() ? `${url}#${wh.webhookKey.trim()}` : url;
      });

    const extraSettings = {
      ACAPY_AUTO_ACCEPT_INVITES: formFields.ACAPY_AUTO_ACCEPT_INVITES,
      ACAPY_AUTO_ACCEPT_REQUESTS: formFields.ACAPY_AUTO_ACCEPT_REQUESTS,
      ACAPY_AUTO_PING_CONNECTION: formFields.ACAPY_AUTO_PING_CONNECTION,
      ACAPY_AUTO_REQUEST_ENDORSEMENT: formFields.ACAPY_AUTO_REQUEST_ENDORSEMENT,
      ACAPY_AUTO_RESPOND_CREDENTIAL_OFFER:
        formFields.ACAPY_AUTO_RESPOND_CREDENTIAL_OFFER,
      ACAPY_AUTO_RESPOND_CREDENTIAL_REQUEST:
        formFields.ACAPY_AUTO_RESPOND_CREDENTIAL_REQUEST,
      ACAPY_AUTO_RESPOND_MESSAGES: formFields.ACAPY_AUTO_RESPOND_MESSAGES,
      ACAPY_AUTO_VERIFY_PRESENTATION: formFields.ACAPY_AUTO_VERIFY_PRESENTATION,
      ACAPY_AUTO_WRITE_TRANSACTIONS: formFields.ACAPY_AUTO_WRITE_TRANSACTIONS,
      ACAPY_CREATE_REVOCATION_TRANSACTIONS:
        formFields.ACAPY_CREATE_REVOCATION_TRANSACTIONS,
      ACAPY_ENDORSER_ROLE: formFields.ACAPY_ENDORSER_ROLE,
      ACAPY_INVITE_PUBLIC: formFields.ACAPY_INVITE_PUBLIC,
      ACAPY_LOG_LEVEL: formFields.ACAPY_LOG_LEVEL,
      ACAPY_MONITOR_PING: formFields.ACAPY_MONITOR_PING,
      ACAPY_NOTIFY_REVOCATION: formFields.ACAPY_NOTIFY_REVOCATION,
      ACAPY_PUBLIC_INVITES: formFields.ACAPY_PUBLIC_INVITES,
    };

    const payload = {
      image_url: formFields.imageUrl,
      label: formFields.walletLabel,
      wallet_webhook_urls: webhooks,
      extra_settings: extraSettings,
    };

    const new_email = {
      contact_email: formFields.contact_email,
    };

    await Promise.all([
      tenantStore.updateTenantSubWallet(payload),
      tenantStore.updateTenantContact(new_email),
    ]);

    await loadTenantSettings();
    toast.success('Your Settings have been Updated');
  } catch (error) {
    console.error('Failed to update settings:', error);
    toast.error(`Failed to update settings: ${error}`);
  } finally {
    submitted.value = false;
  }
};
</script>

<style lang="scss" scoped>
.main-settings {
  background-color: #fff;
  color: $tenant-ui-new-text-on-primary;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0px 4px 10px rgba(66, 66, 66, 0.1);
  padding: 20px;
  position: relative;

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .title {
    font-size: 24px;
    font-weight: 600;
  }

  .description {
    font-size: 16px;
    font-weight: 400;
  }

  :deep(input) {
    text-indent: 5px;
    background-color: #ffffff;
    border: 0;
    height: 42px;
    box-shadow: 0px 4px 4px 0px rgba(66, 66, 66, 0.2);
    font-family: 'Open Sans';
    width: 100%;
  }

  .field :deep(.p-inputtext:focus) {
    box-shadow: 0px 4px 4px 0px rgba(66, 66, 66, 0.2) !important;
  }

  button.btn-webhook {
    color: #6666cc;
  }

  .button-form button {
    background-color: #6666cc;
    font-size: 16px;
    box-shadow: 0px 4px 4px 0px rgba(66, 66, 66, 0.2);
    border: none;
  }
}
</style>
