<template>
  <div>
    <Enrollment v-if="!selectedRecord" @select="handleSelect" />
    <EnrollmentForm v-else :enrollment="selectedRecord" @back="handleBack" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Enrollment from '@/components/enrollments/Enrollment.vue';
import EnrollmentForm from '@/components/enrollments/EnrollmentForm.vue';

const selectedRecord = ref(null);

function handleSelect(data) {
  selectedRecord.value = data;
}

function handleBack() {
  selectedRecord.value = null;
}
</script>
