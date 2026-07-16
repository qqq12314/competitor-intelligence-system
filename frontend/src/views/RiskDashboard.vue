<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchDashboardSummary, fetchRiskAssessments } from '../api/client'
import RiskRadar from '../components/RiskRadar.vue'

const fallbackSummary = {
  brand_count: 12,
  merchant_count: 20,
  contract_risk_count: 5,
  opinion_risk_count: 3,
  risk_distribution: {
    低风险: 4,
    中低风险: 7,
    中风险: 6,
    高风险: 3,
  },
}

const fallbackAssessments = [
  {
    merchant_id: 'M015',
    merchant_name: '商圈库迪快取店',
    total_score: 46.8,
    risk_level: '高风险',
    main_risk_factors: ['负债占比较高', '周边竞品密度较高', '存在近期舆情预警'],
    business_strengths: ['快取模式坪效较高'],
    credit_suggestion: '暂不建议直接授信，应补充流水和租约材料后复核。',
    post_loan_watchlist: ['品牌补贴变化', '平台评分下降', '租金续约压力'],
    dimension_scores: [
      { dimension: '经营能力', score: 55 },
      { dimension: '财务压力', score: 38 },
      { dimension: '品牌稳定性', score: 64 },
      { dimension: '行业竞争', score: 28 },
      { dimension: '合同风险', score: 52 },
      { dimension: '舆情预警', score: 58 },
      { dimension: '渠道履约', score: 66 },
    ],
  },
  {
    merchant_id: 'M008',
    merchant_name: '社区库迪店',
    total_score: 52.4,
    risk_level: '中风险',
    main_risk_factors: ['合同条款存在潜在风险', '近期品牌舆情需关注'],
    business_strengths: ['社区客群稳定'],
    credit_suggestion: '建议控制额度，并设置月度流水回访。',
    post_loan_watchlist: ['活动价格变化', '复购率下降'],
    dimension_scores: [
      { dimension: '经营能力', score: 60 },
      { dimension: '财务压力', score: 46 },
      { dimension: '品牌稳定性', score: 66 },
      { dimension: '行业竞争', score: 35 },
      { dimension: '合同风险', score: 52 },
      { dimension: '舆情预警', score: 58 },
      { dimension: '渠道履约', score: 64 },
    ],
  },
  {
    merchant_id: 'M005',
    merchant_name: '写字楼奈雪店',
    total_score: 61.7,
    risk_level: '中风险',
    main_risk_factors: ['租金占比较高', '人工成本压力偏大'],
    business_strengths: ['月流水处于样本较高水平', '办公商圈客流稳定'],
    credit_suggestion: '建议补充租约和成本明细后审慎授信。',
    post_loan_watchlist: ['租金续约', '高峰等待评价'],
    dimension_scores: [
      { dimension: '经营能力', score: 73 },
      { dimension: '财务压力', score: 48 },
      { dimension: '品牌稳定性', score: 70 },
      { dimension: '行业竞争', score: 65 },
      { dimension: '合同风险', score: 52 },
      { dimension: '舆情预警', score: 84 },
      { dimension: '渠道履约', score: 77 },
    ],
  },
  {
    merchant_id: 'M001',
    merchant_name: '春熙路蜜雪加盟店',
    total_score: 74.0,
    risk_level: '中低风险',
    main_risk_factors: ['周边竞品密度较高'],
    business_strengths: ['开店时间较长', '外卖评分较高'],
    credit_suggestion: '建议审慎授信，控制额度并持续关注竞品压力。',
    post_loan_watchlist: ['商圈价格战', '排队与履约评价'],
    dimension_scores: [
      { dimension: '经营能力', score: 82 },
      { dimension: '财务压力', score: 72 },
      { dimension: '品牌稳定性', score: 78 },
      { dimension: '行业竞争', score: 45 },
      { dimension: '合同风险', score: 86 },
      { dimension: '舆情预警', score: 84 },
      { dimension: '渠道履约', score: 92 },
    ],
  },
]

const loading = ref(true)
const usingFallback = ref(false)
const summary = ref(fallbackSummary)
const assessments = ref(fallbackAssessments)

const sortedAssessments = computed(() =>
  [...assessments.value].sort((a, b) => a.total_score - b.total_score),
)

const focusMerchant = computed(() => sortedAssessments.value[0] || fallbackAssessments[0])

const riskQueue = computed(() => sortedAssessments.value.slice(0, 6))

const totalMerchants = computed(() => summary.value?.merchant_count || assessments.value.length)

const riskShare = computed(() => {
  const distribution = summary.value?.risk_distribution || {}
  const risky = (distribution['中风险'] || 0) + (distribution['高风险'] || 0)
  return totalMerchants.value ? Math.round((risky / totalMerchants.value) * 100) : 0
})

const avgScore = computed(() => {
  if (!assessments.value.length) return 0
  const total = assessments.value.reduce((sum, item) => sum + Number(item.total_score || 0), 0)
  return Math.round((total / assessments.value.length) * 10) / 10
})

const distributionItems = computed(() => {
  const distribution = summary.value?.risk_distribution || fallbackSummary.risk_distribution
  return Object.entries(distribution).map(([level, count]) => ({ level, count }))
})

const trendBars = [
  { label: '周一', value: 42 },
  { label: '周二', value: 48 },
  { label: '周三', value: 57 },
  { label: '周四', value: 51 },
  { label: '周五', value: 64 },
  { label: '周六', value: 59 },
  { label: '周日', value: 68 },
]

const alerts = [
  { level: '高', title: '价格战压力', text: '库迪、幸运咖样本门店补贴频率较高，需关注毛利波动。' },
  { level: '中', title: '合同保证金', text: '部分加盟和租赁合同出现保证金不予退还条款。' },
  { level: '中', title: '租金续约', text: '商场和核心商圈样本店租金占比偏高。' },
]

const levelClass = (level) => {
  if (level?.includes('高')) return 'danger'
  if (level?.includes('中风险')) return 'warning'
  if (level?.includes('中低')) return 'stable'
  return 'safe'
}

onMounted(async () => {
  try {
    const [summaryData, riskData] = await Promise.all([
      fetchDashboardSummary(),
      fetchRiskAssessments(),
    ])
    summary.value = summaryData
    assessments.value = riskData.length ? riskData : fallbackAssessments
  } catch (error) {
    usingFallback.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="risk-shell">
    <aside class="sidebar">
      <div class="brand-mark">
        <span class="brand-logo">R</span>
        <div>
          <strong>RiskLens</strong>
          <small>Tea & Coffee Credit</small>
        </div>
      </div>
      <nav class="nav-list" aria-label="主导航">
        <a class="nav-item active" href="#">风控总览</a>
        <a class="nav-item" href="#">商户画像</a>
        <a class="nav-item" href="#">合同审查</a>
        <a class="nav-item" href="#">报告中心</a>
      </nav>
      <div class="sidebar-note">
        <span>本周重点</span>
        <strong>完成前端看板首版视觉和基础联调入口</strong>
      </div>
    </aside>

    <section class="workspace">
      <header class="topbar">
        <div>
          <p class="eyebrow">智慧金融 / 小微经营贷 / 茶饮咖啡</p>
          <h1>小微商户信贷风控驾驶舱</h1>
        </div>
        <div class="topbar-actions">
          <span class="status-pill">{{ usingFallback ? '演示数据' : '接口数据' }}</span>
          <button class="ghost-button" type="button">导出报告</button>
        </div>
      </header>

      <el-skeleton v-if="loading" :rows="10" animated />

      <template v-else>
        <section class="hero-band">
          <div class="hero-copy">
            <span class="section-label">Portfolio Risk</span>
            <h2>暖色金融风控工作台首版</h2>
            <p>
              面向茶饮咖啡门店授信初审，集中呈现品牌样本、合同风险、舆情预警和高风险商户队列。
            </p>
          </div>
          <div class="hero-score">
            <span>组合风险占比</span>
            <strong>{{ riskShare }}%</strong>
            <small>中风险及以上商户占比</small>
          </div>
        </section>

        <section class="metric-grid">
          <article class="metric-card accent">
            <span>品牌样本</span>
            <strong>{{ summary?.brand_count || 0 }}</strong>
            <small>覆盖茶饮、咖啡、茶咖融合品牌</small>
          </article>
          <article class="metric-card">
            <span>商户样本</span>
            <strong>{{ totalMerchants }}</strong>
            <small>用于授信初审和经营画像</small>
          </article>
          <article class="metric-card">
            <span>合同风险</span>
            <strong>{{ summary?.contract_risk_count || 0 }}</strong>
            <small>保证金、违约责任、单方解除</small>
          </article>
          <article class="metric-card">
            <span>平均评分</span>
            <strong>{{ avgScore }}</strong>
            <small>样本综合风控得分</small>
          </article>
        </section>

        <section class="main-grid">
          <article class="panel queue-panel">
            <div class="panel-title">
              <div>
                <span class="section-label">Credit Queue</span>
                <h2>授信关注队列</h2>
              </div>
              <span class="muted">按风险分由低到高排序</span>
            </div>
            <div class="merchant-list">
              <div v-for="merchant in riskQueue" :key="merchant.merchant_id" class="merchant-row">
                <div>
                  <strong>{{ merchant.merchant_name }}</strong>
                  <p>{{ merchant.main_risk_factors?.slice(0, 2).join(' / ') }}</p>
                </div>
                <div class="score-stack">
                  <span :class="['risk-badge', levelClass(merchant.risk_level)]">
                    {{ merchant.risk_level }}
                  </span>
                  <strong>{{ merchant.total_score }}</strong>
                </div>
              </div>
            </div>
          </article>

          <article class="panel radar-panel">
            <div class="panel-title">
              <div>
                <span class="section-label">Risk Radar</span>
                <h2>{{ focusMerchant.merchant_name }}</h2>
              </div>
              <span :class="['risk-badge', levelClass(focusMerchant.risk_level)]">
                {{ focusMerchant.risk_level }}
              </span>
            </div>
            <RiskRadar :assessment="focusMerchant" />
          </article>
        </section>

        <section class="bottom-grid">
          <article class="panel">
            <div class="panel-title">
              <div>
                <span class="section-label">Risk Distribution</span>
                <h2>风险等级分布</h2>
              </div>
            </div>
            <div class="distribution">
              <div
                v-for="item in distributionItems"
                :key="item.level"
                class="distribution-item"
              >
                <span>{{ item.level }}</span>
                <strong>{{ item.count }}</strong>
              </div>
            </div>
            <div class="trend-card">
              <div class="trend-header">
                <span>贷后预警热度</span>
                <strong>+18%</strong>
              </div>
              <div class="trend-bars">
                <div v-for="bar in trendBars" :key="bar.label" class="trend-bar">
                  <i :style="{ height: `${bar.value}%` }" />
                  <span>{{ bar.label }}</span>
                </div>
              </div>
            </div>
          </article>

          <article class="panel recommendation-panel">
            <div class="panel-title">
              <div>
                <span class="section-label">Credit Suggestion</span>
                <h2>首要商户授信建议</h2>
              </div>
            </div>
            <p class="suggestion-text">{{ focusMerchant.credit_suggestion }}</p>
            <div class="watch-list">
              <span v-for="item in focusMerchant.post_loan_watchlist" :key="item">
                {{ item }}
              </span>
            </div>
          </article>

          <article class="panel alerts-panel">
            <div class="panel-title">
              <div>
                <span class="section-label">Alerts</span>
                <h2>合同与舆情预警</h2>
              </div>
            </div>
            <div class="alert-list">
              <div v-for="alert in alerts" :key="alert.title" class="alert-row">
                <span>{{ alert.level }}</span>
                <div>
                  <strong>{{ alert.title }}</strong>
                  <p>{{ alert.text }}</p>
                </div>
              </div>
            </div>
          </article>
        </section>
      </template>
    </section>
  </main>
</template>
