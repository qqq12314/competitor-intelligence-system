# Day 2 SQLite 数据层说明

## 已完成内容

- 使用 SQLAlchemy 2 建立 SQLite 数据库引擎和会话工厂。
- 建立 `brands`、`merchants`、`contracts`、`public_opinions` 四张表。
- 将 12 个品牌、20 个商户、5 份合同和 4 条舆情从 CSV 导入数据库。
- Seed 支持幂等初始化：数据库已有数据时不会重复插入。
- Seed 支持 `force=True` 清空样例表后重新导入。
- 品牌、商户、评分、报告、看板接口已切换为数据库查询。
- FastAPI 启动时自动建表并在空数据库中导入样例数据。

## 数据库文件

开发环境默认生成：

```text
backend/tea_coffee_risk.db
```

数据库文件已通过 `.gitignore` 忽略，不提交到 GitHub；其他开发者首次启动后端时会自动创建。

## 手动初始化

在 `backend` 目录执行：

```powershell
.\.venv\Scripts\python.exe -m app.db.seed
```

该命令会重建样例数据并输出：

```text
Database initialized: {'brands': 12, 'merchants': 20, 'contracts': 5, 'public_opinions': 4}
```

## 代码位置

- `app/db/base.py`：SQLAlchemy Declarative Base。
- `app/db/session.py`：Engine、SessionLocal 和 FastAPI 数据库依赖。
- `app/db/models.py`：四张 ORM 表。
- `app/db/seed.py`：建表、CSV 导入、幂等 seed 和强制重置。
- `app/repositories/risk_repository.py`：品牌和商户数据库查询及 Pydantic 映射。

## 下一步

Day 3 将把七维评分权重和阈值从 Python 逻辑中抽离为可配置结构，增加边界测试，并确保低、中、高风险样例覆盖充分。
