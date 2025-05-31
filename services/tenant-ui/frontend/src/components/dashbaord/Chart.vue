\<template>
  <div class="dashboard-chart-card lg:ml-1">
    <div class="card-content">
      <div class="chart-titles">
        <h3 class="connections-title pb-2 m-0">
          {{ $t('dashboard.connections') }}
        </h3>
        <h2 class="dashboard-title m-0">{{ $t('dashboard.crmsTitle') }}</h2>
      </div>
      <div id="chart">
        <div v-if="hasData" ref="chartRef"></div>
        <div v-else class="no-data">
          <i class="pi pi-chart-pie"></i>
          <span>{{ $t('dashboard.noData') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import ApexCharts from 'apexcharts';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  onboarded: {
    type: Number,
    required: true,
  },
  invited: {
    type: Number,
    required: true,
  },
  failed: {
    type: Number,
    required: true,
  }
});

const chartRef = ref<HTMLElement | null>(null);
let chart: ApexCharts | null = null;

const hasData = computed(
  () => props.onboarded > 0 || props.invited > 0 || props.failed > 0 || props.studentIds > 0 || props.transcripts > 0
);
const series = computed(() => [props.onboarded, props.invited, props.failed, props.studentIds, props.transcripts]);

const chartOptions = {
  chart: {
    width: 350,
    type: 'donut',
    offsetX: 200,
  },
  labels: [
    t('dashboard.onboarded'),
    t('dashboard.invited'),
    t('dashboard.failed'),
  ],
  colors: ['#5B5BC1', '#3A3A3A', '#C45C5C', '#4CAF50', '#2196F3'],
  legend: {
    position: 'left',
    offsetY: 20,
    itemMargin: {
      horizontal: 0,
      vertical: 8,
    },
  },
  dataLabels: {
    enabled: false,
  },
  plotOptions: {
    pie: {
      donut: {
        size: '50%',
      },
    },
  },
  responsive: [
    {
      breakpoint: 1450,
      options: {
        chart: {
          offsetX: 80,
        },
      },
    },
    {
      breakpoint: 1200,
      options: {
        chart: {
          offsetX: 0,
          width: 300,
        },
      },
    },
    {
      breakpoint: 500,
      options: {
        chart: {
          offsetX: -50,
          width: 250,
        },
        legend: {
          position: 'bottom',
          offsetY: 0,
          itemMargin: {
            horizontal: 2,
          },
          horizontalAlign: 'left',
        },
      },
    },
  ],
  noData: {
    text: t('common.noData'),
    align: 'center',
    verticalAlign: 'middle',
    style: {
      fontSize: '16px',
      fontFamily: 'Open Sans',
    },
  },
};

const initializeChart = () => {
  if (chartRef.value && hasData.value) {
    if (chart) {
      chart.destroy();
    }
    chart = new ApexCharts(chartRef.value, {
      ...chartOptions,
      series: series.value,
    });
    chart.render();
  }
};

onMounted(() => {
  nextTick(() => {
    initializeChart();
  });
});

watch(series, (newSeries) => {
  if (chart && hasData.value) {
    chart.updateSeries(newSeries);
  } else {
    initializeChart();
  }
});

watch(hasData, (newHasData) => {
  if (newHasData) {
    nextTick(() => {
      initializeChart();
    });
  } else if (chart) {
    chart.destroy();
    chart = null;
  }
});

onUnmounted(() => {
  if (chart) {
    chart.destroy();
  }
});
</script>
<style lang="scss">
.dashboard-chart-card {
  color: $tenant-ui-new-text-on-primary;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0px 4px 10px rgba(66, 66, 66, 0.1);
  padding: 20px;
  height: 100%;
  .chart-titles {
    color: $tenant-ui-new-text-on-primary;
    .connections-title {
      font-size: 16px;
      font-weight: 400;
    }
    .dashboard-title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: #666;
    gap: 12px;

    i {
      font-size: 48px;
      opacity: 0.5;
    }

    span {
      font-size: 16px;
    }
  }
}
</style>
