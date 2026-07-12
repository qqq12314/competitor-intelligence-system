# API 草案

## 品牌接口

- `GET /api/brands`：查询品牌样本列表。
- `GET /api/brands/{brand_id}`：查询单个品牌。

## 商户接口

- `GET /api/merchants`：查询商户样本列表。
- `GET /api/merchants/{merchant_id}`：查询单个商户画像。

## 风控评分接口

- `GET /api/risk`：查询全部商户评分。
- `GET /api/risk/{merchant_id}`：查询单个商户评分。

返回核心字段：

- `total_score`：综合风险分。
- `risk_level`：风险等级。
- `dimension_scores`：七维评分。
- `main_risk_factors`：主要风险因子。
- `business_strengths`：经营优势。
- `credit_suggestion`：授信建议。
- `post_loan_watchlist`：贷后关注事项。

## 合同审查接口

- `POST /api/contracts/review`：提交合同文本并返回风险条款。

请求样例：

```json
{
  "merchant_id": "M003",
  "contract_type": "franchise",
  "contract_text": "乙方应一次性支付加盟费和保证金。若乙方提前解除合同，保证金不予退还，并应承担违约金。"
}
```

## 报告接口

- `GET /api/reports/{merchant_id}.md`：生成 Markdown 风控分析报告。

## 看板接口

- `GET /api/dashboard/summary`：返回品牌数量、商户数量、风险分布、高风险商户列表等汇总信息。

