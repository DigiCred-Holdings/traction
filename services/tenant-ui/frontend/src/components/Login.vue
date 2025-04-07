<template>
  <div class="traction-login grid w-screen flex-grow-1 mt-0">
    <div class="lg:col-6 col-12 p-0 overflow-hidden left-bg">
      <div class="py-8 lg:ml-8 lg:text-left text-center">
        <img src="/img/digicred/logoDigiCred.png" />
      </div>
      <div class="lg:px-8 px-4">
        <!-- Logging In -->
        <div v-if="loginMode === LOGIN_MODE.SIGNIN" class="pt-6">
          <LoginForm @tab-change="handleTabChange" />
          <div
            v-if="
              stringOrBooleanTruthy(config.frontend.showOIDCReservationLogin)
            "
            class="oidc-login"
          >
            <hr />
            <div v-if="!user" class="oidc-choice">
              <span class="mb-0">{{ $t('admin.orRequestAccessWith') }}</span>
              <LoginOIDC class="mt-0" />
            </div>
          </div>

          <div
            v-if="
              (user ||
                !stringOrBooleanTruthy(
                  config.frontend.showOIDCReservationLogin
                )) &&
              currentTab === 1
            "
          >
            <p class="login-mode-margin">
              {{ $t('login.noAccount') }}
              <a
                href="#"
                class="p-button-link login-mode"
                @click.prevent="loginMode = LOGIN_MODE.RESERVE"
                >{{ $t('login.createRequest') }}</a
              >
            </p>
            <!-- 
            <p>
              {{ $t('login.submittedRequest') }}
              <a
                href="#"
                class="p-button-link login-mode"
                @click.prevent="loginMode = LOGIN_MODE.STATUS"
                >{{ $t('login.checkStatus') }}</a
              >
            </p> -->
          </div>
        </div>

        <!-- Making Reservation -->
        <div v-else-if="loginMode === LOGIN_MODE.RESERVE" class="pt-6 pb-4">
          <Button
            :label="$t('login.backToSignIn')"
            icon="pi pi-arrow-left"
            class="p-button-text"
            @click="goBack($event)"
          />
          <Reserve />
        </div>

        <!-- Checking Status -->
        <div v-else-if="loginMode === LOGIN_MODE.STATUS" class="pt-6 pb-4">
          <Button
            :label="$t('login.backToSignIn')"
            icon="pi pi-arrow-left"
            class="p-button-text"
            @click="goBack($event)"
          />
          <Status />
        </div>

        <!-- Show OIDC user if logged in -->
        <div
          v-if="stringOrBooleanTruthy(config.frontend.showOIDCReservationLogin)"
        >
          <div class="flex justify-content-end mt-4">
            <OidcUserDisplayVue />
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-6 col-12 p-0 overflow-hidden cover-image">
      <div class="flex flex-column h-full">
        <div class="lg:p-8 px-4 py-8 lg:ml-8 testimonial-section">
          <div class="text-white mb-3">
            {{ $t('login.credentialingProcess') }}
          </div>
          <div class="text-white">
            {{ $t('login.credentialingProcessTitle') }}
          </div>
        </div>
        <div class="dashboard-preview ml-8" />
      </div>
    </div>
  </div>
  <SessionTimeoutModal />
</template>

<script setup lang="ts">
import LoginOIDC from '@/components/oidc/LoginOIDC.vue';

// Vue
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// PrimeVue
import Button from 'primevue/button';
import { useConfirm } from 'primevue/useconfirm';
// Components
import LoginForm from '@/components/LoginForm.vue';
import OidcUserDisplayVue from './reservation/user/OidcUserDisplay.vue';
import Reserve from './reservation/Reserve.vue';
import Status from './reservation/Status.vue';
import SessionTimeoutModal from './common/SessionTimeoutModal.vue';
import { stringOrBooleanTruthy } from '@/helpers';
// State
import { storeToRefs } from 'pinia';
import { useConfigStore, useReservationStore, useOidcStore } from '@/store';

import { RESERVATION_STATUSES } from '@/helpers/constants';

const reservationStore = useReservationStore();
const { config } = storeToRefs(useConfigStore());
const { status } = storeToRefs(useReservationStore());
const { user } = storeToRefs(useOidcStore());

const route = useRoute();
const router = useRouter();

const confirm = useConfirm();

// Other login form swtiching
enum LOGIN_MODE {
  SIGNIN,
  RESERVE,
  STATUS,
}
const loginMode = ref(LOGIN_MODE.SIGNIN);
if (route.name === 'TenantUiReservationStatus') {
  loginMode.value = LOGIN_MODE.STATUS;
}

const currentTab = ref(0);

const handleTabChange = (tabIndex: number) => {
  currentTab.value = tabIndex;
};

const goBack = (event: any) => {
  if (status.value === RESERVATION_STATUSES.SHOW_WALLET) {
    confirm.require({
      target: event.currentTarget,
      message:
        'Are you sure you want to leave this page? You will not be able to retrieve these details again.',
      header: 'Have you saved your Wallet ID and Key Somewhere?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        doGoBack();
      },
    });
  } else {
    doGoBack();
  }
};
const doGoBack = () => {
  loginMode.value = LOGIN_MODE.SIGNIN;
  reservationStore.resetState();
  router.push('/');
};
</script>

<style scoped lang="scss">
// See layout.scss for generalized common login layout stuff
.cover-image {
  background-color: #6666cc;
  display: flex;
  flex-direction: column;
}
.testimonial-section {
  padding-left: 50px !important;
  font-size: 20px;
  > div:first-child {
    font-weight: 700;
  }
  > div:last-child {
    font-weight: 400;
  }
}
.dashboard-preview {
  position: relative;
  background-position: left top;
  background-size: cover;
  background-repeat: no-repeat;
  background-image: url('/img/digicred/loginDash.png');
  height: 100%;
  right: -50px;
}
.left-bg {
  background-color: #f4f4f4;
}
.p-button-link.login-mode {
  color: #6666cc !important;
}
.login-mode-margin {
  margin-top: -30px;
}
@media (max-width: 991px) {
  .left-bg {
    padding-bottom: 50px !important;
  }
  .cover-image {
    min-height: 500px;
  }
  .login-mode-margin {
    margin-top: -30px;
  }
}
</style>
