import type { BrandProfile, DashboardSummary, MerchantProfile, RiskAssessment } from './api/client'

export const MOCK_SUMMARY: DashboardSummary = {
  brand_count: 6,
  merchant_count: 24,
  risk_distribution: {
    低风险: 9,
    中低风险: 7,
    中风险: 5,
    高风险: 3,
  },
  contract_risk_count: 6,
  opinion_risk_count: 4,
  high_risk_merchants: [
    {
      merchant_id: 'M-1004',
      merchant_name: '北岸茶语·中央商场店',
      score: 63.42,
      level: '中风险',
    },
    {
      merchant_id: 'M-1009',
      merchant_name: '栖屿咖啡·青年路店',
      score: 71.08,
      level: '中低风险',
    },
  ],
}

export const MOCK_MERCHANTS: MerchantProfile[] = [
  {
    merchant_id: 'M-1004',
    merchant_name: '北岸茶语·中央商场店',
    brand_name: '北岸茶语',
    city: '杭州',
    district: '拱墅区',
    business_area_type: '商场餐饮',
    opening_months: 22,
    average_ticket: 28,
    takeaway_rating: 4.5,
    monthly_revenue: 182000,
    rent_ratio: 0.19,
    labor_cost_ratio: 0.21,
    purchase_cost_ratio: 0.34,
    debt_ratio: 0.27,
    competitor_density: 6,
    negative_review_keywords: ['出杯慢', '排队长', '高峰波动'],
    franchise_type: '成熟加盟',
    has_contract_risk: true,
    recent_public_opinion_risk: false,
  },
  {
    merchant_id: 'M-1009',
    merchant_name: '栖屿咖啡·青年路店',
    brand_name: '栖屿咖啡',
    city: '杭州',
    district: '西湖区',
    business_area_type: '社区街边',
    opening_months: 15,
    average_ticket: 35,
    takeaway_rating: 4.7,
    monthly_revenue: 146000,
    rent_ratio: 0.16,
    labor_cost_ratio: 0.18,
    purchase_cost_ratio: 0.31,
    debt_ratio: 0.22,
    competitor_density: 4,
    negative_review_keywords: ['新品转化一般'],
    franchise_type: '区域加盟',
    has_contract_risk: false,
    recent_public_opinion_risk: false,
  },
  {
    merchant_id: 'M-1016',
    merchant_name: '糖澜奶茶·商圈旗舰店',
    brand_name: '糖澜奶茶',
    city: '宁波',
    district: '鄞州区',
    business_area_type: '商圈核心',
    opening_months: 9,
    average_ticket: 24,
    takeaway_rating: 4.2,
    monthly_revenue: 98000,
    rent_ratio: 0.24,
    labor_cost_ratio: 0.20,
    purchase_cost_ratio: 0.35,
    debt_ratio: 0.33,
    competitor_density: 9,
    negative_review_keywords: ['促销依赖', '客流波动', '门店拥挤'],
    franchise_type: '新开加盟',
    has_contract_risk: true,
    recent_public_opinion_risk: true,
  },
  {
    merchant_id: 'M-1021',
    merchant_name: '焙野 Espresso Bar',
    brand_name: '焙野咖啡',
    city: '绍兴',
    district: '越城区',
    business_area_type: '写字楼商圈',
    opening_months: 31,
    average_ticket: 31,
    takeaway_rating: 4.8,
    monthly_revenue: 216000,
    rent_ratio: 0.15,
    labor_cost_ratio: 0.17,
    purchase_cost_ratio: 0.29,
    debt_ratio: 0.19,
    competitor_density: 3,
    negative_review_keywords: ['外卖峰值高'],
    franchise_type: '成熟加盟',
    has_contract_risk: false,
    recent_public_opinion_risk: false,
  },
]

export const MOCK_BRANDS: BrandProfile[] = [
  {
    brand_id: 'B-01',
    brand_name: '北岸茶语',
    category: '现代奶茶',
    price_band: '20-30 元',
    store_scale: '100+',
    franchise_maturity: 4,
    public_sentiment: '稳定',
    risk_tags: ['高峰拥堵', '加盟成熟', '合同条款需核查'],
  },
  {
    brand_id: 'B-02',
    brand_name: '栖屿咖啡',
    category: '精品咖啡',
    price_band: '25-40 元',
    store_scale: '60+',
    franchise_maturity: 4,
    public_sentiment: '偏正向',
    risk_tags: ['复购稳定', '客单较高'],
  },
  {
    brand_id: 'B-03',
    brand_name: '糖澜奶茶',
    category: '茶饮连锁',
    price_band: '15-28 元',
    store_scale: '80+',
    franchise_maturity: 3,
    public_sentiment: '波动',
    risk_tags: ['促销依赖', '舆情波动'],
  },
  {
    brand_id: 'B-04',
    brand_name: '焙野咖啡',
    category: '精品咖啡',
    price_band: '22-38 元',
    store_scale: '30+',
    franchise_maturity: 5,
    public_sentiment: '稳定',
    risk_tags: ['区域成熟', '经营稳健'],
  },
]

export const MOCK_ASSESSMENTS: RiskAssessment[] = [
  {
    merchant_id: 'M-1004',
    merchant_name: '北岸茶语·中央商场店',
    total_score: 63.42,
    risk_level: '中风险',
    dimension_scores: [
      { dimension: '经营能力', score: 68, explanation: '商场客流较稳定，但高峰期波动明显。' },
      { dimension: '财务压力', score: 55, explanation: '租金与采购成本占比偏高。' },
      { dimension: '品牌稳定性', score: 74, explanation: '品牌成熟度较好。' },
      { dimension: '行业竞争', score: 60, explanation: '周边奶茶品牌密度偏高。' },
    ],
    main_risk_factors: ['合同条款需复核', '客流峰值波动', '租金占比偏高'],
    business_strengths: ['门店成熟度较高', '外卖评分稳定'],
    credit_suggestion: '建议小额授信并设置月度回访。',
    post_loan_watchlist: ['客流波动', '合同变更', '租金上浮'],
  },
  {
    merchant_id: 'M-1009',
    merchant_name: '栖屿咖啡·青年路店',
    total_score: 71.08,
    risk_level: '中低风险',
    dimension_scores: [
      { dimension: '经营能力', score: 76, explanation: '门店稳定经营，周边客群清晰。' },
      { dimension: '财务压力', score: 70, explanation: '成本结构健康。' },
      { dimension: '品牌稳定性', score: 72, explanation: '品牌认可度较好。' },
      { dimension: '行业竞争', score: 66, explanation: '社区竞争适中。' },
    ],
    main_risk_factors: ['新品转化慢'],
    business_strengths: ['复购稳定', '客单较高', '毛利空间较好'],
    credit_suggestion: '可进入标准授信流程。',
    post_loan_watchlist: ['新品销售占比', '平台评分'],
  },
  {
    merchant_id: 'M-1016',
    merchant_name: '糖澜奶茶·商圈旗舰店',
    total_score: 54.86,
    risk_level: '高风险',
    dimension_scores: [
      { dimension: '经营能力', score: 51, explanation: '客流波动较大。' },
      { dimension: '财务压力', score: 44, explanation: '租金和债务压力偏高。' },
      { dimension: '品牌稳定性', score: 60, explanation: '品牌仍在快速扩张。' },
      { dimension: '行业竞争', score: 42, explanation: '商圈内竞争密度较高。' },
    ],
    main_risk_factors: ['高峰拥挤', '促销依赖', '舆情波动'],
    business_strengths: ['单店销售额仍可观'],
    credit_suggestion: '建议补充材料后再审慎评估。',
    post_loan_watchlist: ['舆情', '门店客流', '租金'],
  },
]

export const MOCK_REPORTS: Record<string, string> = {
  'M-1004': `# 北岸茶语·中央商场店 风险报告

- 风险等级：中风险
- 重点关注：合同条款、租金占比、客流波动

## 核心结论

该门店经营稳定，但商场场景对高峰动线和租金成本较敏感，适合小额授信并加强月度回访。

## 建议

1. 控制授信额度。
2. 继续观察合同条款与租金变动。
3. 跟踪平台评分与到店客流。
`,
  'M-1009': `# 栖屿咖啡·青年路店 风险报告

- 风险等级：中低风险
- 重点关注：新品转化率、外卖波动

## 核心结论

门店经营能力较稳，财务结构健康，可以作为标准授信样本。

## 建议

1. 保持常规授信流程。
2. 关注新品转化和复购表现。
3. 继续跟踪平台评分。
`,
  'M-1016': `# 糖澜奶茶·商圈旗舰店 风险报告

- 风险等级：高风险
- 重点关注：客流波动、促销依赖、舆情风险

## 核心结论

该门店在高竞争商圈内承压较明显，建议先补充材料并延迟授信。

## 建议

1. 补充租赁、流水与还款材料。
2. 加强合同和舆情核查。
3. 暂缓扩大授信。
`,
  'M-1021': `# 焙野 Espresso Bar 风险报告

- 风险等级：低风险
- 重点关注：外卖峰值和运营节奏

## 核心结论

该门店经营稳健，适合作为轻量化授信的正向样本。

## 建议

1. 可纳入标准授信池。
2. 保持正常贷后跟踪。
3. 关注高峰期履约稳定性。
`,
}
