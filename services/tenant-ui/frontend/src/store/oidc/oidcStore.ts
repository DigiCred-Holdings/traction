import axios from 'axios';
import { defineStore, storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useConfigStore } from '../configStore';
import { UserManager } from 'oidc-client-ts';
import { OidcClient } from 'oidc-client-ts';
import { configStringToObject } from '@/helpers';
import { API_PATH } from '@/helpers/constants';
// import { useTokenStore } from '../tokenStore';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import { useTenantStore, useTokenStore } from '../../store';

class UserManager_TactionOverride extends UserManager {
  private _signinCb: (token: any) => void = (token: any) => {};
  public constructor(...args: ConstructorParameters<typeof UserManager>) {
    super(...args);
  }
  public get_client(): OidcClient {
    return this._client;
  }
  public onSuccessfulSignin(cb: (token: any) => void) {
    this._signinCb = cb;
  }
  public async checkSigninResponseState(
    url: string = window.location.href,
    removeState: boolean = true
  ) {
    const oid_response = await this._client.readSigninResponseState(
      url,
      removeState
    );
    if (oid_response) {
      const loginCfg = {};
      const response: any = await axios.post(
        API_PATH.OIDC_OIDC_LOGIN,
        oid_response,
        loginCfg
      );
      console.log(`OIDC Login Response:`, response.data);
      this._signinCb(response.data);
    }
  }
}

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

  const userManager: UserManager_TactionOverride =
    new UserManager_TactionOverride(settings);

  userManager
    .checkSigninResponseState()

    .then(async (val: any) => {
      console.log('signed in', val);
      loading.value = true;
    })
    .catch((err: any) => {
      console.error(err);
    });

  userManager.onSuccessfulSignin(async (token_response: any) => {
    try {
      // Get the logged in user from the OIDC library
      const oidcUser = await userManager.getUser();
      user.value = oidcUser;
      token.value = token_response.token;
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
    return userManager.signinRedirect({
      prompt: 'select_account',
      scope: 'openid profile email',
    });
  }

  return {
    loading,
    error,
    user,
    login,
  };
});
