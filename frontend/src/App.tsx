import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Bean,
  ChevronRight,
  Coffee,
  FileSearch,
  Gauge,
  Mountain,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Waves,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  fetchAIRiskExplanation,
  fetchBrands,
  fetchDashboardSummary,
  fetchMarketContext,
  fetchMerchantReport,
  fetchMerchants,
  fetchRiskAssessments,
  fetchSpiderOverview,
  type AIRiskExplanation,
  type BrandProfile,
  type DashboardSummary,
  type MerchantMarketContext,
  type MerchantProfile,
  type RiskAssessment,
  type SpiderOverview,
} from './api/client'
import {
  MOCK_AI_EXPLANATION,
  MOCK_ASSESSMENTS,
  MOCK_BRANDS,
  MOCK_MARKET_CONTEXT,
  MOCK_MERCHANTS,
  MOCK_REPORTS,
  MOCK_SPIDER_OVERVIEW,
  MOCK_SUMMARY,
} from './mockData'

const navItems = ['首页', '风控看板', '合同审查', '智能报告', '数据接入']

const riskOrder = ['高风险', '中风险', '中低风险', '低风险']

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
}

type LoadState = 'loading' | 'ready' | 'error'
type DataSource = 'api' | 'mock'

function formatWan(value: number) {
  if (!Number.isFinite(value)) return '0.0万'
  return `${(value / 10000).toFixed(1)}万`
}

function formatRatio(value: number) {
  if (!Number.isFinite(value)) return '0%'
  return `${Math.round(value * 100)}%`
}

function formatScore(value: number) {
  if (!Number.isFinite(value)) return '0.00'
  return value.toFixed(2)
}

function riskTone(level: string) {
  if (level.includes('高')) return 'bg-rose-50 text-rose-700 ring-rose-200'
  if (level.includes('中')) return 'bg-amber-50 text-amber-700 ring-amber-200'
  return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
}

function useDashboardData() {
  const [state, setState] = useState<LoadState>('loading')
  const [dataSource, setDataSource] = useState<DataSource>('api')
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [assessments, setAssessments] = useState<RiskAssessment[]>([])
  const [merchants, setMerchants] = useState<MerchantProfile[]>([])
  const [brands, setBrands] = useState<BrandProfile[]>([])
  const [spiderOverview, setSpiderOverview] = useState<SpiderOverview | null>(null)
  const [activeMerchantId, setActiveMerchantId] = useState<string>('')
  const [marketContext, setMarketContext] = useState<MerchantMarketContext | null>(null)
  const [aiExplanation, setAiExplanation] = useState<AIRiskExplanation | null>(null)
  const [reportMarkdown, setReportMarkdown] = useState<string>('')
  const [reportState, setReportState] = useState<LoadState>('loading')

  const load = async () => {
    try {
      setDataSource('api')
      setState('loading')
      setError(null)

      const [summaryResult, assessmentResult, merchantResult, brandResult, spiderOverviewResult] = await Promise.all([
        fetchDashboardSummary(),
        fetchRiskAssessments(),
        fetchMerchants(),
        fetchBrands(),
        fetchSpiderOverview(),
      ])

      setSummary(summaryResult)
      setAssessments(assessmentResult)
      setMerchants(merchantResult)
      setBrands(brandResult)
      setSpiderOverview(spiderOverviewResult)

      const firstActiveId =
        summaryResult.high_risk_merchants[0]?.merchant_id || assessmentResult[0]?.merchant_id || merchantResult[0]?.merchant_id || ''
      setActiveMerchantId((current) => current || firstActiveId)
      setState('ready')
    } catch (err) {
      setDataSource('mock')
      setSummary(MOCK_SUMMARY)
      setAssessments(MOCK_ASSESSMENTS)
      setMerchants(MOCK_MERCHANTS)
      setBrands(MOCK_BRANDS)
      setSpiderOverview(MOCK_SPIDER_OVERVIEW)
      setMarketContext(MOCK_MARKET_CONTEXT)
      setAiExplanation(MOCK_AI_EXPLANATION)
      setActiveMerchantId(MOCK_SUMMARY.high_risk_merchants[0]?.merchant_id || MOCK_MERCHANTS[0]?.merchant_id || '')
      setReportMarkdown(MOCK_REPORTS[MOCK_SUMMARY.high_risk_merchants[0]?.merchant_id || MOCK_MERCHANTS[0]?.merchant_id || ''] || '')
      setReportState('ready')
      setState('ready')
      const message = err instanceof Error ? err.message : '数据加载失败，已切换为本地样例'
      setError(`${message}。当前页面使用本地样例数据。`)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    if (!activeMerchantId) return

    let cancelled = false
    setReportState('loading')
    setReportMarkdown('')
    setMarketContext(null)
    setAiExplanation(null)

    if (dataSource === 'mock') {
      setReportMarkdown(MOCK_REPORTS[activeMerchantId] || '当前商户暂无本地样例报告。')
      setMarketContext({ ...MOCK_MARKET_CONTEXT, merchant_id: activeMerchantId })
      setAiExplanation(MOCK_AI_EXPLANATION)
      setReportState('ready')
      return () => {
        cancelled = true
      }
    }

    Promise.all([
      fetchMerchantReport(activeMerchantId),
      fetchMarketContext(activeMerchantId),
      fetchAIRiskExplanation(activeMerchantId),
    ])
      .then(([content, context, explanation]) => {
        if (!cancelled) {
          setReportMarkdown(content)
          setMarketContext(context)
          setAiExplanation(explanation)
          setReportState('ready')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setReportMarkdown('报告加载失败，请确认后端服务已启动。')
          setReportState('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [activeMerchantId, dataSource])

  const activeMerchant = useMemo(
    () => merchants.find((item) => item.merchant_id === activeMerchantId) || null,
    [activeMerchantId, merchants],
  )

  const activeAssessment = useMemo(
    () => assessments.find((item) => item.merchant_id === activeMerchantId) || null,
    [activeMerchantId, assessments],
  )

  const activeBrand = useMemo(
    () => brands.find((item) => item.brand_name === activeMerchant?.brand_name) || null,
    [activeMerchant, brands],
  )

  const riskEntries = useMemo(() => {
    const entries = Object.entries(summary?.risk_distribution || {})
    return entries.sort(([left], [right]) => {
      const leftRank = riskOrder.findIndex((item) => left.includes(item))
      const rightRank = riskOrder.findIndex((item) => right.includes(item))
      return (leftRank === -1 ? 99 : leftRank) - (rightRank === -1 ? 99 : rightRank)
    })
  }, [summary])

  const totalRiskCount = riskEntries.reduce((total, [, value]) => total + value, 0)

    return {
      state,
      dataSource,
      error,
      summary,
    assessments,
    merchants,
    brands,
    spiderOverview,
    activeMerchantId,
    setActiveMerchantId,
    marketContext,
    aiExplanation,
    reportMarkdown,
    reportState,
    activeMerchant,
    activeAssessment,
    activeBrand,
    riskEntries,
      totalRiskCount,
      reload: load,
    }
  }

function EdgeDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-28 top-28 h-80 w-80 rounded-full border border-espresso/[0.06]" />
      <div className="absolute -left-10 top-48 h-44 w-44 rounded-full border-[10px] border-ocean/[0.04]" />
      <div className="absolute -right-32 top-20 h-96 w-96 rounded-full border-[18px] border-champagne/[0.08]" />
      <div className="absolute -right-20 bottom-10 h-64 w-64 rounded-full border border-espresso/[0.05]" />
      <Bean className="absolute left-8 bottom-24 h-28 w-28 -rotate-12 text-espresso/[0.055]" strokeWidth={1.2} />
      <Coffee className="absolute right-14 top-[45%] h-36 w-36 rotate-6 text-espresso/[0.045]" strokeWidth={1.1} />
      <Waves className="absolute left-[7%] top-[62%] h-36 w-36 text-ocean/[0.045]" strokeWidth={1.2} />
      <svg className="absolute right-[8%] bottom-20 h-40 w-80 text-ocean/[0.05]" viewBox="0 0 420 180" fill="none">
        <path d="M18 116C82 36 132 148 207 76C268 18 318 48 398 24" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <path d="M28 148C111 88 158 162 236 112C300 70 342 90 400 78" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function Navigation() {
  return (
    <motion.nav
      {...fadeIn}
      className="relative z-20 w-full overflow-hidden rounded-[20px] bg-ink px-5 py-4 text-white shadow-soft md:px-7"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne/55 to-transparent" />
      <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-champagne/45 bg-white/8">
            <ShieldCheck className="h-5 w-5 text-champagne" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[11px] font-medium tracking-[0.2em] text-white/46">咕咕嘎嘎歪比巴卟小组</p>
            <p className="text-sm font-semibold tracking-wide text-white">Tea Coffee Credit Risk</p>
          </div>
        </div>

        <div className="grid w-full min-w-0 grid-cols-3 gap-x-3 gap-y-3 text-xs text-white/68 sm:flex sm:flex-wrap sm:items-center sm:text-sm md:gap-x-6 lg:w-auto">
          {navItems.map((item, index) => (
            <a key={item} className="group flex items-center gap-2 transition hover:text-white" href="#">
              {index === 0 && <span className="h-1.5 w-1.5 rounded-full bg-champagne" />}
              <span>{item}</span>
            </a>
          ))}
        </div>

        <div className="flex max-w-full items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/58 md:text-xs md:tracking-[0.22em]">
          <span className="h-px w-6 bg-champagne/55 md:w-8" />
          Micro Credit Risk Platform
        </div>
      </div>
    </motion.nav>
  )
}

function MountainVisual({ summary, activeMerchant }: { summary: DashboardSummary | null; activeMerchant: MerchantProfile | null }) {
  const headlineScore = summary?.high_risk_merchants[0]?.score ?? 0

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
      className="group relative min-h-[430px] w-full min-w-0 overflow-hidden rounded-[20px] bg-[#D8E4F0] shadow-soft ring-1 ring-white/70 md:min-h-[520px]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#DDEAF5] via-[#C7D7E7] to-[#EEF4FA]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/42 to-transparent" />

      <svg className="absolute inset-x-0 bottom-0 h-[82%] w-full transition duration-700 group-hover:scale-[1.015]" viewBox="0 0 1100 620" preserveAspectRatio="none">
        <path d="M0 468L126 342L208 402L314 280L432 420L552 218L696 436L796 304L930 430L1100 286V620H0Z" fill="#AFC3D8" />
        <path d="M0 510L158 388L276 478L398 344L534 492L650 326L804 510L934 404L1100 474V620H0Z" fill="#CAD8E7" />
        <path d="M0 564L180 500L322 548L482 470L642 558L822 492L1100 548V620H0Z" fill="#EEF4FA" />
        <path d="M548 220L588 282L554 262L520 306L490 286Z" fill="#F8FBFF" opacity="0.82" />
        <path d="M794 306L824 352L798 338L766 376L742 356Z" fill="#F8FBFF" opacity="0.74" />
      </svg>

      <svg className="absolute right-7 top-20 h-40 w-80 text-white/36 md:right-16 md:top-24" viewBox="0 0 340 150" fill="none">
        <path d="M20 90C64 32 104 128 152 78C198 30 238 92 318 40" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
        <path d="M34 120C84 78 126 132 178 98C226 68 264 88 316 72" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>

      <div className="absolute right-6 top-6 rounded-2xl border border-white/55 bg-white/54 p-4 text-right shadow-cafe backdrop-blur md:right-9 md:top-9">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-copy">Contract Risk</p>
        <p className="mt-2 text-3xl font-black tracking-tight text-ink">
          {formatScore(headlineScore)} <span className="text-lg text-champagne">↑</span>
        </p>
        <p className="mt-1 text-xs text-copy">{activeMerchant ? `${activeMerchant.brand_name} · 重点商户` : '等待商户数据'}</p>
      </div>

      <div className="absolute left-6 top-7 max-w-[260px] md:left-10 md:top-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/42 px-3 py-1 text-xs font-semibold text-ink/72 backdrop-blur">
          <Mountain className="h-3.5 w-3.5 text-champagne" />
          Snow Signal View
        </div>
        <p className="text-sm leading-7 text-ink/60">
          保留深海军蓝、灰蓝雪山和极淡奶泡线条，主视觉仍然偏金融平台，但用咖啡与茶饮的质感把行业语境拉回来。
        </p>
      </div>
    </motion.div>
  )
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint: string
  icon: typeof Activity
}) {
  return (
    <div className="rounded-[20px] border border-line/85 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-copy">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-ink">{value}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-copy">{hint}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-champagne">
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
      </div>
    </div>
  )
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/75 ${className || ''}`} />
}

function SummaryStrip({ summary, state }: { summary: DashboardSummary | null; state: LoadState }) {
  const cards = [
    { label: '品牌总数', value: summary ? `${summary.brand_count}` : '—', hint: 'brands table', icon: BadgeCheck },
    { label: '商户总数', value: summary ? `${summary.merchant_count}` : '—', hint: 'merchants table', icon: Store },
    { label: '合同风险', value: summary ? `${summary.contract_risk_count}` : '—', hint: 'contract flags', icon: FileSearch },
    { label: '舆情风险', value: summary ? `${summary.opinion_risk_count}` : '—', hint: 'public opinion flags', icon: Activity },
  ] as const

  return (
    <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) =>
        state === 'loading' && !summary ? (
          <SkeletonBlock key={card.label} className="h-[130px] rounded-[20px]" />
        ) : (
          <MetricCard key={card.label} {...card} />
        ),
      )}
    </section>
  )
}

function RiskDistribution({
  summary,
  riskEntries,
  totalRiskCount,
}: {
  summary: DashboardSummary | null
  riskEntries: Array<[string, number]>
  totalRiskCount: number
}) {
  return (
    <section className="rounded-[20px] border border-line/85 bg-white p-6 shadow-soft">
      <div className="mb-6 flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-bold text-ocean">风险分布</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-ink">当前授信样本的风险层级</h2>
        </div>
        <div className="rounded-2xl border border-line bg-[#F8FBFF] px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-copy">Data Source</p>
          <p className="mt-2 text-sm font-bold text-ink">{summary ? 'API + SQLite Seed' : 'Waiting for API'}</p>
        </div>
      </div>

      <div className="space-y-4">
        {riskEntries.length === 0 ? (
          <>
            <SkeletonBlock className="h-12" />
            <SkeletonBlock className="h-12" />
            <SkeletonBlock className="h-12" />
          </>
        ) : (
          riskEntries.map(([level, count]) => {
            const width = totalRiskCount ? Math.max(8, (count / totalRiskCount) * 100) : 8
            return (
              <div key={level} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink">{level}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${riskTone(level)}`}>{count}</span>
                </div>
                <div className="h-2.5 rounded-full bg-line">
                  <div
                    className={`h-2.5 rounded-full ${
                      level.includes('高') ? 'bg-rose-500' : level.includes('中') ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}

function MerchantSelector({
  summary,
  assessments,
  activeMerchantId,
  onSelect,
}: {
  summary: DashboardSummary | null
  assessments: RiskAssessment[]
  activeMerchantId: string
  onSelect: (merchantId: string) => void
}) {
  const items =
    summary?.high_risk_merchants.map((item) => ({
      merchant_id: item.merchant_id,
      merchant_name: item.merchant_name,
      score: item.score,
      level: item.level,
    })) ||
    assessments.slice(0, 5).map((item) => ({
      merchant_id: item.merchant_id,
      merchant_name: item.merchant_name,
      score: item.total_score,
      level: item.risk_level,
    }))

  return (
    <section className="rounded-[20px] border border-line/85 bg-white p-6 shadow-soft">
      <div className="mb-5 flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-bold text-ocean">高风险商户</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-ink">优先跟进的授信样本</h2>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-[#F8FBFF] px-4 py-2 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:shadow-sm"
        >
          <RefreshCw className="h-4 w-4" />
          重新同步
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <>
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-20" />
          </>
        ) : (
          items.map((item) => {
            const selected = item.merchant_id === activeMerchantId
            return (
              <button
                key={item.merchant_id}
                type="button"
                onClick={() => onSelect(item.merchant_id)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                  selected ? 'border-ocean bg-[#F8FBFF] shadow-sm' : 'border-line hover:bg-[#FAFCFF]'
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">{item.merchant_name}</p>
                  <p className="mt-1 text-xs text-copy">{item.merchant_id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${riskTone(item.level)}`}>{item.level}</span>
                  <span className="text-lg font-black text-champagne">{formatScore(item.score)}</span>
                </div>
              </button>
            )
          })
        )}
      </div>
    </section>
  )
}

function MerchantProfileCard({
  merchant,
  brand,
  assessment,
}: {
  merchant: MerchantProfile | null
  brand: BrandProfile | null
  assessment: RiskAssessment | null
}) {
  const metrics = merchant
    ? [
        { label: '城市', value: merchant.city },
        { label: '商圈', value: merchant.business_area_type },
        { label: '月营收', value: formatWan(merchant.monthly_revenue) },
        { label: '客单价', value: `¥${merchant.average_ticket.toFixed(0)}` },
        { label: '到店评分', value: merchant.takeaway_rating.toFixed(1) },
        { label: '开店时长', value: `${merchant.opening_months} 个月` },
      ]
    : []

  return (
    <section className="rounded-[20px] border border-line/85 bg-white p-6 shadow-soft">
      <div className="mb-5">
        <p className="text-sm font-bold text-ocean">当前商户画像</p>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-ink">{merchant?.merchant_name || '等待选择商户'}</h2>
        <p className="mt-2 text-sm leading-7 text-copy">
          {merchant
            ? `${merchant.brand_name} · ${merchant.city}${merchant.district ? ` · ${merchant.district}` : ''}`
            : '点击左侧高风险商户列表，查看具体画像、品牌信息和报告预览。'}
        </p>
      </div>

      {merchant ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {metrics.map((item) => (
              <div key={item.label} className="rounded-2xl border border-line bg-[#FAFCFF] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-copy">{item.label}</p>
                <p className="mt-2 text-sm font-bold text-ink">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-line bg-[#F8FBFF] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
              <BadgeCheck className="h-4 w-4 text-champagne" />
              经营与风险标签
            </div>
            <div className="flex flex-wrap gap-2">
              {merchant.negative_review_keywords.slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-copy ring-1 ring-line">
                  {tag}
                </span>
              ))}
              {merchant.has_contract_risk && (
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-200">
                  合同风险
                </span>
              )}
              {merchant.recent_public_opinion_risk && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                  舆情风险
                </span>
              )}
            </div>
          </div>

          {brand && (
            <div className="mt-5 rounded-2xl border border-line bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-ink">{brand.brand_name}</p>
                  <p className="text-xs text-copy">{brand.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.16em] text-copy">门店成熟度</p>
                  <p className="mt-1 text-lg font-black text-champagne">{brand.franchise_maturity}/5</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {brand.risk_tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full bg-[#F8FBFF] px-3 py-1 text-xs font-medium text-ink ring-1 ring-line">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-[#FAFCFF] p-6 text-sm text-copy">
          当前还没有选中的商户。数据加载完成后会自动选中一条重点风险样本。
        </div>
      )}

      {assessment && (
        <div className="mt-5 rounded-2xl border border-line bg-[#F8FBFF] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
            <Gauge className="h-4 w-4 text-champagne" />
            评分拆解
          </div>
          <div className="space-y-3">
            {assessment.dimension_scores.slice(0, 4).map((item) => (
              <div key={item.dimension}>
                <div className="flex items-center justify-between text-xs text-copy">
                  <span>{item.dimension}</span>
                  <span className="font-bold text-ink">{formatScore(item.score)}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-line">
                  <div className="h-2 rounded-full bg-ocean" style={{ width: `${Math.max(10, item.score)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function ReportPreview({ reportMarkdown, reportState }: { reportMarkdown: string; reportState: LoadState }) {
  return (
    <section className="rounded-[20px] border border-line/85 bg-white p-6 shadow-soft">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-ocean">智能报告预览</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-ink">后端生成的 Markdown 风险报告</h2>
        </div>
        <div className="rounded-full border border-line bg-[#F8FBFF] px-3 py-1 text-xs font-semibold text-copy">
          {reportState === 'loading' ? '加载中' : reportState === 'error' ? '加载失败' : '已接通'}
        </div>
      </div>
      <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-2xl border border-line bg-[#FAFCFF] p-4 text-sm leading-7 text-copy">
        {reportMarkdown || '选择一个商户后，这里会显示后端生成的 markdown 报告。'}
      </pre>
    </section>
  )
}

function MarketIntelPanel({
  overview,
  context,
}: {
  overview: SpiderOverview | null
  context: MerchantMarketContext | null
}) {
  const topCities = overview?.top_cities.slice(0, 3) || []
  const topBrands = overview?.top_brands.slice(0, 3) || []

  return (
    <section className="rounded-[20px] border border-line/85 bg-white p-6 shadow-soft">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-ocean">TS 数据市场环境</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-ink">公开爬虫数据的轻量化接入</h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-champagne">
          <TrendingUp className="h-5 w-5" strokeWidth={1.8} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-[#FAFCFF] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-copy">Store Samples</p>
          <p className="mt-2 text-2xl font-black text-ink">{overview ? overview.store_count.toLocaleString() : '—'}</p>
        </div>
        <div className="rounded-2xl border border-line bg-[#FAFCFF] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-copy">Brands</p>
          <p className="mt-2 text-2xl font-black text-ink">{overview?.brand_count ?? '—'}</p>
        </div>
        <div className="rounded-2xl border border-line bg-[#FAFCFF] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-copy">News</p>
          <p className="mt-2 text-2xl font-black text-champagne">{overview?.news_count ?? '—'}</p>
        </div>
      </div>

      {context && (
        <div className="mt-5 rounded-2xl border border-line bg-[#F8FBFF] p-4">
          <p className="text-sm font-bold text-ink">{context.city} / {context.brand_name}</p>
          <p className="mt-2 text-sm leading-7 text-copy">{context.usage_note}</p>
          <div className="mt-4 space-y-2">
            {context.external_risk_signals.slice(0, 3).map((signal) => (
              <div key={signal} className="flex gap-2 text-sm leading-6 text-copy">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-champagne" />
                <span>{signal}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-copy">Top Cities</p>
          <div className="space-y-2">
            {topCities.map((city) => (
              <div key={city.city} className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3">
                <span className="text-sm font-bold text-ink">{city.city}</span>
                <span className="text-sm font-black text-champagne">{city.store_count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-copy">Top Brands</p>
          <div className="space-y-2">
            {topBrands.map((brand) => (
              <div key={brand.brand_name} className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3">
                <span className="text-sm font-bold text-ink">{brand.brand_name}</span>
                <span className="text-sm font-black text-champagne">{brand.store_count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function AIExplanationPanel({ explanation }: { explanation: AIRiskExplanation | null }) {
  return (
    <section className="rounded-[20px] border border-line/85 bg-white p-6 shadow-soft">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-ocean">AI 可解释风控</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-ink">DeepSeek 压缩摘要分析</h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-champagne">
          <Sparkles className="h-5 w-5" strokeWidth={1.8} />
        </div>
      </div>

      {explanation ? (
        <>
          <div className="rounded-2xl border border-line bg-[#F8FBFF] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-copy ring-1 ring-line">
                {explanation.source === 'deepseek' ? 'DeepSeek' : 'Local Rules'}
              </span>
              <span className="text-xs font-semibold text-copy">Token Saving</span>
            </div>
            <p className="text-sm leading-7 text-copy">{explanation.summary}</p>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-copy">Risk Points</p>
              <div className="space-y-2">
                {explanation.risk_points.slice(0, 4).map((item) => (
                  <div key={item} className="rounded-2xl border border-line bg-white px-4 py-3 text-sm leading-6 text-copy">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-copy">Follow-up Data</p>
              <div className="flex flex-wrap gap-2">
                {explanation.follow_up_data.slice(0, 6).map((item) => (
                  <span key={item} className="rounded-full bg-[#F8FBFF] px-3 py-1.5 text-xs font-semibold text-copy ring-1 ring-line">
                    {item}
                  </span>
                ))}
              </div>
              <p className="mt-4 rounded-2xl border border-line bg-[#FAFCFF] p-4 text-sm leading-7 text-copy">
                {explanation.credit_suggestion}
              </p>
            </div>
          </div>

          <p className="mt-5 text-xs leading-6 text-copy">{explanation.token_saving_note}</p>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-[#FAFCFF] p-6 text-sm text-copy">
          选择商户后，这里会展示基于评分结果和 TS 聚合市场环境生成的风险解释。
        </div>
      )}
    </section>
  )
}

function DatabaseStage({
  merchants,
  brands,
  summary,
  spiderOverview,
  dataSource,
}: {
  merchants: MerchantProfile[]
  brands: BrandProfile[]
  summary: DashboardSummary | null
  spiderOverview: SpiderOverview | null
  dataSource: DataSource
}) {
  const tables = [
    { name: 'brand_profile', rows: brands.length, note: '品牌、价格带、门店成熟度' },
    { name: 'merchant_profile', rows: merchants.length, note: '门店画像、营收、成本和风险位' },
    { name: 'contract_record', rows: summary ? summary.contract_risk_count : 0, note: '待导入合同审查样本' },
    { name: 'public_opinion', rows: summary ? summary.opinion_risk_count : 0, note: '待接入舆情样本与标签' },
    { name: 'spider_aggregate', rows: spiderOverview ? spiderOverview.store_count : 0, note: 'TS 门店、品牌、城市聚合样例' },
  ]

  return (
    <section className="rounded-[24px] border border-line/85 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold text-ocean">数据库预留区</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-ink">等 TS 数据到位后直接导入</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-copy">
            这里先把数据库层的接入口预留好，后续只要把 TS 整理好的真实样本塞进来，就能替换当前 SQLite 示例数据，不需要再改页面结构。
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-line bg-[#F8FBFF] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-copy">
            {dataSource === 'api' ? 'Backend ready' : 'Local sample'}
          </span>
          <span className="rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
            {dataSource === 'api' ? 'API connected' : 'API pending'}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        {tables.map((table) => (
          <div key={table.name} className="rounded-2xl border border-line bg-[#FAFCFF] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-copy">{table.name}</p>
            <div className="mt-3 flex items-baseline justify-between gap-3">
              <p className="text-3xl font-black tracking-tight text-ink">{table.rows}</p>
              <ChevronRight className="h-4 w-4 text-champagne" />
            </div>
            <p className="mt-2 text-sm leading-6 text-copy">{table.note}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function LoadingShell() {
  return (
    <div className="space-y-4 rounded-[20px] border border-line bg-white p-6 shadow-soft">
      <SkeletonBlock className="h-8 w-48" />
      <SkeletonBlock className="h-14 w-4/5" />
      <SkeletonBlock className="h-6 w-3/4" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-24" />
      </div>
    </div>
  )
}

export default function App() {
  const {
    state,
    dataSource,
    error,
    summary,
    assessments,
    merchants,
    brands,
    spiderOverview,
    activeMerchantId,
    setActiveMerchantId,
    marketContext,
    aiExplanation,
    reportMarkdown,
    reportState,
    activeMerchant,
    activeAssessment,
    activeBrand,
    riskEntries,
    totalRiskCount,
    reload,
  } = useDashboardData()

  const primaryMerchant = summary?.high_risk_merchants[0]
  const heroScore = primaryMerchant?.score ?? activeAssessment?.total_score ?? 0
  const heroLevel = primaryMerchant?.level || activeAssessment?.risk_level || '等待数据'
  const heroName = primaryMerchant?.merchant_name || activeMerchant?.merchant_name || '等待数据库导入'

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-glacier via-[#F7FAFD] to-[#E8F0F8] px-4 py-5 font-sans text-ink md:px-8 md:py-8">
      <EdgeDecor />
      <section className="relative mx-auto w-full max-w-[1400px]">
        <Navigation />

        {state === 'loading' && !summary ? (
          <div className="mt-8">
            <LoadingShell />
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
              <motion.div {...fadeIn} className="relative min-h-[430px] w-full overflow-hidden rounded-[20px] bg-white p-6 shadow-soft ring-1 ring-line md:min-h-[520px] md:p-10">
                <div className="absolute right-6 top-6 rounded-full border border-line bg-[#F8FBFF] px-3 py-1.5 text-xs font-semibold text-copy">
                  版本一 · 接口联通
                </div>

                <div className="flex h-full flex-col justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.32em] text-ocean">Micro Credit Risk Index</p>
                    <h1 className="mt-5 max-w-2xl text-[2.35rem] font-black leading-[1.08] tracking-[-0.03em] text-ink md:text-6xl">
                      <span className="block">茶饮咖啡小微商户</span>
                      <span className="block">轻量化信贷风控平台</span>
                    </h1>
                    <p className="mt-6 max-w-2xl text-base leading-8 text-copy md:text-lg">
                      这一版把首页、风控列表、智能报告和数据库预留区都先搭起来，前端直接吃后端接口，后续 TS 只需要把正式数据补到数据库里。
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <span className="rounded-full bg-ocean px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                        {dataSource === 'api' ? 'API connected' : 'Mock fallback'}
                      </span>
                      <span className="rounded-full border border-line bg-[#F8FBFF] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-copy">
                        SQLite seed ready
                      </span>
                      <span className="rounded-full border border-line bg-[#F8FBFF] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-copy">
                        Waiting for TS data
                      </span>
                    </div>
                  </div>

                  <div className="mt-10 grid gap-6 md:grid-cols-[1.12fr_0.88fr] md:items-end">
                    <div>
                      <p className="text-sm font-semibold text-copy">重点商户风险分</p>
                      <div className="mt-3 flex items-end gap-3">
                        <span className="text-7xl font-black leading-none tracking-[-0.07em] text-champagne md:text-8xl">
                          {formatScore(heroScore)}
                        </span>
                        <span className="mb-3 flex items-center gap-1 text-2xl font-black text-champagne">
                          <ArrowUpRight className="h-6 w-6" strokeWidth={2.3} />
                        </span>
                      </div>
                      <p className="mt-4 text-xs font-bold uppercase tracking-[0.28em] text-copy">重点商户 · {heroName}</p>
                      <p className="mt-2 text-sm text-copy">当前层级：{heroLevel}</p>
                    </div>

                    <div className="rounded-2xl border border-line bg-[#F8FBFF] p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-ink">
                          <Gauge className="h-5 w-5 text-champagne" />
                          风控解释
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-copy ring-1 ring-line">
                          {summary ? 'Low-Moderate' : 'Waiting'}
                        </span>
                      </div>
                      <div className="space-y-3 text-sm text-copy">
                        <div className="flex items-center justify-between">
                          <span>商户总数</span>
                          <span className="font-bold text-ink">{summary ? summary.merchant_count : '—'}</span>
                        </div>
                        <div className="h-2 rounded-full bg-line">
                          <div className="h-2 rounded-full bg-ocean" style={{ width: summary ? '82%' : '24%' }} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>合同风险命中</span>
                          <span className="font-bold text-champagne">{summary ? summary.contract_risk_count : '—'} 项</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>舆情风险命中</span>
                          <span className="font-bold text-ink">{summary ? summary.opinion_risk_count : '—'} 项</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <MountainVisual summary={summary} activeMerchant={activeMerchant} />
            </div>

            <SummaryStrip summary={summary} state={state} />

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-6">
                <RiskDistribution summary={summary} riskEntries={riskEntries} totalRiskCount={totalRiskCount} />
                <MerchantSelector
                  summary={summary}
                  assessments={assessments}
                  activeMerchantId={activeMerchantId}
                  onSelect={setActiveMerchantId}
                />
              </div>

              <div className="space-y-6">
                <MerchantProfileCard merchant={activeMerchant} brand={activeBrand} assessment={activeAssessment} />
                <AIExplanationPanel explanation={aiExplanation} />
                <ReportPreview reportMarkdown={reportMarkdown} reportState={reportState} />
              </div>
            </div>

            <div className="mt-8">
              <MarketIntelPanel overview={spiderOverview} context={marketContext} />
            </div>

            <div className="mt-8">
              <DatabaseStage merchants={merchants} brands={brands} summary={summary} spiderOverview={spiderOverview} dataSource={dataSource} />
            </div>

            <section className="mt-8 rounded-[20px] border border-line/85 bg-white/70 p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-bold text-ocean">当前联调状态</p>
                  <p className="mt-2 text-sm leading-7 text-copy">
                    前端已按后端接口完成对接；后端可用时会直接读取品牌、商户、风险评分和报告内容。当前环境若后端依赖未安装，页面会先使用本地样例兜底。数据库层先用 SQLite 示例数据承载，等 TS 把正式数据给到后，直接替换导入源即可。
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-copy">
                  <span className="rounded-full border border-line bg-white px-4 py-2">{dataSource === 'api' ? 'API ready' : 'Mock fallback'}</span>
                  <span className="rounded-full border border-line bg-white px-4 py-2">Report preview ready</span>
                  <span className="rounded-full border border-line bg-white px-4 py-2">DB staging ready</span>
                </div>
              </div>
            </section>

            <div className="mt-8 flex flex-col gap-3 pb-8 text-xs text-copy md:flex-row md:items-center md:justify-between">
              <p>Tea & Coffee Micro Credit Risk Platform · DeepSeek Skill + LangChain 风控原型</p>
              <p className="font-semibold uppercase tracking-[0.22em] text-ink/55">Trusted · Explainable · Lightweight</p>
            </div>
          </>
        )}

        {state === 'error' && (
          <div className="mt-6 rounded-[20px] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold">前端已启动，但后端接口暂时没拉通。</p>
                <p className="mt-2 leading-7">{error}</p>
              </div>
              <button
                type="button"
                onClick={reload}
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white"
              >
                <RefreshCw className="h-4 w-4" />
                重试
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
