<template>
  <div class="card">
    <!-- <div v-for="(item, index) in displayData" :key="index">
        {{ console.log('Item:', item) }}
        <img
          v-if="item.type === 'image'"
          :src="item.url || defaultImage"
          alt="Card image"  
          class="w-10 h-10 mb-2"
        />
        <h1
          v-else-if="item.type === 'title'"
          class="text-lg font-bold text-gray-800"
        >
          {{ item.text }}
        </h1>
        <p
          v-else-if="item.type === 'text'"
          class="text-sm text-gray-700"
        >
          {{ item.text }}
        </p>
        <div class="flex justify-centre items-center mt-4" v-else-if="item.type === 'button'">
            <Button
            class="w-full pi-button text-white font-semibold"
            >
            {{ item.label }}
            </Button>
        </div>
      </div> -->
    <div
      v-for="block in currentState?.display_data"
      :key="JSON.stringify(block)"
      class="block"
    >
      <img v-if="block.type === 'image'" :src="block.url" class="image" />
      <h3
        v-else-if="block.type === 'text' && block.display === 'title'"
        class="title"
      >
        {{ block.text }}
      </h3>
      <p v-else-if="block.type === 'text'" class="text">{{ block.text }}</p>
      <p v-else-if="block.type === 'extended'" class="extended">
        {{ block.text }}
      </p>
      <Button
        v-else-if="block.type === 'button'"
        class="btn pi-button text-white font-semibold"
        @click="handleAction(block.actionID)"
      >
        {{ block.label }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef, ref, watchEffect, onMounted, computed } from 'vue';
import Button from 'primevue/button';
import { Workflow, State } from '@/types/workflow';

const props = defineProps<{ data: Workflow }>();
const workflow = toRef(() => props.data);
const currentStateID = computed({
  get() {
    return workflow.value.initial_state;
  },
  set(value) {
    workflow.value.initial_state = value;
  },
});
console.log(
  'WorkflowRender: Raw props received:',
  JSON.stringify(workflow.value, null, 2)
);
// const displayData = toRef(() => stateData.data)
const currentState = computed<State | undefined>(() =>
  workflow.value.states.find((s) => s.state_id === currentStateID.value)
);
console.log(
  'WorkflowRender: displayData ref value:',
  JSON.stringify(workflow.value, null, 2)
);
const defaultImage =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wallet_Flat_Icon.svg/512px-Wallet_Flat_Icon.svg.png';
function handleAction(actionID: string) {
  const transition = currentState.value?.transitions.find(
    (t) => t.transition_id === actionID
  );
  if (transition) {
    currentStateID.value = transition.state_id;
  }
}
watchEffect(() => {
  console.log(
    'WorkflowRender: watchEffect triggered. Current displayData:',
    JSON.stringify(workflow.value, null, 2)
  );
});

onMounted(() => {
  console.log(
    'WorkflowRender: Component mounted. displayData:',
    JSON.stringify(workflow.value, null, 2)
  );
});
</script>

<style scoped>
.block {
  margin-bottom: 1rem;
  text-align: center;
}
.card {
  max-width: 80%;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  background-color: #c8c8ce;
  padding: 0.5rem;
  color: black;
  display: flex;
  flex-direction: column;
}
.image {
  max-width: 100%;
  border-radius: 1rem;
}

.title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-top: 0.5rem;
}

.text,
.extended {
  font-size: 1rem;
  margin: 0.25rem 0;
}
</style>
