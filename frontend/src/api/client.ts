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

export function reviewContract(payload: unknown) {
  return requestJson('/contracts/review', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
