<!-- eslint-disable vue-i18n/no-raw-text -->
<template>
  <div
    ref="printableView"
    class="transcript-printable-view transcript-page-1-content"
  >
    <div class="header-section">
      <div class="info-grid">
        <div class="info-left">
          <b>District Name: {{ enrollment.student_info.schoolDistrict }}</b>
          <br />
          <b>{{ enrollment.school_name }} Official Transcript</b>
          <p>Accreditation: {{ enrollment.student_info.schoolAccreditation }}</p>
          <p>
            School CEEB Code: {{ enrollment.student_info.schoolCeebCode }} School Code:
            {{ enrollment.student_info.schoolCode }}
          </p>
          <p>
            Tel: {{ enrollment.student_info.schoolPhone }} Fax: {{ enrollment.student_info.schoolFax }}
          </p>
          <p>{{ enrollment.student_info.schoolAddress }}</p>
        </div>
        <div class="info-right" align="right">
          <b>
            {{ enrollment.student_full_name }}
          </b>
          <p>
            Student Number: {{ enrollment.student_number }} Grade:
            {{ enrollment.student_grade }} Tel:
            {{ enrollment.student_phone }}
          </p>
          <p>{{ enrollment.student_address }}</p>
          <p>Generated on {{ enrollment.transcript.transcriptDate }}</p>
        </div>
      </div>
    </div>

    <div class="detail-column">
      <div class="term-block">
        <div class="detail-header">
          <b>Student Information</b>
        </div>
        <div class="detail-body student-information-body">
          <table>
            <tbody>
              <tr>
                <td>Student Number:</td>
                <td>{{ enrollment.student_number }}</td>
              </tr>
              <tr>
                <td>Birth Date:</td>
                <td>{{ enrollment.student_birth_date }}</td>
              </tr>
              <tr>
                <td>State ID:</td>
                <td>{{ enrollment.student_info.studentStateId }}</td>
              </tr>
              <tr>
                <td>Principal:</td>
                <td>{{ enrollment.student_info.schoolPrincipal }}</td>
              </tr>
              <tr>
                <td>Course of Study:</td>
                <td>{{ enrollment.transcript.program }}</td>
              </tr>
              <tr>
                <td>Expected Graduation Year:</td>
                <td>{{ enrollment.student_info.graduationDate }}</td>
              </tr>
              <tr>
                <td>Grade:</td>
                <td>{{ enrollment.student_info.gradeLevel }}</td>
              </tr>
              <tr>
                <td>Sex:</td>
                <td>{{ enrollment.student_info.studentSex }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="term-block">
        <div class="detail-header">
          <b>GPA Summary</b>
        </div>
        <div class="detail-body">
          <table>
            <tbody>
              <tr>
                <td><b>Cumulative GPA</b> (Weighted)</td>
                <td>{{ enrollment.gpa }}</td>
              </tr>
              <tr>
                <td><b>Class Rank</b></td>
                <td>{{ enrollment.transcript.classRank }}</td>
              </tr>
              <tr>
                <td><b>Cumulative GPA</b> (Unweighted)</td>
                <td>{{ enrollment.transcript.gpaUnweighted }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div
        v-for="(term, termIndex) in enrollment.terms"
        :key="'term-' + termIndex"
        class="term-block"
      >
        <div class="detail-header">
          <b>{{ term.termYear }}</b>
        </div>
        <div class="detail-body">
          <p style="margin: 0; font-weight: bold; text-align: center;">#{{ term.termSchoolCode }} {{ term.termSchoolName }}</p>
          <p style="margin: 0; font-weight: bold">Grade: {{ term.termGradeLevel }}</p>
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Mark</th>
                <th>Weight</th>
                <th>Credit</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(course, courseIndex) in term.courses"
                :key="'course-' + termIndex + '-' + courseIndex"
              >
                <td>{{ course.courseCode }} {{ course.courseTitle }}</td>
                <td>{{ course.grade }}</td>
                <td>{{ course.courseWeight }}</td>
                <td>{{ course.creditEarned }}</td>
                <!-- TODO add flag for UNC Min Req. -->
              </tr>
            </tbody>
          </table>
          <b>
            Credit: {{ term.termCredit }} GPA: {{ term.termGpa }} U/W GPA:
            {{ term.termUnweightedGpa }}
          </b>
        </div>
      </div>
      <!-- TODO, conditional logic for in-progress term
      <div class="detail-header">
        <b>In-Progress Courses<b>
      </div>
      <div class="detail-body"></div> -->
      <div class="term-block">
        <div class="detail-header">
          <b>Standard Tests</b>
        </div>
        <div class="detail-body">
          <div
            v-for="(test, testIndex) in parsedTests"
            :key="'test-' + testIndex"
            class="test-entry"
          >
            <p style="margin: 0; font-weight: bold">{{ test.testTitle }}</p>
            <p style="margin: 0; text-indent: 2em">
              Result:{{ test.testScore }} Date:{{ test.testDate }}
            </p>
          </div>
        </div>
      </div>
      <div class="term-block">
        <div class="detail-header left-align">
          <b>
            <u>Credit Summary</u><br />
            Curriculum Program: {{ enrollment.transcript.program }}<br />
            Requirements
          </b>
        </div>
        <div class="detail-body">
          <table>
            <thead>
              <tr>
                <th><u>HS</u></th>
                <th>Attempted</th>
                <th>Earned</th>
                <th>Required</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(creditLine, creditLineIndex) in parsedCreditSummary"
                :key="'credit-' + creditLineIndex"
              >
                <td>{{ creditLine.creditSubject }}</td>
                <td>{{ creditLine.creditAttempted }}</td>
                <td>{{ creditLine.creditEarned }}</td>
                <td>{{ creditLine.creditRequired }}</td>
                <td>{{ creditLine.creditRemaining }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="term-block">
        <div class="detail-header">
          <b>Comments</b>
        </div>
        <div class="detail-body">
          {{ enrollment.transcript.transcriptComments }}
        </div>
      </div>
    </div>
    <div class="signature-section">
      <img src="./verified-stamp.jpg" />
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
  enrollment: {
    type: Object,
    required: true,
  },
});

const parsedTests = computed(() => {
  try {
    return JSON.parse(props.enrollment.transcript.tests) || [];
  } catch (error) {
    console.error('Error parsing tests JSON:', error);
    return [];
  }
});

const parsedCreditSummary = computed(() => {
  try {
    return JSON.parse(props.enrollment.transcript.creditSummary) || [];
  } catch (error) {
    console.error('Error parsing tests JSON:', error);
    return [];
  }
});

console.log('Received enrollment:', props.enrollment);
</script>


<style scoped>
@page {
  size: letter;
  margin: 0.5in;
}

.transcript-printable-view {
  font-family: 'Noto Sans', sans-serif;
  font-size: 6pt; /* Adjust as needed for fitting */
  color: #000;
  background-color: #fff;
  width: 8.5in;
  height: 11in;
  margin: 0 auto;
  /* padding: 20px; */
  box-sizing: border-box;
  overflow: visible;
  display: flex;
  flex-direction: column;
}

.detail-column {
  column-count: 3;
  column-gap: 3px;
  column-fill: auto;
  flex: 1 1 auto;
  min-height: 0;
  /* z-index: 10; */
}

.detail-header {
  text-align: center;
  background-color: #ccc;
  border: 1px solid;
  padding-bottom: 4px;
}

.detail-header b {
  margin-top: -4px;
}

.detail-body {
  border: 1px solid;
  break-inside: avoid-page;
  line-height: 1;
  padding: 4px;
  /* background-color: rgba(255, 255, 255, 0.8); */
}

.term-block {
  break-inside: avoid;
}

.left-align {
  text-align: left;
}

.student-information-body {
  td:first-child {
    font-weight: bold;
  }
}

.header-section .info-grid {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding-bottom: 10px;
  font-size: 9pt; /* Adjust as needed for fitting */
}
.header-section .info-grid p {
  margin: 2px 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 7pt; /* Slightly smaller for tables */
  margin-top: 5px;
}

th,
td {
  /* border: 1px solid #ccc; */ /* REMOVE default border for all table cells */
  padding: 0px 4px;
  text-align: left;
  vertical-align: top;
}

.signature-section {
  position: absolute;
  bottom: 30px;
  right: 20px;
  text-align: right;
  flex: 0 1 40px;
  /* z-index: 15; */
}

.signature-section p {
  margin: 0;
  line-height: 1.2;
}

.signature-section img {
  max-height: 140px;
  width: auto;
  margin: 4px 0;
  /* opacity: 0.8; */
}

.transcript-page-2-content {
  font-family: 'Courier New', Courier, monospace;
  font-size: 8pt; /* P2 seems to use slightly smaller font */
  color: #000;
  background-color: #fff;
  padding: 20px;
  width: 780px; /* Match page 1 width */
  box-sizing: border-box;
  /* page-break-before: always; Might be useful for direct browser print, less for html2canvas */
}

.page-2-signature {
  position: absolute;
  bottom: 30px;
  right: 20px;
  text-align: right;
}

.transcript-page-1-content,
.transcript-page-2-content {
  position: relative;
  /*min-height: 1123px; /* Match the A4 page height we're using for pagination */
  min-height: 11in;
  overflow: hidden; /* Optional: if watermark somehow causes overflow */
  padding: 0.4in 0.3in;
  padding-bottom: 1.25in; /* Adjust for watermark space */
}
</style>
