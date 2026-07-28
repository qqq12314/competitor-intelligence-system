import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCopy,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  HelpCircle,
  Landmark,
  LoaderCircle,
  MapPin,
  Quote,
  RefreshCw,
  Printer,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  WalletCards,
  X,
} from 'lucide-react'
import { runFranchiseAnalysis, type Evidence, type FranchiseAgentResponse, type ResultStatus, type RiskDimension } from './api/client'

const brands = [
  { id: 'mixue', name: '蜜雪冰城' },
  { id: 'luckin', name: '瑞幸咖啡' },
  { id: 'cotti', name: '库迪咖啡' },
  { id: 'chagee', name: '霸王茶姬' },
  { id: 'starbucks', name: '星巴克' },
  { id: 'nayuki', name: '奈雪的茶' },
]

const cities = ['杭州', '北京', '上海', '广州', '天津', '重庆', '成都', '深圳', '武汉', '郑州']

function buildQuestion(brandName: string, city: string) {
  return `请分析${brandName}在${city}的加盟风险，重点评估加盟政策、投入成本、门店竞争、经营舆情和信息完整度，并给出参考依据、核验重点及签约前尽调问题。`
}

const statusCopy: Record<ResultStatus, { label: string; className: string }> = {
  success: { label: '信息较完整', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  insufficient_data: { label: '核心评估已完成', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  degraded: { label: '已完成基础评估', className: 'bg-sky-50 text-sky-700 ring-sky-200' },
  error: { label: '评估异常', className: 'bg-rose-50 text-rose-700 ring-rose-200' },
}

function riskPalette(score: number) {
  if (score >= 70) return { label: '高风险', color: '#dc5a4f', soft: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-200' }
  if (score >= 50) return { label: '中等风险', color: '#d99232', soft: 'bg-amber-50', text: 'text-amber-800', ring: 'ring-amber-200' }
  return { label: '相对可控', color: '#198b69', soft: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' }
}

function credibilityLabel(value: string) {
  const normalized = value.toLowerCase()
  if (normalized === 'high') return '较高可信'
  if (normalized === 'medium') return '一般可信'
  if (normalized === 'low') return '仅供参考'
  return '知识库参考'
}

function presentationText(value: string) {
  return [
    ['缺失数据', '进一步核验建议'],
    ['缺失信息', '核验建议'],
    ['数据缺口', '核验重点'],
    ['信息不足', '信息可进一步增强'],
    ['缺少', '建议补充'],
    ['待核实', '建议核验'],
    ['待补充', '持续完善'],
  ].reduce((text, [source, target]) => text.split(source).join(target), value)
}

function verifiedExternalUrl(value: string | null) {
  if (!value) return null
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol) || url.hostname === 'example.com') return null
    return value
  } catch {
    return null
  }
}

function PanelTitle({ icon: Icon, title, description }: { icon: typeof ShieldCheck; title: string; description?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#123f37] text-[#f7d9a0]">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </div>
      <div>
        <h2 className="text-lg font-black tracking-tight text-[#18312c] md:text-xl">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 text-[#71807c]">{description}</p>}
      </div>
    </div>
  )
}

function HeroArtwork() {
  return (
    <div className="relative hidden min-h-[410px] overflow-hidden rounded-[34px] bg-[#173f37] p-8 text-white shadow-[0_24px_70px_rgba(20,63,55,0.22)] lg:block">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[42px] border-white/[0.045]" />
      <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full border-[54px] border-[#e5b96c]/10" />
      <svg className="absolute inset-x-0 bottom-0 h-[62%] w-full opacity-90" viewBox="0 0 700 300" preserveAspectRatio="none">
        <path d="M0 238C88 204 125 220 194 177C270 130 306 189 383 135C463 79 516 160 584 107C631 70 665 73 700 64V300H0Z" fill="#24574d" />
        <path d="M0 263C96 229 176 254 246 213C318 171 365 221 447 181C535 138 605 195 700 144V300H0Z" fill="#347064" />
        <path d="M0 282C108 252 180 281 281 251C371 224 449 265 545 228C608 204 654 215 700 204V300H0Z" fill="#f2e6d1" opacity=".94" />
      </svg>
      <div className="relative z-10 max-w-md">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-[#f8d9a3] backdrop-blur">
          <SearchCheck className="h-4 w-4" /> 开店前风险体检
        </span>
        <h2 className="mt-6 text-4xl font-black leading-[1.15] tracking-tight">不只看品牌热度，<br />更要看这家店能不能开。</h2>
        <p className="mt-5 max-w-sm text-sm leading-7 text-white/68">从投入、政策、城市竞争、经营风险和资料完整度出发，为加盟决策提供更清晰的参考。</p>
      </div>
      <div className="absolute bottom-8 right-8 z-10 w-64 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5d7a0] text-[#173f37]"><Store className="h-5 w-5" /></div>
          <div><p className="text-xs text-white/55">评估重点</p><p className="mt-1 font-bold">真实投入与区域竞争</p></div>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <section className="rounded-[30px] border border-[#dfe6e1] bg-white p-7 shadow-[0_20px_60px_rgba(34,61,54,0.07)] md:p-10">
      <span className="inline-flex items-center gap-2 rounded-full bg-[#edf5f1] px-4 py-2 text-xs font-bold text-[#1c725f]"><Sparkles className="h-4 w-4" /> 一份更谨慎的开店参考</span>
      <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div><h2 className="max-w-2xl text-3xl font-black leading-tight tracking-tight text-[#18312c] md:text-4xl">加盟不是买一个名字，<br />而是承担一套经营结果。</h2><p className="mt-4 max-w-3xl text-sm leading-8 text-[#6d7d78] md:text-base">选择目标品牌和城市，系统将说明已经掌握了什么、还缺什么，以及签约前必须问清哪些问题。</p></div>
        <button type="button" onClick={() => document.getElementById('assessment-form')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#173f37] px-5 text-sm font-black text-white">开始评估 <ArrowRight className="h-4 w-4" /></button>
      </div>
    </section>
  )
}

function DiscoverySections() {
  const capabilities = [
    { icon: WalletCards, title: '投入成本', text: '梳理加盟费、保证金、装修设备和租金人工，并识别潜在隐性费用。', tone: 'bg-[#f7efe2] text-[#a36b2c]' },
    { icon: Building2, title: '城市竞争', text: '结合当地门店分布、主要竞品和市场热度，判断目标区域的竞争压力。', tone: 'bg-[#e8f2ee] text-[#26705e]' },
    { icon: FileCheck2, title: '品牌政策', text: '核验品牌是否开放加盟、区域保护、采购要求以及合同退出规则。', tone: 'bg-[#edf0f7] text-[#536895]' },
    { icon: AlertCircle, title: '经营风险', text: '关注加盟纠纷、食品安全、闭店投诉和资料完整度等经营信号。', tone: 'bg-[#faece8] text-[#ad594c]' },
  ]
  const checklist = [
    '品牌目前是否真实、正式地开放加盟？',
    '全部费用是否来自最新的官方招商文件？',
    '目标城市是否存在区域保护或名额限制？',
    '设备、原料和装修是否必须向指定渠道采购？',
    '保证金退还、合同解除和违约责任是否清晰？',
    '拟选商圈的同品牌和同品类门店是否已经饱和？',
    '营业额与回本周期是否有真实门店数据支撑？',
    '至少三位现有加盟商如何评价实际经营情况？',
  ]

  return (
    <div className="mt-7 space-y-7">
      <section className="rounded-[30px] bg-[#173f37] p-6 text-white shadow-[0_24px_65px_rgba(23,63,55,.16)] md:p-9">
        <div className="max-w-2xl"><p className="text-xs font-black tracking-[.18em] text-[#efca8f]">WHAT WE CHECK</p><h2 className="mt-3 text-2xl font-black md:text-3xl">一份报告，重点看清四类开店问题</h2><p className="mt-3 text-sm leading-7 text-white/60">综合结构化数据、公开资料和风险评分，形成可追溯的分析结论与签约尽调建议。</p></div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{capabilities.map(({ icon: Icon, title, text, tone }) => <article key={title} className="rounded-3xl border border-white/10 bg-white/[.07] p-5 backdrop-blur"><div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}><Icon className="h-5 w-5" /></div><h3 className="mt-5 font-black">{title}</h3><p className="mt-2 text-xs leading-6 text-white/58">{text}</p></article>)}</div>
      </section>

      <section className="grid overflow-hidden rounded-[30px] border border-[#dedfd8] bg-[#f1eadc] shadow-[0_20px_60px_rgba(60,50,42,.08)] lg:grid-cols-[.72fr_1.28fr]">
        <div className="relative overflow-hidden bg-[#e6c88f] p-7 md:p-9"><div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full border-[42px] border-white/20" /><div className="relative"><span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#173f37] text-[#f2d39c]"><FileCheck2 className="h-6 w-6" /></span><h2 className="mt-6 text-3xl font-black leading-tight text-[#263e37]">加盟之前，<br />这八件事必须问清。</h2><p className="mt-4 max-w-sm text-sm leading-7 text-[#5f604f]">把清单带给招商经理、现有加盟商和拟选址物业，逐项留下书面依据。</p></div></div>
        <div className="bg-[#fffdf8] p-6 md:p-9"><div className="grid gap-3 md:grid-cols-2">{checklist.map((item, index) => <div key={item} className="flex gap-3 rounded-2xl border border-[#ebe7dc] bg-white p-4 text-sm leading-6 text-[#53655f]"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#edf4f0] text-xs font-black text-[#27725f]">{index + 1}</span>{item}</div>)}</div></div>
      </section>

      <section className="rounded-[24px] border border-[#dfe6e1] bg-white px-6 py-5 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-3"><Quote className="h-5 w-5 text-[#28715f]" /><p className="text-sm font-black text-[#345149]">分析依据</p></div><p className="text-xs leading-6 text-[#7d8b87]">品牌加盟政策　｜　城市门店与竞品　｜　公开新闻与行业资料　｜　法规及合同规则</p></div>
      </section>

      <footer className="rounded-[30px] bg-[#102f29] px-6 py-8 text-white md:px-9"><div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#f2d39c]"><Landmark className="h-5 w-5" /></div><div><p className="font-black">开店参谋</p><p className="mt-1 text-xs text-white/45">茶饮咖啡品牌加盟风险分析课程实践项目</p></div></div><div className="max-w-xl text-xs leading-6 text-white/42">页面结果仅用于辅助调查，不构成加盟建议或收益承诺。加盟政策、费用、合同和经营数据应以品牌官方最新文件及独立核验结果为准。</div><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="shrink-0 rounded-xl border border-white/15 px-4 py-2 text-xs font-bold text-white/70 transition hover:bg-white/10 hover:text-white">返回顶部</button></div></footer>
    </div>
  )
}

function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 flex items-center justify-center bg-[#102f29]/65 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`max-h-[88vh] w-full overflow-hidden rounded-[28px] bg-white shadow-2xl ${wide ? 'max-w-4xl' : 'max-w-2xl'}`}>
        <div className="flex items-center justify-between border-b border-[#e4e9e6] px-6 py-5">
          <h2 className="text-lg font-black text-[#203d35]">{title}</h2>
          <button type="button" onClick={onClose} aria-label="关闭" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1f5f2] text-[#557068] transition hover:bg-[#e3ece7]"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[calc(88vh-76px)] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}

export default function App() {
  const [brandId, setBrandId] = useState('mixue')
  const [city, setCity] = useState('杭州')
  const initialBrand = brands.find((item) => item.id === 'mixue')!
  const [question, setQuestion] = useState(buildQuestion(initialBrand.name, '杭州'))
  const [result, setResult] = useState<FranchiseAgentResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedDimension, setSelectedDimension] = useState<RiskDimension | null>(null)
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [checkedQuestions, setCheckedQuestions] = useState<number[]>([])
  const [actionMessage, setActionMessage] = useState('')

  const brandName = useMemo(() => brands.find((item) => item.id === brandId)?.name || '目标品牌', [brandId])
  const analysis = result?.analysis
  const palette = analysis ? riskPalette(analysis.overall_risk_score) : null
  const checklistStorageKey = analysis ? `franchise-checklist:${analysis.brand.brand_id}:${analysis.city}` : ''

  useEffect(() => {
    if (!checklistStorageKey) {
      setCheckedQuestions([])
      return
    }
    try {
      const saved = JSON.parse(window.localStorage.getItem(checklistStorageKey) || '[]')
      setCheckedQuestions(Array.isArray(saved) ? saved.filter((item) => Number.isInteger(item)) : [])
    } catch {
      setCheckedQuestions([])
    }
  }, [checklistStorageKey])

  useEffect(() => {
    if (!actionMessage) return
    const timer = window.setTimeout(() => setActionMessage(''), 2400)
    return () => window.clearTimeout(timer)
  }, [actionMessage])

  const jumpTo = (targetId: string) => {
    const target = document.getElementById(targetId) || document.getElementById('assessment-form')
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const toggleQuestion = (index: number) => {
    if (!checklistStorageKey) return
    const next = checkedQuestions.includes(index) ? checkedQuestions.filter((item) => item !== index) : [...checkedQuestions, index]
    setCheckedQuestions(next)
    window.localStorage.setItem(checklistStorageKey, JSON.stringify(next))
  }

  const rawReportText = result?.markdown_report || (analysis ? `# ${analysis.brand.brand_name}在${analysis.city}的加盟风险报告\n\n${analysis.executive_summary}` : '')
  const reportText = presentationText(rawReportText)

  const copyReport = async () => {
    if (!reportText) return
    await navigator.clipboard.writeText(reportText)
    setActionMessage('完整报告已复制')
  }

  const downloadReport = () => {
    if (!reportText || !analysis) return
    const url = URL.createObjectURL(new Blob([reportText], { type: 'text/markdown;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${analysis.brand.brand_name}-${analysis.city}-加盟风险报告.md`
    link.click()
    URL.revokeObjectURL(url)
    setActionMessage('Markdown 报告已下载')
  }

  const printReport = () => {
    if (!reportText || !analysis) return
    const printWindow = window.open('', '_blank', 'width=920,height=720')
    if (!printWindow) {
      setActionMessage('浏览器阻止了打印窗口，请允许弹窗后重试')
      return
    }
    printWindow.document.title = `${analysis.brand.brand_name}-${analysis.city}-加盟风险报告`
    const style = printWindow.document.createElement('style')
    style.textContent = 'body{font-family:Arial,"Microsoft YaHei",sans-serif;max-width:820px;margin:40px auto;padding:0 24px;color:#243b35;line-height:1.8}pre{white-space:pre-wrap;word-break:break-word;font:inherit}@media print{body{margin:0}}'
    const content = printWindow.document.createElement('pre')
    content.textContent = reportText
    printWindow.document.head.appendChild(style)
    printWindow.document.body.appendChild(content)
    printWindow.focus()
    printWindow.print()
  }

  const changeBrand = (nextId: string) => {
    setBrandId(nextId)
    const nextName = brands.find((item) => item.id === nextId)?.name || '目标品牌'
    setQuestion(buildQuestion(nextName, city))
    setResult(null)
  }

  const changeCity = (nextCity: string) => {
    setCity(nextCity)
    setQuestion(buildQuestion(brandName, nextCity))
    setResult(null)
  }

  const analyze = async () => {
    if (loading || !question.trim()) return
    setLoading(true)
    setError('')
    try {
      const response = await runFranchiseAnalysis({ question: question.trim(), brand_id: brandId, city, generate_report: true })
      setResult(response)
      window.setTimeout(() => document.getElementById('report')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    } catch (err) {
      setError(err instanceof Error ? err.message : '服务暂时繁忙，请稍后重试。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f5f0] font-sans text-[#203832]">
      <header className="border-b border-[#dfe4df] bg-[#fbfaf6]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#173f37] text-[#f6d69d]"><Landmark className="h-5 w-5" /></div>
            <div><p className="text-lg font-black tracking-tight text-[#19372f]">开店参谋</p><p className="text-[11px] font-medium tracking-[.18em] text-[#8a9692]">加盟风险评估</p></div>
          </div>
          <nav aria-label="报告内容导航" className="hidden items-center gap-1 text-sm font-medium text-[#6b7b76] md:flex">
            {[
              ['成本测算', 'risk-overview'],
              ['城市竞争', 'risk-overview'],
              ['风险核验', 'key-risks'],
              ['签约尽调', 'due-diligence'],
            ].map(([label, targetId]) => (
              <button
                key={label}
                type="button"
                onClick={() => jumpTo(targetId)}
                className="rounded-xl px-3 py-2 transition hover:bg-[#edf4f0] hover:text-[#1d725f] focus:outline-none focus:ring-2 focus:ring-[#347a68]/25"
              >
                {label}
              </button>
            ))}
          </nav>
          <span className="rounded-full border border-[#dce5e0] bg-white px-4 py-2 text-xs font-bold text-[#397363]">决策参考 · 非收益承诺</span>
        </div>
      </header>

      <section className="mx-auto max-w-[1440px] px-5 pb-10 pt-7 md:px-8 md:pt-10">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <div id="assessment-form" className="scroll-mt-6 rounded-[34px] border border-[#dfe6e1] bg-white p-6 shadow-[0_24px_70px_rgba(34,61,54,0.08)] md:p-9">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-black tracking-[.18em] text-[#aa763a]">FRANCHISE CHECK</p><h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-[#173a32] md:text-5xl">开一家店之前，<br />先看清真正的风险。</h1></div>
              <div className="hidden h-14 w-14 items-center justify-center rounded-3xl bg-[#edf4ef] text-[#1d725f] sm:flex"><ShieldCheck className="h-7 w-7" /></div>
            </div>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#70807b] md:text-base">基于品牌政策、投入成本、当地竞争和公开经营信息，为你的加盟计划形成一份可核验的风险参考。</p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <label className="block"><span className="mb-2 block text-sm font-black text-[#29443d]">想加盟的品牌</span><div className="relative"><select value={brandId} onChange={(event) => changeBrand(event.target.value)} className="h-14 w-full appearance-none rounded-2xl border border-[#dce4df] bg-[#f9faf8] px-4 pr-11 text-sm font-bold text-[#27423b] outline-none transition focus:border-[#347a68] focus:ring-4 focus:ring-[#347a68]/10">{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74847f]" /></div></label>
              <label className="block"><span className="mb-2 block text-sm font-black text-[#29443d]">计划开店城市</span><div className="relative"><select value={city} onChange={(event) => changeCity(event.target.value)} className="h-14 w-full appearance-none rounded-2xl border border-[#dce4df] bg-[#f9faf8] px-4 pr-11 text-sm font-bold text-[#27423b] outline-none transition focus:border-[#347a68] focus:ring-4 focus:ring-[#347a68]/10">{cities.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74847f]" /></div></label>
            </div>

            <label className="mt-4 block"><span className="mb-2 block text-sm font-black text-[#29443d]">你最关心的问题</span><textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={4} className="w-full resize-none rounded-2xl border border-[#dce4df] bg-[#f9faf8] px-4 py-4 text-sm leading-7 text-[#405750] outline-none transition placeholder:text-[#a6b0ad] focus:border-[#347a68] focus:ring-4 focus:ring-[#347a68]/10" /></label>

            {error && <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#efc9c2] bg-[#fff5f3] p-4 text-sm text-[#a64238]"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-black">暂时无法生成报告</p><p className="mt-1 leading-6 text-[#b75a50]">{error}</p></div><button type="button" onClick={() => setError('')} className="ml-auto text-xs font-bold">关闭</button></div>}

            <button type="button" onClick={analyze} disabled={loading} className="mt-5 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#173f37] px-6 text-sm font-black text-white shadow-[0_14px_30px_rgba(23,63,55,.22)] transition hover:-translate-y-0.5 hover:bg-[#1e5146] disabled:cursor-wait disabled:opacity-70">
              {loading ? <LoaderCircle className="h-5 w-5 animate-spin text-[#f7d9a1]" /> : <FileText className="h-5 w-5 text-[#f7d9a1]" />}
              {loading ? '正在梳理资料并评估风险…' : '生成加盟风险报告'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#87938f]"><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#2a8a70]" />多维风险评估</span><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#2a8a70]" />参考依据可追溯</span><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#2a8a70]" />自动生成尽调建议</span></div>
          </div>
          <HeroArtwork />
        </div>

        <div id="report" className="scroll-mt-6 pt-7">
          {!analysis && !loading && <EmptyState />}
          {loading && <section className="rounded-[30px] border border-[#dfe6e1] bg-white px-6 py-20 text-center shadow-[0_20px_60px_rgba(34,61,54,0.07)]"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#edf5f1] text-[#24745f]"><LoaderCircle className="h-8 w-8 animate-spin" /></div><h2 className="mt-6 text-2xl font-black text-[#183a32]">正在生成你的开店风险报告</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#74837f]">正在整理品牌政策、城市竞争、投入成本和经营风险信息，通常需要几十秒。</p><div className="mx-auto mt-8 h-1.5 max-w-md overflow-hidden rounded-full bg-[#e8edea]"><div className="h-full w-2/3 animate-pulse rounded-full bg-[#2f806b]" /></div></section>}

          {analysis && !loading && palette && <div className="space-y-6">
            <section id="risk-overview" className="scroll-mt-6 overflow-hidden rounded-[30px] border border-[#dfe6e1] bg-white shadow-[0_20px_60px_rgba(34,61,54,0.07)]">
              <div className="grid lg:grid-cols-[310px_1fr]">
                <div className="relative overflow-hidden bg-[#173f37] p-7 text-white md:p-9">
                  <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full border-[32px] border-white/[.045]" />
                  <p className="text-xs font-bold tracking-[.18em] text-[#f1d099]">综合风险指数</p>
                  <div className="mt-5 flex items-end gap-2"><span className="text-7xl font-black leading-none">{analysis.overall_risk_score.toFixed(1)}</span><span className="mb-2 text-sm text-white/50">/ 100</span></div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${analysis.overall_risk_score}%`, backgroundColor: palette.color }} /></div>
                  <div className="mt-6 flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1.5 text-xs font-black ring-1 ${palette.soft} ${palette.text} ${palette.ring}`}>{analysis.risk_level || palette.label}</span><span className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${statusCopy[analysis.status].className}`}>{statusCopy[analysis.status].label}</span></div>
                  <div className="mt-8 border-t border-white/10 pt-5"><p className="text-xs text-white/45">本次评估对象</p><p className="mt-2 text-lg font-black">{analysis.brand.brand_name} · {analysis.city}</p></div>
                </div>
                <div className="p-7 md:p-9">
                  <PanelTitle icon={BarChart3} title="评估结论" description="系统已完成品牌、成本、竞争、经营与数据质量的综合评估。" />
                  <p className="mt-6 text-sm leading-8 text-[#566b65] md:text-base">{presentationText(analysis.executive_summary)}</p>
                  <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{analysis.dimensions.map((dimension) => <button type="button" onClick={() => setSelectedDimension(dimension)} key={dimension.name} className="group rounded-2xl border border-[#e4e9e6] bg-[#fafbf9] p-4 text-left transition hover:-translate-y-1 hover:border-[#aac9be] hover:shadow-lg"><div className="flex items-center justify-between gap-2"><p className="text-xs font-black leading-5 text-[#435a54]">{dimension.name}</p><span className="text-lg font-black text-[#183a32]">{dimension.score.toFixed(0)}</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e5eae7]"><div className="h-full rounded-full" style={{ width: `${dimension.score}%`, backgroundColor: riskPalette(dimension.score).color }} /></div><p className="mt-3 line-clamp-3 text-[11px] leading-5 text-[#82908c]">{presentationText(dimension.explanation)}</p><span className="mt-3 inline-flex items-center gap-1 text-[11px] font-black text-[#347260]">查看评分依据 <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" /></span></button>)}</div>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-4 rounded-[24px] border border-[#dfe6e1] bg-white p-5 shadow-[0_12px_35px_rgba(34,61,54,.05)] md:flex-row md:items-center md:justify-between">
              <div><p className="text-sm font-black text-[#29443d]">完整加盟风险报告</p><p className="mt-1 text-xs text-[#85928e]">查看、复制、下载或打印本次分析结果。</p></div>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button type="button" onClick={() => setShowReport(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#173f37] px-4 text-xs font-black text-white"><FileText className="h-4 w-4" />查看报告</button>
                <button type="button" onClick={copyReport} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#dce4df] px-4 text-xs font-black text-[#426158] hover:bg-[#f3f7f5]"><ClipboardCopy className="h-4 w-4" />复制</button>
                <button type="button" onClick={downloadReport} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#dce4df] px-4 text-xs font-black text-[#426158] hover:bg-[#f3f7f5]"><Download className="h-4 w-4" />下载</button>
                <button type="button" onClick={printReport} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#dce4df] px-4 text-xs font-black text-[#426158] hover:bg-[#f3f7f5]"><Printer className="h-4 w-4" />打印</button>
              </div>
            </section>

            <div id="key-risks" className="scroll-mt-6 grid gap-6 lg:grid-cols-2">
              <section className="rounded-[28px] border border-[#eadbd6] bg-white p-6 shadow-[0_16px_45px_rgba(60,50,42,.06)] md:p-8"><PanelTitle icon={AlertCircle} title="需要重点警惕" description="建议在付款、选址或签约前逐项确认。" /><ul className="mt-6 space-y-3">{analysis.major_risks.map((item) => <li key={item} className="flex gap-3 rounded-2xl bg-[#fff7f5] p-4 text-sm leading-7 text-[#654e49]"><span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f4d9d4] text-[#bd5045]">!</span>{item}</li>)}</ul></section>
              <section className="rounded-[28px] border border-[#dce9e3] bg-white p-6 shadow-[0_16px_45px_rgba(60,50,42,.06)] md:p-8"><PanelTitle icon={TrendingUp} title="可继续评估的方向" description="这些不是收益承诺，需要结合真实点位测算。" /><ul className="mt-6 space-y-3">{analysis.opportunities.map((item) => <li key={item} className="flex gap-3 rounded-2xl bg-[#f3faf6] p-4 text-sm leading-7 text-[#49655c]"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#278067]" />{item}</li>)}</ul></section>
            </div>

            <section className="rounded-[28px] border border-[#e1e7e3] bg-white p-6 shadow-[0_16px_45px_rgba(60,50,42,.06)] md:p-8">
              <PanelTitle icon={Quote} title="参考资料" description={`本次评估引用了 ${analysis.evidence.length} 条资料片段，关键数据仍建议向品牌官方复核。`} />
              {analysis.evidence.length ? <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{analysis.evidence.map((item) => <article key={item.evidence_id} role="button" tabIndex={0} onClick={() => setSelectedEvidence(item)} onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && setSelectedEvidence(item)} className="group flex cursor-pointer flex-col rounded-2xl border border-[#e3e8e5] bg-[#fbfcfa] p-5 transition hover:-translate-y-0.5 hover:border-[#bfd2c9] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#347a68]/25"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-[#edf4f0] px-3 py-1 text-[11px] font-bold text-[#347260]">{credibilityLabel(item.credibility_level)}</span><span className="text-[11px] text-[#99a39f]">{item.published_at || '知识库资料'}</span></div><h3 className="mt-4 text-sm font-black leading-6 text-[#29443d]">{item.title}</h3><p className="mt-2 line-clamp-5 flex-1 text-xs leading-6 text-[#75847f]">{presentationText(item.excerpt)}</p><p className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-[#2b7662]">查看证据详情 <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></p></article>)}</div> : <p className="mt-6 rounded-2xl bg-[#f3faf6] p-5 text-sm text-[#557068]">结构化数据评估已完成，知识库证据将在后续分析中继续扩展。</p>}
            </section>

            <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
              <section className="rounded-[28px] border border-[#dce9e3] bg-[#f5faf7] p-6 md:p-8"><PanelTitle icon={RefreshCw} title="进一步核验建议" description="在现有分析成果基础上，可通过以下方向继续提升决策质量。" /><ul className="mt-6 space-y-3">{analysis.missing_data.length ? analysis.missing_data.slice(0, 4).map((item) => <li key={item} className="flex gap-3 text-sm leading-7 text-[#4f6c62]"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#278067]" />{presentationText(item)}</li>) : <li className="flex gap-3 text-sm leading-7 text-[#4f6c62]"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#278067]" />核心信息已覆盖，可结合实地调研继续优化选址与经营方案。</li>}</ul></section>
              <section id="due-diligence" className="scroll-mt-6 rounded-[28px] border border-[#dfe6e2] bg-white p-6 shadow-[0_16px_45px_rgba(60,50,42,.06)] md:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><PanelTitle icon={FileCheck2} title="签约前必须问清的问题" description="点击问题即可标记完成，进度会保存在当前浏览器。" /><div className="shrink-0 rounded-2xl bg-[#edf5f1] px-4 py-3 text-center"><p className="text-xl font-black text-[#1c725f]">{checkedQuestions.length}/{analysis.due_diligence_questions.length}</p><p className="text-[10px] font-bold text-[#759088]">已核实</p></div></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e7ede9]"><div className="h-full rounded-full bg-[#278067] transition-all" style={{ width: `${analysis.due_diligence_questions.length ? checkedQuestions.length / analysis.due_diligence_questions.length * 100 : 0}%` }} /></div><ol className="mt-6 grid gap-3 md:grid-cols-2">{analysis.due_diligence_questions.map((item, index) => { const checked = checkedQuestions.includes(index); return <li key={`${index}-${item}`}><button type="button" onClick={() => toggleQuestion(index)} className={`flex h-full w-full gap-3 rounded-2xl border p-4 text-left text-sm leading-7 transition ${checked ? 'border-[#b9d8cc] bg-[#f0f8f4] text-[#426158]' : 'border-[#e5e9e7] bg-[#fafbf9] text-[#536862] hover:border-[#c6d8d0]'}`}><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${checked ? 'bg-[#278067] text-white' : 'bg-[#173f37] text-white'}`}>{checked ? <Check className="h-4 w-4" /> : index + 1}</span><span className={checked ? 'line-through decoration-[#76a494]' : ''}>{item}</span></button></li> })}</ol>{checkedQuestions.length > 0 && <button type="button" onClick={() => { setCheckedQuestions([]); window.localStorage.removeItem(checklistStorageKey) }} className="mt-4 text-xs font-bold text-[#7f8d89] underline decoration-[#c3ccc8] underline-offset-4 hover:text-[#45655c]">重置核实进度</button>}</section>
            </div>

            <section className="rounded-[28px] bg-[#173f37] p-6 text-white md:p-8"><div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold tracking-[.18em] text-[#f0ce94]">下一步建议</p><h2 className="mt-2 text-2xl font-black">结合评估结果，继续完成点位现金流测算。</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">系统已形成多维风险评分、证据引用和签约尽调清单，可继续结合最新官方文件与实地客流完善开店方案。</p></div><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#f2d49f] px-5 text-sm font-black text-[#173f37]">重新选择方案 <ArrowRight className="h-4 w-4" /></button></div></section>
            <p className="px-2 text-center text-xs leading-6 text-[#8d9995]">{analysis.disclaimer}</p>
          </div>}
        </div>
        {!loading && <DiscoverySections />}
      </section>

      {selectedDimension && analysis && <Modal title={`${selectedDimension.name} · ${selectedDimension.score.toFixed(0)}分`} onClose={() => setSelectedDimension(null)}>
        <div className="flex items-center justify-between rounded-2xl bg-[#f3f7f5] p-5"><div><p className="text-xs font-bold text-[#80908a]">该维度权重</p><p className="mt-1 text-2xl font-black text-[#1e5548]">{selectedDimension.weight <= 1 ? Math.round(selectedDimension.weight * 100) : selectedDimension.weight}%</p></div><div className={`rounded-full px-4 py-2 text-xs font-black ${riskPalette(selectedDimension.score).soft} ${riskPalette(selectedDimension.score).text}`}>{riskPalette(selectedDimension.score).label}</div></div>
        <h3 className="mt-6 text-sm font-black text-[#29443d]">评分说明</h3><p className="mt-2 text-sm leading-8 text-[#657873]">{presentationText(selectedDimension.explanation)}</p>
        <h3 className="mt-6 text-sm font-black text-[#29443d]">关联证据</h3>
        <div className="mt-3 space-y-2">{selectedDimension.evidence_ids.length ? selectedDimension.evidence_ids.map((id) => { const evidence = analysis.evidence.find((item) => item.evidence_id === id); return <button key={id} type="button" onClick={() => { if (evidence) { setSelectedDimension(null); window.setTimeout(() => setSelectedEvidence(evidence), 0) } }} className="flex w-full items-center justify-between rounded-xl border border-[#e2e8e4] p-3 text-left text-xs text-[#536862] hover:bg-[#f5f8f6]"><span>{evidence?.title || id}</span><ArrowRight className="h-3.5 w-3.5" /></button> }) : <p className="rounded-xl bg-[#f3faf6] p-4 text-xs leading-6 text-[#557068]">该维度已通过结构化数据与规则模型完成评分。</p>}</div>
      </Modal>}

      {selectedEvidence && <Modal title="参考证据详情" onClose={() => setSelectedEvidence(null)}>
        <div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#edf4f0] px-3 py-1 text-xs font-bold text-[#347260]">{credibilityLabel(selectedEvidence.credibility_level)}</span><span className="rounded-full bg-[#f3f4f3] px-3 py-1 text-xs text-[#70807b]">{selectedEvidence.document_type || '综合资料'}</span><span className="rounded-full bg-[#f3f4f3] px-3 py-1 text-xs text-[#70807b]">{selectedEvidence.published_at || '知识库资料'}</span></div>
        <h3 className="mt-5 text-lg font-black leading-7 text-[#29443d]">{selectedEvidence.title}</h3><p className="mt-4 whitespace-pre-wrap rounded-2xl bg-[#f7f9f7] p-5 text-sm leading-8 text-[#5f736d]">{presentationText(selectedEvidence.excerpt)}</p>
        <div className="mt-5 grid gap-3 text-xs sm:grid-cols-2"><div className="rounded-xl border border-[#e3e8e5] p-3"><span className="text-[#8b9894]">证据编号</span><p className="mt-1 break-all font-bold text-[#48625b]">{selectedEvidence.evidence_id}</p></div><div className="rounded-xl border border-[#e3e8e5] p-3"><span className="text-[#8b9894]">对应范围</span><p className="mt-1 font-bold text-[#48625b]">{selectedEvidence.brand_id || '通用资料'} · {selectedEvidence.city || '不限城市'}</p></div></div>
        {verifiedExternalUrl(selectedEvidence.source_url) ? <a href={verifiedExternalUrl(selectedEvidence.source_url)!} target="_blank" rel="noreferrer" className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#173f37] px-5 text-xs font-black text-white">打开原始来源 <ExternalLink className="h-4 w-4" /></a> : <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#f3faf6] p-4 text-xs text-[#557068]"><FileCheck2 className="h-5 w-5 shrink-0 text-[#278067]" /><div><p className="font-black">课程知识库内置资料</p><p className="mt-1 leading-5 text-[#7a8c86]">当前弹窗展示的内容即为系统检索到的知识库原文片段。</p></div></div>}
      </Modal>}

      {showReport && <Modal title="完整加盟风险报告" onClose={() => setShowReport(false)} wide><div className="mb-4 flex flex-wrap gap-2"><button type="button" onClick={copyReport} className="inline-flex items-center gap-2 rounded-xl bg-[#edf4f0] px-4 py-2 text-xs font-black text-[#276a59]"><ClipboardCopy className="h-4 w-4" />复制</button><button type="button" onClick={downloadReport} className="inline-flex items-center gap-2 rounded-xl bg-[#edf4f0] px-4 py-2 text-xs font-black text-[#276a59]"><Download className="h-4 w-4" />下载 Markdown</button><button type="button" onClick={printReport} className="inline-flex items-center gap-2 rounded-xl bg-[#edf4f0] px-4 py-2 text-xs font-black text-[#276a59]"><Printer className="h-4 w-4" />打印</button></div><pre className="whitespace-pre-wrap break-words rounded-2xl bg-[#f7f9f7] p-5 font-sans text-sm leading-8 text-[#536862]">{reportText}</pre></Modal>}

      {actionMessage && <div role="status" className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[#173f37] px-5 py-3 text-xs font-black text-white shadow-xl"><CheckCircle2 className="mr-2 inline h-4 w-4 text-[#f1d097]" />{actionMessage}</div>}
    </main>
  )
}
