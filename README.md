# 茶饮咖啡小微商户轻量化信贷风控与智能经营分析系统

本项目基于最新选题报告，将原“茶饮咖啡竞品分析”升级为面向中小金融机构的小微商户信贷风控与经营分析原型系统。系统聚焦茶饮、咖啡、茶咖融合门店，通过品牌信息、门店经营数据、合同条款、财务压力和舆情信号，生成可解释的风险评分、合同风险提示、授信建议和经营分析报告。

当前仓库按“一周完成可演示原型”的节奏组织。第 1 天已完成简单项目框架、样例数据、基础接口骨架、前端看板骨架和项目策划案，后续按日补齐数据库、评分、合同审查、AI 分析、前端联调和答辩材料。

## 项目定位

- **业务方向**：智慧金融、数据分析、大模型应用、小微企业信贷风控。
- **服务对象**：中小银行、村镇银行、消费金融公司、担保公司、小额贷款机构。
- **研究对象**：茶饮咖啡加盟门店、单店咖啡馆、区域连锁饮品店、申请小额经营贷款的个体工商户。
- **核心能力**：轻量化风险评分、合同风险识别、DeepSeek 智能解释、经营画像、授信建议报告、可视化看板。

## 一周计划

完整计划见 [docs/development-plan.md](docs/development-plan.md)。

| 天数 | 目标 | 交付物 |
| --- | --- | --- |
| Day 1 | 搭建项目框架，明确技术路线和数据标准 | FastAPI/Vue 目录骨架、样例 CSV、策划案 |
| Day 2 | 完善数据层和 SQLite 初始化 | 数据库模型、初始化脚本、样例数据入库 |
| Day 3 | 完成轻量化风控评分 | 七维评分模型、评分接口、测试样例 |
| Day 4 | 完成合同审查和 DeepSeek Prompt | 合同风险识别、AI 分析模板 |
| Day 5 | 完成前端可视化看板 | 风险分布、高风险列表、七维雷达图 |
| Day 6 | 完成报告生成与前后端联调 | Markdown 报告、接口联调、演示样例 |
| Day 7 | 完成演示和答辩材料 | 操作说明、演示脚本、结项总结 |

## 项目结构

```text
backend/
  app/
    api/routes/          FastAPI 路由
    core/                配置与基础能力
    models/              Pydantic 数据模型
    services/            风控评分、合同审查、报告生成等业务服务
data/
  sample/                品牌、商户、合同和舆情样例数据
  dictionary/            风控指标字段字典
docs/                    计划、架构、接口和策划案
frontend/
  src/                   Vue 3 看板原型
skills/
  deepseek_risk_analyst/ DeepSeek 风控分析 Skill Prompt
```

## 技术架构

```text
CSV sample data
  -> FastAPI + Pydantic
  -> rule scoring / contract review / report generator
  -> DeepSeek + LangChain analysis layer
  -> Vue 3 + Element Plus + ECharts dashboard
  -> Markdown report
```

## Day 1 已完成

- 建立后端 FastAPI 基础入口和路由结构。
- 建立品牌、商户、合同、风控评分的 Pydantic 模型。
- 建立样例品牌库、商户库、合同库、舆情库和指标字典。
- 建立规则评分、合同审查、报告生成服务的初版代码。
- 建立 Vue 3 看板原型目录和基础页面。
- 建立 DeepSeek 风控分析 Skill Prompt。
- 完成一周开发计划和项目具体策划案。

Day 1 框架说明见 [docs/day1-framework.md](docs/day1-framework.md)，项目具体策划案见 [docs/project-plan.md](docs/project-plan.md)。

## 后端启动

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

访问：

- API 首页：`http://127.0.0.1:8000`
- Swagger 文档：`http://127.0.0.1:8000/docs`

## 前端启动

```powershell
cd frontend
pnpm install
pnpm dev
```

## 关键文档

- [一周开发计划](docs/development-plan.md)
- [Day 1 项目框架说明](docs/day1-framework.md)
- [项目具体策划案](docs/project-plan.md)
- [系统架构说明](docs/architecture.md)
- [API 草案](docs/api-draft.md)

