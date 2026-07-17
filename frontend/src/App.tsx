import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Bean,
  ChartNoAxesCombined,
  ChevronRight,
  Coffee,
  FileSearch,
  Gauge,
  Mountain,
  ShieldCheck,
  Sparkles,
  Store,
  Waves,
} from 'lucide-react'
import { motion } from 'framer-motion'

const fadeUp = {
  initial: false,
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
}

const navItems = ['首页', '风控看板', '合同审查', '智能报告', '项目说明']

const sampleCards = [
  {
    name: 'Espresso',
    scene: '高周转咖啡快取店',
    sales: '¥48.6K',
    repurchase: '62%',
    flavor: '91.8',
    risk: '低风险',
    score: 'A',
    accent: 'from-[#FFF8EC] to-[#FFFFFF]',
  },
  {
    name: 'Oat Latte',
    scene: '社区型燕麦拿铁店',
    sales: '¥32.4K',
    repurchase: '57%',
    flavor: '88.6',
    risk: '稳健',
    score: 'A-',
    accent: 'from-[#F7FBFF] to-[#FFFFFF]',
  },
  {
    name: 'Brown Sugar Milk Tea',
    scene: '商圈黑糖奶茶店',
    sales: '¥76.2K',
    repurchase: '49%',
    flavor: '84.3',
    risk: '需复核',
    score: 'B+',
    accent: 'from-[#FFF6F1] to-[#FFFFFF]',
  },
]

function EdgeDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-28 top-28 h-80 w-80 rounded-full border border-espresso/[0.06]" />
      <div className="absolute -left-14 top-44 h-44 w-44 rounded-full border-[10px] border-ocean/[0.04]" />
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
      {...fadeUp}
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

function MountainVisual() {
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
          36.87 <span className="text-lg text-champagne">↓</span>
        </p>
        <p className="mt-1 text-xs text-copy">合同风险指数</p>
      </div>

      <div className="absolute left-6 top-7 max-w-[230px] md:left-10 md:top-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/42 px-3 py-1 text-xs font-semibold text-ink/72 backdrop-blur">
          <Mountain className="h-3.5 w-3.5 text-champagne" />
          Snow Signal View
        </div>
        <p className="text-sm leading-7 text-ink/60">
          低饱和灰蓝雪山用于表达稳定、长期和审慎；极淡奶泡曲线保留茶饮咖啡行业识别。
        </p>
      </div>
    </motion.div>
  )
}

function RiskIndexPanel() {
  return (
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.78, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-[430px] w-full min-w-0 rounded-[20px] bg-white px-7 py-8 shadow-soft ring-1 ring-line/85 md:min-h-[520px] md:px-10 md:py-10"
    >
      <div className="absolute right-7 top-7 flex items-center gap-2 rounded-full border border-line bg-[#F8FBFF] px-3 py-1.5 text-xs font-semibold text-copy">
        <span className="h-2 w-2 rounded-full bg-champagne" />
        UPDATE
      </div>

      <div className="flex h-full flex-col justify-between">
        <div>
          <p className="mb-5 text-xs font-black uppercase tracking-[0.32em] text-ocean">Micro Credit Risk Index</p>
          <h1 className="max-w-xl text-[2.08rem] font-black leading-[1.08] tracking-[-0.01em] text-ink md:text-6xl md:tracking-[-0.035em]">
            <span className="block md:inline">茶饮咖啡小微商户</span>
            <span className="block md:inline">智能风控平台</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-copy [word-break:break-all] md:text-lg md:[word-break:normal]">
            将经营流水、门店活跃度、合同文本与商户画像转化为可解释的授信前风险指数，辅助完成轻量化信贷风控与经营分析。
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div>
            <p className="text-sm font-semibold text-copy">今日组合风险指数</p>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-7xl font-black leading-none tracking-[-0.07em] text-champagne md:text-8xl">
                37.62
              </span>
              <span className="mb-3 flex items-center gap-1 text-2xl font-black text-champagne">
                <ArrowUpRight className="h-6 w-6" strokeWidth={2.3} />
              </span>
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.28em] text-copy">
              UPDATE&nbsp;&nbsp;2026 / 07 / 17
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-[#F8FBFF] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-ink">
                <Gauge className="h-5 w-5 text-champagne" />
                风控解释
              </div>
              <span className="text-xs text-copy">
                <span className="sm:hidden">中低</span>
                <span className="hidden sm:inline">Low-Moderate</span>
              </span>
            </div>
            <div className="space-y-3 text-sm text-copy">
              <div className="flex items-center justify-between">
                <span>现金流稳定性</span>
                <span className="font-bold text-ink">82%</span>
              </div>
              <div className="h-2 rounded-full bg-line">
                <div className="h-2 w-[82%] rounded-full bg-ocean" />
              </div>
              <div className="flex items-center justify-between">
                <span>合同异常命中</span>
                <span className="font-bold text-champagne">3 项</span>
              </div>
              <div className="flex items-center justify-between">
                <span>经营增长信号</span>
                <span className="font-bold text-ink">正向</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function SampleCard({
  card,
  index,
}: {
  card: (typeof sampleCards)[number]
  index: number
}) {
  return (
    <motion.article
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.62, delay: 0.22 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, scale: 1.01 }}
      className={`relative w-full min-w-0 overflow-hidden rounded-[20px] border border-white/80 bg-gradient-to-br ${card.accent} p-6 shadow-cafe ring-1 ring-line/80`}
    >
      <div className="absolute right-5 top-5 text-champagne">
        <Sparkles className="h-5 w-5" strokeWidth={1.8} />
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-copy">{card.name}</p>
      <h3 className="mt-3 text-xl font-black tracking-tight text-ink">{card.scene}</h3>
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-copy">月销售额</p>
          <p className="mt-1 text-xl font-black text-ink">{card.sales}</p>
        </div>
        <div>
          <p className="text-copy">复购率</p>
          <p className="mt-1 text-xl font-black text-ink">{card.repurchase}</p>
        </div>
        <div>
          <p className="text-copy">风味评分</p>
          <p className="mt-1 text-xl font-black text-ink">{card.flavor}</p>
        </div>
        <div>
          <p className="text-copy">风险评级</p>
          <p className="mt-1 text-xl font-black text-champagne">{card.score}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between rounded-2xl border border-line/80 bg-white/68 px-4 py-3">
        <span className="text-sm font-semibold text-copy">{card.risk}</span>
        <ChevronRight className="h-4 w-4 text-champagne" strokeWidth={2} />
      </div>
    </motion.article>
  )
}

function SampleCards() {
  return (
    <section className="relative z-10 -mt-12 grid w-full min-w-0 grid-cols-1 gap-5 px-4 md:grid-cols-3 md:px-8 lg:px-12">
      {sampleCards.map((card, index) => (
        <SampleCard key={card.name} card={card} index={index} />
      ))}
    </section>
  )
}

function InsightStrip() {
  const items = [
    { icon: Activity, label: '经营波动监测', value: '12 signals' },
    { icon: FileSearch, label: '合同风险识别', value: 'NLP review' },
    { icon: ChartNoAxesCombined, label: '智能报告生成', value: 'Explainable' },
    { icon: Store, label: '门店画像归因', value: 'Merchant graph' },
  ]

  return (
    <motion.section
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.72, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
      className="mt-10 grid w-full min-w-0 grid-cols-1 gap-4 rounded-[20px] border border-line/80 bg-white/70 p-4 shadow-sm backdrop-blur md:grid-cols-4"
    >
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-center gap-3 rounded-2xl px-3 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-champagne">
            <Icon className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-sm font-bold text-ink">{label}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-copy">{value}</p>
          </div>
        </div>
      ))}
    </motion.section>
  )
}

export default function App() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-glacier via-[#F7FAFD] to-[#E8F0F8] px-4 py-5 text-ink md:px-8 md:py-8">
      <EdgeDecor />
      <section className="relative mx-auto w-full max-w-[1400px]">
        <Navigation />

        <div className="mt-8 w-full min-w-0 overflow-visible rounded-[24px] bg-white/24 p-0 md:mt-10">
          <div className="grid w-full min-w-0 grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <RiskIndexPanel />
            <MountainVisual />
          </div>
          <SampleCards />
        </div>

        <InsightStrip />

        <div className="mt-9 flex flex-col gap-3 pb-8 text-xs text-copy md:flex-row md:items-center md:justify-between">
          <p>Tea & Coffee Micro Credit Risk Platform · DeepSeek Skill + LangChain 风控原型</p>
          <p className="font-semibold uppercase tracking-[0.22em] text-ink/55">Trusted · Explainable · Lightweight</p>
        </div>
      </section>
    </main>
  )
}
