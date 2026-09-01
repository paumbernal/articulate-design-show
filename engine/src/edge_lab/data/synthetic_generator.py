"""Synthetic OHLCV + order-flow data generator.

Honesty by design (see SYNTHETIC_DATA_ASSUMPTIONS.md for the full writeup):
a pure random walk cannot support a genuine test of the Liquidity Sweep +
Absorption Reversal hypothesis — the pattern would either never occur (no
usable sample) or a naive generator would make the win rate suspiciously
perfect. This module uses two layers instead:

1. A regime-switching random walk with session-aware intraday seasonality,
   producing a plausible base price path with real session highs/lows for
   later bars to reference.
2. A transparent, rate-controlled scenario injector that explicitly
   constructs the target microstructure sequence (sweep -> absorption ->
   delta divergence -> reversion) at a documented rate, with the reversion
   magnitude randomized so backtest outcomes are mixed, not scripted wins —
   plus explicit NEGATIVE CONTROLS (a sweep with no absorption that just
   continues, and an absorption-looking volume spike with no prior sweep)
   so signal detectors have real examples to discriminate against.

Nothing here is real market data. It must never be labeled as such.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from typing import Literal

import numpy as np

from edge_lab.config import InstrumentSpec, InstrumentSymbol, get_instrument
from edge_lab.data.session_calendar import session_bounds_utc, trading_days_between
from edge_lab.models import OHLCVBar, SyntheticOrderFlowBar
from edge_lab.models.enums import Direction, Timeframe

Regime = Literal["trend_up", "trend_down", "ranging", "volatile"]
SweepSide = Literal["low", "high"]
ScenarioKind = Literal["target_reversal", "negative_sweep_continuation", "negative_volume_spike"]

BARS_PER_SESSION: dict[Timeframe, int] = {"1m": 390, "5m": 78, "15m": 26, "30m": 13, "1h": 7}
DEFAULT_START_PRICE: dict[InstrumentSymbol, float] = {"MES": 5200.0, "MNQ": 21500.0}


@dataclass(frozen=True)
class RegimeParams:
    drift_ticks_mean: float
    drift_ticks_std: float
    vol_ticks_std: float
    volume_multiplier: float


REGIME_PARAMS: dict[Regime, RegimeParams] = {
    "trend_up": RegimeParams(0.35, 0.9, 3.0, 1.1),
    "trend_down": RegimeParams(-0.35, 0.9, 3.0, 1.1),
    "ranging": RegimeParams(0.0, 0.5, 1.6, 0.85),
    "volatile": RegimeParams(0.0, 1.2, 6.0, 1.5),
}

REGIME_TRANSITIONS: dict[Regime, dict[Regime, float]] = {
    "trend_up": {"trend_up": 0.55, "ranging": 0.25, "volatile": 0.10, "trend_down": 0.10},
    "trend_down": {"trend_down": 0.55, "ranging": 0.25, "volatile": 0.10, "trend_up": 0.10},
    "ranging": {"ranging": 0.50, "trend_up": 0.18, "trend_down": 0.18, "volatile": 0.14},
    "volatile": {"volatile": 0.40, "ranging": 0.30, "trend_up": 0.15, "trend_down": 0.15},
}


@dataclass(frozen=True)
class GeneratorConfig:
    symbol: InstrumentSymbol
    start_date: date
    end_date: date
    timeframe: Timeframe = "5m"
    seed: int = 42
    starting_price: float | None = None
    base_volume: float = 800.0
    injection_rate: float = 0.6
    """Expected count of positive target-scenario injections per eligible session."""
    negative_control_rate: float = 0.5
    """Rate of negative-control injections, relative to positive injections."""


@dataclass(frozen=True)
class InjectedScenario:
    kind: ScenarioKind
    session_index: int
    trigger_bar_index: int
    direction: Direction | None
    swept_level: float | None
    reverted: bool


@dataclass
class SyntheticDataset:
    bars: list[OHLCVBar] = field(default_factory=list)
    orderflow: list[SyntheticOrderFlowBar] = field(default_factory=list)
    injected_scenarios: list[InjectedScenario] = field(default_factory=list)


@dataclass
class _RawBar:
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float
    bid_volume: float
    ask_volume: float
    aggressive_buy_volume: float
    aggressive_sell_volume: float


def _next_regime(rng: np.random.Generator, current: Regime) -> Regime:
    options = REGIME_TRANSITIONS[current]
    regimes = list(options.keys())
    probs = list(options.values())
    return rng.choice(regimes, p=probs)  # type: ignore[return-value]


def _seasonality(t: float) -> float:
    """U-shaped multiplier: higher near session open/close, lower midday."""
    return 0.6 + 0.8 * (1 - np.sin(np.pi * t))


def _synthesize_bar(
    rng: np.random.Generator,
    timestamp: datetime,
    prev_close: float,
    tick_size: float,
    drift_ticks_mean: float,
    vol_ticks_std: float,
    volume: float,
    buy_pressure: float,
    aggressive_fraction: float,
    step: float | None = None,
) -> _RawBar:
    open_ = prev_close
    if step is None:
        step = rng.normal(drift_ticks_mean, max(vol_ticks_std, 1e-6)) * tick_size
    close = open_ + step
    wick_noise = rng.normal(0, max(vol_ticks_std, 1e-6) * 0.6, size=2) * tick_size
    path = [open_, open_ + wick_noise[0], open_ + wick_noise[0] + wick_noise[1], close]
    high, low = max(path), min(path)

    buy_pressure = min(max(buy_pressure, 0.05), 0.95)
    ask_volume = volume * buy_pressure
    bid_volume = volume * (1 - buy_pressure)
    aggressive_buy = ask_volume * aggressive_fraction
    aggressive_sell = bid_volume * aggressive_fraction
    return _RawBar(
        timestamp=timestamp,
        open=open_,
        high=high,
        low=low,
        close=close,
        volume=volume,
        bid_volume=bid_volume,
        ask_volume=ask_volume,
        aggressive_buy_volume=aggressive_buy,
        aggressive_sell_volume=aggressive_sell,
    )


def _generate_session_bars(
    rng: np.random.Generator,
    spec: InstrumentSpec,
    config: GeneratorConfig,
    params: RegimeParams,
    start_price: float,
    n_bars: int,
    session_open_utc: datetime,
) -> list[_RawBar]:
    bars: list[_RawBar] = []
    prev_close = start_price
    for i in range(n_bars):
        t = i / max(n_bars - 1, 1)
        season = _seasonality(t)
        volume = (
            config.base_volume
            * params.volume_multiplier
            * season
            * float(rng.lognormal(mean=0.0, sigma=0.25))
        )
        vol_ticks_std = params.vol_ticks_std * season
        step = float(rng.normal(params.drift_ticks_mean, max(vol_ticks_std, 1e-6))) * spec.tick_size
        # Order flow tracks the realized price step (with noise) rather than
        # being drawn independently — otherwise price and delta are
        # uncorrelated even outside injected scenarios, and delta-divergence
        # detection becomes meaningless (fires on ~chance-level noise).
        normalized_step = step / (max(vol_ticks_std, 1e-6) * spec.tick_size)
        buy_pressure = 0.5 + 0.32 * float(np.tanh(normalized_step)) + float(rng.normal(0, 0.05))
        aggressive_fraction = float(rng.uniform(0.45, 0.65))
        timestamp = session_open_utc + timedelta(minutes=i * _TIMEFRAME_MINUTES[config.timeframe])
        bar = _synthesize_bar(
            rng,
            timestamp,
            prev_close,
            spec.tick_size,
            params.drift_ticks_mean,
            vol_ticks_std,
            volume,
            buy_pressure,
            aggressive_fraction,
            step=step,
        )
        bars.append(bar)
        prev_close = bar.close
    return bars


_TIMEFRAME_MINUTES: dict[Timeframe, int] = {"1m": 1, "5m": 5, "15m": 15, "30m": 30, "1h": 60}


def _local_avg_volume(bars: list[_RawBar], idx: int, lookback: int = 10) -> float:
    window = bars[max(0, idx - lookback) : idx] or bars[: max(idx, 1)]
    return float(np.mean([b.volume for b in window])) if window else 500.0


def _inject_target_reversal(
    rng: np.random.Generator,
    bars: list[_RawBar],
    tick_size: float,
    idx: int,
    level: float,
    sweep_side: SweepSide,
) -> InjectedScenario | None:
    k = int(rng.integers(1, 4))  # absorption bars
    m = int(rng.integers(3, 8))  # reversion bars
    if idx < 1 or idx + k + m >= len(bars):
        return None

    sign = -1 if sweep_side == "low" else 1
    reversal_sign = -sign
    direction: Direction = "bullish" if sweep_side == "low" else "bearish"

    piercing_ticks = float(rng.integers(1, 4))
    pierce_price = level + sign * piercing_ticks * tick_size
    local_vol = _local_avg_volume(bars, idx)

    # --- sweep bar ---
    reclaim_ticks = float(rng.uniform(0.3, 1.5)) * piercing_ticks
    prev_close = bars[idx - 1].close
    close = pierce_price - sign * reclaim_ticks * tick_size
    volume = local_vol * float(rng.uniform(2.2, 4.0))
    buy_pressure = 0.15 if sweep_side == "low" else 0.85
    aggressive_fraction = float(rng.uniform(0.65, 0.85))
    high = max(prev_close, close, pierce_price if sweep_side == "high" else prev_close)
    low = min(prev_close, close, pierce_price if sweep_side == "low" else prev_close)
    ask_volume = volume * buy_pressure
    bid_volume = volume * (1 - buy_pressure)
    bars[idx] = _RawBar(
        timestamp=bars[idx].timestamp,
        open=prev_close,
        high=high,
        low=low,
        close=close,
        volume=volume,
        bid_volume=bid_volume,
        ask_volume=ask_volume,
        aggressive_buy_volume=ask_volume * aggressive_fraction,
        aggressive_sell_volume=bid_volume * aggressive_fraction,
    )

    # --- absorption bars: elevated one-sided volume, price contained ---
    for j in range(idx + 1, idx + 1 + k):
        prev_close = bars[j - 1].close
        drift = float(rng.normal(0, 0.5)) * tick_size
        close = prev_close + drift
        volume = local_vol * float(rng.uniform(1.4, 2.5))
        buy_pressure = 0.22 if sweep_side == "low" else 0.78
        aggressive_fraction = float(rng.uniform(0.6, 0.8))
        ask_volume = volume * buy_pressure
        bid_volume = volume * (1 - buy_pressure)
        wick = float(rng.uniform(0, 0.8)) * tick_size
        bars[j] = _RawBar(
            timestamp=bars[j].timestamp,
            open=prev_close,
            high=max(prev_close, close) + wick,
            low=min(prev_close, close) - wick,
            close=close,
            volume=volume,
            bid_volume=bid_volume,
            ask_volume=ask_volume,
            aggressive_buy_volume=ask_volume * aggressive_fraction,
            aggressive_sell_volume=bid_volume * aggressive_fraction,
        )

    # --- reversion bars: randomized magnitude, so outcomes are mixed ---
    # Bounded to a realistic few-point total move over the window (NOT
    # scaled by piercing_ticks, which is tiny by construction — a sweep is
    # only 1-3 ticks beyond the level) so a single bar can't run away into
    # an unrealistic double-digit-point move. Sometimes this barely clears
    # the level (a "loss" in the backtest), sometimes it's a clean
    # multi-point reversal (a "win") — that's the intentional mix.
    target_reversion_ticks = float(rng.uniform(0, 20))
    per_bar_drift = reversal_sign * (target_reversion_ticks / m)
    drift_std = max(abs(per_bar_drift) * 0.35, 1.0)
    for j in range(idx + 1 + k, idx + 1 + k + m):
        prev_close = bars[j - 1].close
        volume = local_vol * float(rng.uniform(0.9, 1.6))
        buy_pressure = 0.65 if reversal_sign > 0 else 0.35
        buy_pressure += float(rng.uniform(-0.05, 0.05))
        aggressive_fraction = float(rng.uniform(0.5, 0.7))
        drift = float(rng.normal(per_bar_drift, drift_std))
        close = prev_close + drift * tick_size
        wick = float(rng.uniform(0, 1.0)) * tick_size
        ask_volume = volume * min(max(buy_pressure, 0.05), 0.95)
        bid_volume = volume - ask_volume
        bars[j] = _RawBar(
            timestamp=bars[j].timestamp,
            open=prev_close,
            high=max(prev_close, close) + wick,
            low=min(prev_close, close) - wick,
            close=close,
            volume=volume,
            bid_volume=bid_volume,
            ask_volume=ask_volume,
            aggressive_buy_volume=ask_volume * aggressive_fraction,
            aggressive_sell_volume=bid_volume * aggressive_fraction,
        )

    final_close = bars[idx + k + m].close
    reverted = final_close > level if sweep_side == "low" else final_close < level

    return InjectedScenario(
        kind="target_reversal",
        session_index=-1,
        trigger_bar_index=idx,
        direction=direction,
        swept_level=level,
        reverted=reverted,
    )


def _inject_negative_sweep_continuation(
    rng: np.random.Generator,
    bars: list[_RawBar],
    tick_size: float,
    idx: int,
    level: float,
    sweep_side: SweepSide,
) -> InjectedScenario | None:
    """A real sweep with NO absorption: volume stays one-sided and price
    keeps extending — a genuine continuation the setup must not fire on.
    """
    m = int(rng.integers(3, 8))
    if idx < 1 or idx + m >= len(bars):
        return None

    sign = -1 if sweep_side == "low" else 1
    direction: Direction = "bullish" if sweep_side == "low" else "bearish"
    piercing_ticks = float(rng.integers(1, 4))
    pierce_price = level + sign * piercing_ticks * tick_size
    local_vol = _local_avg_volume(bars, idx)

    prev_close = bars[idx - 1].close
    close = pierce_price  # no reclaim at all — closes at/through the extreme
    volume = local_vol * float(rng.uniform(2.0, 3.5))
    buy_pressure = 0.15 if sweep_side == "low" else 0.85
    aggressive_fraction = float(rng.uniform(0.6, 0.8))
    ask_volume = volume * buy_pressure
    bid_volume = volume * (1 - buy_pressure)
    bars[idx] = _RawBar(
        timestamp=bars[idx].timestamp,
        open=prev_close,
        high=max(prev_close, close),
        low=min(prev_close, close),
        close=close,
        volume=volume,
        bid_volume=bid_volume,
        ask_volume=ask_volume,
        aggressive_buy_volume=ask_volume * aggressive_fraction,
        aggressive_sell_volume=bid_volume * aggressive_fraction,
    )

    # continuation: price keeps moving in the SAME direction as the sweep
    per_bar_drift = sign * float(rng.uniform(0.6, 1.4))
    for j in range(idx + 1, idx + 1 + m):
        prev_close = bars[j - 1].close
        volume = local_vol * float(rng.uniform(1.0, 1.8))
        buy_pressure = 0.2 if sweep_side == "low" else 0.8
        aggressive_fraction = float(rng.uniform(0.55, 0.75))
        drift = float(rng.normal(per_bar_drift, 0.6))
        close = prev_close + drift * tick_size
        wick = float(rng.uniform(0, 0.8)) * tick_size
        ask_volume = volume * min(max(buy_pressure, 0.05), 0.95)
        bid_volume = volume - ask_volume
        bars[j] = _RawBar(
            timestamp=bars[j].timestamp,
            open=prev_close,
            high=max(prev_close, close) + wick,
            low=min(prev_close, close) - wick,
            close=close,
            volume=volume,
            bid_volume=bid_volume,
            ask_volume=ask_volume,
            aggressive_buy_volume=ask_volume * aggressive_fraction,
            aggressive_sell_volume=bid_volume * aggressive_fraction,
        )

    return InjectedScenario(
        kind="negative_sweep_continuation",
        session_index=-1,
        trigger_bar_index=idx,
        direction=direction,
        swept_level=level,
        reverted=False,
    )


def _inject_negative_volume_spike(
    rng: np.random.Generator, bars: list[_RawBar], tick_size: float, idx: int
) -> InjectedScenario | None:
    """An elevated-volume, one-sided-delta bar with NO nearby swept level —
    noise that must not satisfy the liquidity-sweep required rule.
    """
    if idx < 1 or idx >= len(bars):
        return None
    prev_close = bars[idx - 1].close
    local_vol = _local_avg_volume(bars, idx)
    volume = local_vol * float(rng.uniform(2.0, 3.5))
    buy_pressure = float(rng.choice([0.2, 0.8]))
    aggressive_fraction = float(rng.uniform(0.6, 0.8))
    tick_move = float(rng.uniform(-3, 3)) * tick_size
    close = prev_close + tick_move
    ask_volume = volume * buy_pressure
    bid_volume = volume - ask_volume
    bars[idx] = _RawBar(
        timestamp=bars[idx].timestamp,
        open=prev_close,
        high=max(prev_close, close) + abs(tick_move) * 0.5,
        low=min(prev_close, close) - abs(tick_move) * 0.5,
        close=close,
        volume=volume,
        bid_volume=bid_volume,
        ask_volume=ask_volume,
        aggressive_buy_volume=ask_volume * aggressive_fraction,
        aggressive_sell_volume=bid_volume * aggressive_fraction,
    )
    return InjectedScenario(
        kind="negative_volume_spike",
        session_index=-1,
        trigger_bar_index=idx,
        direction=None,
        swept_level=None,
        reverted=False,
    )


def _maybe_inject_scenarios(
    rng: np.random.Generator,
    session_bars: list[_RawBar],
    config: GeneratorConfig,
    spec: InstrumentSpec,
    session_index: int,
    prev_session_high: float | None,
    prev_session_low: float | None,
) -> list[InjectedScenario]:
    n = len(session_bars)
    lo, hi = int(n * 0.15), int(n * 0.75)
    scenarios: list[InjectedScenario] = []

    if prev_session_high is not None and prev_session_low is not None and hi > lo:
        n_positive = int(rng.random() < config.injection_rate) + int(
            rng.random() < config.injection_rate * 0.3
        )
        for _ in range(n_positive):
            idx = int(rng.integers(lo, hi))
            sweep_side: SweepSide = rng.choice(["low", "high"])  # type: ignore[assignment]
            level = prev_session_low if sweep_side == "low" else prev_session_high
            result = _inject_target_reversal(rng, session_bars, spec.tick_size, idx, level, sweep_side)
            if result is not None:
                scenarios.append(result)

        if rng.random() < config.injection_rate * config.negative_control_rate:
            idx = int(rng.integers(lo, hi))
            sweep_side = rng.choice(["low", "high"])  # type: ignore[assignment]
            level = prev_session_low if sweep_side == "low" else prev_session_high
            result = _inject_negative_sweep_continuation(
                rng, session_bars, spec.tick_size, idx, level, sweep_side
            )
            if result is not None:
                scenarios.append(result)

    if rng.random() < config.injection_rate * config.negative_control_rate:
        idx = int(rng.integers(max(1, n // 4), max(2, (3 * n) // 4)))
        result = _inject_negative_volume_spike(rng, session_bars, spec.tick_size, idx)
        if result is not None:
            scenarios.append(result)

    return [
        InjectedScenario(
            kind=s.kind,
            session_index=session_index,
            trigger_bar_index=s.trigger_bar_index,
            direction=s.direction,
            swept_level=s.swept_level,
            reverted=s.reverted,
        )
        for s in scenarios
    ]


def generate_dataset(config: GeneratorConfig) -> SyntheticDataset:
    spec = get_instrument(config.symbol)
    rng = np.random.default_rng(config.seed)
    days = trading_days_between(config.start_date, config.end_date)
    if not days:
        return SyntheticDataset()

    n_per_session = BARS_PER_SESSION[config.timeframe]
    price = config.starting_price or DEFAULT_START_PRICE[config.symbol]
    regime: Regime = "ranging"
    prev_session_high: float | None = None
    prev_session_low: float | None = None

    all_bars: list[OHLCVBar] = []
    all_of: list[SyntheticOrderFlowBar] = []
    all_scenarios: list[InjectedScenario] = []
    bar_index = 0

    for session_idx, day in enumerate(days):
        regime = _next_regime(rng, regime)
        params = REGIME_PARAMS[regime]
        session_open_utc, _ = session_bounds_utc(day, spec)

        session_bars = _generate_session_bars(
            rng, spec, config, params, price, n_per_session, session_open_utc
        )
        scenarios = _maybe_inject_scenarios(
            rng, session_bars, config, spec, session_idx, prev_session_high, prev_session_low
        )
        all_scenarios.extend(scenarios)

        session_high = max(b.high for b in session_bars)
        session_low = min(b.low for b in session_bars)
        cumulative_delta = 0.0
        for i, rb in enumerate(session_bars):
            delta = rb.ask_volume - rb.bid_volume
            cumulative_delta += delta
            all_bars.append(
                OHLCVBar(
                    symbol=config.symbol,
                    timeframe=config.timeframe,
                    timestamp=rb.timestamp,
                    open=rb.open,
                    high=rb.high,
                    low=rb.low,
                    close=rb.close,
                    volume=rb.volume,
                    session="RTH",
                    bar_index=bar_index + i,
                )
            )
            all_of.append(
                SyntheticOrderFlowBar(
                    symbol=config.symbol,
                    timeframe=config.timeframe,
                    bar_index=bar_index + i,
                    bid_volume=rb.bid_volume,
                    ask_volume=rb.ask_volume,
                    delta=delta,
                    cumulative_delta=cumulative_delta,
                    aggressive_buy_volume=rb.aggressive_buy_volume,
                    aggressive_sell_volume=rb.aggressive_sell_volume,
                    imbalance_ratio=rb.ask_volume / max(rb.bid_volume, 1e-6),
                )
            )
        bar_index += n_per_session
        prev_session_high, prev_session_low = session_high, session_low
        price = session_bars[-1].close

    return SyntheticDataset(bars=all_bars, orderflow=all_of, injected_scenarios=all_scenarios)
