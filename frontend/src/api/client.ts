export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

export interface DashboardHighRiskMerchant {
  merchant_id: string
  merchant_name: string
  score: number
  level: string
}

export interface DashboardSummary {
  brand_count: number
  merchant_count: number
  risk_distribution: Record<string, number>
  contract_risk_count: number
  opinion_risk_count: number
  high_risk_merchants: DashboardHighRiskMerchant[]
}

export interface RiskDimensionScore {
  dimension: string
  score: number
  explanation: string
}

export interface RiskAssessment {
  merchant_id: string
  merchant_name: string
  total_score: number
  risk_level: string
  dimension_scores: RiskDimensionScore[]
  main_risk_factors: string[]
  business_strengths: string[]
  credit_suggestion: string
  post_loan_watchlist: string[]
}

export interface MerchantProfile {
  merchant_id: string
  merchant_name: string
  brand_name: string
  city: string
  district: string
  business_area_type: string
  opening_months: number
  average_ticket: number
  takeaway_rating: number
  monthly_revenue: number
  rent_ratio: number
  labor_cost_ratio: number
  purchase_cost_ratio: number
  debt_ratio: number
  competitor_density: number
  negative_review_keywords: string[]
  franchise_type: string
  has_contract_risk: boolean
  recent_public_opinion_risk: boolean
}

export interface BrandProfile {
  brand_id: string
  brand_name: string
  category: string
  price_band: string
  store_scale: string
  franchise_maturity: number
  public_sentiment: string
  risk_tags: string[]
}

export interface SpiderBrandStat {
  brand_name: string
  store_count: number
  news_count: number
  sample_risk_score: number
  risk_level: string
  primary_signal: string
}

export interface SpiderCityStat {
  city: string
  store_count: number
  market_heat: string
  competition_level: string
  top_brands: string[]
}

export interface SpiderOverview {
  brand_count: number
  city_count: number
  store_count: number
  news_count: number
  top_brands: SpiderBrandStat[]
  top_cities: SpiderCityStat[]
  missing_credit_fields: string[]
  data_stage_note: string
}

export interface MerchantMarketContext {
  merchant_id: string
  merchant_name: string
  city: string
  brand_name: string
  city_store_count: number | null
  city_market_heat: string | null
  city_competition_level: string | null
  city_top_brands: string[]
  brand_store_count: number | null
  brand_news_count: number | null
  brand_sample_risk_score: number | null
  brand_risk_level: string | null
  external_risk_signals: string[]
  usage_note: string
}

export interface AIRiskExplanation {
  source: 'deepseek' | 'local_rules' | string
  summary: string
  risk_points: string[]
  credit_suggestion: string
  business_suggestions: string[]
  follow_up_data: string[]
  token_saving_note: string
}

async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

async function requestText(path: string, options?: RequestInit): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return response.text()
}

export function fetchDashboardSummary() {
  return requestJson<DashboardSummary>('/dashboard/summary')
}

export function fetchRiskAssessments() {
  return requestJson<RiskAssessment[]>('/risk')
}

export function fetchBrands() {
  return requestJson<BrandProfile[]>('/brands')
}

export function fetchMerchants() {
  return requestJson<MerchantProfile[]>('/merchants')
}

export function fetchMerchantReport(merchantId: string) {
  return requestText(`/reports/${merchantId}.md`)
}

export function fetchSpiderOverview() {
  return requestJson<SpiderOverview>('/spider/overview')
}

export function fetchMarketContext(merchantId: string) {
  return requestJson<MerchantMarketContext>(`/spider/market-context/${merchantId}`)
}

export function fetchAIRiskExplanation(merchantId: string) {
  return requestJson<AIRiskExplanation>(`/ai/risk-explanation/${merchantId}`)
}

export function reviewContract(payload: unknown) {
  return requestJson('/contracts/review', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
