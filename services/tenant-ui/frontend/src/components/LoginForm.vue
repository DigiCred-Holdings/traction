<template>
  <form @submit.prevent="handleSubmit(!v$.$invalid)">
    <div class="font-bold login-title mb-4">{{ $t('login.login') }}</div>
    <TabView
      v-model:active-index="activeTab"
      class="tab-container"
      @tab-change="handleTabChange"
    >
      <TabPanel header="Account">
        <div class="field mt-3 w-full">
          <IconField icon-position="left">
            <InputIcon>
              <svg-icon
                type="mdi"
                :path="emailOutlineIcon"
                class="icon-size"
              ></svg-icon>
            </InputIcon>
            <InputText
              id="email-id"
              v-model="v$.emailId.$model"
              type="text"
              option-label="label"
              autocomplete="email-id"
              :placeholder="'Email'"
              name="emailId"
              autofocus
              class="w-full"
            />
          </IconField>
          <small v-if="v$.emailId.$invalid && submitted" class="p-error">{{
            v$.emailId.required.$message
          }}</small>
        </div>

        <div class="field mt-3 w-full">
          <IconField icon-position="left">
            <InputIcon>
              <svg-icon
                type="mdi"
                :path="lockOutlineIcon"
                class="icon-size"
              ></svg-icon>
            </InputIcon>
            <InputText
              id="password-id"
              v-model="v$.passwordId.$model"
              type="password"
              option-label="label"
              autocomplete="password-id"
              placeholder="Password"
              name="password"
              class="w-full"
            />
          </IconField>
          <small v-if="v$.passwordId.$invalid && submitted" class="p-error">{{
            v$.passwordId.required.$message
          }}</small>
        </div>
      </TabPanel>

      <TabPanel header="Wallet Credentials">
        <div class="field mt-3 w-full">
          <IconField icon-position="left">
            <InputIcon>
              <svg-icon
                type="mdi"
                :path="walletIcon"
                class="icon-size"
              ></svg-icon>
            </InputIcon>
            <InputText
              id="wallet-id"
              v-model="v$.walletId.$model"
              type="text"
              option-label="label"
              autocomplete="wallet-id"
              name="walledId"
              :placeholder="$t('common.walletId')"
              autofocus
              class="w-full"
            />
          </IconField>
          <small v-if="v$.walletId.$invalid && submitted" class="p-error">{{
            v$.walletId.required.$message
          }}</small>
        </div>

        <div class="field mt-3 w-full">
          <IconField icon-position="left">
            <InputIcon>
              <svg-icon
                type="mdi"
                :path="keyOutlineIcon"
                class="icon-size"
              ></svg-icon>
            </InputIcon>
            <InputText
              id="wallet-secret"
              v-model="v$.walletSecret.$model"
              type="password"
              option-label="label"
              autocomplete="wallet-secret"
              :placeholder="$t('login.walletSecret')"
              name="walletSecret"
              class="w-full"
            />
          </IconField>
          <small v-if="v$.walletSecret.$invalid && submitted" class="p-error">{{
            v$.walletSecret.required.$message
          }}</small>
        </div>
      </TabPanel>

      <TabPanel header="API Key">
        <div class="field mt-3 w-full">
          <IconField icon-position="left">
            <InputIcon>
              <svg-icon
                type="mdi"
                :path="tenantOutlineIcon"
                class="icon-size"
              ></svg-icon>
            </InputIcon>
            <InputText
              id="tenant-id"
              v-model="v$.tenantId.$model"
              type="text"
              option-label="label"
              autocomplete="tenant-id"
              name="walledId"
              :placeholder="$t('common.tenantId')"
              autofocus
              class="w-full"
            />
          </IconField>
          <small v-if="v$.tenantId.$invalid && submitted" class="p-error">{{
            v$.tenantId.required.$message
          }}</small>
        </div>

        <div class="field mt-3 w-full">
          <IconField icon-position="left">
            <InputIcon>
              <svg-icon
                type="mdi"
                :path="keyOutlineIcon"
                class="icon-size"
              ></svg-icon>
            </InputIcon>
            <InputText
              id="api-key"
              v-model="v$.apiKey.$model"
              type="password"
              option-label="label"
              autocomplete="api-key"
              :placeholder="$t('common.apiKey')"
              name="apiKey"
              class="w-full"
            />
          </IconField>
          <small v-if="v$.apiKey.$invalid && submitted" class="p-error">{{
            v$.apiKey.required.$message
          }}</small>
        </div>
      </TabPanel>
    </TabView>

    <div class="flex justify-content-end">
      <Button
        type="submit"
        class="px-6 login-btn"
        :label="$t('login.login')"
        :disabled="!!loading"
        :loading="!!loading"
      />
    </div>

    <Message v-if="invalidCreds" severity="error" :closable="false">
      {{ $t('login.invalidCreds') }}
    </Message>
  </form>
</template>

<script setup lang="ts">
//Vue
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
// PrimeVue/Validation/etc
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import { useToast } from 'vue-toastification';
import { requiredIf } from '@vuelidate/validators';
import { useVuelidate } from '@vuelidate/core';
// MDI Icons
import SvgIcon from '@jamescoyle/vue-icon';
import {
  mdiCardAccountDetailsOutline,
  mdiEmailOutline,
  mdiKeyOutline,
  mdiLockOutline,
  mdiWalletOutline,
} from '@mdi/js';
// State
import { useTenantStore, useTokenStore } from '../store';
import { storeToRefs } from 'pinia';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
const toast = useToast();
const router = useRouter();

// Icons
const walletIcon = mdiWalletOutline;
const keyOutlineIcon = mdiKeyOutline;
const emailOutlineIcon = mdiEmailOutline;
const lockOutlineIcon = mdiLockOutline;
const tenantOutlineIcon = mdiCardAccountDetailsOutline;

// Tabs
const activeTab = ref(0);

// Login Form and validation
const invalidCreds = ref(false);
const formFields = reactive({
  apiKey: '',
  tenantId: '',
  walletId: '',
  walletSecret: '',
  emailId: '',
  passwordId: '',
});
const rules = {
  apiKey: { required: requiredIf(() => activeTab.value === 2) },
  tenantId: { required: requiredIf(() => activeTab.value === 2) },
  walletId: { required: requiredIf(() => activeTab.value === 1) },
  walletSecret: { required: requiredIf(() => activeTab.value === 1) },
  emailId: { required: requiredIf(() => activeTab.value === 0) },
  passwordId: { required: requiredIf(() => activeTab.value === 0) },
};
const v$ = useVuelidate(rules, formFields);

// State setup
const tokenStore = useTokenStore();
// use the loading state from the store to disable the button...
const { loading, token } = storeToRefs(useTokenStore());
const tenantStore = useTenantStore();

// Form submission
const submitted = ref(false);
const handleSubmit = async (isFormValid: boolean) => {
  invalidCreds.value = false;
  submitted.value = true;
  if (!isFormValid) {
    return;
  }

  // Use the wallet creds to get a token
  try {
    // Trim id/key inputs
    formFields.walletId = formFields.walletId.trim();
    formFields.walletSecret = formFields.walletSecret.trim();
    formFields.tenantId = formFields.tenantId.trim();
    formFields.apiKey = formFields.apiKey.trim();
    formFields.emailId = formFields.emailId.trim();
    formFields.passwordId = formFields.passwordId.trim();
    // Get a token
    if (activeTab.value === 2) {
      await tokenStore.login(formFields.tenantId, formFields.apiKey, true);
    } else if (activeTab.value === 1) {
      await tokenStore.login(
        formFields.walletId,
        formFields.walletSecret,
        false
      );
    } else if (activeTab.value === 0) {
      await tokenStore.login(formFields.emailId, formFields.passwordId, false);
    }
  } catch (err: any) {
    if (err.response?.status === 404 || err.response?.status === 409) {
      // Handle wallet not found or bad password for this as a status not an exception
      invalidCreds.value = true;
    } else {
      toast.error(`Failure getting token: ${err}`);
    }
  }

  // token is loaded, now go fetch the global data about the tenant
  if (token.value) {
    try {
      const results = await Promise.allSettled([
        tenantStore.getSelf(),
        tenantStore.getTenantConfig(),
        tenantStore.getIssuanceStatus(),
      ]);
      // if any the Tenant details fetch fails, throw the first error
      results.forEach((result) => {
        if (result.status === 'rejected') {
          throw result.reason;
        }
      });
      router.push({ name: 'Dashboard' });
    } catch (err) {
      console.error(err);
      toast.error(`Failure getting tenant info: ${err}`);
    } finally {
      submitted.value = false;
    }
  }
};

const emit = defineEmits(['tab-change']);

const handleTabChange = (e: any) => {
  emit('tab-change', e.index);
};
</script>

<style scoped lang="scss">
.tab-container {
  &::v-deep(.p-tabview-panels) {
    padding: 0;
  }
  &::v-deep(li.p-highlight .p-tabview-nav-link) {
    color: #6666cc !important;
    border-bottom-color: #6666cc !important;
  }
  &::v-deep(.p-tabview-nav-link span) {
    font-weight: 600;
    font-size: 16px;
  }
}
.login-title {
  color: #424242;
  font-size: 24px;
}
.icon-size {
  width: 18px;
  margin-top: -5px;
  color: #424242;
}
input {
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
button.p-button.login-btn,
button.p-button:not(.p-button-rounded):not(.p-danger):not(.p-button-text):not(
    .p-button-link
  ):hover {
  box-shadow: 0px 4px 4px 0px rgba(66, 66, 66, 0.2);
  background-color: #6666cc !important;
  font-size: 16px;
  border: none;
  height: 42px;
}
::v-deep(.p-tabview .p-tabview-panels),
::v-deep(.p-tabview .p-tabview-nav li .p-tabview-nav-link),
::v-deep(.p-tabview .p-tabview-nav) {
  background-color: transparent !important;
}
::v-deep(.p-tabview .p-tabview-nav) {
  border-color: #424242;
  border-width: 0 0 1px 0;
  font-family: 'Open Sans';
}
::v-deep(.p-tabview .p-tabview-nav li .p-tabview-nav-link) {
  border-color: transparent transparent #424242 transparent;
  color: $tenant-ui-new-text-on-primary;
}
</style>
