<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useConnectionStore, useTenantStore, useMessageStore } from '@/store';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';

const tenantStore = useTenantStore();
const connectionStore = useConnectionStore();
const messageStore = useMessageStore();
const { filteredConnections } = storeToRefs(useConnectionStore());
const toast = useToast();
const { t } = useI18n();

// Message state
const message = ref('');
const showDialog = ref(false);
const sendingStatus = ref<Record<string, 'pending' | 'sent' | 'error' | null>>(
  {}
);
const broadcastStarted = ref(false);

onMounted(async () => {
  await loadTenantSettings();
  await loadConnections();
});

const loadTenantSettings = async () => {
  try {
    await tenantStore.getTenantSubWallet();
  } catch (error) {
    console.error('Failed to load tenant settings:', error);
  }
};

const loadConnections = async () => {
  try {
    await connectionStore.listConnections();
  } catch (error) {
    console.error('Failed to load connections:', error);
    toast.error(t('common.failedToLoad'));
  }
};

const openSendDialog = () => {
  if (!message.value.trim()) {
    toast.error(t('messages.enterMessage'));
    return;
  }

  // Reset status for all connections - initially no status
  sendingStatus.value = {};
  broadcastStarted.value = false;

  showDialog.value = true;
};

const sendMessage = async (connectionId: string) => {
  try {
    // Use messageStore to send message instead of direct axios call
    await messageStore.sendMessage(connectionId, {
      content: message.value,
    });

    // Update status to sent
    sendingStatus.value[connectionId] = 'sent';
  } catch (error) {
    console.error(
      `Failed to send message to connection ${connectionId}:`,
      error
    );
    sendingStatus.value[connectionId] = 'error';
  }
};

const startBroadcast = () => {
  // Mark broadcast as started
  broadcastStarted.value = true;

  // Set all connections to pending status
  filteredConnections.value.forEach((conn) => {
    if (conn.connection_id) {
      sendingStatus.value[conn.connection_id] = 'pending';
    }
  });

  // Now start the actual broadcast
  broadcastMessage();
};

const broadcastMessage = async () => {
  // Send messages to all connections in parallel
  const sendPromises = filteredConnections.value
    .filter((conn) => conn.connection_id)
    .map((conn) => sendMessage(conn.connection_id as string));

  try {
    await Promise.allSettled(sendPromises);
    toast.success(t('messages.broadcastComplete'));
  } catch (error) {
    console.error('Error during broadcast:', error);
  }
};
</script>

<template>
  <div class="message-broadcast-container p-4">
    <h1 class="text-xl font-bold mb-4">
      {{ $t('messages.broadcastMessage') }}
    </h1>

    <div class="message-input-container mb-4">
      <label for="messageInput" class="block mb-2 font-medium">{{
        $t('messages.messageContent')
      }}</label>
      <Textarea
        id="messageInput"
        v-model="message"
        rows="5"
        class="w-full"
        :placeholder="$t('messages.typePlaceholder')"
      />
    </div>

    <div class="actions-container">
      <Button
        :label="$t('messages.sendToAllConnections')"
        icon="pi pi-send"
        class="p-button-primary"
        @click="openSendDialog"
      />
    </div>

    <!-- Connections Dialog -->
    <Dialog
      v-model:visible="showDialog"
      :header="$t('messages.sendingToConnections')"
      :modal="true"
      :closable="!broadcastStarted"
      class="w-full md:w-8 lg:w-6"
    >
      <div class="connections-list p-2">
        <div
          v-for="conn in filteredConnections"
          :key="conn.connection_id || ''"
          class="connection-item flex align-items-center justify-content-between p-3 mb-2"
        >
          <div class="connection-details">
            <span class="connection-name font-medium">{{
              conn.alias || $t('common.unnamedConnection')
            }}</span>
            <span class="connection-id text-sm text-color-secondary block">{{
              conn.connection_id
            }}</span>
          </div>

          <div class="connection-status">
            <!-- Only show status when broadcast has started -->
            <template v-if="broadcastStarted && conn.connection_id">
              <!-- Pending status with loading icon -->
              <span
                v-if="sendingStatus[conn.connection_id] === 'pending'"
                class="status-pending"
              >
                <i class="pi pi-spin pi-spinner mr-2"></i>
                {{ $t('messages.sending') }}
              </span>

              <!-- Sent status with check icon -->
              <span
                v-else-if="sendingStatus[conn.connection_id] === 'sent'"
                class="status-sent text-green-600"
              >
                <i class="pi pi-check-circle mr-2"></i>
                {{ $t('messages.messageSent') }}
              </span>

              <!-- Error status with warning icon -->
              <span
                v-else-if="sendingStatus[conn.connection_id] === 'error'"
                class="status-error text-red-600"
              >
                <i class="pi pi-times-circle mr-2"></i>
                {{ $t('messages.failedToSend') }}
              </span>
            </template>
            <span v-else class="status-ready">
              {{ $t('messages.readyToSend') }}
            </span>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          :label="$t('messages.startBroadcast')"
          icon="pi pi-send"
          class="p-button-primary"
          @click="startBroadcast"
          :disabled="broadcastStarted"
        />
        <Button
          :label="$t('common.close')"
          icon="pi pi-times"
          class="p-button-secondary ml-2"
          @click="showDialog = false"
          :disabled="broadcastStarted"
        />
      </template>
    </Dialog>
  </div>
</template>

<style lang="scss" scoped>
.message-broadcast-container {
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0px 4px 10px rgba(66, 66, 66, 0.1);
}

.connection-item {
  background-color: #f8f9fa;
  border-radius: 4px;

  &:hover {
    background-color: #f1f3f5;
  }
}

.status-pending {
  color: #6c757d;
}

.status-sent {
  color: #28a745;
}

.status-error {
  color: #dc3545;
}

.status-ready {
  color: #6c757d;
  font-style: italic;
}
</style>
