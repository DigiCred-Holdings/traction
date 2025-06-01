<template>
  <div class="lg:flex justify-content-between align-items-center mb-2">
    <div class="flex align-items-center gap-2">
      <Button
        icon="pi pi-angle-left"
        variant="text"
        class="p-button-text bg-gray-200"
        rounded
        @click="$emit('back')"
      />
      <h2 class="lg:text-xl text-lg font-bold">
        {{ enrollment.student_full_name }}
        {{ $t('enrollments.enrolmentDetails') }}
      </h2>
    </div>
    <div
      class="flex gap-2 lg:flex-row flex-column lg:align-items-center align-items-start"
    >
      <!-- Status Dropdown -->
      <Dropdown
        v-model="status"
        :options="enrollmentStatusOptions"
        option-label="label"
        option-value="value"
        class="w-32"
      />
      <!-- Download Button -->
      <Button
        :label="$t('enrollments.downloadTranscript')"
        icon="pi pi-download"
        class="p-button-primary download-button"
        @click="menu.toggle($event)"
      />
      <Menu ref="menu" :model="downloadOptions" :popup="true" />
    </div>
  </div>
  <div>
    <div class="grid">
      <div class="col-12 lg:col-6 lg:pr-0">
        <Panel class="h-full">
          <template #header>
            <h2 class="text-lg font-semibold">
              {{ $t('enrollments.studentInformation') }}
            </h2>
          </template>
          <div class="grid formgrid">
            <div class="field col-12 lg:col-6">
              <p>
                <strong>{{ $t('enrollments.name') + ':' }}</strong>
                {{ enrollment.student_full_name }}
              </p>
            </div>
            <div class="field col-12 lg:col-6">
              <p>
                <strong>{{ $t('enrollments.phone') + ':' }}</strong>
                {{ enrollment.student_phone }}
              </p>
            </div>
            <div class="field col-12 lg:col-6">
              <p>
                <strong>{{ $t('enrollments.dob') + ':' }}</strong>
                {{ enrollment.student_birth_date }}
              </p>
            </div>
            <div class="field col-12 lg:col-6">
              <p>
                <strong>{{ $t('enrollments.email') + ':' }}</strong>
                {{ enrollment.student_email }}
              </p>
            </div>
            <div class="field col-12">
              <p>
                <strong>{{ $t('enrollments.address') + ':' }}</strong>
                {{ enrollment.student_address }}
              </p>
            </div>
          </div>
        </Panel>
      </div>
      <div class="col-12 lg:col-6">
        <Panel class="h-full">
          <template #header>
            <h2 class="text-lg font-semibold">
              {{ $t('enrollments.schoolInformation') }}
            </h2>
          </template>
          <div class="grid formgrid">
            <div class="field col-12 lg:col-6">
              <p>
                <strong>{{ $t('enrollments.name') + ':' }}</strong>
                {{ enrollment.school_name }}
              </p>
            </div>
            <div class="field col-12 lg:col-6">
              <p>
                <strong>{{ $t('enrollments.graduation') + ':' }}</strong>
                {{ enrollment.graduation_date }}
              </p>
            </div>
            <div class="field col-12 lg:col-6">
              <p>
                <strong>{{ $t('enrollments.address') + ':' }}</strong>
                {{ enrollment.school_address }}
              </p>
            </div>
            <div class="field col-12 lg:col-6">
              <p>
                <strong>{{ $t('enrollments.gpa') + ':' }}</strong>
                {{ enrollment.gpa }}
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </div>

    <div class="grid">
      <div class="col-12 lg:col-6 lg:pr-0">
        <Panel ref="transcriptRef">
          <template #header>
            <h2 class="text-lg font-semibold">
              {{ $t('enrollments.transcript') }}
            </h2>
          </template>
          <div class="grid formgrid">
            <div class="field col-12 lg:col-6">
              <p>
                <strong>{{ $t('enrollments.program') + ':' }}</strong>
                {{ enrollment.transcript.program }}
              </p>
              <p>
                <strong>{{ $t('enrollments.classRank') + ':' }}</strong>
                {{ enrollment.transcript.classRank }}
              </p>
              <p>
                <strong>{{ $t('enrollments.date') + ':' }}</strong>
                {{ enrollment.transcript.transcriptDate }}
              </p>
            </div>
            <div class="field col-12 lg:col-6">
              <p>
                <strong>{{ $t('enrollments.weightedGPA') + ':' }}</strong>
                {{ enrollment.transcript.gpa }}
              </p>
              <p>
                <strong>{{ $t('enrollments.unweightedGPA') + ':' }}</strong>
                {{ enrollment.transcript.gpaUnweighted }}
              </p>
            </div>
            <div class="field col-12">
              <p class="font-bold">
                {{ $t('enrollments.comments') + ':' }}
              </p>
              <p>{{ enrollment.transcript.transcriptComments }}</p>
            </div>
          </div>
        </Panel>
      </div>

      <div class="col-12 lg:col-6">
        <Panel
          v-for="(term, i) in reversedTerms"
          :key="term.termId || i"
          class="mb-2"
          toggleable
          :collapsed="i !== activeTermIndex"
          @toggle="handleTermToggle(i)"
        >
          <template #header>
            <h2 class="text-lg font-semibold">
              {{ $t('enrollments.term') + ' ' + (reversedTerms.length - i) }}
            </h2>
          </template>
          <div class="grid">
            <div class="col-12 lg:col-5">
              <p>
                <strong>{{ $t('enrollments.year') + ':' }}</strong>
                {{ term.termYear }}
              </p>
              <p>
                <strong>{{ $t('enrollments.school') + ':' }}</strong>
                {{ term.termSchoolName }}
              </p>
              <p>
                <strong>{{ $t('enrollments.gradeLevel') + ':' }}</strong>
                {{ term.termGradeLevel }}
              </p>
              <p>
                <strong>{{ $t('enrollments.credits') + ':' }}</strong>
                {{ term.termCredit }}
              </p>
              <p>
                <strong>{{ $t('enrollments.gpa') + ':' }}</strong>
                {{ term.termGpa }}
              </p>
            </div>
            <div class="col-12 lg:col-7">
              <h3 class="text-lg font-semibold mb-2">
                {{ $t('enrollments.courses') }}
              </h3>
              <div v-if="term.courses && term.courses.length">
                <div
                  v-for="(course, j) in term.courses"
                  :key="j"
                  class="mb-2 course-card"
                >
                  <p class="course-code-title">
                    <span class="font-bold">{{ course.courseCode }}</span>
                    {{ course.courseTitle }}
                  </p>
                  <p class="course-details">
                    {{ $t('enrollments.grade') + ':' }}
                    {{ course.grade + ',' }}
                    {{ $t('enrollments.credits') + ':' }}
                    {{ course.creditEarned }}
                  </p>
                </div>
              </div>
              <p v-else>{{ $t('enrollments.noCourses') }}</p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  </div>

  <Dialog
    v-model:visible="showPdfPreviewDialog"
    modal
    header="PDF Preview"
    :style="{ width: '75vw' }"
    :breakpoints="{ '960px': '80vw', '640px': '90vw' }"
    @hide="cancelPdfPreview"
  >
    <div class="pdf-preview-container">
      <div v-if="pdfPreviewImageSrc.pages.length" class="preview-pages">
        <div
          v-for="(page, index) in pdfPreviewImageSrc.pages"
          :key="index"
          class="preview-page"
        >
          <h3>{{ $t('enrollments.page') }} {{ index + 1 }}</h3>
          <img :src="page" :alt="`Transcript Preview Page ${index + 1}`" />
        </div>
        <div class="preview-page">
          <h3>
            {{ $t('enrollments.page') }}
            {{ pdfPreviewImageSrc.pages.length + 1 }}
          </h3>
          <img
            :src="pdfPreviewImageSrc.gradingPage"
            alt="Grading System Page"
          />
        </div>
      </div>
      <p v-else>
        {{ $t('enrollments.generatingPreview', 'Generating preview...') }}
      </p>
    </div>
    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        @click="cancelPdfPreview"
      />
      <Button
        label="Download PDF"
        icon="pi pi-download"
        :disabled="!pdfPreviewImageSrc.pages.length"
        @click="confirmPdfDownload"
      />
    </template>
  </Dialog>
</template>

<script setup>
import {
  ref,
  defineProps,
  computed,
  createApp,
  nextTick,
  watch,
  onMounted,
} from 'vue';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import TranscriptPrintableView from './TranscriptPrintableView.vue';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Panel from 'primevue/panel';
import Menu from 'primevue/menu';
import Dialog from 'primevue/dialog';
import { useToast } from 'vue-toastification';
import { useTenantStore } from '@/store';
import { storeToRefs } from 'pinia';

defineEmits(['back']);
const toast = useToast();
const { tenantWallet } = storeToRefs(useTenantStore());
const tenantStore = useTenantStore();
const webhookUrl = ref(null);
const webhookKey = ref(null);

const loadTenantSettings = async () => {
  try {
    await tenantStore.getTenantSubWallet();
    const webhooks = tenantWallet.value?.settings?.['wallet.webhook_urls'][0];
    if (webhooks) {
      if (webhooks.match(/#/g)) {
        webhookUrl.value = webhooks.substring(0, webhooks.indexOf('#'));
        webhookKey.value = webhooks.substring(webhooks.indexOf('#') + 1);
      } else {
        webhookUrl.value = webhooks;
        webhookKey.value = '';
      }
    } else {
      console.error('No webhook URLs found in tenant settings');
      toast.error('No webhook URLs found in tenant settings');
    }
  } catch (err) {
    console.error(err);
    toast.error(`Failure: ${err}`);
  }
};

onMounted(async () => {
  await loadTenantSettings();
});

const props = defineProps({
  enrollment: {
    type: Object,
    required: true,
  },
});

// Computed property to display terms in reverse order (latest first)
const reversedTerms = computed(() => {
  if (props.enrollment && props.enrollment.terms) {
    return [...props.enrollment.terms].reverse();
  }
  return [];
});

const activeTermIndex = ref(0); // Initialize to 0 to open the first term (latest) by default

// Function to handle toggling, ensuring only one panel is open
const handleTermToggle = (toggledIndex) => {
  if (activeTermIndex.value === toggledIndex) {
    activeTermIndex.value = null; // Collapse if it's already open
  } else {
    activeTermIndex.value = toggledIndex; // Expand the new one (and collapse others via :collapsed binding)
  }
};

const enrollmentStatusOptions = [
  {
    label: 'Started',
    value: 'started',
  },
  {
    label: 'Completed',
    value: 'completed',
  },
  {
    label: 'Approved',
    value: 'approved',
  },
  {
    label: 'Rejected',
    value: 'rejected',
  },
  {
    label: 'Pending',
    value: 'pending',
  },
];
const status = ref(props.enrollment.enrollment_status || 'pending');

// Add watch for status changes
watch(status, async (newStatus) => {
  try {
    if (webhookUrl.value) {
      const url = `${webhookUrl.value}/enrollment/${props.enrollment.enrollment_id}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': webhookKey.value,
        },
        body: JSON.stringify({
          enrollment_status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success('Status updated successfully');
    }
  } catch (error) {
    console.error('Error updating enrollment status:', error);
    toast.error('Failed to update status');
    // Revert the status back if the update failed
    status.value = props.enrollment.enrollment_status || 'pending';
  }
});

const showPdfPreviewDialog = ref(false);
const pdfPreviewImageSrc = ref({
  pages: [],
  gradingPage: null,
});
const mountedPrintApp = ref(null);
const mountedPrintVm = ref(null);

const menu = ref();
const downloadOptions = ref([
  {
    label: 'Download PDF',
    icon: 'pi pi-file-pdf',
    command: () => {
      previewAndPreparePdf();
    },
  },
  {
    label: 'Download TIFF',
    icon: 'pi pi-file-export',
    command: () => {
      downloadTIFF();
    },
  },
]);

const transcriptRef = ref(null);

function cleanupPrintableComponent() {
  try {
    if (mountedPrintApp.value) {
      mountedPrintApp.value.unmount();
    }

    // Find and remove the container if it exists
    const container = document.getElementById(
      'printable-transcript-container-dynamic'
    );
    if (container && container.parentElement) {
      container.parentElement.removeChild(container);
    }

    // Reset all refs
    mountedPrintApp.value = null;
    mountedPrintVm.value = null;
    pdfPreviewImageSrc.value = { pages: [], gradingPage: null };
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

async function previewAndPreparePdf() {
  if (mountedPrintApp.value) {
    // If already mounted, clean up first (e.g., from a previous attempt)
    cleanupPrintableComponent();
  }
  const printableContainer = document.createElement('div');
  printableContainer.id = 'printable-transcript-container-dynamic';
  Object.assign(printableContainer.style, {
    position: 'absolute',
    top: '-9999px',
    left: '-9999px',
    zIndex: '-1',
  });
  document.body.appendChild(printableContainer);

  const app = createApp(TranscriptPrintableView, {
    enrollment: props.enrollment,
  });
  const vm = app.mount(printableContainer);
  mountedPrintApp.value = app;
  mountedPrintVm.value = vm;

  try {
    await nextTick();

    const canvasOptions = {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        // Ensure watermark is visible in cloned document
        const watermarks = clonedDoc.getElementsByClassName('watermark');
        Array.from(watermarks).forEach((watermark) => {
          watermark.style.opacity = '1';
          watermark.style.display = 'block';
          watermark.style.zIndex = '1';
        });
      },
    };

    // Get all transcript content pages
    const contentElement = vm.$refs.printableView;
    if (contentElement) {
      // Calculate how many pages we need based on content height
      const pageHeight = 1123; // Approximate A4 height in pixels at 96 DPI
      const contentHeight = contentElement.scrollHeight;
      const numberOfPages = Math.ceil(contentHeight / pageHeight);

      // Generate preview for each content page
      for (let i = 0; i < numberOfPages; i++) {
        const tempDiv = document.createElement('div');
        tempDiv.style.height = `${pageHeight}px`;
        tempDiv.style.overflow = 'hidden';
        tempDiv.style.position = 'relative';
        tempDiv.style.backgroundColor = '#ffffff';

        // Clone the content for each page
        const contentClone = contentElement.cloneNode(true);
        contentClone.style.position = 'absolute';
        contentClone.style.top = `${-i * pageHeight}px`;

        // Ensure watermark is visible
        const watermark = contentClone.querySelector('.watermark');
        if (watermark) {
          watermark.style.opacity = '0.7';
          watermark.style.display = 'block';
        }

        tempDiv.appendChild(contentClone);
        document.body.appendChild(tempDiv);

        const canvas = await html2canvas(tempDiv, {
          ...canvasOptions,
          width: contentElement.scrollWidth,
          height: pageHeight,
        });

        pdfPreviewImageSrc.value.pages.push(canvas.toDataURL('image/png'));
        document.body.removeChild(tempDiv);
      }
    }

    // Generate preview for grading system page (always last)
    const gradingPageElement = vm.$refs.page2View;
    if (gradingPageElement) {
      // Ensure watermark is visible
      const watermark = gradingPageElement.querySelector('.watermark');
      if (watermark) {
        watermark.style.opacity = '0.7';
        watermark.style.display = 'block';
      }

      const canvas = await html2canvas(gradingPageElement, {
        ...canvasOptions,
        width: gradingPageElement.scrollWidth,
        height: gradingPageElement.scrollHeight,
      });
      pdfPreviewImageSrc.value.gradingPage = canvas.toDataURL('image/png');
    }

    showPdfPreviewDialog.value = true;
  } catch (error) {
    console.error('Error generating PDF preview:', error);
    toast.error('Could not generate PDF preview.');
    cleanupPrintableComponent();
  }
}

async function confirmPdfDownload() {
  if (!mountedPrintVm.value) {
    toast.error('Printable transcript component is not ready.');
    return;
  }

  try {
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const margin = 10;

    // Add all content pages
    for (let i = 0; i < pdfPreviewImageSrc.value.pages.length; i++) {
      if (i > 0) pdf.addPage();
      await addImageToPdf(pdfPreviewImageSrc.value.pages[i], pdf, margin);
    }

    // Add grading system page last
    if (pdfPreviewImageSrc.value.gradingPage) {
      pdf.addPage();
      await addImageToPdf(pdfPreviewImageSrc.value.gradingPage, pdf, margin);
    }

    pdf.save(`${props.enrollment.student_full_name} - Transcript.pdf`);
  } catch (error) {
    console.error('Error generating final PDF:', error);
    toast.error('Could not generate final PDF.');
  } finally {
    showPdfPreviewDialog.value = false;
    cleanupPrintableComponent();
  }
}

// Helper function to add image to PDF with proper scaling
async function addImageToPdf(imgData, pdfInstance, margin) {
  const imgProps = pdfInstance.getImageProperties(imgData);
  const pdfWidth = pdfInstance.internal.pageSize.getWidth();
  const pdfHeight = pdfInstance.internal.pageSize.getHeight();
  const availableWidth = pdfWidth - 2 * margin;
  const availableHeight = pdfHeight - 2 * margin;
  const imgAspectRatio = imgProps.width / imgProps.height;

  let newImgWidth = availableWidth;
  let newImgHeight = newImgWidth / imgAspectRatio;

  if (newImgHeight > availableHeight) {
    newImgHeight = availableHeight;
    newImgWidth = newImgHeight * imgAspectRatio;
  }

  const xOffset = (pdfWidth - newImgWidth) / 2;
  const yOffset = margin;

  pdfInstance.addImage(
    imgData,
    'PNG',
    xOffset,
    yOffset,
    newImgWidth,
    newImgHeight
  );
}

function cancelPdfPreview() {
  showPdfPreviewDialog.value = false;
  cleanupPrintableComponent();
}

async function downloadTIFF() {
  try {
    // Clean up any existing printable component
    if (mountedPrintApp.value) {
      cleanupPrintableComponent();
    }

    // Create the printable view
    const printableContainer = document.createElement('div');
    printableContainer.id = 'printable-transcript-container-dynamic';
    Object.assign(printableContainer.style, {
      position: 'absolute',
      top: '-9999px',
      left: '-9999px',
      zIndex: '-1',
    });
    document.body.appendChild(printableContainer);

    const app = createApp(TranscriptPrintableView, {
      enrollment: props.enrollment,
    });
    const vm = app.mount(printableContainer);

    await nextTick();

    const canvasOptions = {
      scale: 1.5, // Reduced from 2 to reduce file size
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
    };

    const pages = [];

    // Get all transcript content pages
    const contentElement = vm.$refs.printableView;
    if (contentElement) {
      // Calculate how many pages we need based on content height
      const pageHeight = 1123; // Approximate A4 height in pixels at 96 DPI
      const contentHeight = contentElement.scrollHeight;
      const numberOfPages = Math.ceil(contentHeight / pageHeight);

      // Generate canvas for each content page
      for (let i = 0; i < numberOfPages; i++) {
        const tempDiv = document.createElement('div');
        tempDiv.style.height = `${pageHeight}px`;
        tempDiv.style.overflow = 'hidden';
        tempDiv.style.position = 'relative';
        tempDiv.style.backgroundColor = '#ffffff';

        // Clone the content for each page
        const contentClone = contentElement.cloneNode(true);
        contentClone.style.position = 'absolute';
        contentClone.style.top = `${-i * pageHeight}px`;

        // Ensure watermark is visible
        const watermark = contentClone.querySelector('.watermark');
        if (watermark) {
          watermark.style.opacity = '1';
          watermark.style.display = 'block';
          watermark.style.zIndex = '1';
        }

        tempDiv.appendChild(contentClone);
        document.body.appendChild(tempDiv);

        const canvas = await html2canvas(tempDiv, {
          ...canvasOptions,
          width: contentElement.scrollWidth,
          height: pageHeight,
        });

        // Use JPEG format with quality setting to reduce size
        pages.push(canvas.toDataURL('image/jpeg', 0.9));
        document.body.removeChild(tempDiv);
      }
    }

    // Generate canvas for grading system page (always last)
    const gradingPageElement = vm.$refs.page2View;
    if (gradingPageElement) {
      // Ensure watermark is visible
      const watermark = gradingPageElement.querySelector('.watermark');
      if (watermark) {
        watermark.style.opacity = '1';
        watermark.style.display = 'block';
        watermark.style.zIndex = '1';
      }

      const canvas = await html2canvas(gradingPageElement, {
        ...canvasOptions,
        width: gradingPageElement.scrollWidth,
        height: gradingPageElement.scrollHeight,
      });
      // Use JPEG format with quality setting to reduce size
      pages.push(canvas.toDataURL('image/jpeg', 0.9));
    }

    // Clean up the printable component
    app.unmount();
    document.body.removeChild(printableContainer);

    // Send to backend for TIFF conversion
    const response = await fetch('/api/enrollments/generate-tiff', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pages: pages,
        filename: `${props.enrollment.student_full_name} - Transcript.tiff`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to generate TIFF';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Download the TIFF file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${props.enrollment.student_full_name} - Transcript.tiff`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error generating TIFF:', error);
    toast.error('Failed to generate TIFF file: ' + error.message);
  }
}
</script>

<style scoped lang="scss">
p {
  margin-bottom: 4px;
}

.course-card {
  background-color: #f0f0f0;
  border-radius: 6px;
  padding: 0.75rem 1rem;
}

.course-card .course-code-title {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.course-card .course-details {
  font-size: 0.9rem;
  margin-bottom: 0;
  color: #555;
}

.btn-primary {
  padding: 8px 12px;
  background: $tenant-ui-new-accent-color;
  color: white;
  border: none;
  cursor: pointer;
}

:deep(.p-panel.h-full) {
  display: flex;
  flex-direction: column;

  .p-toggleable-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;

    .p-panel-content {
      flex-grow: 1;

      .formgrid {
        .field {
          margin-bottom: 0;
        }
      }
    }
  }
}

:deep(.p-panel .p-panel-header) {
  padding: 0.75rem 1rem;
  background-color: #ffffff;
}

:deep(.p-panel .p-panel-header .p-panel-icons) {
  z-index: 1;
}

.pdf-preview-container {
  .preview-pages {
    display: flex;
    flex-direction: column;
    gap: 2rem;

    .preview-page {
      h3 {
        margin-bottom: 1rem;
        font-size: 1.1rem;
        color: #666;
      }

      img {
        max-width: 100%;
        height: auto;
        border: 1px solid #ccc;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    }
  }
}

.download-button {
  background-color: #6666cc !important;
  border: none;

  &:enabled:hover {
    background-color: #5555bb !important;
  }
}
</style>
