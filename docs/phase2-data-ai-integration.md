# 第二阶段数据与 AI 分析接入说明

## 当前完成内容

本阶段在已有首页和 FastAPI 基础接口之上，补齐了“TS 爬虫数据 -> 后端统计 -> 风控解释 -> 前端展示”的最小闭环。

已完成模块：

- TS 爬虫聚合样例数据接入：`data/spider/brand_stats.csv`、`city_stats.csv`、`news_samples.csv`
- SQLite 新增表：`spider_brand_stats`、`spider_city_stats`、`spider_news_samples`
- 后端新增统计接口：`/api/spider/overview`、`/api/spider/brands`、`/api/spider/cities`、`/api/spider/news`
- 后端新增商户外部环境接口：`/api/spider/market-context/{merchant_id}`
- 后端新增 AI 风控解释接口：`/api/ai/risk-explanation/{merchant_id}`
- 前端新增 TS 市场环境展示区、AI 可解释风控区、数据接入进度展示

## DeepSeek 省 token 策略

系统不把原始爬虫 CSV 直接发送给 DeepSeek。后端先用 SQLite 和规则函数完成数据聚合，只把压缩后的 JSON 摘要传给模型。

当前 AI 接口逻辑：

1. 后端读取商户画像、风控评分和 TS 聚合市场环境。
2. 如果没有配置 `DEEPSEEK_API_KEY`，使用本地规则生成解释，保证演示稳定。
3. 如果配置了 `DEEPSEEK_API_KEY`，只发送商户摘要 JSON、评分结果和市场环境摘要。
4. DeepSeek 返回结构化 JSON，用于前端展示风险解释、授信建议、经营建议和补充资料清单。

## 后续 TS 需要补充的数据

现有 TS 数据适合做外部经营环境评估，但还不能直接替代真实授信数据。后续建议补充：

- `merchant_credit_sample.csv`：商户月流水、月订单量、客单价、复购率、房租、人工、原料成本、负债、贷款金额、贷款期限
- `contract_sample.csv`：租赁合同、加盟合同、采购合同文本，以及租金、剩余租期、违约责任、续租条款
- `store_clean.csv`：完整门店 POI 清洗表，可用于更细粒度的城市/区县竞争密度
- `news.csv`：完整品牌新闻表，可用于舆情筛选和品牌风险摘要

## 前后端联调重点

前端优先调用后端真实接口，失败时使用本地 mock 兜底，保证汇报页面不空白。

重点接口：

| 接口 | 作用 |
| --- | --- |
| `GET /api/dashboard/summary` | 首页基础统计 |
| `GET /api/risk` | 商户风险评分列表 |
| `GET /api/merchants/search` | 按关键词、地区、风险等级、品类检索商户 |
| `GET /api/spider/overview` | TS 爬虫数据总览 |
| `GET /api/spider/market-context/{merchant_id}` | 单个商户外部市场环境 |
| `GET /api/spider/region-risk/{city}` | 地区茶饮咖啡商户风控概览 |
| `GET /api/ai/risk-explanation/{merchant_id}` | AI/规则生成风控解释 |
| `GET /api/reports/{merchant_id}.md` | Markdown 风控报告预览 |

## 前端交互更新

为更贴近真实风控用户需求，首页已从纯展示页调整为轻量工作台：

- 支持搜索商户、品牌、城市和商圈关键词。
- 支持按地区、风险等级、茶饮/咖啡品类筛选商户样本。
- 新增地区风控概览，展示城市公开门店样本、市场热度、竞争等级和地区授信提示。
- DeepSeek 分析改为手动点击触发，切换商户时不自动调用模型，减少 token 消耗。
- 页面布局拆成地区、市场、商户、AI、报告等连续横向模块，减少左右栏内容高度不一致带来的大面积空白。

## 运行方式

后端：

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

前端：

```powershell
cd frontend
cmd /c npm run dev
```

浏览器访问：

- 前端页面：`http://127.0.0.1:5173`
- 后端接口文档：`http://127.0.0.1:8000/docs`

## 汇报口径

当前阶段已完成茶饮咖啡小微商户风控系统的前后端基础联调，并接入 TS 提供的公开经营环境数据。系统先通过后端规则模型计算风险评分，再结合 DeepSeek 或本地规则生成可解释风控建议，前端以金融风控看板形式展示商户画像、市场环境、风险因子、授信建议和后续资料补充清单。
