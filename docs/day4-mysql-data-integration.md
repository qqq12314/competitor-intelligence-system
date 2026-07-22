# 第 4 天开发推进：MySQL 数据接入预留与前后端完善

## 当日目标

本阶段在“茶饮咖啡品牌投资与加盟风险智能分析系统”的新版方向上继续推进，重点解决真实数据暂未到位时的工程衔接问题：先完成 MySQL 数据表结构、CSV 导入脚本、后端数据状态接口和前端数据接入状态展示，为 TS 后续补充真实数据预留稳定入口。

## 已完成内容

1. 后端新增品牌投资与加盟分析专用数据表，覆盖品牌基础信息、股票行情、新闻舆情、城市门店分布、加盟政策、地区竞争和数据来源登记。
2. 后端品牌分析服务改为“数据库优先、CSV 兜底”。如果 MySQL 或当前开发数据库中已有品牌分析数据，接口优先读取数据库；如果数据库为空，则继续读取 `data/collected/*.csv` 样例数据，保证页面不空白。
3. 新增数据状态接口 `GET /api/brand-intel/data-status`，用于查看每类数据在数据库和 CSV 中的行数、负责人、是否可导入以及下一步补充要求。
4. 新增 CSV 导入脚本 `backend/app/db/import_brand_intel.py`，后续 TS 将真实数据整理成当前字段格式后，可一键导入 MySQL。
5. 前端新增“第 4 天 · MySQL 数据接入预留”展示区域，显示当前数据源、数据库类型、数据库行数、CSV 样例行数和各数据集的后续补充动作。
6. `.env.example` 新增 MySQL 连接示例，`requirements.txt` 增加 `pymysql` 依赖。

## MySQL 使用方式

先在本机 MySQL 创建数据库：

```sql
CREATE DATABASE tea_coffee_brand_intel DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

然后在项目根目录创建或修改 `.env`：

```env
DATABASE_URL=mysql+pymysql://root:你的密码@127.0.0.1:3306/tea_coffee_brand_intel?charset=utf8mb4
```

安装后端依赖并启动后端，系统会自动创建表：

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

如果要把当前 CSV 样例导入数据库：

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m app.db.import_brand_intel
```

## TS 后续数据补充要求

TS 后续优先补齐以下 7 类数据，并保持字段名与 `data/collected` 目录下的 CSV 一致：

| 数据集 | 作用 | 当前处理方式 |
| --- | --- | --- |
| `brand_profile.csv` | 品牌画像、上市状态、门店规模、价格带 | 数据库优先读取，空库回退 CSV |
| `market_quote.csv` | 投资风险评分中的行情波动、市值、成交量 | 数据库优先读取，空库回退 CSV |
| `news_sentiment.csv` | 新闻舆情风险与 DeepSeek 分析摘要 | 数据库优先读取，空库回退 CSV |
| `city_store_distribution.csv` | 地区门店密度和加盟风险评分 | 数据库优先读取，空库回退 CSV |
| `franchise_policy.csv` | 加盟成本、回本周期、区域保护政策 | 数据库优先读取，空库回退 CSV |
| `region_competition.csv` | 城市竞品密度、机会点、风险点 | 数据库优先读取，空库回退 CSV |
| `source_registry.csv` | 数据来源说明和可信度登记 | 用于汇报和后续数据审查 |

## 后续任务

1. 将当前 SQLite/CSV 过渡方案切换到本机 MySQL 并完成一次真实导入测试。
2. 等 TS 提供真实数据后，替换当前 CSV 样例，再运行导入脚本写入 MySQL。
3. 继续优化投资风险指数和加盟风险指数的权重，使风险结果可以解释到具体指标。
4. 前端继续增加行情走势图、新闻舆情列表和地区竞品对比功能。
5. DeepSeek 模块接入真实 API 后，继续沿用手动触发和缓存机制，减少 token 消耗。
