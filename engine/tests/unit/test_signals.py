from datetime import UTC, datetime, timedelta

from edge_lab.config import get_instrument
from edge_lab.models import OHLCVBar, SyntheticOrderFlowBar
from edge_lab.signals import absorption, delta_divergence, poc_sweep
from edge_lab.signals.base import build_detection_context
from edge_lab.signals.registry import detect_all

SPEC = get_instrument("MES")
TICK = SPEC.tick_size


def _session_bars(day: int, n: int, base: float) -> list[OHLCVBar]:
    bars = []
    for i in range(n):
        bars.append(
            OHLCVBar(
                symbol="MES",
                timeframe="5m",
                timestamp=datetime(2026, 3, day, 14, 30, tzinfo=UTC) + timedelta(minutes=5 * i),
                open=base,
                high=base + 1.0,
                low=base - 1.0,
                close=base,
                volume=200,
                session="RTH",
                bar_index=0,  # overwritten by caller
            )
        )
    return bars


def _flat_bars(day: int, n: int, price: float, volume: float = 200) -> list[OHLCVBar]:
    """No-wick bars trading at a single price -- used to build a
    deterministic POC (all volume lands in one bucket) and a quiet baseline
    session that never crosses it on its own.
    """
    bars = []
    for i in range(n):
        bars.append(
            OHLCVBar(
                symbol="MES",
                timeframe="5m",
                timestamp=datetime(2026, 3, day, 14, 30, tzinfo=UTC) + timedelta(minutes=5 * i),
                open=price,
                high=price,
                low=price,
                close=price,
                volume=volume,
                session="RTH",
                bar_index=0,
            )
        )
    return bars


def _of_bar(bar_index: int, bid: float, ask: float, cumulative_delta: float) -> SyntheticOrderFlowBar:
    return SyntheticOrderFlowBar(
        symbol="MES",
        timeframe="5m",
        bar_index=bar_index,
        bid_volume=bid,
        ask_volume=ask,
        delta=ask - bid,
        cumulative_delta=cumulative_delta,
        aggressive_buy_volume=ask * 0.6,
        aggressive_sell_volume=bid * 0.6,
        imbalance_ratio=ask / max(bid, 1e-9),
    )


def _reindex(bars: list[OHLCVBar]) -> list[OHLCVBar]:
    return [b.model_copy(update={"bar_index": i}) for i, b in enumerate(bars)]


def test_poc_sweep_fires_on_pierce_and_reclaim_with_elevated_volume() -> None:
    session1 = _flat_bars(day=2, n=10, price=5100.0)  # single price -> POC == 5100.0 exactly
    session2 = _flat_bars(day=3, n=10, price=5100.5)  # trades above POC, never crosses it on its own
    # Bar 4 pierces below the prior session's POC and closes back above it, on elevated volume.
    session2[4] = session2[4].model_copy(update={"low": 5099.5, "close": 5100.5, "volume": 900})
    bars = _reindex(session1 + session2)

    orderflow = [_of_bar(i, bid=100, ask=100, cumulative_delta=0) for i in range(len(bars))]
    context = build_detection_context(bars, orderflow, SPEC)
    conditions = poc_sweep.detect(bars, orderflow, context)

    assert len(conditions) == 1
    assert conditions[0].bar_index == 14  # session2[4] -> global index 10+4
    assert conditions[0].direction == "bullish"
    assert conditions[0].evidence["swept_level"] == 5100.0


def test_poc_sweep_does_not_fire_without_elevated_volume() -> None:
    session1 = _flat_bars(day=2, n=10, price=5100.0)
    session2 = _flat_bars(day=3, n=10, price=5100.5)
    # Pierces and reclaims, but volume is normal -> should not fire.
    session2[4] = session2[4].model_copy(update={"low": 5099.5, "close": 5100.5, "volume": 210})
    bars = _reindex(session1 + session2)
    orderflow = [_of_bar(i, bid=100, ask=100, cumulative_delta=0) for i in range(len(bars))]
    context = build_detection_context(bars, orderflow, SPEC)
    conditions = poc_sweep.detect(bars, orderflow, context)
    assert conditions == []


def test_poc_sweep_requires_reclaim_not_just_a_pierce() -> None:
    session1 = _flat_bars(day=2, n=10, price=5100.0)
    session2 = _flat_bars(day=3, n=10, price=5100.5)
    # Pierces below POC on high volume, but closes below it too -> no reclaim, should not fire.
    # Bar is entirely at/below POC (open/high included) so it can't accidentally satisfy the
    # bearish pierce-from-above condition either.
    session2[4] = session2[4].model_copy(
        update={"open": 5099.8, "high": 5099.9, "low": 5099.0, "close": 5099.8, "volume": 900}
    )
    bars = _reindex(session1 + session2)
    orderflow = [_of_bar(i, bid=100, ask=100, cumulative_delta=0) for i in range(len(bars))]
    context = build_detection_context(bars, orderflow, SPEC)
    conditions = poc_sweep.detect(bars, orderflow, context)
    assert conditions == []


def test_poc_sweep_bearish_direction() -> None:
    session1 = _flat_bars(day=2, n=10, price=5100.0)
    session2 = _flat_bars(day=3, n=10, price=5099.5)  # trades below POC
    # Bar 4 pierces above POC and closes back below it, on elevated volume.
    session2[4] = session2[4].model_copy(update={"high": 5100.5, "close": 5099.5, "volume": 900})
    bars = _reindex(session1 + session2)
    orderflow = [_of_bar(i, bid=100, ask=100, cumulative_delta=0) for i in range(len(bars))]
    context = build_detection_context(bars, orderflow, SPEC)
    conditions = poc_sweep.detect(bars, orderflow, context)
    assert len(conditions) == 1
    assert conditions[0].direction == "bearish"
    assert conditions[0].evidence["swept_level"] == 5100.0


def test_poc_sweep_fires_only_once_per_session() -> None:
    session1 = _flat_bars(day=2, n=10, price=5100.0)
    session2 = _flat_bars(day=3, n=10, price=5100.5)
    session2[3] = session2[3].model_copy(update={"low": 5099.5, "close": 5100.5, "volume": 900})
    session2[6] = session2[6].model_copy(update={"low": 5099.0, "close": 5100.5, "volume": 900})
    bars = _reindex(session1 + session2)
    orderflow = [_of_bar(i, bid=100, ask=100, cumulative_delta=0) for i in range(len(bars))]
    context = build_detection_context(bars, orderflow, SPEC)
    conditions = poc_sweep.detect(bars, orderflow, context)
    assert len(conditions) == 1
    assert conditions[0].bar_index == 13


def test_absorption_fires_on_high_volume_low_progress_skewed_flow() -> None:
    bars = _reindex(_session_bars(day=2, n=12, base=5100.0))
    # Make one bar's range tight (little "result") but its volume huge ("effort").
    bars[6] = bars[6].model_copy(
        update={"open": 5100.0, "close": 5100.0, "high": 5100.25, "low": 5099.75, "volume": 900}
    )
    orderflow = [_of_bar(i, bid=100, ask=100, cumulative_delta=0) for i in range(len(bars))]
    # Heavy aggressive selling (bid-heavy) absorbed without the price falling.
    orderflow[6] = _of_bar(6, bid=650, ask=250, cumulative_delta=-300)
    context = build_detection_context(bars, orderflow, SPEC)
    conditions = absorption.detect(bars, orderflow, context)
    assert len(conditions) == 1
    assert conditions[0].bar_index == 6
    assert conditions[0].direction == "bullish"  # selling absorbed -> expect reversal up


def test_absorption_does_not_fire_on_ordinary_trending_bar() -> None:
    bars = _reindex(_session_bars(day=2, n=12, base=5100.0))
    bars[6] = bars[6].model_copy(
        update={"open": 5100.0, "close": 5102.0, "high": 5102.25, "low": 5099.75, "volume": 250}
    )
    orderflow = [_of_bar(i, bid=100, ask=100, cumulative_delta=0) for i in range(len(bars))]
    orderflow[6] = _of_bar(6, bid=90, ask=160, cumulative_delta=70)
    context = build_detection_context(bars, orderflow, SPEC)
    conditions = absorption.detect(bars, orderflow, context)
    assert conditions == []


def test_delta_divergence_detector_wraps_the_feature_correctly() -> None:
    bars = _reindex(_session_bars(day=2, n=6, base=5100.0))
    bars[5] = bars[5].model_copy(update={"high": 5103.0, "close": 5102.0})
    orderflow = [
        _of_bar(0, 40, 60, 20),
        _of_bar(1, 45, 55, 30),
        _of_bar(2, 55, 45, 20),
        _of_bar(3, 50, 50, 20),
        _of_bar(4, 55, 45, 10),
        _of_bar(5, 70, 30, -30),  # new high on bar 5, but cumulative delta falls
    ]
    context = build_detection_context(bars, orderflow, SPEC, divergence_lookback=3)
    conditions = delta_divergence.detect(bars, orderflow, context)
    assert any(c.bar_index == 5 and c.direction == "bearish" for c in conditions)


def test_registry_detect_all_merges_and_sorts_by_bar_index() -> None:
    session1 = _flat_bars(day=2, n=10, price=5100.0)
    session2 = _flat_bars(day=3, n=10, price=5100.5)
    session2[4] = session2[4].model_copy(update={"low": 5099.5, "close": 5100.5, "volume": 900})
    bars = _reindex(session1 + session2)
    orderflow = [_of_bar(i, bid=100, ask=100, cumulative_delta=0) for i in range(len(bars))]
    context = build_detection_context(bars, orderflow, SPEC)
    conditions = detect_all(bars, orderflow, context)
    assert [c.bar_index for c in conditions] == sorted(c.bar_index for c in conditions)
    assert any(c.signal_type == "poc_sweep" for c in conditions)
