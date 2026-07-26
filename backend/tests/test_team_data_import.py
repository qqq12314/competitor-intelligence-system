import zipfile

import pytest

from app.services.team_data_import import (
    ImportReport,
    REQUIRED_FILES,
    normalize_brand,
    normalize_city,
    parse_store_count,
    read_zip_csvs,
    transform,
)


def test_normalization_rules():
    assert normalize_brand("mixue_bingcheng") == ("mixue", "蜜雪冰城")
    assert normalize_brand("shanghai_auntie") == ("auntea_jenny", "沪上阿姨")
    assert normalize_city("北京市") == "北京"
    assert normalize_city("重庆市") == "重庆"
    assert parse_store_count("200+") == (200, "200+")
    assert parse_store_count("48,300") == (48300, "48,300")


def test_zip_validation_rejects_missing_files(tmp_path):
    zip_path = tmp_path / "incomplete.zip"
    with zipfile.ZipFile(zip_path, "w") as archive:
        archive.writestr("data/brand_info.csv", "brand_name\nbrand\n")
    report = ImportReport(batch_id="test", source_path=str(zip_path), dry_run=True)
    with pytest.raises(ValueError, match="缺少必要文件"):
        read_zip_csvs(zip_path, report)


def test_zip_validation_rejects_path_traversal(tmp_path):
    zip_path = tmp_path / "unsafe.zip"
    with zipfile.ZipFile(zip_path, "w") as archive:
        archive.writestr("../brand_info.csv", "brand_name\nbrand\n")
        for filename in REQUIRED_FILES - {"brand_info.csv"}:
            archive.writestr(f"data/{filename}", "placeholder\n")
    report = ImportReport(batch_id="test", source_path=str(zip_path), dry_run=True)
    with pytest.raises(ValueError, match="不安全路径"):
        read_zip_csvs(zip_path, report)


def test_realistic_rows_transform_to_project_schema():
    rows = {
        "brand_info.csv": [
            {
                "brand_name": "mixue_bingcheng",
                "category": "茶饮",
                "founded_year": "1997",
                "headquarters": "河南郑州",
                "listed_status": "已上市",
                "stock_code": "02097",
                "store_count": "48300",
                "price_range": "7-9元",
                "main_cities": "全国",
                "official_website": "mixue.com",
                "source_url": "https://example.com/brand",
                "query_date": "2026-07-24",
            }
        ],
        "franchise_policy.csv": [
            {
                "brand_name": "mixue_bingcheng",
                "franchise_available": "是",
                "franchise_fee": "7000-11000元/年",
                "deposit": "20000元",
                "renovation_fee": "6-10万元",
                "equipment_fee": "7-8万元",
                "total_investment_range": "21-25万元",
                "payback_period": "10-14个月",
                "territorial_protection": "同品牌间距≥300米",
                "data_source": "第三方",
                "source_url": "https://example.com/policy",
                "query_date": "2026-07-24",
            }
        ],
        "news_sentiment.csv": [
            {
                "brand_name": "mixue_bingcheng",
                "news_title": "食品安全样例",
                "source": "测试来源",
                "publish_time": "2026-07-14",
                "news_url": "https://example.com/news",
                "summary": "新闻摘要",
                "sentiment": "负面",
                "news_type": "食品安全",
                "keywords": "投诉",
                "risk_hint": "食品安全风险",
            }
        ],
        "stock_info.csv": [
            {
                "brand_name": "蜜雪冰城",
                "stock_code": "02097",
                "market": "HK",
                "current_price": "215.2",
                "price_change_pct": "-0.17",
                "volume": "167561",
                "market_cap": "",
                "pe_ratio": "",
                "trade_date": "2026-07-23",
                "source_url": "https://example.com/quote",
            }
        ],
        "financial_data_raw.csv": [
            {
                "brand_name": "蜜雪冰城",
                "stock_code": "02097",
                "market": "HK",
                "report_date": "2025-12-31",
                "revenue": "335.60",
                "revenue_yoy": "35.2",
                "net_profit": "58.87",
                "net_profit_yoy": "32.7",
                "gross_margin": "31.1",
                "net_margin": "17.5",
                "pe_ratio": "13.96",
                "pb_ratio": "3.39",
                "roe": "29.88",
                "analyst_rating": "增持",
                "query_date": "2026-07-26",
            }
        ],
        "投资风险评估表.csv": [
            {
                "城市": "北京市",
                "品牌": "蜜雪冰城",
                "门店数量": "200+",
                "数量风险": "高",
                "平均评分": "4.2",
                "综合风险评级": "高",
                "投资建议": "竞争压力较高",
            },
            {
                "城市": "北京市",
                "品牌": "瑞幸咖啡",
                "门店数量": "100+",
                "数量风险": "高",
                "平均评分": "4.3",
                "综合风险评级": "中高",
                "投资建议": "需要核实点位",
            },
        ],
    }
    report = ImportReport(batch_id="2026-07-26", source_path="test.zip", dry_run=True)
    output = transform(rows, report)

    assert output["brand_profile.csv"][0]["brand_id"] == "mixue"
    assert output["brand_profile.csv"][0]["brand_name"] == "蜜雪冰城"
    assert output["brand_profile.csv"][0]["main_cities"] == ""
    assert output["news_sentiment.csv"][0]["sentiment"] == "negative"
    assert output["franchise_policy.csv"][0]["is_franchise_available"] == "true"
    assert "装修费" in output["franchise_policy.csv"][0]["franchise_conditions"]
    assert output["city_store_distribution.csv"][0]["city"] == "北京"
    assert output["city_store_distribution.csv"][0]["store_count_estimate"] == 200
    assert output["region_competition.csv"][0]["competition_level"] == "high"
    assert output["financial_data_normalized.csv"][0]["brand_id"] == "mixue"
