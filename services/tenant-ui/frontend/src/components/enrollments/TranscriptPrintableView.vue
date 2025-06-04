<!-- eslint-disable vue-i18n/no-raw-text -->
<template>
  <div
    ref="printableView"
    class="transcript-printable-view transcript-page-1-content"
  >
    <img src="/img/pdf/logo-pdf.svg" class="watermark" alt="Watermark" />
    <div class="header-section">
      <div class="top-header">
        <span class="college-name">{{ collegeName }}</span>
      </div>
      <div class="info-grid">
        <div class="info-left">
          <p>Date: {{ formatDate(new Date()) }}</p>
          <p>
            Name:
            {{
              enrollment.student_full_name ||
              (enrollment.student_last_name || '') +
                ', ' +
                (enrollment.student_first_name || '') ||
              'N/A'
            }}
          </p>
        </div>
        <div class="info-right">
          <p>SSN: {{ enrollment.student_ssn || 'N/A' }}</p>
          <p>
            Birth Date: {{ formatDate(enrollment.student_birth_date) || 'N/A' }}
          </p>
          <p>
            ID:
            {{ enrollment.student_id || enrollment.student_number || 'N/A' }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="
        enrollment.transferred_courses && enrollment.transferred_courses.length
      "
      class="curriculum-section"
    >
      <p>
        Curriculum: <br />
        Courses transferred from other institutions
      </p>
      <table>
        <thead>
          <tr>
            <th>Course</th>
            <th>Title/Comments</th>
            <th>Cred</th>
            <th>Transfer From</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(course, index) in enrollment.transferred_courses"
            :key="'transfer-' + index"
          >
            <td>{{ course.course_code }}</td>
            <td style="max-width: 150px">
              {{ truncateText(course.title, 20) }}
            </td>
            <td>{{ (course.credits_earned || 0).toFixed(2) }}</td>
            <td>{{ course.transfer_school_name }}</td>
          </tr>
          <tr>
            <td colspan="2" class="text-right">The total transfer cred:</td>
            <td>{{ totalTransferCredits.toFixed(2) }}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="course-history-section mt-8">
      <!-- This will be looped for each term -->
      <div
        v-for="(term, termIndex) in enrollment.terms"
        :key="'term-' + termIndex"
        class="term-block"
      >
        <table>
          <thead>
            <tr>
              <th>Course</th>
              <th>Title/Comments</th>
              <th>Grd</th>
              <th>Repeat</th>
              <th>Hrs Att</th>
              <th>Hrs Cmpl</th>
              <th>Grade Points</th>
              <th>Course Dates</th>
              <th>Shell Crs</th>
            </tr>
          </thead>
          <tbody>
            <!-- Row for Term Name -->
            <tr class="term-name-row">
              <td></td>
              <td colspan="2">{{ term.termName }}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr
              v-for="(course, courseIndex) in term.courses"
              :key="'course-' + termIndex + '-' + courseIndex"
            >
              <td>{{ course.courseCode }}</td>
              <td style="max-width: 150px">
                {{ truncateText(course.courseTitle, 20) }}
              </td>
              <td>{{ course.grade }}</td>
              <td>{{ course.repeat_indicator || '' }}</td>
              <td>{{ (course.hours_attempted || 0).toFixed(2) }}</td>
              <td>{{ (course.hours_completed || 0).toFixed(2) }}</td>
              <td>{{ (course.grade_points || 0).toFixed(2) }}</td>
              <td>{{ formatDateRange(course.start_date, course.end_date) }}</td>
              <td>{{ course.shell_crs_indicator || '' }}</td>
            </tr>
            <tr class="totals-row">
              <td colspan="4" class="text-right">Term Totals</td>
              <td>{{ (term.term_hours_attempted || 0).toFixed(2) }}</td>
              <td>{{ (term.term_hours_completed || 0).toFixed(2) }}</td>
              <td>{{ (term.term_grade_points || 0).toFixed(2) }}</td>
              <td colspan="2">GPA = {{ (term.term_gpa || 0).toFixed(3) }}</td>
            </tr>
            <tr v-if="term.cumulative_gpa !== undefined" class="totals-row">
              <td colspan="4" class="text-right">Cumulative Totals</td>
              <td>{{ (term.cumulative_hours_attempted || 0).toFixed(2) }}</td>
              <td>{{ (term.cumulative_hours_completed || 0).toFixed(2) }}</td>
              <td>{{ (term.cumulative_grade_points || 0).toFixed(2) }}</td>
              <td colspan="2">
                GPA = {{ (term.cumulative_gpa || 0).toFixed(3) }}
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="term.academic_standing" class="academic-standing">
          Academic Standing: {{ term.academic_standing }}
        </p>
      </div>
    </div>

    <div class="footer-section mt-4 mb-6">
      <p>{{ enrollment.degree_program_name }}</p>
      <p>
        Program Total: Completed Cred:
        {{ (enrollment.program_total_credits_completed || 0).toFixed(2) }} GPA :
        {{ (enrollment.program_total_gpa || 0).toFixed(3) }}
      </p>
      <p>
        The courses with *U are Universal Education Transfer Component courses.
      </p>
      <p>The courses with *A are CAA courses.</p>
    </div>

    <div class="signature-section">
      <p>Registrar</p>
      <p>{{ collegeName }}</p>
    </div>
  </div>

  <!-- Page 2 Content -->
  <div
    ref="page2View"
    class="transcript-page-2-content"
    style="page-break-before: always"
  >
    <img src="/img/pdf/logo-pdf.svg" class="watermark" alt="Watermark" />
    <div class="page-2-header">
      <div class="registrar-info">
        <p>Registrar's Office</p>
        <p>411 N. Front Street</p>
        <p>Wilmington NC 28401</p>
      </div>
    </div>

    <div class="accreditation-info">
      <p>
        ACCREDITATION: Cape Fear Community College is accredited by the
        Commission on College of the Southern Association of Colleges and
        Schools to award associate degrees. Contact the Commission on Colleges
        at 1866 Southern Lane, Decatur, Georgia 30033-4097 or call (404)
        679-4500 for questions about the accreditation of Cape Fear Community
        College. Additional specific program accreditations may be found in our
        most recent online catalog.
      </p>
    </div>

    <div class="grading-system-info">
      <p class="section-title">GRADING SYSTEM AND GRADE POINT AVERAGE</p>
      <div class="grading-table-container">
        <table class="grading-table-left">
          <thead>
            <tr>
              <th>Grade</th>
              <th>Explanation</th>
              <th>QP</th>
              <th>Counted in GPA</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>A</td>
              <td>Superior</td>
              <td>4</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>B</td>
              <td>Good</td>
              <td>3</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>C</td>
              <td>Average</td>
              <td>2</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>D</td>
              <td>Poor</td>
              <td>1</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>F</td>
              <td>Failure</td>
              <td>0</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>W</td>
              <td>Official Withdrawal</td>
              <td>0</td>
              <td>No</td>
            </tr>
            <tr>
              <td>XF</td>
              <td>Unofficial Withdrawal</td>
              <td>0</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>NS</td>
              <td>No Show</td>
              <td>0</td>
              <td>No</td>
            </tr>
            <tr>
              <td>AU</td>
              <td>Audit</td>
              <td>0</td>
              <td>No</td>
            </tr>
            <tr>
              <td>SR</td>
              <td>Senior Audit</td>
              <td>0</td>
              <td>No</td>
            </tr>
            <tr>
              <td>I</td>
              <td>Incomplete</td>
              <td>0</td>
              <td>No</td>
            </tr>
            <tr>
              <td>CR</td>
              <td>Credit by Exam</td>
              <td>0</td>
              <td>No</td>
            </tr>
            <tr>
              <td>*</td>
              <td>Repeated</td>
              <td>0</td>
              <td>No</td>
            </tr>
            <tr>
              <td>CT</td>
              <td>Credit by Transfer (prior to 2006)</td>
              <td>0</td>
              <td>No</td>
            </tr>
            <tr>
              <td>NC</td>
              <td>No Credit</td>
              <td>0</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>PA, PB, PC</td>
              <td>Developmental Passing</td>
              <td>0</td>
              <td>No</td>
            </tr>
            <tr>
              <td>R</td>
              <td>Repeat</td>
              <td>0</td>
              <td>No</td>
            </tr>
            <tr>
              <td>WP</td>
              <td>Withdrawal Passing</td>
              <td>0</td>
              <td>No</td>
            </tr>
            <tr>
              <td>WF</td>
              <td>Withdrawal Failing</td>
              <td>0</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>WE</td>
              <td>Withdraw Emergency (COVID-19)</td>
              <td>0</td>
              <td>No</td>
            </tr>
            <tr>
              <td>IE</td>
              <td>Incomplete Emergency (COVID-19)</td>
              <td>0</td>
              <td>No</td>
            </tr>
          </tbody>
        </table>
        <div class="grading-text-right">
          <p>
            Prior to Summer 1997, the college operated on the quarter system.
            Effective Summer 1997, the North Carolina Community College System
            converted to a semester based calendar and credit system. All
            courses listed on this transcript have been converted to semester
            hours.
          </p>
          <p>
            When a course it taken more than once, only the highest grade will
            be included in calculating the GPA.
          </p>
          <p>All attempted courses are reflected on the official transcript.</p>
          <p>
            An overall average GPA of 2.0 (C average) or better is required for
            graduation.
          </p>
          <p>
            The college will not assume responsibility for a transcript when it
            is not received directly from the Registrar's Office.
          </p>
        </div>
      </div>
    </div>
    <div class="signature-section page-2-signature">
      <p>Registrar</p>
      <p>{{ collegeName }}</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed, ref } from 'vue';

const printableView = ref(null);
const page2View = ref(null);

const props = defineProps({
  enrollment: {
    type: Object,
    required: true,
    default: () => ({
      student_full_name: 'Firstname Lastname',
      student_last_name: 'Lastname',
      student_first_name: 'Firstname',
      student_ssn: 'XXX-XX-XXXX',
      student_birth_date: '1990-01-01',
      student_id: '0000000',
      student_number: 'S12345',
      transferred_courses: [
        {
          course_code: 'ACA-122*A',
          title: 'College Transfer Success',
          credits_earned: 1.0,
          transfer_school_name: 'Mitchell Community College',
        },
      ],
      terms: [
        {
          termName: 'Fall Semester 2020',
          courses: [
            {
              courseCode: 'BIO-168*A',
              courseTitle: 'Anatomy and Physiology I',
              grade: 'A',
              repeat_indicator: '',
              hours_attempted: 4.0,
              hours_completed: 4.0,
              grade_points: 16.0,
              start_date: '2020-08-21',
              end_date: '2020-12-17',
              shell_crs_indicator: '',
            },
          ],
          term_hours_attempted: 18.0,
          term_hours_completed: 18.0,
          term_grade_points: 57.0,
          term_gpa: 3.167,
          cumulative_gpa: 3.167,
          cumulative_hours_attempted: 18.0,
          cumulative_hours_completed: 18.0,
          cumulative_grade_points: 57.0,
          academic_standing: 'No Academic Standing',
        },
      ],
      degree_program_name: 'Associate in Arts',
      program_total_credits_completed: 49.0,
      program_total_gpa: 3.368,
    }),
  },
});

// This should ideally come from a central config or the enrollment data itself
const collegeName = computed(
  () => props.enrollment?.college_name || 'Cape Fear Community College'
);

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Make sure date is valid before formatting
  if (isNaN(date.getTime())) return dateString; // Return original if not a valid date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  const formatSingle = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return ''; // handle invalid date string for single part
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
  };
  return `${formatSingle(startDate)}-${formatSingle(endDate)}`;
};

const totalTransferCredits = computed(() => {
  return (props.enrollment.transferred_courses || []).reduce(
    (sum, course) => sum + (course.credits_earned || 0),
    0
  );
});

const truncateText = (text, maxLength) => {
  if (typeof text === 'string' && text.length > maxLength) {
    return text.substring(0, maxLength - 3) + '...';
  }
  return text;
};
</script>

<style scoped>
.transcript-printable-view {
  font-family: 'Courier New', Courier, monospace;
  font-size: 10pt; /* Adjust as needed for fitting */
  color: #000;
  background-color: #fff;
  padding: 20px;
  width: 780px; /* Approx width for A4 portrait, adjust as needed */
  box-sizing: border-box;
}

.header-section .top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-section .college-name {
  text-align: center;
  flex-grow: 1;
}

.header-section .info-grid {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding-bottom: 10px;
}
.header-section .info-grid p {
  margin: 2px 0;
}

.curriculum-section p:first-child,
.curriculum-section p:nth-child(2) {
  margin-bottom: 5px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9pt; /* Slightly smaller for tables */
  margin-top: 5px;
}

th,
td {
  /* border: 1px solid #ccc; */ /* REMOVE default border for all table cells */
  padding: 2px 4px;
  text-align: left;
  vertical-align: top;
}

/* Style for table headers in transferred courses and term courses tables on Page 1 */
.curriculum-section table th,
.course-history-section table th {
  font-weight: normal; /* Ensure headers are not bold */
  background-color: transparent;
  border-bottom: 1px dashed #000;
  border-top: none;
  padding-top: 4px;
  padding-bottom: 4px;
  text-align: left;
}

/* Specific styling for cells in Page 1 tables if needed, for now just padding and alignment */
.curriculum-section table td,
.course-history-section table td {
  /* Ensure no borders are accidentally inherited or applied */
  border: none;
}

/* Keep the borderless style for the P2 grading table */
.grading-table-left th,
.grading-table-left td {
  padding: 1px 3px;
  font-size: 8pt;
  border: none; /* P2 table has no borders */
}
.grading-table-left th {
  text-align: left;
  font-weight: normal; /* Headers not bold in P2 grading table */
  background-color: transparent;
}

.text-right {
  text-align: right;
}
.text-center {
  text-align: center;
}

.course-history-section .term-block {
  margin-bottom: 15px;
}
.course-history-section .academic-standing {
  font-style: italic;
  margin-top: 5px;
}
.course-history-section .totals-row td {
  font-weight: normal; /* Ensure totals are not bold */
}

.footer-section p {
  margin-top: 0;
  margin-bottom: 0;
}

.signature-section {
  position: absolute;
  bottom: 30px;
  right: 20px;
  text-align: right;
}

.signature-section p {
  margin: 0;
  line-height: 1.2;
}

.transcript-page-2-content {
  font-family: 'Courier New', Courier, monospace;
  font-size: 9pt; /* P2 seems to use slightly smaller font */
  color: #000;
  background-color: #fff;
  padding: 20px;
  width: 780px; /* Match page 1 width */
  box-sizing: border-box;
  /* page-break-before: always; Might be useful for direct browser print, less for html2canvas */
}

.page-2-header {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 15px;
  width: 100%;
}

.registrar-info {
  text-align: center;
}
.registrar-info p {
  margin: 0;
  line-height: 1.2;
}

.accreditation-info {
  margin-bottom: 15px;
  text-align: justify;
  line-height: 1.3;
}
.accreditation-info p {
  margin: 0;
}
.accreditation-info p strong {
  font-weight: normal;
}

.grading-system-info .section-title {
  margin-bottom: 10px;
  text-align: left;
}

.grading-table-container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.grading-table-left {
  width: 45%; /* Adjust as needed */
}

.grading-text-right {
  width: 50%; /* Adjust as needed */
  line-height: 1.3;
}
.grading-text-right p {
  margin-bottom: 10px;
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
  min-height: 1123px; /* Match the A4 page height we're using for pagination */
  overflow: hidden; /* Optional: if watermark somehow causes overflow */
}

.watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
  opacity: 0.7; /* Adjust for desired faintness */
  width: 80%; /* Adjust size as needed */
  max-width: 600px; /* Optional max size */
  /* Ensure it doesn't affect layout by being too large for html2canvas capture area if not scaled well */
  object-fit: contain;
}

.header-section .top-header span:first-child {
  font-weight: normal; /* Ensure this is not bold */
}

/* Term Name Row specific styling */
.term-name-row td {
  font-weight: normal; /* Ensure not bold if it inherits from a general td style */
  text-align: left;
  padding-top: 5px; /* Add some space above term name */
  padding-bottom: 2px;
  border: none !important; /* Ensure this row has no cell borders */
}

.course-history-section .term-header {
  /* font-weight: normal; */ /* This class is no longer used for term name */
}
</style>
