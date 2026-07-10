# Day 2 任务清单

## 今日目标

让后端服务可以运行，并完成数据库连接和品牌表结构设计，为 Day 3 的品牌 CRUD 接口做准备。

## 已完成

- 安装 `backend/requirements.txt` 中的后端依赖。
- 验证 FastAPI `/health` 接口，返回状态码 200。
- 新增数据库连接模块 `backend/app/core/database.py`。
- 新增品牌 ORM 模型 `backend/app/models/brand.py`。
- 新增品牌 Pydantic 结构 `backend/app/schemas/brand.py`。
- 应用启动时自动初始化数据库表。
- 新增健康检查测试 `backend/tests/test_health.py`。

## 明日任务

- 实现品牌列表查询接口。
- 实现品牌新增接口。
- 实现品牌详情、修改和删除接口。
- 将 `data/sample/brands.csv` 的样例品牌导入数据库。
- 在 API 文档中补充品牌接口字段说明。
