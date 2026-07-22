import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Bean,
  Building2,
  ChevronRight,
  Coffee,
  Database,
  FileText,
  Gauge,
  LineChart,
  MapPin,
  Mountain,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Waves,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  fetchBrandDataStatus,
  fetchBrandAIAnalysis,
  fetchBrandIntelList,
  fetchBrandIntelSummary,
  fetchBrandReport,
  fetchProjectOverview,
  fetchRegionIntel,
  type BrandAIAnalysis,
  type BrandDataStatus,
  type BrandIntelItem,
  type BrandIntelSummary,
  type ProjectOverview,
  type RegionIntel,
} from './api/client'
import { MOCK_AI_ANALYSIS, MOCK_BRANDS, MOCK_REGION, MOCK_SUMMARY } from './mockData'

type LoadState = 'loading' | 'ready' | 'error'
type AnalysisState = 'idle' | 'loading' | 'ready' | 'error'
type DataSource = 'api' | 'mock'
type Scenario = 'mixed' | 'investment' | 'franchise'

const navItems = [
  { label: '首页', href: '#home' },
  { label: '品牌风险', href: '#brand-risk' },
  { label: '地区加盟', href: '#region-franchise' },
  { label: '智能报告', href: '#smart-report' },
  { label: '项目说明', href: '#project-info' },
]
const riskLevels = ['中低风险', '中风险', '较高风险']
const categories = ['咖啡', '茶饮']

const fadeIn = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
}

function formatScore(value?: number) {
  if (!Number.isFinite(value)) return '0.00'
  return Number(value).toFixed(2)
}

function formatStoreCount(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(1)} 万`
  return `${value}`
}

function riskTone(level: string) {
  if (level.includes('较高')) return 'border-rose-200 bg-rose-50 text-rose-700'
  if (level.includes('中风险')) return 'border-amber-200 bg-amber-50 text-amber-700'
  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
}

function useBrandIntelData() {
  const [state, setState] = useState<LoadState>('loading')
  const [dataSource, setDataSource] = useState<DataSource>('api')
  const [summary, setSummary] = useState<BrandIntelSummary | null>(null)
  const [brands, setBrands] = useState<BrandIntelItem[]>([])
  const [region, setRegion] = useState<RegionIntel | null>(null)
  const [dataStatus, setDataStatus] = useState<BrandDataStatus | null>(null)
  const [projectOverview, setProjectOverview] = useState<ProjectOverview | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setState('loading')
    setError(null)
    try {
      const [summaryResult, brandResult, regionResult, statusResult, overviewResult] = await Promise.all([
        fetchBrandIntelSummary(),
        fetchBrandIntelList({}),
        fetchRegionIntel('杭州'),
        fetchBrandDataStatus(),
        fetchProjectOverview(),
      ])
      setSummary(summaryResult)
      setBrands(brandResult)
      setRegion(regionResult)
      setDataStatus(statusResult)
      setProjectOverview(overviewResult)
      setDataSource('api')
      setState('ready')
    } catch (err) {
      setSummary(MOCK_SUMMARY)
      setBrands(MOCK_BRANDS)
      setRegion(MOCK_REGION)
      setDataSource('mock')
      setState('ready')
      setError(err instanceof Error ? err.message : '后端接口暂时不可用，已切换本地样例数据。')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return { state, dataSource, summary, brands, setBrands, region, setRegion, dataStatus, projectOverview, error, reload: load }
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
    </div>
  )
}

function Navigation({ dataSource }: { dataSource: DataSource }) {
  return (
    <motion.nav {...fadeIn} className="relative z-20 w-full overflow-hidden rounded-[20px] bg-ink px-5 py-4 text-white shadow-soft md:px-7">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne/55 to-transparent" />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-champagne/45 bg-white/8">
            <ShieldCheck className="h-5 w-5 text-champagne" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-white/50">咕咕嘎嘎歪比巴卟小组</p>
            <p className="text-sm font-semibold text-white">Brand Investment Risk Platform</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-x-3 gap-y-3 text-xs text-white/68 sm:flex sm:flex-wrap sm:items-center sm:text-sm md:gap-x-6">
          {navItems.map((item, index) => (
            <a key={item.href} className="group flex items-center gap-2 rounded-lg px-1 py-1 transition hover:text-white" href={item.href}>
              {index === 0 && <span className="h-1.5 w-1.5 rounded-full bg-champagne" />}
              <span>{item.label}</span>
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-white/58">
          <span className="h-px w-8 bg-champagne/55" />
          {dataSource === 'api' ? 'API Connected' : 'Mock Preview'}
        </div>
      </div>
    </motion.nav>
  )
}

function MountainVisual({ region, activeBrand }: { region: RegionIntel | null; activeBrand: BrandIntelItem | null }) {
  return (
    <motion.div {...fadeIn} className="group relative min-h-[430px] w-full overflow-hidden rounded-[20px] bg-[#D8E4F0] shadow-soft ring-1 ring-white/70 md:min-h-[520px]">
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
        <p className="text-[11px] font-semibold uppercase text-copy">FRANCHISE RISK</p>
        <p className="mt-2 text-3xl font-black text-ink">
          {formatScore(region?.franchise_risk_score)} <span className="text-lg text-champagne">↑</span>
        </p>
        <p className="mt-1 text-xs text-copy">{region ? `${region.city} 地区样本` : '等待地区数据'}</p>
      </div>

      <div className="absolute left-6 top-7 max-w-[270px] md:left-10 md:top-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-xl border border-white/55 bg-white/42 px-3 py-1 text-xs font-semibold text-ink/72 backdrop-blur">
          <Mountain className="h-3.5 w-3.5 text-champagne" />
          Region Signal View
        </div>
        <p className="text-sm leading-7 text-ink/64">
          保留深海军蓝导航、低饱和灰蓝雪山主视觉和极淡奶泡曲线，主体从授信风控切换为品牌投资与地区加盟风险。
        </p>
      </div>

      <div className="absolute inset-x-6 bottom-6 grid gap-3 md:grid-cols-3 md:bottom-8 md:left-8 md:right-8">
        {(activeBrand?.metrics || []).slice(0, 3).map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-white/60 bg-white/76 p-4 shadow-cafe backdrop-blur">
            <p className="text-xs font-semibold text-copy">{metric.label}</p>
            <p className="mt-2 text-2xl font-black text-ink">{metric.value}</p>
            <p className="mt-1 text-[11px] uppercase text-copy">{metric.hint}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function MetricCard({ label, value, hint, icon: Icon }: { label: string; value: string; hint: string; icon: typeof Activity }) {
  return (
    <div className="rounded-[20px] border border-line/85 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-copy">{label}</p>
          <p className="mt-3 text-3xl font-black text-ink">{value}</p>
          <p className="mt-2 text-xs uppercase text-copy">{hint}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-champagne">
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
      </div>
    </div>
  )
}

function SummaryStrip({ summary }: { summary: BrandIntelSummary | null }) {
  const cards = [
    { label: '品牌样本', value: `${summary?.brand_count ?? 0}`, hint: 'BRAND SAMPLE', icon: BadgeCheck },
    { label: '上市关联', value: `${summary?.listed_brand_count ?? 0}`, hint: 'PUBLIC MARKET', icon: LineChart },
    { label: '覆盖城市', value: `${summary?.city_count ?? 0}`, hint: 'REGION FILTER', icon: MapPin },
    { label: '新闻样本', value: `${summary?.news_count ?? 0}`, hint: 'SENTIMENT INPUT', icon: Activity },
  ]

  return (
    <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <MetricCard key={card.label} {...card} />
      ))}
    </section>
  )
}

function SectionIntro({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string
  title: string
  description: string
  icon: typeof Activity
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 rounded-[20px] border border-line/85 bg-white/82 p-5 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-bold text-ocean">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-black text-ink md:text-3xl">{title}</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-copy">{description}</p>
      </div>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink text-champagne">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </div>
    </div>
  )
}

function FilterBar({
  search,
  city,
  category,
  riskLevel,
  scenario,
  cities,
  resultCount,
  onSearch,
  onCity,
  onCategory,
  onRiskLevel,
  onScenario,
  onClear,
}: {
  search: string
  city: string
  category: string
  riskLevel: string
  scenario: Scenario
  cities: string[]
  resultCount: number
  onSearch: (value: string) => void
  onCity: (value: string) => void
  onCategory: (value: string) => void
  onRiskLevel: (value: string) => void
  onScenario: (value: Scenario) => void
  onClear: () => void
}) {
  return (
    <section className="mt-6 rounded-[20px] border border-line/85 bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-bold text-ocean">搜索与筛选</p>
          <h2 className="mt-2 text-2xl font-black text-ink">按品牌、地区、品类和风险快速定位样本</h2>
        </div>
        <div className="rounded-xl border border-line bg-[#F8FBFF] px-4 py-2 text-xs font-semibold uppercase text-copy">
          {resultCount} Matched Brands
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.9fr_auto]">
        <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-[#FAFCFF] px-4">
          <Search className="h-4 w-4 shrink-0 text-champagne" />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            className="h-12 w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-copy/60"
            placeholder="搜索品牌、股票代码、城市或风险标签"
          />
        </label>

        <select value={city} onChange={(event) => onCity(event.target.value)} className="h-12 rounded-2xl border border-line bg-[#FAFCFF] px-4 text-sm font-semibold text-ink outline-none">
          <option value="">全部地区</option>
          {cities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select value={category} onChange={(event) => onCategory(event.target.value)} className="h-12 rounded-2xl border border-line bg-[#FAFCFF] px-4 text-sm font-semibold text-ink outline-none">
          <option value="">全部品类</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select value={riskLevel} onChange={(event) => onRiskLevel(event.target.value)} className="h-12 rounded-2xl border border-line bg-[#FAFCFF] px-4 text-sm font-semibold text-ink outline-none">
          <option value="">全部风险</option>
          {riskLevels.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select value={scenario} onChange={(event) => onScenario(event.target.value as Scenario)} className="h-12 rounded-2xl border border-line bg-[#FAFCFF] px-4 text-sm font-semibold text-ink outline-none">
          <option value="mixed">综合视角</option>
          <option value="investment">股民投资</option>
          <option value="franchise">加盟评估</option>
        </select>

        <button type="button" onClick={onClear} className="h-12 rounded-2xl border border-line bg-white px-5 text-sm font-semibold text-copy transition hover:border-champagne hover:text-ink">
          重置
        </button>
      </div>
    </section>
  )
}

function BrandList({
  brands,
  activeBrandId,
  onSelect,
}: {
  brands: BrandIntelItem[]
  activeBrandId: string
  onSelect: (brandId: string) => void
}) {
  return (
    <section className="rounded-[20px] border border-line/85 bg-white p-5 shadow-soft">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-ocean">品牌样本卡</p>
          <h2 className="mt-2 text-2xl font-black text-ink">投资与加盟双风险</h2>
        </div>
        <Store className="h-6 w-6 text-champagne" />
      </div>

      <div className="mt-5 space-y-3">
        {brands.map((brand) => (
          <button
            key={brand.brand_id}
            type="button"
            onClick={() => onSelect(brand.brand_id)}
            className={`w-full rounded-2xl border p-4 text-left transition duration-300 hover:-translate-y-0.5 ${
              activeBrandId === brand.brand_id ? 'border-champagne bg-[#FFFDF8] shadow-cafe' : 'border-line bg-[#FAFCFF] hover:border-champagne/70'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-black text-ink">{brand.brand_name}</p>
                  <span className={`rounded-lg border px-2 py-1 text-xs font-semibold ${riskTone(brand.risk_level)}`}>{brand.risk_level}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-copy">
                  {brand.category} · {brand.listed_status} · {brand.stock_code || '暂无股票代码'}
                </p>
              </div>
              <ChevronRight className="mt-1 h-5 w-5 text-champagne" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-copy">投资风险</p>
                <p className="mt-1 text-2xl font-black text-ink">{formatScore(brand.investment_risk_score)}</p>
              </div>
              <div>
                <p className="text-xs text-copy">加盟风险</p>
                <p className="mt-1 text-2xl font-black text-champagne">{formatScore(brand.franchise_risk_score)}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

function BrandDetail({ brand }: { brand: BrandIntelItem | null }) {
  if (!brand) {
    return (
      <section className="rounded-[20px] border border-line/85 bg-white p-6 shadow-soft">
        <p className="text-sm text-copy">暂无匹配品牌，请调整搜索或筛选条件。</p>
      </section>
    )
  }

  const quoteRows = [
    ['市场', brand.quote?.market || brand.listed_status],
    ['当前价', brand.quote?.current_price ? `${brand.quote.current_price} ${brand.quote.currency || ''}` : '暂无行情'],
    ['涨跌幅', brand.quote?.change_percent ? `${brand.quote.change_percent}%` : '暂无'],
    ['市值', brand.quote?.market_cap || '暂无'],
  ]
  const policy = brand.franchise_policy
  const news = brand.news || []
  const competition = brand.region_competition || []

  return (
    <section className="rounded-[20px] border border-line/85 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-bold text-ocean">品牌画像</p>
          <h2 className="mt-2 text-3xl font-black text-ink">{brand.brand_name}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-copy">{brand.growth_signal}</p>
        </div>
        <div className="rounded-2xl border border-line bg-[#F8FBFF] p-4 text-right">
          <p className="text-xs font-semibold uppercase text-copy">MICRO CREDIT RISK INDEX</p>
          <p className="mt-2 text-4xl font-black text-champagne">
            {formatScore(brand.investment_risk_score)} <ArrowUpRight className="inline h-5 w-5" />
          </p>
          <p className="mt-1 text-xs text-copy">已调整为品牌投资风险指数</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <MetricCard label="门店规模" value={formatStoreCount(brand.store_count)} hint={brand.price_band} icon={Store} />
        <MetricCard label="关联标的" value={brand.stock_code || '未上市'} hint={brand.stock_name || brand.listed_status} icon={TrendingUp} />
        <MetricCard label="舆情倾向" value={brand.sentiment_level} hint="NEWS SIGNAL" icon={Activity} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-[#FAFCFF] p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
            <LineChart className="h-5 w-5 text-champagne" />
            股民投资视角
          </div>
          <p className="text-sm leading-7 text-copy">{brand.market_signal}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {brand.risk_tags.map((tag) => (
              <span key={tag} className="rounded-lg border border-line bg-white px-3 py-1 text-xs font-semibold text-copy">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-[#FAFCFF] p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
            <Building2 className="h-5 w-5 text-champagne" />
            普通用户加盟视角
          </div>
          <p className="text-sm leading-7 text-copy">{brand.franchise_signal}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {brand.key_cities.map((city) => (
              <span key={city} className="rounded-lg border border-line bg-white px-3 py-1 text-xs font-semibold text-copy">
                {city}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="rounded-2xl border border-line bg-[#FAFCFF] p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-ink">
            <TrendingUp className="h-5 w-5 text-champagne" />
            行情摘要
          </div>
          <div className="space-y-3">
            {quoteRows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-copy">{label}</span>
                <span className="font-bold text-ink">{value}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-6 text-copy">用于股民投资风险分析，后续 TS 可替换为真实行情接口或历史行情 CSV。</p>
        </div>

        <div className="rounded-2xl border border-line bg-[#FAFCFF] p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-ink">
            <Activity className="h-5 w-5 text-champagne" />
            新闻舆情样本
          </div>
          <div className="space-y-3">
            {(news.length ? news : []).slice(0, 3).map((item) => (
              <div key={`${item.publish_date}-${item.title}`} className="rounded-xl bg-white p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-ocean">{item.publish_date}</span>
                  <span className={`rounded-lg px-2 py-0.5 text-[11px] font-bold ${item.sentiment === 'negative' ? 'bg-rose-50 text-rose-700' : item.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-copy'}`}>
                    {item.sentiment}
                  </span>
                </div>
                <p className="mt-2 text-sm font-bold text-ink">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-copy">{item.risk_signal}</p>
              </div>
            ))}
            {!news.length && <p className="text-sm text-copy">暂无新闻样本，等待 TS 补充 news_sentiment.csv。</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-line bg-[#FAFCFF] p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-ink">
            <Building2 className="h-5 w-5 text-champagne" />
            加盟政策摘要
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-3">
              <p className="text-xs text-copy">是否开放加盟</p>
              <p className="mt-1 font-bold text-ink">{policy?.is_franchise_available === false ? '否' : policy?.is_franchise_available === true ? '是' : '待核实'}</p>
            </div>
            <div className="rounded-xl bg-white p-3">
              <p className="text-xs text-copy">总投资区间</p>
              <p className="mt-1 font-bold text-ink">{policy?.total_investment_range || '待核实'}</p>
            </div>
            <div className="rounded-xl bg-white p-3">
              <p className="text-xs text-copy">预计回本周期</p>
              <p className="mt-1 font-bold text-ink">{policy?.estimated_payback_period || '待核实'}</p>
            </div>
            <div className="rounded-xl bg-white p-3">
              <p className="text-xs text-copy">区域保护</p>
              <p className="mt-1 font-bold text-ink">{policy?.area_protection_policy || '待核实'}</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-6 text-copy">{policy?.note || '公开资料有限，后续需要继续核实官方招商政策。'}</p>
        </div>

        <div className="rounded-2xl border border-line bg-[#FAFCFF] p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-ink">
            <MapPin className="h-5 w-5 text-champagne" />
            地区竞争信号
          </div>
          <div className="space-y-3">
            {competition.slice(0, 3).map((item) => (
              <div key={`${item.city}-${item.target_brand}`} className="rounded-xl bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-ink">{item.city}</p>
                  <span className="rounded-lg bg-[#FFFDF8] px-2 py-1 text-xs font-bold text-champagne">{item.competition_level || '待评估'}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-copy">主要竞品：{item.major_competitors.join('、') || '待补充'}</p>
                <p className="mt-1 text-xs leading-5 text-copy">{item.risk_points || '等待地区竞争数据。'}</p>
              </div>
            ))}
            {!competition.length && <p className="text-sm text-copy">暂无地区竞争样本，等待 TS 补充 region_competition.csv。</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-[#FAFCFF] p-5">
        <p className="text-sm font-bold text-ink">后续调查建议</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(brand.follow_up_data || []).map((item) => (
            <span key={item} className="rounded-lg border border-line bg-white px-3 py-1 text-xs font-semibold text-copy">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function RegionPanel({ region }: { region: RegionIntel | null }) {
  if (!region) return null
  return (
    <section className="rounded-[20px] border border-line/85 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-bold text-ocean">地区加盟环境</p>
          <h2 className="mt-2 text-2xl font-black text-ink">{region.city} · {region.market_heat}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-copy">{region.consumer_profile}</p>
        </div>
        <div className="rounded-2xl bg-ink px-5 py-4 text-white">
          <p className="text-xs text-white/62">地区加盟风险</p>
          <p className="mt-2 text-3xl font-black text-champagne">{formatScore(region.franchise_risk_score)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {region.brand_cards.map((card) => (
          <div key={card.brand_name} className="rounded-2xl border border-line bg-[#FAFCFF] p-4">
            <p className="text-lg font-black text-ink">{card.brand_name}</p>
            <p className="mt-2 text-sm text-copy">样本门店：{card.store_count}</p>
            <p className="mt-2 text-sm text-copy">竞争压力：{card.competition_pressure}</p>
            <p className="mt-3 font-semibold text-ocean">{card.franchise_fit}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <SignalList title="机会点" items={region.opportunity_points} />
        <SignalList title="风险点" items={region.risk_points} />
      </div>
    </section>
  )
}

function SignalList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-line bg-[#FAFCFF] p-5">
      <p className="text-sm font-bold text-ink">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex gap-2 text-sm leading-6 text-copy">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-champagne" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AIAnalysisPanel({
  analysis,
  state,
  onGenerate,
}: {
  analysis: BrandAIAnalysis | null
  state: AnalysisState
  onGenerate: () => void
}) {
  return (
    <section className="rounded-[20px] border border-line/85 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-bold text-ocean">DeepSeek 手动分析区</p>
          <h2 className="mt-2 text-2xl font-black text-ink">点击后才生成智能解释</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-copy">
            为节省 token，品牌切换和地区筛选不会自动调用 DeepSeek。后端先聚合摘要，再由 AI 输出投资和加盟解释。
          </p>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={state === 'loading'}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-ink px-5 text-sm font-semibold text-white transition hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === 'loading' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-champagne" />}
          {state === 'loading' ? '生成中' : '生成智能分析'}
        </button>
      </div>

      {state === 'idle' && (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-[#FAFCFF] p-5 text-sm leading-7 text-copy">
          当前还没有调用 AI。展示时可以先讲：系统默认展示规则评分，只有点击按钮才进入 DeepSeek 分析，避免频繁消耗 token。
        </div>
      )}

      {state === 'error' && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          AI 分析接口暂时不可用，请确认后端服务或密钥配置。
        </div>
      )}

      {analysis && (
        <div className="mt-6 space-y-4">
          <p className="rounded-2xl border border-line bg-[#FAFCFF] p-5 text-sm leading-7 text-copy">{analysis.summary}</p>
          <div className="grid gap-4 lg:grid-cols-2">
            <SignalList title="投资分析" items={[analysis.investment_view]} />
            <SignalList title="加盟分析" items={[analysis.franchise_view]} />
          </div>
          <SignalList title="行动建议" items={analysis.action_suggestions} />
          <p className="text-xs leading-6 text-copy">
            {analysis.token_saving_note}
            {analysis.cache_hit ? ' 当前结果来自缓存。' : ' 当前结果为本次生成并已写入缓存。'}
          </p>
        </div>
      )}
    </section>
  )
}

function ReportPreview({ report }: { report: string }) {
  return (
    <section className="rounded-[20px] border border-line/85 bg-white p-6 shadow-soft">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-ocean">智能报告预览</p>
          <h2 className="mt-2 text-2xl font-black text-ink">Markdown 报告接口已预留</h2>
        </div>
        <FileText className="h-6 w-6 text-champagne" />
      </div>
      <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-2xl border border-line bg-[#FAFCFF] p-5 text-sm leading-7 text-copy">
        {report || '报告加载中...'}
      </pre>
    </section>
  )
}

function DataStage({ status }: { status: BrandDataStatus | null }) {
  const datasets = status?.datasets || []
  return (
    <section className="rounded-[20px] border border-line/85 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-bold text-ocean">第 4 天 · MySQL 数据接入预留</p>
          <h2 className="mt-2 text-2xl font-black text-ink">数据库表结构已预留，真实数据到位后可直接导入</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-copy">
            当前后端采用“数据库优先、CSV 兜底”的方式：如果 MySQL 中已有品牌分析数据，接口会优先读取数据库；如果 TS 暂时无法提供真实数据，页面仍使用 CSV 样例保持可展示状态。
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-copy">{status?.message || '正在等待后端数据状态接口返回。'}</p>
        </div>
        <div className="grid min-w-[280px] grid-cols-2 gap-3 rounded-2xl border border-line bg-[#FAFCFF] p-4">
          <div>
            <p className="text-xs uppercase text-copy">Active Source</p>
            <p className="mt-2 text-lg font-black text-ink">{status?.active_source === 'database' ? 'Database' : 'CSV Fallback'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-copy">Engine</p>
            <p className="mt-2 text-lg font-black text-ink">{status?.database_engine || 'loading'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-copy">DB Rows</p>
            <p className="mt-2 text-lg font-black text-champagne">{status?.total_database_rows ?? 0}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-copy">CSV Rows</p>
            <p className="mt-2 text-lg font-black text-champagne">{status?.total_csv_rows ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {datasets.map((item) => (
          <div key={item.dataset} className="rounded-2xl border border-line bg-[#FAFCFF] p-4 transition duration-300 hover:-translate-y-1 hover:shadow-cafe">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase text-copy">{item.dataset}</p>
                <p className="mt-2 text-sm font-bold text-ink">{item.owner_role}</p>
              </div>
              <Database className="h-5 w-5 text-champagne" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs text-copy">数据库</p>
                <p className="mt-1 font-black text-ink">{item.database_rows}</p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs text-copy">CSV 样例</p>
                <p className="mt-1 font-black text-ink">{item.csv_rows}</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-copy">{item.next_action}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ProjectInfoSection({ overview, status }: { overview: ProjectOverview | null; status: BrandDataStatus | null }) {
  const scenarios = overview?.business_scenarios || [
    { title: '股民投资辅助分析', description: '围绕品牌行情、新闻舆情和扩张情况进行风险提示。' },
    { title: '地区加盟风险评估', description: '结合城市门店密度、竞品分布和加盟政策提示经营风险。' },
    { title: '智能报告生成', description: '手动触发 AI 分析，生成更适合汇报和后续调查的摘要。' },
  ]
  const modules = overview?.feature_modules || []
  const technicalPoints = overview?.technical_points || []
  const nextTasks = overview?.next_tasks || []

  return (
    <section className="space-y-6">
      <div className="rounded-[20px] border border-line/85 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-bold text-ocean">{overview?.stage || '第 5 天 · 功能页面完善与接口联调'}</p>
            <h2 className="mt-2 text-2xl font-black text-ink md:text-3xl">项目说明与技术落实</h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-copy">
              {overview?.positioning || '面向股民和加盟意向用户的茶饮咖啡品牌投资与加盟风险智能分析系统。'}
            </p>
          </div>
          <div className="rounded-2xl bg-ink px-5 py-4 text-right text-white">
            <p className="text-xs uppercase text-white/60">Data Layer</p>
            <p className="mt-2 text-2xl font-black text-champagne">{status?.mysql_ready ? 'MySQL' : 'CSV'}</p>
            <p className="mt-1 text-xs text-white/58">{status?.active_source || 'loading'}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {scenarios.map((item) => (
            <div key={item.title} className="rounded-2xl border border-line bg-[#FAFCFF] p-5">
              <p className="text-base font-black text-ink">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-copy">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[20px] border border-line/85 bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-ocean">模块完成情况</p>
              <h3 className="mt-2 text-2xl font-black text-ink">导航功能已形成可展示闭环</h3>
            </div>
            <BadgeCheck className="h-6 w-6 text-champagne" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {modules.map((item) => (
              <div key={item.name} className="rounded-2xl border border-line bg-[#FAFCFF] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-ink">{item.name}</p>
                  <span className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-champagne ring-1 ring-line">{item.status}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-copy">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <SignalList title="技术要点" items={technicalPoints} />
          <SignalList title="下一阶段任务" items={nextTasks} />
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const { state, dataSource, summary, brands, region, setRegion, dataStatus, projectOverview, error, reload } = useBrandIntelData()
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('杭州')
  const [category, setCategory] = useState('')
  const [riskLevel, setRiskLevel] = useState('')
  const [scenario, setScenario] = useState<Scenario>('mixed')
  const [activeBrandId, setActiveBrandId] = useState('luckin')
  const [analysis, setAnalysis] = useState<BrandAIAnalysis | null>(null)
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle')
  const [report, setReport] = useState('')

  const cities = useMemo(() => Array.from(new Set(brands.flatMap((brand) => brand.key_cities))).sort((a, b) => a.localeCompare(b, 'zh-CN')), [brands])

  const filteredBrands = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return brands
      .filter((brand) => {
        const haystack = [brand.brand_name, brand.stock_name || '', brand.stock_code || '', brand.category, brand.headquarters, brand.listed_status, ...brand.key_cities, ...brand.risk_tags]
          .join(' ')
          .toLowerCase()
        if (keyword && !haystack.includes(keyword)) return false
        if (city && !brand.key_cities.includes(city)) return false
        if (category && brand.category !== category) return false
        if (riskLevel && brand.risk_level !== riskLevel) return false
        return true
      })
      .sort((left, right) => {
        if (scenario === 'investment') return right.investment_risk_score - left.investment_risk_score
        if (scenario === 'franchise') return right.franchise_risk_score - left.franchise_risk_score
        return Math.max(right.investment_risk_score, right.franchise_risk_score) - Math.max(left.investment_risk_score, left.franchise_risk_score)
      })
  }, [brands, category, city, riskLevel, scenario, search])

  const activeBrand = useMemo(
    () => filteredBrands.find((brand) => brand.brand_id === activeBrandId) || filteredBrands[0] || null,
    [activeBrandId, filteredBrands],
  )

  useEffect(() => {
    if (activeBrand && activeBrand.brand_id !== activeBrandId) setActiveBrandId(activeBrand.brand_id)
  }, [activeBrand, activeBrandId])

  useEffect(() => {
    if (!city) return
    if (dataSource === 'mock') {
      setRegion(MOCK_REGION)
      return
    }
    void fetchRegionIntel(city)
      .then(setRegion)
      .catch(() => setRegion(MOCK_REGION))
  }, [city, dataSource, setRegion])

  useEffect(() => {
    setAnalysis(null)
    setAnalysisState('idle')
    if (!activeBrand) return
    if (dataSource === 'mock') {
      setReport(`# ${activeBrand.brand_name}品牌投资与加盟风险分析报告\n\n当前使用本地样例数据。系统已预留后端 Markdown 报告接口，真实数据导入后可生成完整报告。`)
      return
    }
    void fetchBrandReport(activeBrand.brand_id, city)
      .then(setReport)
      .catch(() => setReport('报告接口暂时不可用，请确认后端服务是否启动。'))
  }, [activeBrand, city, dataSource])

  const clearFilters = () => {
    setSearch('')
    setCity('杭州')
    setCategory('')
    setRiskLevel('')
    setScenario('mixed')
  }

  const generateAnalysis = async () => {
    if (!activeBrand || analysisState === 'loading') return
    setAnalysisState('loading')
    setAnalysis(null)
    if (dataSource === 'mock') {
      window.setTimeout(() => {
        setAnalysis(MOCK_AI_ANALYSIS)
        setAnalysisState('ready')
      }, 420)
      return
    }
    try {
      const result = await fetchBrandAIAnalysis({ brand_id: activeBrand.brand_id, city, scenario })
      setAnalysis(result)
      setAnalysisState('ready')
    } catch {
      setAnalysisState('error')
    }
  }

  const heroBrand = activeBrand || summary?.top_attention_brands[0] || null

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-glacier via-[#F7FAFD] to-[#E8F0F8] px-4 py-5 font-sans text-ink md:px-8 md:py-8">
      <EdgeDecor />
      <section className="relative mx-auto w-full max-w-[1400px]">
        <Navigation dataSource={dataSource} />

        <div id="home" className="mt-8 scroll-mt-8 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <motion.div {...fadeIn} className="relative min-h-[430px] overflow-hidden rounded-[20px] bg-white p-6 shadow-soft ring-1 ring-line md:min-h-[520px] md:p-10">
            <div className="absolute right-6 top-6 rounded-xl border border-line bg-[#F8FBFF] px-3 py-1.5 text-xs font-semibold text-copy">
              Day 4 · MySQL Ready
            </div>

            <div className="flex h-full flex-col justify-between">
              <div>
                <p className="text-xs font-black uppercase text-ocean">MICRO CREDIT RISK INDEX</p>
                <h1 className="mt-5 max-w-2xl text-[2.35rem] font-black leading-[1.08] text-ink md:text-6xl">
                  <span className="block">茶饮咖啡品牌投资</span>
                  <span className="block">与加盟风险分析平台</span>
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-copy md:text-lg">
                  面向股民和加盟意向用户，整合品牌行情、新闻舆情、门店分布和地区竞争信息，提供可搜索、可筛选、可解释的品牌风险辅助分析。
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <span className="rounded-xl bg-ocean px-4 py-2 text-xs font-semibold uppercase text-white">{dataSource === 'api' ? 'API connected' : 'Mock fallback'}</span>
                  <span className="rounded-xl border border-line bg-[#F8FBFF] px-4 py-2 text-xs font-semibold uppercase text-copy">Manual AI analysis</span>
                  <span className="rounded-xl border border-line bg-[#F8FBFF] px-4 py-2 text-xs font-semibold uppercase text-copy">TS data staging</span>
                </div>
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-end">
                <div>
                  <p className="text-sm font-semibold text-copy">今日品牌投资风险指数</p>
                  <div className="mt-3 flex items-end gap-3">
                    <span className="text-7xl font-black leading-none text-champagne md:text-8xl">{formatScore(heroBrand?.investment_risk_score)}</span>
                    <span className="mb-3 flex items-center gap-1 text-2xl font-black text-champagne">
                      <ArrowUpRight className="h-6 w-6" strokeWidth={2.3} />
                    </span>
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase text-copy">ACTIVE BRAND · {heroBrand?.brand_name || '等待数据'}</p>
                  <p className="mt-2 text-sm text-copy">场景：股民投资 + 地区加盟双视角</p>
                </div>

                <div className="rounded-2xl border border-line bg-[#F8FBFF] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-ink">
                      <Gauge className="h-5 w-5 text-champagne" />
                      风险解释
                    </div>
                    <span className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-copy ring-1 ring-line">{heroBrand?.risk_level || 'Waiting'}</span>
                  </div>
                  <div className="space-y-3 text-sm text-copy">
                    <div className="flex items-center justify-between">
                      <span>加盟风险</span>
                      <span className="font-bold text-champagne">{formatScore(heroBrand?.franchise_risk_score)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-line">
                      <div className="h-2 rounded-full bg-ocean" style={{ width: heroBrand ? `${Math.min(heroBrand.franchise_risk_score, 90)}%` : '24%' }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>地区样本</span>
                      <span className="font-bold text-ink">{city || region?.city || '杭州'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <MountainVisual region={region} activeBrand={heroBrand} />
        </div>

        <SummaryStrip summary={summary} />

        {state === 'loading' && (
          <div className="mt-8 rounded-[20px] border border-line bg-white p-6 text-sm text-copy shadow-soft">正在加载品牌投资与加盟风险接口...</div>
        )}

        <section id="brand-risk" className="mt-10 scroll-mt-8">
          <SectionIntro
            eyebrow="品牌风险"
            title="品牌投资与加盟风险筛选"
            description="支持按品牌名称、股票代码、城市、品类、风险等级和使用场景进行定位，帮助用户先找到需要重点关注的品牌样本，再查看对应风险解释。"
            icon={ShieldCheck}
          />
          <FilterBar
            search={search}
            city={city}
            category={category}
            riskLevel={riskLevel}
            scenario={scenario}
            cities={cities}
            resultCount={filteredBrands.length}
            onSearch={setSearch}
            onCity={setCity}
            onCategory={setCategory}
            onRiskLevel={setRiskLevel}
            onScenario={setScenario}
            onClear={clearFilters}
          />
          <div className="mt-6 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <BrandList brands={filteredBrands} activeBrandId={activeBrand?.brand_id || ''} onSelect={setActiveBrandId} />
            <BrandDetail brand={activeBrand} />
          </div>
        </section>

        <section id="region-franchise" className="mt-10 scroll-mt-8">
          <SectionIntro
            eyebrow="地区加盟"
            title={`${city || region?.city || '目标城市'}加盟环境与竞品观察`}
            description="面向加盟意向用户，重点展示目标城市的门店密度、竞品品牌、市场热度、机会点和风险点，后续可继续接入商圈租金与外卖销量数据。"
            icon={MapPin}
          />
          <RegionPanel region={region} />
        </section>

        <section id="smart-report" className="mt-10 scroll-mt-8">
          <SectionIntro
            eyebrow="智能报告"
            title="手动触发 DeepSeek 分析与报告预览"
            description="品牌或地区切换时不自动调用大模型；用户点击生成后，后端只传入聚合摘要和评分结果，并优先读取缓存，减少 token 消耗。"
            icon={Sparkles}
          />
          <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
            <AIAnalysisPanel analysis={analysis} state={analysisState} onGenerate={generateAnalysis} />
            <ReportPreview report={report} />
          </div>
        </section>

        <section id="project-info" className="mt-10 scroll-mt-8">
          <SectionIntro
            eyebrow="项目说明"
            title="业务场景、技术路线与数据接入进度"
            description="说明系统面向股民和加盟意向用户的核心场景，展示前后端模块完成情况、MySQL 数据层状态和下一阶段开发任务。"
            icon={FileText}
          />
          <ProjectInfoSection overview={projectOverview} status={dataStatus} />
          <div className="mt-6">
            <DataStage status={dataStatus} />
          </div>
        </section>

        {error && (
          <section className="mt-8 rounded-[20px] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p>后端接口暂时未连通，当前使用本地样例数据。错误信息：{error}</p>
              <button type="button" onClick={reload} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-xs font-semibold text-white">
                <RefreshCw className="h-4 w-4" />
                重试接口
              </button>
            </div>
          </section>
        )}

        <div className="mt-8 flex flex-col gap-3 pb-8 text-xs text-copy md:flex-row md:items-center md:justify-between">
          <p>Tea & Coffee Brand Investment and Franchise Risk Platform · DeepSeek Skill + LangChain</p>
          <p className="font-semibold uppercase text-ink/55">Trusted · Explainable · Lightweight</p>
        </div>
      </section>
    </main>
  )
}
