// Main dashboard
import Dashboard from '@/views/Dashboard.vue';
import About from '@/views/About.vue';
import Onboarding from '@/views/Onboarding.vue';
import Transcript from '@/views/transcript/Transcript.vue';
import Workflows from '@/views/Workflows.vue';
import { RouteRecordRaw } from 'vue-router';
import Enrollment from '@/views/Enrollment.vue';

// Tenant
import TenantUi from '@/views/TenantUi.vue';
import Profile from '@/views/tenant/Profile.vue';
import Settings from '@/views/tenant/Settings.vue';
import Developer from '@/views/tenant/Developer.vue';
// Connections
import MyConnections from '@/views/connections/MyConnections.vue';
import MyInvitations from '@/views/connections/MyInvitations.vue';
// Issuance
import MyIssuedCredentials from '@/views/issuance/MyIssuedCredentials.vue';
import Schemas from '@/views/issuance/Schemas.vue';
import CredentialDefinitions from '@/views/issuance/CredentialDefinitions.vue';
//Bulk Issue
import BulkIssue from '@/views/bulkIssue/BulkIssue.vue';
// // Verifictation
import MyPresentations from '@/views/verification/MyPresentations.vue';
// // Holder
import MyHeldCredentials from '@/views/holder/MyHeldCredentials.vue';
// Messages
import MyMessages from '@/views/messages/MyMessages.vue';
// OCA
import Oca from '@/views/oca/Oca.vue';
// API Keys
import ApiKeys from '@/views/ApiKeys.vue';
// Log
import Log from '@/views/Log.vue';
// Const
import { RESERVATION_STATUS_ROUTE } from '@/helpers/constants';
// Tablet
import OnboardingTablet from '@/views/OnboardingTablet.vue';
// import i18n from '@/plugins/i18n/i18n';

import MyMessages_new from '@/views/messagesNew/MyMessages_new.vue';

const tenantRoutes: RouteRecordRaw[] = [
  // Tenant Routes (base / is Tenant side for this app)
  {
    path: '/',
    name: 'TenantUi',
    component: TenantUi,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: 'Dashboard' },
      },

      // About
      {
        path: '/onboarding',
        name: 'onboarding',
        component: Onboarding,
        meta: { title: 'Onboarding' },
      },
      {
        path: '/workflow-list',
        name: 'Workflows',
        component: Workflows,
      },
      //Enrollment
      {
        path: '/enrollment',
        name: 'Enrollment',
        component: Enrollment,
      },
      // Transcript
      // About
      {
        path: '/transcript',
        name: 'transcript',
        component: Transcript,
        meta: { title: 'Transcript' },
      },

      // About
      {
        path: '/about',
        name: 'About',
        component: About,
      },

      // Tenant - Setup etc
      {
        path: '/tenant/',
        children: [
          {
            path: 'profile',
            name: 'Profile',
            component: Profile,
          },
          {
            path: 'settings',
            name: 'Settings',
            component: Settings,
            meta: { title: 'Settings' },
          },
          {
            path: 'developer',
            name: 'Developer',
            component: Developer,
          },
        ],
      },

      // Tenant - Connections
      {
        path: '/connections/',
        children: [
          {
            path: '',
            name: 'MyConnections',
            component: MyConnections,
          },
          {
            path: 'invitations',
            name: 'MyInvitations',
            component: MyInvitations,
          },
        ],
      },

      // Tenant - Schemas, templates etc
      {
        path: 'schemas',
        name: 'Schemas',
        component: Schemas,
      },
      {
        path: 'credentialDefinitions',
        name: 'CredentialDefinitions',
        component: CredentialDefinitions,
      },
      {
        path: 'oca',
        name: 'OCA',
        component: Oca,
      },

      // Tenant - Issuer
      {
        path: '/issuance/',
        children: [
          {
            path: 'credentials',
            name: 'MyIssuedCredentials',
            component: MyIssuedCredentials,
          },
        ],
      },

      // Tenant - Bulk Issue
      {
        path: '/bulkIssue',
        name: 'BulkIssue',
        component: BulkIssue,
      },

      // Tenant - Verifier
      {
        path: '/verification/',
        children: [
          {
            path: 'verifications',
            name: 'MyPresentations',
            component: MyPresentations,
          },
        ],
      },

      // Tenant - Holder
      {
        path: '/holder/',
        children: [
          {
            path: 'credentials',
            name: 'MyHeldCredentials',
            component: MyHeldCredentials,
          },
        ],
      },

      // Tenant - Messages
      {
        path: '/messages',
        children: [
          {
            path: 'recent',
            name: 'MyMessages',
            component: MyMessages,
          },
        ],
      },

      // Tenant - New Messages
      {
        path: 'messages-new',
        name: 'MyMessages-new',
        component: MyMessages_new,
      },

      // Tenant - API Keys
      {
        path: 'authentications/keys',
        name: 'ApiKeys',
        component: ApiKeys,
      },

      // Tenant - Log
      {
        path: 'log',
        name: 'Log',
        component: Log,
      },
    ],
  },
  // Direct back to the status checking page for reservations
  {
    path: `/${RESERVATION_STATUS_ROUTE}`,
    name: 'TenantUiReservationStatus',
    component: TenantUi,
  },
  // Onboarding Tablet
  {
    path: '/onboardingTablet',
    name: 'onboardingTablet',
    component: OnboardingTablet,
  },
];

export default tenantRoutes;
