<script setup>
import * as echarts from 'echarts'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  assessment: {
    type: Object,
    required: true,
  },
})

const chartRef = ref(null)
let chart = null

function renderChart() {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)

  const dimensions = props.assessment.dimension_scores
  chart.setOption({
    tooltip: {},
    radar: {
      indicator: dimensions.map((item) => ({ name: item.dimension, max: 100 })),
      radius: '68%',
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: dimensions.map((item) => item.score),
            name: props.assessment.merchant_name,
            areaStyle: { opacity: 0.18 },
          },
        ],
      },
    ],
  })
}

onMounted(() => {
  renderChart()
  window.addEventListener('resize', renderChart)
})

watch(() => props.assessment, renderChart, { deep: true })

onBeforeUnmount(() => {
  window.removeEventListener('resize', renderChart)
  chart?.dispose()
})
</script>

<template>
  <div ref="chartRef" class="radar-chart" />
</template>

