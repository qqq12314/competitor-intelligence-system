# 基于 DeepSeek Skill 与 LangChain 的茶饮咖啡小微商户轻量化信贷风控与智能经营分析系统

本项目面向中小银行、村镇银行、消费金融公司、担保公司和小额贷款机构，以茶饮咖啡门店为典型小微经营主体，通过品牌信息、门店经营数据、成本压力、合同条款和舆情信号，生成可解释的七维风险评分、合同风险提示、DeepSeek 智能分析、授信辅助建议和贷后关注事项。

系统用于课程项目演示和辅助分析，不直接替代征信核验、银行流水审查、现场尽调、人工审批或专业法律意见。

## 核心业务流程

```text
品牌与商户数据
  -> 数据清洗和字段标准化
  -> 七维轻量化风控评分
  -> 合同风险识别
  -> DeepSeek 风险解释
  -> 前端风控看板
  -> Markdown / Word / PDF 风控报告
```

## 核心功能

- 品牌信息库：品牌品类、价格带、门店规模、加盟成熟度、舆情与风险标签。
- 商户经营档案：开店时长、客单价、月流水、外卖评分、成本比例、负债比例和竞品密度。
- 七维风控评分：经营能力、财务压力、品牌稳定性、行业竞争、合同风险、舆情预警、渠道履约。
- 合同智能审查：识别违约责任、保证金、加盟费用、采购付款、单方解除和争议解决等风险条款。
- DeepSeek 智能分析：生成经营画像、品牌风险摘要、合同风险解释、授信辅助建议和贷后预警。
- 风控看板：指标卡、高风险商户、风险等级分布和七维雷达图。
- 报告生成：生成标准化小微商户信贷风控分析报告。

## 技术栈

- 前端：Vue 3、Vite、Element Plus、ECharts、Axios。
- 后端：FastAPI、Pydantic v2、SQLAlchemy 2。
- 数据库：开发期 SQLite，后续兼容 MySQL 8。
- 大模型：DeepSeek API。
- LLM 工程：LangChain PromptTemplate、Structured Output。
- 测试：pytest、httpx。
- 部署：Docker Compose、Nginx。

## 项目结构

```text
backend/
  app/
    api/routes/          品牌、商户、评分、合同、报告、看板接口
    core/                配置与基础能力
    models/              Pydantic 领域模型
    services/            评分、合同审查、报告生成服务
data/
  sample/                品牌、商户、合同、舆情样例数据
  dictionary/            风控指标字典
docs/                    计划、架构、API 和项目策划案
frontend/
  src/                   Vue 3 风控看板
skills/
  deepseek_risk_analyst/ DeepSeek 风控分析 Skill
```

## 快速启动

后端：

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

如果尚未创建虚拟环境：

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

前端：

```powershell
cd frontend
pnpm install
pnpm dev
```

访问地址：

- 前端：`http://127.0.0.1:5173`
- API：`http://127.0.0.1:8000`
- Swagger：`http://127.0.0.1:8000/docs`
- 健康检查：`http://127.0.0.1:8000/health`

## 当前状态

当前仓库已具备 FastAPI/Vue 工程骨架、SQLite + SQLAlchemy 数据层、四类样例数据自动入库、七维评分、合同规则审查、Markdown 报告和风控看板。下一阶段重点是评分权重配置化、DeepSeek 结构化分析、自动化测试和报告导出。

Day 2 数据库说明见 [docs/day2-database.md](docs/day2-database.md)。
