# 茶饮咖啡品牌投资与加盟风险智能分析系统

本项目基于最新汇报方向，已由“茶饮咖啡小微商户信贷风控”调整为“茶饮咖啡品牌投资与加盟风险智能分析”。系统主要面向两类用户：

1. 股民与普通投资者：查看茶饮咖啡品牌或关联股票的行情风险、新闻舆情、品牌扩张和投资关注点。
2. 加盟意向用户：选择城市和品牌，分析当地加盟风险、门店密度、竞争品牌、市场热度和后续需要调查的数据。

系统输出用于课程项目演示和辅助分析，不构成确定性投资建议、买卖建议或加盟承诺。

## 当前版本完成内容

- 前端首页已切换为品牌投资与加盟风险方向，保留深海军蓝、浅金色、冰川蓝灰和雪山主视觉风格。
- 新增品牌搜索、地区筛选、品类筛选、风险等级筛选和使用场景筛选。
- 新增投资风险指数、加盟风险指数、地区加盟环境、品牌样本卡和 Markdown 报告预览。
- DeepSeek 分析改为手动点击触发，避免切换品牌时自动消耗 token。
- 后端新增 `/api/brand-intel/*` 接口，旧信贷风控接口保留为 legacy，方便后续复用数据导入和评分代码。
- 当前使用后端样例数据跑通主流程，后续等待 TS 补充真实行情、新闻、门店和加盟政策数据。

## 核心业务流程

```text
品牌 / 行情 / 新闻 / 门店 / 加盟政策数据
  -> 数据清洗与字段标准化
  -> 品牌投资风险评分 + 地区加盟风险评分
  -> 前端搜索筛选与地区分析
  -> 用户手动触发 DeepSeek 智能解释
  -> Markdown / Word / PDF 分析报告
```

## 新版接口

| 接口 | 说明 |
| --- | --- |
| `GET /api/brand-intel/summary` | 获取品牌数量、上市关联数量、城市数量、新闻样本和风险分布 |
| `GET /api/brand-intel/brands` | 获取品牌样本列表，支持 `keyword`、`city`、`category`、`risk_level`、`scenario` 筛选 |
| `GET /api/brand-intel/brands/{brand_id}` | 获取单个品牌画像 |
| `GET /api/brand-intel/region?city=杭州` | 获取地区加盟环境与竞品分析 |
| `POST /api/brand-intel/ai/analyze` | 手动触发 AI 分析，输入品牌、城市和分析场景 |
| `GET /api/brand-intel/reports/{brand_id}.md` | 获取 Markdown 分析报告 |

## 技术栈

- 前端：React、TypeScript、Vite、Tailwind CSS、Lucide React、Framer Motion
- 后端：FastAPI、Pydantic、SQLite、SQLAlchemy
- AI：DeepSeek API，后续预留 LangChain / RAG / Agent 工具链
- 数据：前期样例数据，后续导入 TS 整理的 CSV / JSON

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
cmd /c npm install
cmd /c npm run dev
```

访问地址：

- 前端：`http://127.0.0.1:5173`
- API：`http://127.0.0.1:8000`
- Swagger：`http://127.0.0.1:8000/docs`
- 健康检查：`http://127.0.0.1:8000/health`

## 后续需要 TS 补充的数据

| 数据类型 | 字段示例 | 用途 |
| --- | --- | --- |
| 行情数据 | 股票代码、价格、涨跌幅、成交量、市值、更新时间 | 投资风险评分 |
| 新闻舆情 | 标题、来源、发布时间、情感倾向、关键词 | 舆情风险解释 |
| 门店分布 | 城市、品牌、门店数、商圈密度、增长趋势 | 地区加盟风险 |
| 加盟政策 | 加盟费、保证金、装修费、投资区间、回本周期 | 加盟成本评估 |
| 地区竞争 | 城市、竞品品牌、竞品门店数、市场热度 | 区域竞争分析 |

## Token 控制方案

系统默认只使用规则评分和后端摘要展示结果。DeepSeek 分析必须由用户手动点击触发，后端只传品牌摘要、地区摘要和评分结果，不传大规模原始 CSV。后续可增加缓存机制，同一品牌、同一城市、同一天的分析结果优先读取缓存。
