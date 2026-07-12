<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchDashboardSummary, fetchRiskAssessments } from '../api/client'
import RiskRadar from '../components/RiskRadar.vue'

const loading = ref(true)
const summary = ref(null)
const assessments = ref([])

const riskRows = computed(() =>
  [...assessments.value].sort((a, b) => a.total_score - b.total_score).slice(0, 8),
)

const selectedAssessment = computed(() => riskRows.value[0] || null)

onMounted(async () => {
  try {
    const [summaryData, riskData] = await Promise.all([
      fetchDashboardSummary(),
      fetchRiskAssessments(),
    ])
    summary.value = summaryData
    assessments.value = riskData
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="page">
    <header class="page-header">
      <div>
        <p class="eyebrow">智慧金融 / 小微信贷风控</p>
        <h1>茶饮咖啡小微商户风控看板</h1>
      </div>
      <el-tag size="large" effect="dark">DeepSeek + LangChain</el-tag>
    </header>

    <el-skeleton v-if="loading" :rows="8" animated />

    <template v-else>
      <section class="metric-grid">
        <article class="metric">
          <span>品牌样本</span>
          <strong>{{ summary?.brand_count || 0 }}</strong>
        </article>
        <article class="metric">
          <span>商户样本</span>
          <strong>{{ summary?.merchant_count || 0 }}</strong>
        </article>
        <article class="metric">
          <span>合同风险</span>
          <strong>{{ summary?.contract_risk_count || 0 }}</strong>
        </article>
        <article class="metric">
          <span>舆情预警</span>
          <strong>{{ summary?.opinion_risk_count || 0 }}</strong>
        </article>
      </section>

      <section class="content-grid">
        <div class="panel">
          <div class="panel-title">
            <h2>高风险关注商户</h2>
            <span>按综合风险分升序</span>
          </div>
          <el-table :data="riskRows" height="430">
            <el-table-column prop="merchant_name" label="商户" min-width="150" />
            <el-table-column prop="risk_level" label="风险等级" width="110" />
            <el-table-column prop="total_score" label="分数" width="90" />
            <el-table-column label="主要风险" min-width="220">
              <template #default="{ row }">
                {{ row.main_risk_factors.slice(0, 2).join('；') }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="panel">
          <div class="panel-title">
            <h2>七维风险雷达</h2>
            <span>{{ selectedAssessment?.merchant_name }}</span>
          </div>
          <RiskRadar v-if="selectedAssessment" :assessment="selectedAssessment" />
        </div>
      </section>

      <section class="panel">
        <div class="panel-title">
          <h2>风险等级分布</h2>
          <span>用于授信初审和贷后分层</span>
        </div>
        <div class="distribution">
          <div
            v-for="(count, level) in summary?.risk_distribution"
            :key="level"
            class="distribution-item"
          >
            <span>{{ level }}</span>
            <strong>{{ count }}</strong>
          </div>
        </div>
      </section>
    </template>
  </main>
</template>

