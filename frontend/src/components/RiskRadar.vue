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
  if (!chartRef.value || !props.assessment) return
  if (!chart) chart = echarts.init(chartRef.value)

  const dimensions = props.assessment.dimension_scores || []
  chart.setOption({
    color: ['#c76a2a'],
    tooltip: {
      trigger: 'item',
      backgroundColor: '#2b241f',
      borderWidth: 0,
      textStyle: { color: '#fff7ed' },
    },
    radar: {
      indicator: dimensions.map((item) => ({ name: item.dimension, max: 100 })),
      radius: '64%',
      splitNumber: 4,
      axisName: {
        color: '#5f5146',
        fontSize: 12,
      },
      axisLine: {
        lineStyle: { color: '#e2d4c5' },
      },
      splitLine: {
        lineStyle: { color: ['#f0e6da', '#ead8c8', '#dfc6ad', '#d3ae8a'] },
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(255, 249, 241, 0.95)', 'rgba(247, 237, 224, 0.75)'],
        },
      },
    },
    series: [
      {
        type: 'radar',
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 3 },
        areaStyle: {
          opacity: 0.22,
          color: '#d9843a',
        },
        data: [
          {
            value: dimensions.map((item) => item.score),
            name: props.assessment.merchant_name,
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
