export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

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

export interface KnowledgeStatus {
  ready: boolean
  document_count: number
  chunk_count: number
  brands: Record<string, number>
  document_types: Record<string, number>
  persist_directory: string
  embedding_model: string
  updated_at: string | null
}

export interface FrameworkStatus {
  architecture: string
  agent_count: number
  agent_name: string
  multi_agent: boolean
  rag_role: string
  tool_count: number
  chains: string[]
  callbacks_enabled: boolean
  structured_output: string
  langchain_version: string
  llm: Record<string, unknown>
  knowledge: KnowledgeStatus
  embedding_model: string
}

export interface AgentTool {
  name: string
  description: string
  parameters: Record<string, unknown>
}

async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `API 请求失败：${response.status}`)
  }
  return response.json() as Promise<T>
}

export function fetchFramework() {
  return requestJson<FrameworkStatus>('/franchise-agent/framework')
}

export function fetchTools() {
  return requestJson<{ count: number; tools: AgentTool[] }>('/franchise-agent/tools')
}

export function fetchKnowledgeStatus() {
  return requestJson<KnowledgeStatus>('/knowledge/status')
}

export function searchKnowledge(payload: {
  query: string
  brand_id?: string
  city?: string
  document_type?: string
  top_k?: number
}) {
  return requestJson<{ query: string; count: number; evidence: Evidence[] }>('/knowledge/search', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function runFranchiseAgent(payload: {
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
