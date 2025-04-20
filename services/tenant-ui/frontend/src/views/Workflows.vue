<template>
  <div>
    <WorkflowList v-if="!isEditing" @edit="editWorkflow" @add="addNewWorkflow" />
    <WorkflowEditor v-else :workflow="selectedWorkflow" :webhook-url="webhookUrl" :update="updateWorkflow" @back="backToList" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import WorkflowList from '@/components/workflow/WorkflowList.vue';
import WorkflowEditor from '@/components/workflow/WorkflowEditor.vue';
import { Workflow }  from '@/types/workflow';

const isEditing = ref(false);
let selectedWorkflow = reactive<Workflow>(
  {
    name: "untitled",
    workflow_id: "",
    initial_state: "initial",
    render: [],
    states: [],
  }
);
const webhookUrl = ref();
const updateWorkflow = ref(false);

const editWorkflow = (workflow: any, webhook: string) => {
  console.log("inside Edit Workflow: ",workflow);
  selectedWorkflow = workflow;
  isEditing.value = true;
  updateWorkflow.value = true;
  webhookUrl.value = webhook;
};

const addNewWorkflow = (webhook:string) => {
  console.log("inside Add New Workflow");
  isEditing.value = true;
  webhookUrl.value = webhook;
  updateWorkflow.value = false;
};

const backToList = () => {
  isEditing.value = false;
  selectedWorkflow = {
    name: "untitled",
    workflow_id: "",
    initial_state: "initial",
    render: [],
    states: [],
  };
};

</script>
