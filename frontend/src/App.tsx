import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Database,
  FileSearch,
  LoaderCircle,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react'
import {
  fetchFramework,
  fetchKnowledgeStatus,
  fetchTools,
  runFranchiseAgent,
  type AgentTool,
  type FranchiseAgentResponse,
  type FrameworkStatus,
  type KnowledgeStatus,
  type ResultStatus,
} from './api/client'

const DEMO_QUESTION = '分析蜜雪冰城在杭州的加盟风险，重点关注加盟政策、投入成本、城市门店密度、竞品、负面舆情，并给出证据、缺失数据和尽调问题。'

const brands = [
  { id: 'mixue', name: '蜜雪冰城' },
  { id: 'luckin', name: '瑞幸咖啡' },
  { id: 'cotti', name: '库迪咖啡' },
  { id: 'chagee', name: '霸王茶姬' },
]

const cities = ['杭州', '上海', '成都', '北京', '深圳', '广州', '武汉', '郑州']

function statusTone(status: ResultStatus | 'running') {
  if (status === 'success') return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (status === 'insufficient_data') return 'bg-amber-50 text-amber-700 ring-amber-200'
  if (status === 'degraded') return 'bg-orange-50 text-orange-700 ring-orange-200'
  if (status === 'running') return 'bg-blue-50 text-blue-700 ring-blue-200'
  return 'bg-rose-50 text-rose-700 ring-rose-200'
}

function statusLabel(status: ResultStatus | 'running') {
  return ({ success: '成功', insufficient_data: '数据不足', degraded: '降级运行', error: '失败', running: '运行中' })[status]
}

function SectionTitle({ icon: Icon, eyebrow, title }: { icon: typeof Bot; eyebrow: string; title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white"><Icon className="h-5 w-5" /></div>
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p><h2 className="text-xl font-black text-slate-950">{title}</h2></div>
    </div>
  )
}

function EmptyResult() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600"><Search className="h-7 w-7" /></div>
      <h2 className="mt-5 text-xl font-black text-slate-900">等待第一次加盟风险分析</h2>
      <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">选择品牌和城市，或直接使用固定演示问题。系统将让唯一的 Franchise Risk Agent 调用六个工具，再通过两个 LCEL 链生成结构化结论和报告。</p>
    </div>
  )
}

export default function App() {
  const [brandId, setBrandId] = useState('mixue')
  const [city, setCity] = useState('杭州')
  const [question, setQuestion] = useState(DEMO_QUESTION)
  const [framework, setFramework] = useState<FrameworkStatus | null>(null)
  const [knowledge, setKnowledge] = useState<KnowledgeStatus | null>(null)
  const [tools, setTools] = useState<AgentTool[]>([])
  const [result, setResult] = useState<FranchiseAgentResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([fetchFramework(), fetchKnowledgeStatus(), fetchTools()])
      .then(([frameworkData, knowledgeData, toolData]) => {
        setFramework(frameworkData)
        setKnowledge(knowledgeData)
        setTools(toolData.tools)
      })
      .catch((err: Error) => setError(`后端状态加载失败：${err.message}`))
  }, [])

  const analyze = async () => {
    if (!question.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      setResult(await runFranchiseAgent({ question, brand_id: brandId, city, generate_report: true }))
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败，请检查后端服务。')
    } finally {
      setLoading(false)
    }
  }

  const analysis = result?.analysis

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <header className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-6 px-5 py-7 md:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600"><ShieldCheck className="h-6 w-6" /></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">LangChain · DeepSeek · Chroma RAG</p><h1 className="mt-1 text-2xl font-black">加盟风险智能分析系统</h1></div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-emerald-400/15 px-4 py-2 text-emerald-300 ring-1 ring-emerald-400/30">唯一 Agent：Franchise Risk Agent</span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-slate-200 ring-1 ring-white/15">6 个工具</span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-slate-200 ring-1 ring-white/15">2 条 LCEL 链</span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1480px] gap-6 px-5 py-7 md:px-8 xl:grid-cols-[380px_1fr]">
        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle icon={Sparkles} eyebrow="Analysis Input" title="发起加盟风险分析" />
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700">品牌
                <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none focus:border-blue-500">
                  {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-bold text-slate-700">目标城市
                <select value={city} onChange={(e) => setCity(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none focus:border-blue-500">
                  {cities.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="block text-sm font-bold text-slate-700">自然语言问题
                <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={8} className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500" />
              </label>
              <button onClick={() => setQuestion(DEMO_QUESTION)} className="text-left text-xs font-bold leading-5 text-blue-600 hover:text-blue-800">使用固定演示问题</button>
              <button onClick={analyze} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Bot className="h-5 w-5" />}{loading ? 'Agent 正在分析…' : '运行唯一 Agent'}
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle icon={Database} eyebrow="System Status" title="框架与知识库" />
            <div className="grid grid-cols-2 gap-3">
              {[['Agent 数量', framework?.agent_count ?? '—'], ['工具数量', framework?.tool_count ?? '—'], ['知识文档', knowledge?.document_count ?? '—'], ['知识分块', knowledge?.chunk_count ?? '—']].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-black text-slate-950">{value}</p></div>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-xs leading-5 text-slate-500">
              <p><span className="font-bold text-slate-700">架构：</span>单 Agent，RAG 仅作为工具</p>
              <p><span className="font-bold text-slate-700">模型：</span>DeepSeek / {String((framework?.llm || {}).model || '加载中')}</p>
              <p><span className="font-bold text-slate-700">Embedding：</span>{knowledge?.embedding_model || '加载中'}</p>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle icon={Wrench} eyebrow="Agent Tools" title="六个 LangChain 工具" />
            <div className="space-y-3">{tools.map((tool, index) => <div key={tool.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-3"><div className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">{index + 1}</span><div><p className="font-mono text-xs font-bold text-blue-700">{tool.name}</p><p className="mt-1 text-xs leading-5 text-slate-500">{tool.description}</p></div></div></div>)}</div>
          </section>
        </aside>

        <section className="space-y-6">
          {error && <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><span>{error}</span></div>}
          {!analysis && !loading && <EmptyResult />}
          {loading && <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-blue-100 bg-white"><LoaderCircle className="h-10 w-10 animate-spin text-blue-600" /><p className="mt-5 font-black">Franchise Risk Agent 正在调用工具并整理证据</p><p className="mt-2 text-sm text-slate-500">请稍候，DeepSeek 调用失败时系统会自动降级到确定性分析。</p></div>}

          {analysis && !loading && <>
            <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
              <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Overall Risk</p>
                <p className="mt-4 text-6xl font-black">{analysis.overall_risk_score.toFixed(1)}</p>
                <div className="mt-4 flex items-center justify-between"><span className="text-sm text-slate-400">{analysis.brand.brand_name} · {analysis.city}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusTone(analysis.status)}`}>{statusLabel(analysis.status)}</span></div>
                <p className="mt-6 border-t border-white/10 pt-5 text-xl font-black text-amber-300">{analysis.risk_level}</p>
                <p className="mt-3 text-xs leading-5 text-slate-400">运行模式：{result.execution_mode}<br />LangChain 回调事件：{result.callback_event_count}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle icon={ShieldCheck} eyebrow="Executive Summary" title="分析结论" />
                <p className="text-sm leading-8 text-slate-600">{analysis.executive_summary}</p>
                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">{analysis.dimensions.map((dimension) => <div key={dimension.name} className="rounded-2xl bg-slate-50 p-4"><div className="flex items-baseline justify-between gap-2"><p className="text-xs font-bold text-slate-600">{dimension.name}</p><p className="text-xl font-black text-slate-950">{dimension.score.toFixed(0)}</p></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-blue-600" style={{ width: `${dimension.score}%` }} /></div><p className="mt-2 text-[11px] text-slate-400">权重 {(dimension.weight * 100).toFixed(0)}%</p></div>)}</div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><SectionTitle icon={AlertTriangle} eyebrow="Risk Signals" title="主要风险" /><ul className="space-y-3">{analysis.major_risks.map((item) => <li key={item} className="flex gap-3 rounded-2xl bg-rose-50/70 p-4 text-sm leading-6 text-slate-700"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />{item}</li>)}</ul></div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><SectionTitle icon={CheckCircle2} eyebrow="Opportunity" title="机会与可行方向" /><ul className="space-y-3">{analysis.opportunities.map((item) => <li key={item} className="flex gap-3 rounded-2xl bg-emerald-50/70 p-4 text-sm leading-6 text-slate-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{item}</li>)}</ul></div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><SectionTitle icon={CircleDashed} eyebrow="Execution Trace" title="六工具执行时间线" /><div className="space-y-3">{analysis.tool_trace.map((trace, index) => <div key={`${trace.tool_name}-${index}`} className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-[34px_190px_110px_1fr]"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">{index + 1}</span><div><p className="font-mono text-xs font-bold text-blue-700">{trace.tool_name}</p><p className="mt-1 text-xs text-slate-400">{trace.duration_ms} ms</p></div><span className={`h-fit w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusTone(trace.status)}`}>{statusLabel(trace.status)}</span><div><p className="break-all text-xs leading-5 text-slate-500">输入：{trace.input_summary}</p><p className="mt-1 text-xs leading-5 text-slate-600">输出：{trace.output_summary}</p></div></div>)}</div></div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><SectionTitle icon={FileSearch} eyebrow="RAG Evidence" title={`可追溯证据（${analysis.evidence.length}）`} /><div className="grid gap-4 lg:grid-cols-2">{analysis.evidence.map((item) => <article key={item.evidence_id} className="rounded-2xl border border-slate-200 p-5"><div className="flex flex-wrap items-center gap-2"><span className="rounded-lg bg-blue-50 px-2 py-1 font-mono text-xs font-bold text-blue-700">{item.evidence_id}</span><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-500">可信度 {item.credibility_level}</span></div><h3 className="mt-3 font-black text-slate-900">{item.title}</h3><p className="mt-2 line-clamp-5 text-sm leading-6 text-slate-500">{item.excerpt}</p><div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-400"><span>{item.published_at || '日期未知'}</span>{item.source_url ? <a href={item.source_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-bold text-blue-600">查看来源<ChevronRight className="h-3 w-3" /></a> : <span>无公开 URL</span>}</div></article>)}</div></div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6"><SectionTitle icon={Database} eyebrow="Missing Data" title="缺失数据" /><ul className="space-y-2 text-sm leading-6 text-amber-900">{analysis.missing_data.length ? analysis.missing_data.map((item) => <li key={item}>• {item}</li>) : <li>未识别到明确缺失项。</li>}</ul></div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><SectionTitle icon={MapPin} eyebrow="Due Diligence" title="加盟前尽调问题" /><ol className="space-y-3">{analysis.due_diligence_questions.map((item, index) => <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600"><span className="font-black text-blue-600">{index + 1}.</span>{item}</li>)}</ol></div>
            </div>

            {result?.markdown_report && <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><SectionTitle icon={FileSearch} eyebrow="Report Chain" title="Markdown 分析报告" /><pre className="max-h-[720px] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-6 font-sans text-sm leading-7 text-slate-200">{result.markdown_report}</pre></div>}
            <p className="px-2 text-xs leading-6 text-slate-400">{analysis.disclaimer}</p>
          </>}
        </section>
      </div>
    </main>
  )
}
