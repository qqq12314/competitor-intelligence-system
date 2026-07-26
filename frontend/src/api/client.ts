export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export type ResultStatus = 'success' | 'insufficient_data' | 'degraded' | 'error'

export interface Evidence {
  evidence_id: string
  title: string
  excerpt: string
  source_url: string | null
  published_at: string | null
  document_type: string
  credibility_level: string
  brand_id: string | null
  city: string | null
}

export interface ToolTrace {
  tool_name: string
  input_summary: string
  status: ResultStatus | 'running'
  duration_ms: number
  output_summary: string
}

export interface RiskDimension {
  name: string
  score: number
  weight: number
  explanation: string
  evidence_ids: string[]
}

export interface FranchiseAnalysis {
  status: ResultStatus
  brand: { brand_id: string; brand_name: string }
  city: string
  executive_summary: string
  overall_risk_score: number
  risk_level: string
  dimensions: RiskDimension[]
  major_risks: string[]
  opportunities: string[]
  evidence: Evidence[]
  missing_data: string[]
  due_diligence_questions: string[]
  tool_trace: ToolTrace[]
  disclaimer: string
}

export interface FranchiseAgentResponse {
  framework: string
  agent_name: string
  model_provider: string
  model_name: string
  execution_mode: 'live_agent' | 'deterministic_fallback' | 'hybrid'
  live_tool_calling_succeeded: boolean
  callback_event_count: number
  analysis: FranchiseAnalysis
  markdown_report: string | null
  cache_hit: boolean
}

async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 120_000)
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
      signal: controller.signal,
      ...options,
    })
    if (!response.ok) {
      let message = ''
      try {
        const payload = await response.json() as { detail?: string }
        message = payload.detail || ''
      } catch {
        message = await response.text()
      }
      throw new Error(message || `分析服务返回异常（${response.status}）`)
    }
    return response.json() as Promise<T>
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('本次分析用时较长，请稍后重试。')
    }
    if (error instanceof TypeError) {
      throw new Error('分析服务暂时无法连接，请稍后重试。')
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}

export function runFranchiseAnalysis(payload: {
  question: string
  brand_id?: string
  city?: string
  generate_report?: boolean
}) {
  return requestJson<FranchiseAgentResponse>('/franchise-agent/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
