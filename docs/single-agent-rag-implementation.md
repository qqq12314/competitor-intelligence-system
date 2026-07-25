# 单 Agent + RAG 整合实施说明

## 1. 目标

系统只保留“茶饮咖啡加盟风险”作为用户主线。一个 `Franchise Risk Agent` 负责理解问题、选择工具、汇总事实；Chroma RAG 作为 `search_franchise_knowledge` 工具提供原文证据，不独立扮演 Agent。

## 2. 后端模块

- `app/agents/franchise_agent.py`：唯一 Agent 的编排入口，接入 DeepSeek、六个工具和回调。
- `app/tools/franchise_tools.py`：六个 Pydantic 入参的 StructuredTool，统一返回 `status/data/sources/evidence/missing_fields/error`。
- `app/rag/`：Markdown 解析、分块、本地向量、Chroma 持久化与检索。
- `app/chains/franchise_analysis.py`：确定性结果 + Pydantic 结构化输出链。
- `app/chains/report.py`：结构化分析转 Markdown 的 LCEL 链。
- `app/api/routes/knowledge.py`：知识状态、检索和重建接口。
- `app/api/routes/franchise_agent.py`：框架、工具和分析接口。

## 3. 风险计算

规则引擎固定计算五个维度：

| 维度 | 权重 |
| --- | ---: |
| 品牌与政策 | 25% |
| 地区竞争 | 25% |
| 成本与回本 | 20% |
| 舆情与经营 | 15% |
| 数据完整性 | 15% |

总分越高代表加盟风险越高。DeepSeek 可改写摘要、风险说明和尽调表达，但结构化链会恢复规则引擎给出的总分、等级、五维分数、证据和缺失项，避免 LLM 自行改分。

## 4. 数据不足策略

- 指定城市不存在时，`get_region_intel` 抛出 `LookupError`。
- `analyze_region` 返回 `insufficient_data` 和该城市缺失项。
- 不允许回退到默认城市，也不允许使用其他城市的门店数据冒充目标城市。
- 只有目标品牌在目标城市的 `region_competition` 记录存在时，才认为品牌城市数据完整。

## 5. RAG 证据

`data/knowledge/` 每份 Markdown 首行含 JSON 元数据，入库后每个分块生成稳定的 evidence ID。API 返回标题、片段、URL、发布日期、文档类型、可信度、品牌和城市，前端可直接展示和追溯。

默认 `local-zh-hash-v1` 是低成本课程基线：用中文字符和二元组生成 384 维确定性向量，不下载模型。它满足真实 Chroma 向量检索与持久化演示，但语义召回能力不等于 BGE；后续只需替换 `app/rag/embeddings.py` 的实现即可升级。

## 6. 前端展示

新版首页包含：

- 品牌、城市和自然语言问题输入；
- 唯一 Agent、两个 Chain、知识文档/分块状态；
- 六工具清单和执行时间线；
- 总分、等级和五维评分；
- 主要风险、机会、证据卡片；
- 缺失数据、加盟前尽调问题；
- Markdown 报告。

前端不再展示股票代码、PE、市值、投资评分或股民投资场景。

## 7. 降级与测试

没有 DeepSeek Key、模型超时、结构化输出失败或 Agent 工具调用失败时，系统仍会依次执行六个本地工具，并生成确定性分析与报告。结果状态显示为 `degraded` 或 `insufficient_data`，不伪装为成功的 LLM 调用。

pytest 使用空 Key，不调用真实 DeepSeek。生产构建通过 `pnpm build` 验证 TypeScript 类型和 Vite 打包。
