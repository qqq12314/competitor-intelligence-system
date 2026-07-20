import type {
  AIRiskExplanation,
  BrandProfile,
  DashboardSummary,
  MerchantMarketContext,
  MerchantProfile,
  RiskAssessment,
  SpiderOverview,
} from './api/client'

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

export const MOCK_SPIDER_OVERVIEW: SpiderOverview = {
  brand_count: 10,
  city_count: 10,
  store_count: 24986,
  news_count: 290,
  top_brands: [
    {
      brand_name: '蜜雪冰城',
      store_count: 4719,
      news_count: 31,
      sample_risk_score: 63.4,
      risk_level: '中风险',
      primary_signal: '门店规模大且加盟密度高，适合观察区域竞争和价格带压力',
    },
    {
      brand_name: '瑞幸咖啡',
      store_count: 4434,
      news_count: 42,
      sample_risk_score: 58.8,
      risk_level: '中低风险',
      primary_signal: '品牌数字化能力强，但核心城市咖啡竞争密度高',
    },
    {
      brand_name: '库迪咖啡',
      store_count: 4422,
      news_count: 38,
      sample_risk_score: 66.2,
      risk_level: '中风险',
      primary_signal: '扩张速度快，需关注促销依赖与单店稳定性',
    },
  ],
  top_cities: [
    {
      city: '杭州市',
      store_count: 2890,
      market_heat: '高活跃',
      competition_level: '高竞争',
      top_brands: ['瑞幸咖啡', '库迪咖啡', '星巴克'],
    },
    {
      city: '上海市',
      store_count: 2743,
      market_heat: '高活跃',
      competition_level: '高竞争',
      top_brands: ['星巴克', '瑞幸咖啡', '霸王茶姬'],
    },
    {
      city: '广州市',
      store_count: 2718,
      market_heat: '高活跃',
      competition_level: '高竞争',
      top_brands: ['蜜雪冰城', '茶百道', '喜茶'],
    },
  ],
  missing_credit_fields: ['近6个月营业流水', '月订单量与客单价明细', '会员复购率', '房租、人工、原料成本', '现有负债与贷款申请金额', '合同原文'],
  data_stage_note: '当前 TS 数据用于外部经营环境评估；真实授信仍需补充商户流水、成本、负债和合同原文。',
}

export const MOCK_MARKET_CONTEXT: MerchantMarketContext = {
  merchant_id: 'M-1004',
  merchant_name: '北屿茶语·中央商场店',
  city: '杭州市',
  brand_name: '北屿茶语',
  city_store_count: 2890,
  city_market_heat: '高活跃',
  city_competition_level: '高竞争',
  city_top_brands: ['瑞幸咖啡', '库迪咖啡', '星巴克'],
  brand_store_count: null,
  brand_news_count: null,
  brand_sample_risk_score: null,
  brand_risk_level: null,
  external_risk_signals: [
    '杭州市门店样本数约2890，市场热度为高活跃。',
    '城市竞争水平：高竞争，主要品牌包括瑞幸咖啡、库迪咖啡、星巴克。',
    '当前 TS 聚合数据暂未匹配该品牌，前期按独立/区域品牌审慎处理。',
  ],
  usage_note: '该市场环境只作为外部辅助指标，不直接替代商户真实信贷资料和人工审批。',
}

export const MOCK_AI_EXPLANATION: AIRiskExplanation = {
  source: 'local_rules',
  summary: '该商户综合风险处于中等区间。结合 TS 公开经营环境数据，当前判断重点应放在现金流真实性、区域竞争压力和合同稳定性。',
  risk_points: ['区域同类门店密度较高，存在客流分流压力。', '租金占比偏高，现金流安全垫需要复核。', '合同条款存在潜在经营约束。'],
  credit_suggestion: '建议审慎授信，控制额度并设置月度经营数据回访。',
  business_suggestions: ['补充近6个月流水和平台订单截图。', '结合商圈竞品密度调整授信额度。', '将租赁合同剩余期限纳入贷前复核。'],
  follow_up_data: ['近6个月收款流水', '平台订单与复购数据', '租赁合同及剩余租期', '现有负债和贷款用途'],
  token_saving_note: '本结果未发送原始 CSV，仅使用后端聚合后的商户画像、评分结果和市场环境摘要。',
}
