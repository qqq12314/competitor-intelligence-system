from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.rag.ingest import ingest_knowledge
from app.rag.retriever import search_knowledge


DEMO_QUESTION = "分析蜜雪冰城在杭州的加盟风险，重点关注加盟政策、投入成本、城市门店密度、竞品、负面舆情，并给出证据、缺失数据和尽调问题。"


def test_knowledge_index_and_retrieval(monkeypatch):
    monkeypatch.setattr(settings, "deepseek_api_key", None)
    status = ingest_knowledge(force=True)
    assert status["document_count"] == 20
    assert status["chunk_count"] >= 20

    evidence = search_knowledge("蜜雪冰城官方加盟条件", brand_id="mixue", city="杭州")
    assert evidence
    assert all(item.evidence_id for item in evidence)
    assert any(item.source_url for item in evidence)


def test_single_agent_api_contract(monkeypatch):
    monkeypatch.setattr(settings, "deepseek_api_key", None)
    with TestClient(app) as client:
        status = client.get("/api/knowledge/status")
        assert status.status_code == 200
        assert status.json()["ready"] is True

        search = client.post(
            "/api/knowledge/search",
            json={"query": "加盟合同区域保护", "brand_id": "mixue", "city": "杭州"},
        )
        assert search.status_code == 200
        assert search.json()["evidence"]

        framework = client.get("/api/franchise-agent/framework")
        assert framework.status_code == 200
        assert framework.json()["agent_count"] == 1
        assert framework.json()["multi_agent"] is False
        assert framework.json()["chains"] == ["franchise_analysis_chain", "report_chain"]

        tools = client.get("/api/franchise-agent/tools")
        assert tools.status_code == 200
        assert tools.json()["count"] == 6
        assert {item["name"] for item in tools.json()["tools"]} == {
            "search_brand",
            "get_franchise_policy",
            "analyze_region",
            "get_franchise_sentiment",
            "search_franchise_knowledge",
            "calculate_franchise_risk",
        }


def test_fixed_question_returns_structured_analysis_without_city_fallback(monkeypatch):
    monkeypatch.setattr(settings, "deepseek_api_key", None)
    with TestClient(app) as client:
        response = client.post(
            "/api/franchise-agent/analyze",
            json={"question": DEMO_QUESTION, "brand_id": "mixue", "city": "杭州"},
        )
        assert response.status_code == 200
        payload = response.json()
        analysis = payload["analysis"]
        assert analysis["brand"]["brand_id"] == "mixue"
        assert analysis["city"] == "杭州"
        assert len(analysis["dimensions"]) == 5
        assert len(analysis["tool_trace"]) == 6
        assert analysis["evidence"]
        assert analysis["missing_data"]
        assert any("杭州" in item and "蜜雪冰城" in item for item in analysis["missing_data"])
        assert analysis["due_diligence_questions"]
        assert payload["markdown_report"].startswith("# ")
        assert payload["execution_mode"] == "deterministic_fallback"
        assert payload["live_tool_calling_succeeded"] is False

        unknown = client.post(
            "/api/franchise-agent/analyze",
            json={"question": "分析蜜雪冰城在拉萨的加盟风险，并列出缺失数据。", "brand_id": "mixue", "city": "拉萨"},
        )
        assert unknown.status_code == 200
        unknown_analysis = unknown.json()["analysis"]
        assert unknown_analysis["status"] == "insufficient_data"
        assert unknown_analysis["city"] == "拉萨"
        assert any("拉萨" in item for item in unknown_analysis["missing_data"])
        assert "成都" not in " ".join(unknown_analysis["missing_data"])
