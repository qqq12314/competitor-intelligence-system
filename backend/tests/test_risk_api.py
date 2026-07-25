def test_risk_config_endpoint(client) -> None:
    response = client.get("/api/risk/config")
    assert response.status_code == 200
    payload = response.json()
    assert payload["version"] == "1.0.0"
    assert len(payload["dimensions"]) == 7
    assert sum(payload["dimensions"].values()) == 1.0


def test_all_database_merchants_score_successfully(client) -> None:
    response = client.get("/api/risk")
    assert response.status_code == 200
    assessments = response.json()
    assert len(assessments) == 20
    assert all(len(item["dimension_scores"]) == 7 for item in assessments)
    assert all(0 <= item["total_score"] <= 100 for item in assessments)
    assert all("�" not in item["risk_level"] for item in assessments)


def test_single_merchant_and_missing_merchant(client) -> None:
    response = client.get("/api/risk/M001")
    assert response.status_code == 200
    assert response.json()["merchant_id"] == "M001"
    assert client.get("/api/risk/UNKNOWN").status_code == 404
