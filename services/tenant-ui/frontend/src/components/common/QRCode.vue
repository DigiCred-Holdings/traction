<template>
  <div v-if="qrContent" class="qr-container">
    <!-- QR Code encoded link -->
    <qrcode-vue
      v-if="qrContent"
      class="qr-image"
      :value="qrContent"
      :size="300"
      level="H"
    />

    <!-- Plain text of link -->
    <!-- <div class="field mt-5 w-full">
      <label for="inviteUrl">{{ $t('common.invitationUrl') }}</label>
      <div class="p-inputgroup">
        <InputText
          id="inviteUrl"
          readonly
          :value="qrContent"
          name="invite-url"
          class="w-full"
        />
        <Button
          icon="pi pi-copy"
          title="Copy to clipboard"
          class="p-button-secondary"
          @click="copy_to_clipboard"
        />
      </div>
    </div> -->
  </div>
  <span v-else>{{ $t('qrCode.noContentFound') }}</span>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import QrcodeVue from 'qrcode.vue';
import { useToast } from 'vue-toastification';
const toast = useToast();

// Props
const props = defineProps({
  qrContent: {
    type: String as PropType<string>,
    required: true,
  },
});

const copy_to_clipboard = () => {
  navigator.clipboard.writeText(props.qrContent);
  toast.info('URL copied to clipboard');
  return;
};
</script>

<style>
.qr-container {
  position: relative;
  z-index: 1;
  margin-left: -4px;
  margin-top: -4px;
}
.qr-image {
  display: flex;
  margin-bottom: 25px;
}
</style>
