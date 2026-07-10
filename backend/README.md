# 后端说明

后端使用 FastAPI 实现，负责品牌数据管理、CSV 数据导入、指标评分、DeepSeek 智能摘要和报告生成。

## 本阶段目标

Day 1 只建立后端骨架和依赖清单。Day 2 开始实现可运行服务，先完成健康检查、配置读取和数据库连接。

## 计划接口

```text
GET    /health
GET    /api/brands
POST   /api/brands
GET    /api/brands/{brand_id}
PUT    /api/brands/{brand_id}
DELETE /api/brands/{brand_id}
POST   /api/import/brands
GET    /api/analysis/scores
POST   /api/ai/brand-summary
POST   /api/reports/generate
```

## 启动方式

后续安装依赖后，在项目根目录执行：

```powershell
.\.venv\Scripts\Activate.ps1
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
