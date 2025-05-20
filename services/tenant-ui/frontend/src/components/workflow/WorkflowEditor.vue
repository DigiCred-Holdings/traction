<template>
  <div class="header">
    <Button
      label="Back"
      icon="pi pi-angle-left"
      class="pi-button"
      @click="$emit('back')"
    />
    <h2>{{ update ? $t('workflow.edit') : $t('workflow.create') }}</h2>
  </div>
  <div class="json-panel-container">
    <!-- Left Panel -->
    <div ref="leftPane" class="json-panel">
      <div class="toolbar">
        <span class="title">{{ workflowName }}</span>
      </div>

      <div class="json-editor">
        <JsonEditorVue
          v-bind="jsonEditorSettings"
          v-model="jsonData"
          :stringified="false"
          style="height: 65vh"
          @update:model-value="onEditorUpdate"
        />
      </div>
    </div>
    <!-- <div class="resizer vertical" @mousedown="e => startResize(e, 'vertical')"></div> -->
    <!-- Right Panel -->
    <div ref="topRightPane" class="render-panel">
      {{
        console.log(
          `WorkflowEditor: ${jsonData.name}:`,
          JSON.stringify(jsonData, null, 2)
        )
      }}
      <WorkflowCard :data="workflowData" />
      <!-- <div class="resizer horizontal" @mousedown="e => startResize(e, 'horizontal')"></div> -->
      <div ref="bottomRightPane" class="bottom">
        <Button
          label="Reset-UI"
          icon="pi pi-refresh"
          class="pi-button"
          @click="reset"
        />
        <Button
          label="Save"
          icon="pi pi-save"
          class="pi-button"
          @click="save"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import JsonEditorVue from 'json-editor-vue';
import WorkflowCard from '@/components/workflow/WorkflowRender.vue';
import Button from 'primevue/button';
import { Workflow, State } from '@/types/workflow';
import { useToast } from 'vue-toastification';
import { webhookService } from '@/services/webhookService';

const emit = defineEmits(['back']);
const toast = useToast();
const { workflow, webhookUrl, update } = defineProps({
  workflow: {
    type: Object as () => Workflow,
    required: true,
  },
  webhookUrl: {
    type: String,
    default: null,
  },
  update: {
    type: Boolean,
  },
});

console.log('inside WorkflowEditor: ', workflow);

const jsonEditorSettings = {
  mainMenuBar: true,
  mode: 'text' as any,
  statusBar: true,
  navigationBar: true,
  indentation: 2,
  tabSize: 2,
};
const jsonData = ref<Workflow>(JSON.parse(JSON.stringify(workflow)));

console.log(
  'WorkflowEditor: Initial jsonData:',
  JSON.stringify(jsonData, null, 2)
);

const workflowData = computed(() => (jsonData.value ?? {}) as Workflow);

console.log(
  'WorkflowEditor: Initial data computed:',
  JSON.stringify(workflowData.value, null, 2)
);

// Computed property for the name to help with template type inference
const workflowName = computed(() => jsonData.value.name);

/** Called every time <JsonEditorVue> emits update:modelValue */
const onEditorUpdate = (val: Workflow | string) => {
  console.log('JSON updated ➡️', val);
};

// Watcher for side-effects (or additional debugging)
watch(
  jsonData,
  (newValue, oldValue) => {
    console.log('Deep watch ➡️ ', newValue);
  },
  { deep: true }
);

// Resizalble panes (commented out for now)
// const leftPane = ref<HTMLElement|null>(null)
// const topRightPane = ref<HTMLElement|null>(null)
// const bottomRightPane = ref<HTMLElement|null>(null)

// let isResizing = false
// let isVertical = true
// let scrollState = { top: 0, left: 0 }

// const LEFT_WIDTH_KEY = 'leftPaneWidth'
// const TOP_RIGHT_HEIGHT_KEY = 'topRightPaneHeight'

// function startResize(e: MouseEvent, direction: 'vertical' | 'horizontal') {
//   isResizing = true
//   isVertical = direction === 'vertical'

//   const targetPane = isVertical ? leftPane.value : topRightPane.value
//   if (targetPane) {
//     scrollState.left = targetPane.scrollLeft
//     scrollState.top = targetPane.scrollTop
//   }

//   document.addEventListener('mousemove', handleMouseMove)
//   document.addEventListener('mouseup', stopResize)
// }

// function handleMouseMove(e:MouseEvent) {
// if (!isResizing) return

// if (isVertical && leftPane.value) {
//   const newWidth = e.clientX
//   leftPane.value.style.flexBasis = `${newWidth}px`
//   localStorage.setItem(LEFT_WIDTH_KEY, newWidth.toString())

//   leftPane.value.scrollLeft = scrollState.left
//   leftPane.value.scrollTop = scrollState.top
// } else if (!isVertical && topRightPane.value) {
//   const containerTop = topRightPane.value.parentElement?.getBoundingClientRect().top || 0
//   const newHeight = e.clientY - containerTop
//   topRightPane.value.style.flexBasis = `${newHeight}px`
//   localStorage.setItem(TOP_RIGHT_HEIGHT_KEY, newHeight.toString())

//   topRightPane.value.scrollLeft = scrollState.left
//   topRightPane.value.scrollTop = scrollState.top
// }
// }

// function stopResize() {
//   isResizing = false
//   document.removeEventListener('mousemove', handleMouseMove)
//   document.removeEventListener('mouseup', stopResize)
// }

// onMounted(() => {
//   // Restore dimensions from localStorage
//   const leftWidth = localStorage.getItem(LEFT_WIDTH_KEY)
//   if (leftWidth && leftPane.value) {
//     leftPane.value.style.flexBasis = `${leftWidth}px`
//   }

//   const topHeight = localStorage.getItem(TOP_RIGHT_HEIGHT_KEY)
//   if (topHeight && topRightPane.value) {
//     topRightPane.value.style.flexBasis = `${topHeight}px`
//   }
// })

// onBeforeUnmount(() => stopResize())

const reset = () => {
  const newData = JSON.parse(JSON.stringify(jsonData.value));
  newData.initial_state = 'menu'; // Update the reactive `jsonData` to trigger re-render
  Object.assign(workflowData.value, newData);
  console.log('Workflow refreshed with new data:', workflowData.value);
};

const save = async () => {
  // Create a clean, non-proxied copy of the current data
  let dataToSave;
  try {
    dataToSave = JSON.parse(JSON.stringify(jsonData.value));
  } catch (error) {
    console.error('Error creating clean data copy for saving:', error);
    toast.error('Error preparing data for saving: Invalid JSON format.');
    return; // Stop if data is not valid JSON
  }

  console.log('update:', update);
  console.log('Saving data:', JSON.stringify(dataToSave, null, 2)); // Log the data being sent

  try {
    if (webhookUrl) {
      console.log(
        `Sending ${update ? 'update' : 'create'} request for workflow`
      );

      if (update) {
        await webhookService.updateWorkflow(webhookUrl, dataToSave);
      } else {
        await webhookService.createWorkflow(webhookUrl, dataToSave);
      }

      const successMessage = update
        ? 'Workflow Updated Successfully'
        : 'Workflow Created Successfully';
      toast.success(successMessage);
      console.log(
        update ? 'Workflow Data Updated:' : 'Workflow Data Saved:',
        dataToSave
      );
      emit('back');
    } else {
      console.error('Webhook URL is missing, cannot save.');
      toast.error('Cannot save workflow: Webhook URL is missing.');
    }
  } catch (error) {
    console.error('Error updating workflow:', error);
    toast.error(`Error updating workflow: ${error}`);
  }
};

watch(
  () => jsonData.value.name,
  (newVal) => {
    console.log('Workflow name changed:', newVal);
  }
);
</script>

<style scoped lang="scss">
.header {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  justify-content: space-between;
  margin-bottom: 15px;
}

.json-panel-container {
  display: flex;
  gap: 10px;
  justify-content: space-between;
  background: #f4f4f9;
  padding: 1% 0;
}

.json-panel {
  overflow: auto;
  background: $tenant-ui-new-accent-color;
  border-radius: 3px 0 0 3px;
  color: white;
  box-sizing: border-box;
  position: relative;
  height: 100%;
  width: 60vw;
  margin: 0 auto;
}

.json-editor {
  background: white;
  color: black;
  max-height: 100%;
  max-width: 100%;
  border-radius: 3px;
  --jse-theme-color: #6666ccea;
  --jse-theme-color-highlight: #5a5ab0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0 8px 8px;
}

.render-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  background: #f4f4f9;
  height: 70%;
  align-items: center;
}

.workflow-card {
  padding: 0 10px;
  background: #f4f4f9;
  border-radius: 0 4px 0 0;
  display: flex;
  width: 100%;
  overflow: auto;
  justify-content: center;
}

.bottom {
  display: flex;
  overflow: auto;
  background: #f4f4f9;
  border-radius: 0 0 4px;
  gap: 20px;
  padding: 10px;
  justify-content: space-evenly;
  width: 90%;
}
.bottom button {
  color: white;
  border: none;
  margin: 0 5px;
}
button {
  background-color: $tenant-ui-new-accent-color;
}
.title {
  font-size: 18px;
  font-weight: bold;
}

.actions {
  display: flex;
  gap: 5px;
}

.editor-tabs {
  margin-top: 10px;
}

.editor-tabs button {
  background: transparent;
  border: none;
  color: white;
  padding: 5px 10px;
  cursor: pointer;
}

.editor-tabs button.active {
  font-weight: bold;
  border-bottom: 2px solid white;
}

.resizer {
  background: #aaa;
  z-index: 10;
}

.resizer.vertical {
  width: 5px;
  cursor: col-resize;
}

.resizer.horizontal {
  height: 5px;
  cursor: row-resize;
}

.json-textarea {
  width: 100%;
  height: 200px;
  font-family: monospace;
  border: none;
  outline: none;
}
</style>
