# API 草案

Day 1 只定义接口方向，Day 2 起逐步实现。

## 基础接口

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/health` | 服务健康检查 |

## 品牌库

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/brands` | 查询品牌列表 |
| `POST` | `/api/brands` | 新增品牌 |
| `GET` | `/api/brands/{brand_id}` | 查询品牌详情 |
| `PUT` | `/api/brands/{brand_id}` | 修改品牌 |
| `DELETE` | `/api/brands/{brand_id}` | 删除品牌 |

## 数据导入

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/api/import/brands` | 导入品牌 CSV |
| `POST` | `/api/import/products` | 导入产品和价格 CSV |
| `POST` | `/api/import/reviews` | 导入评价样本 CSV |
| `POST` | `/api/import/events` | 导入营销事件 CSV |

## 分析与报告

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/analysis/scores` | 查询七维评分 |
| `POST` | `/api/ai/brand-summary` | 生成品牌智能摘要 |
| `POST` | `/api/reports/generate` | 生成 Markdown 分析报告 |
