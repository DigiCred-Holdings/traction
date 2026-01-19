import axios from 'axios';
import { defineStore, storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useConfigStore } from '../configStore';
import { UserManager } from 'oidc-client-ts';
import { configStringToObject } from '@/helpers';
import { API_PATH } from '@/helpers/constants';
// import { useTokenStore } from '../tokenStore';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import { useTenantStore, useTokenStore } from '../../store';

export const useOidcStore = defineStore('oidcStore', () => {
  // Stores
  const { config } = storeToRefs(useConfigStore());
  const { token } = storeToRefs(useTokenStore());
  const toast = useToast();
  const router = useRouter();

  const settings: any = {
    authority: config.value.frontend.oidc.authority,
    client_id: config.value.frontend.oidc.client,
    redirect_uri: `${window.location.origin}`,
    response_type: 'code',
    automaticSilentRenew: false,
    post_logout_redirect_uri: `${window.location.origin}`,
    loadUserInfo: true,
    extraQueryParams: configStringToObject(
      config.value.frontend.oidc.extraQueryParams || ''
    ),
  };

  const userManager: UserManager = new UserManager(settings);

  userManager
    .signinRedirectCallback()
    .then(() => {
      loading.value = true;
    })
    .catch((err) => {
      console.error(err);
    });

  userManager.events.addUserLoaded(async () => {
    try {
      // Get the logged in user from the OIDC library
      const oidcUser = await userManager.getUser();
      user.value = oidcUser;

      const loginCfg = {
        headers: { Authorization: `Bearer ${oidcUser?.access_token}` },
      };
      const response: any = await axios.get(
        // API_PATH.OIDC_INNKEEPER_LOGIN,
        API_PATH.OIDC_OIDC_LOGIN,
        loginCfg
      );
      token.value = response.data.token;
      if (token.value) localStorage.setItem('token', token.value);

      // Strip the oidc return params
      window.history.pushState({}, document.title);

      // token is loaded, now go fetch the global data about the tenant
      if (token.value) {
        try {
          const tenantStore = useTenantStore();
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
        }
      }

    } catch (err: any) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  });

  // State
  const loading: any = ref(false);
  const error: any = ref(null);
  const user: any = ref(null);

  // Getters

  // Ations
  async function login() {
    loading.value = true;
    return userManager.signinRedirect();
  }

  return {
    loading,
    error,
    user,
    login,
  };
});
