"""In-sample/out-of-sample splitting and statistical significance testing.

This module exists specifically to prevent the honest-research failure mode
described in the project's own README: a backtest that looks impressive
purely because of overfitting, a lucky sample, or an unrealistic evaluation.
It does not try to prove a setup works — only to quantify how much (or how
little) confidence the sample size and test statistic actually support.
"""

from __future__ import annotations

from collections.abc import Sequence

from scipy import stats

from edge_lab.models import BacktestTrade, SignificanceResult, ValidationSummary

MIN_SAMPLE_SIZE_FOR_SIGNIFICANCE = 30
MIN_OUT_OF_SAMPLE_SIZE = 30


def split_out_of_sample_index(n_bars: int, out_of_sample_fraction: float = 0.3) -> int:
    """The bar index at/after which trades are treated as out-of-sample —
    always a strictly chronological split (the last `fraction` of the
    dataset), never a random shuffle, to avoid look-ahead bias.
    """
    if not 0 < out_of_sample_fraction < 1:
        raise ValueError("out_of_sample_fraction must be between 0 and 1 (exclusive)")
    return int(n_bars * (1 - out_of_sample_fraction))


def _significance(trades: Sequence[BacktestTrade]) -> SignificanceResult:
    r_values = [t.pnl_r for t in trades]
    n = len(r_values)
    if n < 2:
        return SignificanceResult(method="one-sample two-sided t-test against zero mean R")

    t_stat, p_value = stats.ttest_1samp(r_values, popmean=0.0)
    mean_r = sum(r_values) / n
    sem = stats.sem(r_values)
    ci_low, ci_high = stats.t.interval(0.95, df=n - 1, loc=mean_r, scale=sem) if sem > 0 else (mean_r, mean_r)

    wins = sum(1 for r in r_values if r > 0)
    win_ci_low, win_ci_high = _wilson_interval(wins, n)

    return SignificanceResult(
        method="one-sample two-sided t-test against zero mean R",
        p_value=float(p_value),
        ci_low=float(ci_low),
        ci_high=float(ci_high),
        win_rate_ci_low=win_ci_low,
        win_rate_ci_high=win_ci_high,
    )


def _wilson_interval(wins: int, n: int, confidence: float = 0.95) -> tuple[float, float]:
    if n == 0:
        return (0.0, 0.0)
    z = stats.norm.ppf(1 - (1 - confidence) / 2)
    phat = wins / n
    denom = 1 + z**2 / n
    center = phat + z**2 / (2 * n)
    margin = z * ((phat * (1 - phat) / n + z**2 / (4 * n**2)) ** 0.5)
    low = (center - margin) / denom
    high = (center + margin) / denom
    return max(0.0, low), min(1.0, high)


def build_validation_summary(trades: Sequence[BacktestTrade]) -> ValidationSummary:
    in_sample = [t for t in trades if not t.is_out_of_sample]
    out_of_sample = [t for t in trades if t.is_out_of_sample]

    warnings: list[str] = [
        "This is a research backtest on synthetic data, not a live-trading simulation.",
        "Fills assume no slippage beyond the fixed cost assumption on every trade. "
        "Real fills may be worse, especially in fast markets.",
        "When a bar touches both the stop and target, the stop is conservatively assumed "
        "to fill first; the true intrabar sequence is unknowable from OHLC bars.",
        "Detected conditions and Edge Scores are retrospective pattern matches, not "
        "forecasts. A high score describes the past, not the future.",
    ]

    if len(trades) < MIN_SAMPLE_SIZE_FOR_SIGNIFICANCE:
        warnings.append(
            f"Total sample size ({len(trades)}) is below {MIN_SAMPLE_SIZE_FOR_SIGNIFICANCE}. "
            "Treat any statistic here as exploratory, not conclusive."
        )
    if len(out_of_sample) < MIN_OUT_OF_SAMPLE_SIZE:
        warnings.append(
            f"Out-of-sample count ({len(out_of_sample)}) is below {MIN_OUT_OF_SAMPLE_SIZE}. "
            "In-sample performance may not generalize; this is a primary overfitting risk."
        )
    if len(in_sample) == 0 or len(out_of_sample) == 0:
        warnings.append(
            "No true in-sample/out-of-sample comparison is possible without trades on both sides."
        )

    return ValidationSummary(
        in_sample_n=len(in_sample),
        out_of_sample_n=len(out_of_sample),
        significance=_significance(trades),
        warnings=warnings,
    )
