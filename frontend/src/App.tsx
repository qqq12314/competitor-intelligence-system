import { useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  FileCheck2,
  FileText,
  HelpCircle,
  Landmark,
  LoaderCircle,
  MapPin,
  Quote,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import { runFranchiseAnalysis, type FranchiseAgentResponse, type ResultStatus } from './api/client'

const brands = [
  { id: 'mixue', name: '蜜雪冰城' },
  { id: 'luckin', name: '瑞幸咖啡' },
  { id: 'cotti', name: '库迪咖啡' },
  { id: 'chagee', name: '霸王茶姬' },
  { id: 'starbucks', name: '星巴克' },
  { id: 'nayuki', name: '奈雪的茶' },
  { id: 'chabaidao', name: '茶百道' },
  { id: 'guming', name: '古茗' },
  { id: 'heytea', name: '喜茶' },
  { id: 'auntea_jenny', name: '沪上阿姨' },
]

const cities = ['杭州', '北京', '上海', '广州', '天津', '重庆', '成都', '深圳', '武汉', '郑州']

function buildQuestion(brandName: string, city: string) {
  return `请分析${brandName}在${city}的加盟风险，重点评估加盟政策、投入成本、门店竞争、经营舆情和信息完整度，并给出参考依据、待核实信息及签约前尽调问题。`
}

const statusCopy: Record<ResultStatus, { label: string; className: string }> = {
  success: { label: '信息较完整', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  insufficient_data: { label: '部分信息待核实', className: 'bg-amber-50 text-amber-800 ring-amber-200' },
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
  return '待核实'
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
    <section className="overflow-hidden rounded-[30px] border border-[#dfe6e1] bg-white shadow-[0_20px_60px_rgba(34,61,54,0.07)]">
      <div className="grid lg:grid-cols-[1.1fr_.9fr]">
        <div className="p-7 md:p-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#edf5f1] px-4 py-2 text-xs font-bold text-[#1c725f]"><Sparkles className="h-4 w-4" /> 一份更谨慎的开店参考</span>
          <h2 className="mt-6 max-w-xl text-3xl font-black leading-tight tracking-tight text-[#18312c] md:text-4xl">加盟不是买一个名字，<br />而是承担一套经营结果。</h2>
          <p className="mt-5 max-w-2xl text-sm leading-8 text-[#6d7d78] md:text-base">选择目标品牌和城市，我们将围绕五类关键风险形成评估，并明确告诉你：已经掌握了什么、还缺什么、签约前必须问什么。</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              [WalletCards, '投入成本', '费用、回本与现金流'],
              [Building2, '城市竞争', '门店密度与主要竞品'],
              [FileCheck2, '签约尽调', '缺失资料与关键问题'],
            ].map(([Icon, title, text]) => {
              const FeatureIcon = Icon as typeof WalletCards
              return <div key={String(title)} className="rounded-2xl border border-[#e5ebe7] bg-[#fafcfb] p-4"><FeatureIcon className="h-5 w-5 text-[#b27735]" /><p className="mt-3 text-sm font-black text-[#233b35]">{String(title)}</p><p className="mt-1 text-xs leading-5 text-[#7b8985]">{String(text)}</p></div>
            })}
          </div>
        </div>
        <div className="relative min-h-[300px] overflow-hidden bg-[#f0e7d8] p-8">
          <div className="absolute -right-12 top-12 h-52 w-52 rounded-full bg-[#e3bf80]/45 blur-3xl" />
          <div className="relative mx-auto flex h-full max-w-sm items-center justify-center">
            <div className="w-full rotate-[-2deg] rounded-[28px] bg-white p-6 shadow-[0_24px_50px_rgba(71,55,34,0.15)]">
              <div className="flex items-center justify-between"><div><p className="text-xs font-bold text-[#a1743e]">加盟风险预评估</p><p className="mt-1 text-lg font-black text-[#203b34]">开店决策清单</p></div><ShieldCheck className="h-8 w-8 text-[#1d745f]" /></div>
              <div className="mt-6 space-y-3">{['品牌政策是否可核实', '当地门店是否已饱和', '投入是否包含隐性费用', '合同退出机制是否清晰'].map((item, index) => <div key={item} className="flex items-center gap-3 rounded-xl bg-[#f6f8f6] px-3 py-3 text-sm text-[#4b625c]"><span className={`flex h-6 w-6 items-center justify-center rounded-full ${index < 2 ? 'bg-[#dcefe8] text-[#16735c]' : 'bg-[#f5e7cf] text-[#ae6f27]'}`}>{index < 2 ? <Check className="h-3.5 w-3.5" /> : <HelpCircle className="h-3.5 w-3.5" />}</span>{item}</div>)}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
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

  const brandName = useMemo(() => brands.find((item) => item.id === brandId)?.name || '目标品牌', [brandId])
  const analysis = result?.analysis
  const palette = analysis ? riskPalette(analysis.overall_risk_score) : null

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
          <div className="hidden items-center gap-6 text-sm font-medium text-[#6b7b76] md:flex">
            <span>成本测算</span><span>城市竞争</span><span>风险核验</span><span>签约尽调</span>
          </div>
          <span className="rounded-full border border-[#dce5e0] bg-white px-4 py-2 text-xs font-bold text-[#397363]">决策参考 · 非收益承诺</span>
        </div>
      </header>

      <section className="mx-auto max-w-[1440px] px-5 pb-10 pt-7 md:px-8 md:pt-10">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-[34px] border border-[#dfe6e1] bg-white p-6 shadow-[0_24px_70px_rgba(34,61,54,0.08)] md:p-9">
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
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#87938f]"><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#2a8a70]" />多维风险评估</span><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#2a8a70]" />参考依据可追溯</span><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#2a8a70]" />明确标注待核实信息</span></div>
          </div>
          <HeroArtwork />
        </div>

        <div id="report" className="scroll-mt-6 pt-7">
          {!analysis && !loading && <EmptyState />}
          {loading && <section className="rounded-[30px] border border-[#dfe6e1] bg-white px-6 py-20 text-center shadow-[0_20px_60px_rgba(34,61,54,0.07)]"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#edf5f1] text-[#24745f]"><LoaderCircle className="h-8 w-8 animate-spin" /></div><h2 className="mt-6 text-2xl font-black text-[#183a32]">正在生成你的开店风险报告</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#74837f]">正在整理品牌政策、城市竞争、投入成本和经营风险信息，通常需要几十秒。</p><div className="mx-auto mt-8 h-1.5 max-w-md overflow-hidden rounded-full bg-[#e8edea]"><div className="h-full w-2/3 animate-pulse rounded-full bg-[#2f806b]" /></div></section>}

          {analysis && !loading && palette && <div className="space-y-6">
            <section className="overflow-hidden rounded-[30px] border border-[#dfe6e1] bg-white shadow-[0_20px_60px_rgba(34,61,54,0.07)]">
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
                  <PanelTitle icon={BarChart3} title="评估结论" description="风险指数越高，代表签约和开店前需要核实的问题越多。" />
                  <p className="mt-6 text-sm leading-8 text-[#566b65] md:text-base">{analysis.executive_summary}</p>
                  <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{analysis.dimensions.map((dimension) => <div key={dimension.name} className="rounded-2xl border border-[#e4e9e6] bg-[#fafbf9] p-4"><div className="flex items-center justify-between gap-2"><p className="text-xs font-black leading-5 text-[#435a54]">{dimension.name}</p><span className="text-lg font-black text-[#183a32]">{dimension.score.toFixed(0)}</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e5eae7]"><div className="h-full rounded-full" style={{ width: `${dimension.score}%`, backgroundColor: riskPalette(dimension.score).color }} /></div><p className="mt-3 line-clamp-3 text-[11px] leading-5 text-[#82908c]">{dimension.explanation}</p></div>)}</div>
                </div>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-[28px] border border-[#eadbd6] bg-white p-6 shadow-[0_16px_45px_rgba(60,50,42,.06)] md:p-8"><PanelTitle icon={AlertCircle} title="需要重点警惕" description="建议在付款、选址或签约前逐项确认。" /><ul className="mt-6 space-y-3">{analysis.major_risks.map((item) => <li key={item} className="flex gap-3 rounded-2xl bg-[#fff7f5] p-4 text-sm leading-7 text-[#654e49]"><span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f4d9d4] text-[#bd5045]">!</span>{item}</li>)}</ul></section>
              <section className="rounded-[28px] border border-[#dce9e3] bg-white p-6 shadow-[0_16px_45px_rgba(60,50,42,.06)] md:p-8"><PanelTitle icon={TrendingUp} title="可继续评估的方向" description="这些不是收益承诺，需要结合真实点位测算。" /><ul className="mt-6 space-y-3">{analysis.opportunities.map((item) => <li key={item} className="flex gap-3 rounded-2xl bg-[#f3faf6] p-4 text-sm leading-7 text-[#49655c]"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#278067]" />{item}</li>)}</ul></section>
            </div>

            <section className="rounded-[28px] border border-[#e1e7e3] bg-white p-6 shadow-[0_16px_45px_rgba(60,50,42,.06)] md:p-8">
              <PanelTitle icon={Quote} title="参考资料" description={`本次评估引用了 ${analysis.evidence.length} 条资料片段，关键数据仍建议向品牌官方复核。`} />
              {analysis.evidence.length ? <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{analysis.evidence.map((item) => <article key={item.evidence_id} className="group flex flex-col rounded-2xl border border-[#e3e8e5] bg-[#fbfcfa] p-5 transition hover:-translate-y-0.5 hover:border-[#bfd2c9] hover:shadow-lg"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-[#edf4f0] px-3 py-1 text-[11px] font-bold text-[#347260]">{credibilityLabel(item.credibility_level)}</span><span className="text-[11px] text-[#99a39f]">{item.published_at || '日期待核实'}</span></div><h3 className="mt-4 text-sm font-black leading-6 text-[#29443d]">{item.title}</h3><p className="mt-2 line-clamp-5 flex-1 text-xs leading-6 text-[#75847f]">{item.excerpt}</p>{item.source_url ? <a href={item.source_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-[#2b7662]">查看资料来源 <ExternalLink className="h-3.5 w-3.5" /></a> : <p className="mt-4 text-xs text-[#a0aaa6]">公开链接待补充</p>}</article>)}</div> : <p className="mt-6 rounded-2xl bg-[#f6f8f6] p-5 text-sm text-[#71817c]">当前没有匹配到可展示的参考资料，建议向品牌官方索取最新招商文件。</p>}
            </section>

            <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
              <section className="rounded-[28px] border border-[#eadfca] bg-[#fffaf0] p-6 md:p-8"><PanelTitle icon={RefreshCw} title="还需要补充的信息" description="缺少这些信息时，不建议仅凭当前结果作出决定。" /><ul className="mt-6 space-y-3">{analysis.missing_data.length ? analysis.missing_data.map((item) => <li key={item} className="flex gap-3 text-sm leading-7 text-[#715f45]"><HelpCircle className="mt-1 h-5 w-5 shrink-0 text-[#b47a2f]" />{item}</li>) : <li className="flex gap-3 text-sm leading-7 text-[#4f6c62]"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#278067]" />当前未识别到明显资料缺口，但仍应以最新合同和实地调查为准。</li>}</ul></section>
              <section className="rounded-[28px] border border-[#dfe6e2] bg-white p-6 shadow-[0_16px_45px_rgba(60,50,42,.06)] md:p-8"><PanelTitle icon={FileCheck2} title="签约前必须问清的问题" description="建议把这些问题带给招商经理、现有加盟商和拟选址物业。" /><ol className="mt-6 grid gap-3 md:grid-cols-2">{analysis.due_diligence_questions.map((item, index) => <li key={`${index}-${item}`} className="flex gap-3 rounded-2xl border border-[#e5e9e7] bg-[#fafbf9] p-4 text-sm leading-7 text-[#536862]"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#173f37] text-xs font-black text-white">{index + 1}</span>{item}</li>)}</ol></section>
            </div>

            <section className="rounded-[28px] bg-[#173f37] p-6 text-white md:p-8"><div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold tracking-[.18em] text-[#f0ce94]">下一步建议</p><h2 className="mt-2 text-2xl font-black">先核实缺口，再做点位现金流测算。</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">本报告用于缩小调查范围，不能替代品牌官方文件、合同审查、现场客流调查和独立财务测算。</p></div><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#f2d49f] px-5 text-sm font-black text-[#173f37]">重新选择方案 <ArrowRight className="h-4 w-4" /></button></div></section>
            <p className="px-2 text-center text-xs leading-6 text-[#8d9995]">{analysis.disclaimer}</p>
          </div>}
        </div>
      </section>
    </main>
  )
}
