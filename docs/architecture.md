# 系统架构说明

## 1. 项目定位

本项目构建面向茶饮咖啡小微商户的轻量化经营贷辅助风控原型。系统利用经营、成本、品牌、合同、舆情和渠道履约等非财务信号，生成规则评分和 DeepSeek 智能解释，为人工授信审查提供参考。

## 2. 总体架构

```text
Vue 3 + Element Plus + ECharts
                |
              REST API
                |
FastAPI + Pydantic + SQLAlchemy
      |             |              |
  七维规则评分    合同审查      DeepSeek 分析
      |             |              |
品牌/商户/合同/舆情数据     LangChain Structured Output
                |
          Markdown / Word / PDF
```

## 3. 数据层

- `data/sample/brands.csv`：品牌样本。
- `data/sample/merchants.csv`：商户经营样例。
- `data/sample/contracts.csv`：合同样例。
- `data/sample/public_opinion.csv`：品牌与门店舆情样例。
- `data/dictionary/risk_indicator_dictionary.csv`：风控指标字典。
- 当前使用 CSV 支撑演示，下一阶段迁移至 SQLite + SQLAlchemy，并保留切换 MySQL 8 的能力。

## 4. 后端模块

- `brands`：品牌查询。
- `merchants`：商户查询。
- `risk`：七维风控评分。
- `contracts`：合同风险识别。
- `reports`：Markdown 风控报告。
- `dashboard`：看板汇总。
- 后续增加数据库、DeepSeek 分析、文件上传、Word/PDF 导出和测试模块。

## 5. 七维评分

| 维度 | 权重 | 主要依据 |
| --- | ---: | --- |
| 经营能力 | 22% | 开店时长、月流水、外卖评分、差评关键词 |
| 财务压力 | 22% | 租金、人工、采购、负债占比 |
| 品牌稳定性 | 14% | 品牌梯队、加盟成熟度、品牌舆情 |
| 行业竞争 | 12% | 周边竞品密度、价格竞争压力 |
| 合同风险 | 12% | 保证金、违约责任、单方解除、付款条款 |
| 舆情预警 | 10% | 负面新闻、投诉、闭店消息 |
| 渠道履约 | 8% | 外卖评分、配送评价、出餐效率 |

基础分数由可解释规则计算。DeepSeek 负责结合证据字段生成经营画像、风险解释、授信辅助建议和贷后关注事项，不直接替代评分规则。

## 6. DeepSeek 分析约束

- 使用 `deepseek-chat` 生成常规结构化分析；复杂推理可选 `deepseek-reasoner`。
- 通过 LangChain PromptTemplate 组织输入，通过 Pydantic 校验 JSON 输出。
- 必须引用输入证据字段，数据不足时明确说明。
- 不虚构征信、司法、纳税、工商或真实银行流水。
- 不给出绝对放款结论，不替代人工审批和专业法律意见。

## 7. 前端页面

- 风控总览。
- 高风险商户列表。
- 风险等级分布。
- 七维风险雷达图。
- 商户详情和评分解释。
- 合同审查。
- 风控报告预览与导出。

## 8. 项目边界

本系统仅用于课程实践和辅助分析。正式金融业务必须结合征信、银行流水原件、纳税、工商、司法、现场尽调和人工审批；合同审查结果不替代专业法律意见。
