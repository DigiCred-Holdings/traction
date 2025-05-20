<template>
  <div class="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
    <h1 class="text-2xl font-bold mb-4">{{ $t('enrollment.information') }}</h1>

    <section class="mb-4">
      <h2 class="text-xl font-semibold mb-2">
        {{ $t(enrollment.studentInformation) }}
      </h2>
      <p>
        <strong>{{ $t('enrollment.name') }}</strong>
        {{ enrollment.student_full_name }}
      </p>
      <p>
        <strong>{{ $t('enrollment.dateOfBirth') }}</strong>
        {{ enrollment.student_birth_date }}
      </p>
      <p>
        <strong>{{ $t('enrollment.address') }}</strong>
        {{ enrollment.student_address }}
      </p>
      <p>
        <strong>{{ $t('enrollment.phone') }}</strong>
        {{ enrollment.student_phone }}
      </p>
      <p>
        <strong>{{ $t('enrollment.email') }}</strong>
        {{ enrollment.student_email }}
      </p>
    </section>

    <section class="mb-4">
      <h2 class="text-xl font-semibold mb-2">
        {{ $t('enrollment.schoolInfo') }}
      </h2>
      <p>
        <strong>{{ $t('enrollment.name') }}</strong>
        {{ enrollment.school_name }}
      </p>
      <p>
        <strong>{{ $t('enrollment.address') }}</strong>
        {{ enrollment.school_address }}
      </p>
      <p>
        <strong>{{ $t('enrollment.graduationYear') }}</strong>
        {{ enrollment.graduation_date }}
      </p>
      <p>
        <strong>{{ $t('enrollment.gpa') }}</strong> {{ enrollment.gpa }}
      </p>
    </section>

    <section class="mb-4">
      <h2 class="text-xl font-semibold mb-2">{{ $t('enrollment.terms') }}</h2>
      <div
        v-for="(term, i) in enrollment.terms"
        :key="i"
        class="border p-3 mb-3 rounded"
      >
        <p>
          <strong>{{ $t('enrollment.year') }}</strong> {{ term.termYear }}
        </p>
        <p>
          <strong>{{ $t('enrollment.name') }}</strong> {{ term.termSchoolName }}
        </p>
        <p>
          <strong>{{ $t('enrollment.gradeLevel') }}</strong>
          {{ term.termGradeLevel }}
        </p>
        <p>
          <strong>{{ $t('enrollment.credits') }}</strong> {{ term.termCredit }}
        </p>
        <p>
          <strong>{{ $t('enrollment.gpa') }}</strong> {{ term.termGpa }}
        </p>
        <h3 class="font-medium mt-2">{{ $t('enrollment.courses') }}</h3>
        <ul class="list-disc ml-6">
          <li v-for="(course, j) in term.courses" :key="j">
            {{ course.courseTitle }} {{ course.courseCode }}
            {{ $t('common.hypen') }} {{ $t('enrollment.grade') }}
            {{ course.grade }} {{ $t('common.comma') }}
            {{ $t('enrollment.credits') }} {{ course.creditEarned }}
          </li>
        </ul>
      </div>
    </section>

    <section ref="transcriptRef" class="mb-4">
      <h2 class="text-xl font-semibold mb-2">
        {{ $t('enrollment.transcript') }}
      </h2>
      <p>
        <strong>{{ $t('enrollment.program') }}</strong>
        {{ enrollment.transcript.program }}
      </p>
      <p>
        <strong>{{ $t('enrollment.classRank') }}</strong>
        {{ enrollment.transcript.classRank }}
      </p>
      <p>
        <strong>{{ $t('enrollment.gpa') }}</strong>
        {{ enrollment.transcript.gpa }}
      </p>
      <p>
        <strong>{{ $t('enrollment.unweightedGPA') }}</strong>
        {{ enrollment.transcript.gpaUnweighted }}
      </p>
      <p>
        <strong>{{ $t('enrollment.transcriptDate') }}</strong>
        {{ enrollment.transcript.transcriptDate }}
      </p>
      <p>
        <strong>{{ $t('enrollment.transcriptComments') }}</strong>
        {{ enrollment.transcript.transcriptComments }}
      </p>
    </section>

    <button
      class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      @click="downloadPDF"
    >
      {{ $t('enrollment.download') }}
    </button>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue';
import jsPDF from 'jspdf';

const props = defineProps({
  enrollment: {
    type: Object,
    required: true,
  },
});

const transcriptRef = ref(null);

function downloadPDF() {
  const doc = new jsPDF();
  let y = 10;

  doc.setFontSize(14);
  doc.text('Transcript', 10, y);
  y += 10;

  const fields = [
    ['Name', props.enrollment.student_full_name],
    ['Program', props.enrollment.transcript.program],
    ['Class Rank', props.enrollment.transcript.classRank],
    ['Weighted GPA', props.enrollment.transcript.gpa],
    ['Unweighted GPA', props.enrollment.transcript.gpaUnweighted],
    ['Transcript Date', props.enrollment.transcript.transcriptDate],
    ['Comments', props.enrollment.transcript.transcriptComments],
  ];

  doc.setFontSize(11);
  fields.forEach(([label, value]) => {
    doc.text(`${label}: ${value || '-'}`, 10, y);
    y += 8;
  });

  props.enrollment.terms.forEach((term, i) => {
    y += 6;
    doc.setFontSize(12);
    doc.text(`Term ${i + 1}: ${term.termYear} - ${term.termSchoolName}`, 10, y);
    y += 6;
    doc.setFontSize(10);
    term.courses.forEach((course) => {
      doc.text(
        `• ${course.courseTitle} (${course.courseCode}) - Grade: ${course.grade}, Credits: ${course.creditEarned}`,
        12,
        y
      );
      y += 6;
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
    });
  });

  doc.save(`${props.enrollment.student_full_name} - transcript.pdf`);
}
</script>

<style scoped>
p {
  margin-bottom: 4px;
}
</style>
