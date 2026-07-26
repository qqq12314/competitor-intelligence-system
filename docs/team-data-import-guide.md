# 队友数据安全导入指南

## 1. 已实现的能力

项目提供 `backend/scripts/import_team_data.py`，可以读取队友的 `data.zip`，也可以读取已经解压的六张原始 CSV。脚本不会调用原来的 `force=True` 全量删除逻辑，而是按业务键进行合并更新。

处理流程：

```text
ZIP 或 raw CSV 目录
  -> 文件完整性与 ZIP 路径安全检查
  -> 品牌 ID/中文名标准化
  -> 中文情感标签标准化
  -> 城市名和“200+”门店数清洗
  -> 生成 processed 标准 CSV
  -> SQLite 自动备份
  -> SQLAlchemy 合并写入
  -> 重复新闻跳过
  -> dry-run 与 apply 两类 JSON 审计报告
```

## 2. 预览，不修改数据库

从项目中已经归档的原始数据预览：

```powershell
cd backend
.\.venv\Scripts\python.exe -m scripts.import_team_data ..\data\raw\team_data_20260726 --batch-id 2026-07-26
```

直接预览 ZIP：

```powershell
.\.venv\Scripts\python.exe -m scripts.import_team_data "C:\path\to\data.zip" --batch-id 2026-07-26
```

默认是 dry run，不修改数据库。

## 3. 生成 raw 和 processed 文件

```powershell
.\.venv\Scripts\python.exe -m scripts.import_team_data "C:\path\to\data.zip" --batch-id 2026-07-26 --write-files
```

输出：

```text
data/raw/team_data_20260726/
data/processed/team_data_20260726/
```

## 4. 合并写入数据库

先查看 dry-run 报告，确认无错误后执行：

```powershell
.\.venv\Scripts\python.exe -m scripts.import_team_data ..\data\raw\team_data_20260726 --batch-id 2026-07-26 --apply-db
```

`--apply-db` 会自动执行以下操作：

1. 如果使用 SQLite，备份数据库到 `data/backups/`。
2. 新品牌执行插入，已有品牌执行更新。
3. 政策、行情、城市和竞争记录按业务键合并。
4. 相同品牌、标题和发布日期的新闻直接跳过。
5. 任一数据库步骤发生异常时回滚整个事务。

报告文件分别保存为：

- `import_report_dry_run.json`：预览或只生成文件的结果。
- `import_report_apply.json`：真实数据库合并结果，包括备份路径和插入/更新/跳过统计。

## 5. 本批数据转换结果

| 输出 | 记录数 |
| --- | ---: |
| 品牌基础信息 | 13 |
| 加盟政策 | 9 |
| 新闻舆情 | 13 |
| 行情快照 | 9 |
| 标准化财务数据 | 7 |
| 城市门店样本 | 50 |
| 地区竞争样本 | 50 |
| 来源登记 | 6 |

原始品牌数据有 14 条，但 `auntea_jenny` 和 `shanghai_auntie` 都指向“沪上阿姨”，标准化后合并为一个品牌，因此输出 13 条品牌记录。

## 6. 数据使用原则

- 财务和股票信息不参与当前加盟风险规则评分。
- 城市风险表的“投资建议”只作为第三方辅助信号。
- `200+` 按下限 200 入库，原始值保存在备注中。
- 中文“正面/中性/负面”转换为 `positive/neutral/negative`。
- 来源为网站首页或第三方平台时，必须继续核验具体原文。
- 没有杭州品牌级门店数据时仍返回 `insufficient_data`，不使用其他城市替代。

## 7. 验证

```powershell
$env:DEEPSEEK_API_KEY=''
.\.venv\Scripts\python.exe -m pytest -q
```

还可以启动后端后检查：

```text
GET /api/brand-intel/brands/mixue
GET /api/brand-intel/region?city=北京
POST /api/franchise-agent/analyze
```
