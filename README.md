# 茶饮咖啡加盟风险智能分析系统

本项目面向准备加盟茶饮、咖啡品牌的用户，使用一个 `Franchise Risk Agent` 分析品牌政策、投入成本、目标城市门店密度、竞品、舆情和数据完整性，并输出证据、缺失数据、尽调问题与 Markdown 报告。

当前主线仅为“加盟风险”。股票代码、PE、市值和投资评分不再作为前端功能。历史信贷风控与品牌数据接口仍保留在后端，供数据、评分和报告能力复用。

## 核心架构

```text
用户问题
  -> POST /api/franchise-agent/analyze
  -> 唯一的 Franchise Risk Agent（DeepSeek + LangChain）
     -> 6 个工具（结构化数据、RAG、规则评分）
  -> franchise_analysis_chain（Pydantic 结构化输出）
  -> report_chain（Markdown 报告）
  -> 风险分数 + 证据 + 缺失数据 + 尽调问题 + 工具轨迹
```

RAG 是 Agent 调用的一个工具，不是第二个 Agent。城市数据不存在时，系统返回 `insufficient_data`，不会用其他城市的数据替代。

六个工具：

1. `search_brand`
2. `get_franchise_policy`
3. `analyze_region`
4. `get_franchise_sentiment`
5. `search_franchise_knowledge`
6. `calculate_franchise_risk`

五个风险维度：品牌与政策 25%、地区竞争 25%、成本与回本 20%、舆情与经营 15%、数据完整性 15%。规则引擎计算分数，LLM 只能负责解释，不能篡改规则分数。

## 技术栈

- 前端：React、TypeScript、Vite、Tailwind CSS、Lucide React
- 后端：FastAPI、Pydantic、SQLAlchemy、SQLite/MySQL
- Agent：LangChain `create_agent`、DeepSeek OpenAI 兼容接口、Callbacks
- RAG：Chroma 持久化向量库、Markdown 分块、证据 ID
- Chain：LCEL、Pydantic structured output、Markdown report chain
- 测试：pytest、FastAPI TestClient、TypeScript/Vite production build

知识库当前包含 `data/knowledge/` 下 20 份 Markdown 课程演示资料。默认使用本地中文字符/二元组哈希向量，便于离线演示且不产生 Embedding API 费用；生产环境可替换为 BGE 等中文 Embedding 模型。

## 环境配置

复制根目录 `.env.example` 的配置到 `backend/.env`，填写 DeepSeek Key：

```env
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=你的密钥
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
EMBEDDING_MODEL=local-zh-hash-v1
CHROMA_PERSIST_DIRECTORY=../data/chroma
RAG_TOP_K=5
```

`backend/.env` 已被 Git 忽略，不要把真实密钥提交到仓库。

## 启动项目

后端（PowerShell）：

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

首次启动会自动创建数据库并构建 Chroma 知识索引。

前端（另开一个 PowerShell）：

```powershell
cd frontend
pnpm install
pnpm dev
```

访问地址：

- 前端：http://127.0.0.1:5173
- API：http://127.0.0.1:8000
- Swagger：http://127.0.0.1:8000/docs
- 健康检查：http://127.0.0.1:8000/health

固定演示问题：

> 分析蜜雪冰城在杭州的加盟风险，重点关注加盟政策、投入成本、城市门店密度、竞品、负面舆情，并给出证据、缺失数据和尽调问题。

## 新增 API

| 方法 | 接口 | 说明 |
| --- | --- | --- |
| GET | `/api/knowledge/status` | 查看 Chroma 文档数、分块数与索引状态 |
| POST | `/api/knowledge/search` | 检索带证据 ID 和来源的知识片段 |
| POST | `/api/knowledge/reindex` | 强制重建知识索引 |
| GET | `/api/franchise-agent/framework` | 查看单 Agent、模型、Chain 和 RAG 状态 |
| GET | `/api/franchise-agent/tools` | 查看六个 LangChain 工具及参数 Schema |
| POST | `/api/franchise-agent/analyze` | 运行完整加盟风险 Agent 工作流 |

## 验证

```powershell
cd backend
$env:DEEPSEEK_API_KEY=''
.\.venv\Scripts\python.exe -m pytest -q

cd ..\frontend
pnpm build
```

测试时清空 DeepSeek Key，确保不会产生真实 API 费用，并验证本地确定性降级链路。当前自动化覆盖知识索引、RAG 检索、单 Agent 数量、六工具契约、固定问题、五维评分、工具轨迹和禁止城市回退。

## 数据免责声明

当前知识库和 CSV 中的费用、门店、政策与舆情数据主要用于课程演示，部分来源为第三方或示例 URL，不能视为实时官方事实。正式加盟决策前必须向品牌官方、商务主管部门、拟选址物业和现有加盟商交叉核验。

详细实施说明见 [docs/single-agent-rag-implementation.md](docs/single-agent-rag-implementation.md)。

队友提供的品牌、政策、舆情、城市、行情和财务 CSV 已接入安全导入流程。使用方法见 [docs/team-data-import-guide.md](docs/team-data-import-guide.md)。
