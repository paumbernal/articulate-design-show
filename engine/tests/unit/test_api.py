from fastapi.testclient import TestClient

from edge_lab.api.app import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_meta_marks_data_as_synthetic() -> None:
    response = client.get("/api/meta")
    assert response.status_code == 200
    body = response.json()
    assert body["isSyntheticData"] is True
    assert "synthetic" in body["disclaimer"].lower()
    assert body["supportedSymbols"] == ["MES", "MNQ"]


def test_get_bars_returns_camel_case_bars() -> None:
    response = client.get(
        "/api/market-data/bars",
        params={"symbol": "MES", "timeframe": "5m", "start": "2026-01-05", "end": "2026-01-09"},
    )
    assert response.status_code == 200
    bars = response.json()
    assert len(bars) > 0
    assert "barIndex" in bars[0]
    assert "open" in bars[0]


def test_get_orderflow_matches_bar_count() -> None:
    params = {"symbol": "MES", "timeframe": "5m", "start": "2026-01-05", "end": "2026-01-09"}
    bars = client.get("/api/market-data/bars", params=params).json()
    orderflow = client.get("/api/market-data/orderflow", params=params).json()
    assert len(bars) == len(orderflow)
    assert "cumulativeDelta" in orderflow[0]


def test_get_conditions_returns_camel_case_signal_type() -> None:
    response = client.get(
        "/api/conditions",
        params={"symbol": "MES", "timeframe": "5m", "start": "2026-01-05", "end": "2026-04-24"},
    )
    assert response.status_code == 200
    conditions = response.json()
    assert len(conditions) > 0
    assert "signalType" in conditions[0]


def test_list_setups_returns_the_mvp_setup() -> None:
    response = client.get("/api/setups")
    assert response.status_code == 200
    setups = response.json()
    assert len(setups) == 1
    assert setups[0]["id"] == "poc-sweep-absorption-reversal"
    assert "maxScore" not in setups[0]  # derived client-side, not sent over the wire


def test_get_edge_scores_for_known_setup() -> None:
    response = client.get(
        "/api/setups/poc-sweep-absorption-reversal/edge-scores",
        params={"symbol": "MES", "timeframe": "5m", "start": "2026-01-05", "end": "2026-04-24"},
    )
    assert response.status_code == 200
    scores = response.json()
    assert len(scores) > 0
    assert "metRequiredRules" in scores[0]


def test_get_edge_scores_404_for_unknown_setup() -> None:
    response = client.get(
        "/api/setups/does-not-exist/edge-scores",
        params={"symbol": "MES", "timeframe": "5m", "start": "2026-01-05", "end": "2026-01-09"},
    )
    assert response.status_code == 404


def test_run_backtest_returns_trades_and_statistics() -> None:
    response = client.post(
        "/api/backtest",
        json={
            "symbol": "MES",
            "timeframe": "5m",
            "start": "2026-01-05",
            "end": "2026-06-26",
            "setupId": "poc-sweep-absorption-reversal",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert "trades" in body and "statistics" in body
    assert len(body["trades"]) > 0
    assert body["statistics"]["sampleSize"] == len(body["trades"])
    assert 0 <= body["statistics"]["winRate"] <= 1
    assert len(body["statistics"]["validation"]["warnings"]) > 0
