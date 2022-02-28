import { showcaseService } from '@/services';
import { Tenants } from '@/utils/constants';

// The store module to hold the current showcase app "sandbox session"
export default {
  namespaced: true,
  state: {
    currentSandbox: null,
    sandboxes: []
  },
  getters: {
    currentSandbox: state => state.currentSandbox,
    sandboxes: state => state.sandboxes,

  },
  mutations: {
    SET_CURRENT(state, currentSandbox) {
      state.currentSandbox = currentSandbox;
    },
    SET_SANDBOXES(state, sandboxes) {
      state.sandboxes = sandboxes;
    },
  },
  actions: {
    // Post a new sandbox
    async createSandbox({ dispatch }, tag) {
      try {
        await showcaseService.createSandbox(tag);
      }
      catch (error) {
        dispatch('notifications/addNotification', {
          message: 'An error occurred while fetching the current sandboxes.',
          consoleError: `Error getting sandboxes: ${error}`,
        }, { root: true });
      }
    },
    // Query the showcase API for current sandbox states
    async getSandboxes({ commit, dispatch }) {
      try {
        // Get the forms based on the user's permissions
        const response = await showcaseService.getSandboxes();
        commit('SET_SANDBOXES', response.data);
      } catch (error) {
        dispatch('notifications/addNotification', {
          message: 'An error occurred while fetching the current sandboxes.',
          consoleError: `Error getting sandboxes: ${error}`,
        }, { root: true });
      }
    },
    // Select a specific sandbox to use for the current session
    async selectSandbox({ commit, state }, id) {
      const toSelect = state.sandboxes.find(s => s.id == id);
      if (toSelect) {
        commit('SET_CURRENT', toSelect);
        commit('alice/SET_TENANT', toSelect.tenants.find(t => t.name = Tenants.ALICE), { root: true });
      }
    },
  }
};