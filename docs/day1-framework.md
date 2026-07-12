# Day 1 项目框架说明

## 1. Day 1 目标

第一天的目标是完成“能继续开发”的项目基础框架，而不是一次性完成全部业务功能。框架需要让后续 6 天可以按模块推进，并能在答辩时清楚说明系统从数据到评分、AI 分析、看板和报告的技术路线。

## 2. 已建立目录

```text
backend/
  app/
    api/routes/
    core/
    models/
    services/
data/
  sample/
  dictionary/
docs/
frontend/
  src/
skills/
  deepseek_risk_analyst/
```

## 3. 后端框架

后端使用 FastAPI。Day 1 先建立服务入口和接口边界，后续逐步补数据库、真实 AI 调用和测试。

当前后端模块：

- `backend/app/main.py`：FastAPI 应用入口。
- `backend/app/core/config.py`：应用配置。
- `backend/app/api/routes/brands.py`：品牌接口。
- `backend/app/api/routes/merchants.py`：商户接口。
- `backend/app/api/routes/risk.py`：评分接口。
- `backend/app/api/routes/contracts.py`：合同审查接口。
- `backend/app/api/routes/reports.py`：报告生成接口。
- `backend/app/api/routes/dashboard.py`：看板汇总接口。

Day 1 技术取舍：

- 使用 CSV 作为临时数据源，降低第一天复杂度。
- 使用 Pydantic 定义领域模型，保证接口数据结构清晰。
- 使用规则函数实现初版评分，后续可迁移为配置化评分模型。

## 4. 数据框架

Day 1 建立以下样例数据：

- `data/sample/brands.csv`：品牌样本。
- `data/sample/merchants.csv`：商户经营样例。
- `data/sample/contracts.csv`：合同样例。
- `data/sample/public_opinion.csv`：舆情样例。
- `data/dictionary/risk_indicator_dictionary.csv`：风控指标字典。

数据层后续演进：

1. Day 2 将 CSV 导入 SQLite。
2. Day 3-4 接口优先从 SQLite 查询。
3. Day 6 报告生成引用数据库记录和评分结果。

## 5. 风控评分框架

Day 1 已预留七维评分结构：

| 维度 | 作用 |
| --- | --- |
| 经营能力 | 判断门店持续经营能力 |
| 财务压力 | 判断租金、人工、采购和负债压力 |
| 品牌稳定性 | 判断品牌依附和加盟体系风险 |
| 行业竞争 | 判断周边竞品密度和价格战风险 |
| 合同风险 | 判断合同条款对经营的约束 |
| 舆情预警 | 支持贷后监控 |
| 渠道履约 | 通过外卖评分近似判断履约能力 |

后续需要跟进：

- 将权重写入配置文件。
- 增加评分解释字段。
- 增加测试样例，验证不同风险等级。

## 6. AI 分析框架

Day 1 建立 `skills/deepseek_risk_analyst/SKILL.md`，明确 DeepSeek 分析的输入、输出和约束。

AI 输出要求：

- 商户经营画像。
- 品牌风险摘要。
- 合同风险解释。
- 授信建议。
- 贷后关注事项。
- 证据字段。
- 数据局限说明。

后续需要跟进：

- 使用 LangChain PromptTemplate 封装 Prompt。
- 通过 DeepSeek API 生成结构化 JSON。
- 对 JSON 输出做 Pydantic 校验。

## 7. 前端框架

前端使用 Vue 3 + Element Plus + ECharts。Day 1 建立基础页面和组件目录。

当前页面规划：

- 顶部指标卡：品牌数、商户数、合同风险数、舆情风险数。
- 高风险商户列表。
- 七维风险雷达图。
- 风险等级分布。

后续需要跟进：

- Day 5 接入真实后端接口。
- 增加品牌价格带对比图。
- 增加合同风险类型统计。
- 增加舆情预警时间线。

## 8. Day 1 验收

Day 1 验收标准：

- 仓库目录清楚，后续开发位置明确。
- 后端代码可以通过 Python 编译检查。
- 样例数据字段符合选题报告。
- README 能说明项目定位和启动方式。
- 文档中有一周开发计划和具体策划案。

