import { createTestingPinia } from '@pinia/testing';
import { flushPromises, mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import { describe, expect, test, vi } from 'vitest';

import LoginForm from '@/components/LoginForm.vue';
import { useTenantStore, useTokenStore } from '@/store';

import { login } from '../__mocks__/validation/forms';
import { tokenStore } from '../__mocks__/store';

// Mocks
vi.mock('vue-router');

const mockRouter = async (name = 'test') => {
  const routerMock = await import('vue-router');
  routerMock.useRoute = vi.fn().mockReturnValue({
    name,
  });
  routerMock.useRouter = vi.fn().mockReturnValue({
    push: vi.fn(),
  });
};

// Tests
const mountLoginForm = () =>
  mount(LoginForm, {
    global: {
      plugins: [PrimeVue, createTestingPinia()],
    },
  });

describe('LoginForm', async () => {
  test('renders with expected inner components', async () => {
    await mockRouter();
    const wrapper = mountLoginForm();

    expect(wrapper.findAllComponents({ name: 'InputText' })).toHaveLength(6);
    wrapper.getComponent({ name: 'Button' });
  });

  test('invalid walletId renders error message', async () => {
    const loginValues = JSON.parse(JSON.stringify(login));
    loginValues.activeTab = 1;
    loginValues.walletId.$invalid = true;
    loginValues.$invalid = true;
    await mockRouter(loginValues);
    const wrapper = mountLoginForm();
    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.html()).toContain('The value is required');
  });

  test('invalid walletSecret renders error message', async () => {
    const loginValues = JSON.parse(JSON.stringify(login));
    loginValues.walletSecret.$invalid = true;
    loginValues.$invalid = true;
    await mockRouter(loginValues);
    const wrapper = mountLoginForm();
    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.html()).toContain('The value is required');
  });
});
