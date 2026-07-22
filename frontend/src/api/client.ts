export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

export interface BrandMetric {
  label: string
  value: string
  hint: string
}

export interface MarketQuote {
  stock_code: string | null
  market: string | null
  current_price: string | null
  change_percent: string | null
  volume: string | null
  market_cap: string | null
  pe_ratio: string | null
  currency: string | null
  trade_date: string | null
  source_url: string | null
}

export interface NewsSignal {
  title: string
  source_name: string
  publish_date: string
  sentiment: string
  news_type: string
  summary: string
  risk_signal: string
  news_url: string | null
}

export interface FranchisePolicy {
  is_franchise_available: boolean | null
  franchise_fee: string | null
  deposit: string | null
  total_investment_range: string | null
  estimated_payback_period: string | null
  area_protection_policy: string | null
  franchise_conditions: string | null
  source_url: string | null
  note: string | null
}

export interface RegionCompetitionSignal {
  city: string
  target_brand: string
  same_category_store_count: number | null
  major_competitors: string[]
  competition_level: string | null
  market_heat: string | null
  opportunity_points: string | null
  risk_points: string | null
}

export interface BrandIntelItem {
  brand_id: string
  brand_name: string
  stock_name: string | null
  stock_code: string | null
  category: string
  headquarters: string
  listed_status: string
  key_cities: string[]
  store_count: number
  price_band: string
  sentiment_level: string
  investment_risk_score: number
  franchise_risk_score: number
  risk_level: string
  growth_signal: string
  market_signal: string
  franchise_signal: string
  risk_tags: string[]
  metrics: BrandMetric[]
  quote?: MarketQuote | null
  news?: NewsSignal[]
  franchise_policy?: FranchisePolicy | null
  region_competition?: RegionCompetitionSignal[]
  follow_up_data?: string[]
}

export interface BrandIntelSummary {
  brand_count: number
  listed_brand_count: number
  city_count: number
  news_count: number
  average_investment_risk: number
  average_franchise_risk: number
  risk_distribution: Record<string, number>
  top_attention_brands: BrandIntelItem[]
}

export interface RegionBrandCard {
  brand_name: string
  store_count: number
  competition_pressure: string
  franchise_fit: string
}

export interface RegionIntel {
  city: string
  market_heat: string
  competition_level: string
  consumer_profile: string
  store_density_index: number
  franchise_risk_score: number
  key_competitors: string[]
  brand_cards: RegionBrandCard[]
  opportunity_points: string[]
  risk_points: string[]
  follow_up_data: string[]
}

export interface BrandAIAnalysis {
  source: string
  summary: string
  investment_view: string
  franchise_view: string
  risk_points: string[]
  action_suggestions: string[]
  follow_up_data: string[]
  token_saving_note: string
  cache_hit?: boolean
}

export interface BrandAnalysisRequest {
  brand_id: string
  city?: string
  scenario?: 'investment' | 'franchise' | 'mixed'
}

export interface DatasetStatus {
  dataset: string
  database_rows: number
  csv_rows: number
  ready_for_import: boolean
  owner_role: string
  next_action: string
}

export interface BrandDataStatus {
  active_source: string
  database_engine: string
  mysql_ready: boolean
  fallback_enabled: boolean
  total_database_rows: number
  total_csv_rows: number
  datasets: DatasetStatus[]
  message: string
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

async function requestText(path: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${path}`)
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }
  return response.text()
}

export function fetchBrandIntelSummary() {
  return requestJson<BrandIntelSummary>('/brand-intel/summary')
}

export function fetchBrandDataStatus() {
  return requestJson<BrandDataStatus>('/brand-intel/data-status')
}

export function fetchBrandIntelList(params: {
  keyword?: string
  city?: string
  risk_level?: string
  category?: string
  scenario?: string
}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value)
  })
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return requestJson<BrandIntelItem[]>(`/brand-intel/brands${suffix}`)
}

export function fetchRegionIntel(city?: string) {
  const suffix = city ? `?city=${encodeURIComponent(city)}` : ''
  return requestJson<RegionIntel>(`/brand-intel/region${suffix}`)
}

export function fetchBrandAIAnalysis(payload: BrandAnalysisRequest) {
  return requestJson<BrandAIAnalysis>('/brand-intel/ai/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchBrandReport(brandId: string, city?: string) {
  const suffix = city ? `?city=${encodeURIComponent(city)}` : ''
  return requestText(`/brand-intel/reports/${brandId}.md${suffix}`)
}
