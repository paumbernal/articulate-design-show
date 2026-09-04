# Pau Martínez Bernal — Portfolio

Personal portfolio site (React + Vite + TypeScript + Tailwind + shadcn/ui). Two projects are documented in detail below: **Monte Carlo VaR Simulation** and **OrderFlow Edge Lab**.

```bash
npm install
npm run dev      # http://localhost:8080
```

---

# Monte Carlo VaR Simulation

*A quantitative risk-analysis dashboard for a rules-based futures trading strategy: Monte Carlo simulation of a trade-return distribution, Value-at-Risk, Expected Shortfall, drawdown analysis, and risk of ruin. This is not a trading recommendation, and it's not a record of live performance.*

Live in this portfolio at `/monte-carlo-var-simulation`. Source: [`src/features/futures-risk-lab/`](src/features/futures-risk-lab/), a pure TypeScript quantitative engine (`lib/`) with no UI dependencies, driving a React dashboard (`components/`).

## Project Overview

The pipeline: **trading strategy assumptions → trade-return distribution → Monte Carlo simulation → simulated equity curves → distribution of terminal account values → maximum drawdown analysis → Value-at-Risk → Expected Shortfall → risk-of-ruin analysis → interactive risk dashboard.**

The default assumptions model an MNQ (Micro E-mini Nasdaq-100) day-trading strategy: 59% win rate, +1.2R average winner, -1R average loser, $200 risked per trade (about +$60.40 theoretical expectancy per trade). Every one of those numbers, along with starting balance, trade count, simulation count, VaR confidence, drawdown thresholds, ruin definition, and account target, is a live input in the dashboard, with sensible defaults and validated ranges.

The dashboard operates in two modes:

- **Synthetic mode** (default): trades are drawn from a parametric distribution built around the assumptions above.
- **Historical/Empirical mode**: upload a CSV of real trades (`date,pnl,r_multiple`, plus optional instrument/price/size/fee/time columns). The app computes actual win rate, average win/loss, expectancy, profit factor, and historical drawdown, then bootstrap-resamples the Monte Carlo simulation directly from that empirical R-multiple distribution instead of the parametric one.

## Architecture

```
src/features/futures-risk-lab/
  types.ts                 Shared types: SimulationConfig, SimulationResult, EmpiricalTradeRecord, ...
  lib/                      The quantitative engine. No React imports, and independently unit-tested.
    rng.ts                  Seeded PRNG (mulberry32) + Gaussian (Marsaglia polar) + Gamma (Marsaglia-Tsang)
    tradeDistribution.ts     Synthetic per-trade R-multiple sampler (see Methodology below)
    monteCarlo.ts            The simulation loop: N paths x M trades produce terminal balance, max
                              drawdown, and min/max balance per path, plus a bounded sample of full
                              equity curves
    riskMetrics.ts            Percentiles, VaR, CVaR, drawdown-threshold probabilities, risk of ruin,
                              and target probabilities: pure functions over already-simulated arrays
    dashboardMetrics.ts        Composes riskMetrics.ts into everything the dashboard displays
    csvParser.ts               Historical-trade CSV parsing plus empirical statistics
    histogram.ts                Generic binning helper shared by every distribution chart
    formatters.ts, defaults.ts, validateConfig.ts
  components/                Presentational React components (charts, panels, forms). No simulation
                              logic lives here, only lib/ calls and rendering
  FuturesRiskLab.tsx          Container: owns config state, debounces expensive re-simulation, and
                              recomputes cheap derived metrics (thresholds/targets) instantly
```

**Why the engine and UI are split here specifically:** `runMonteCarloSimulation` (expensive, since it generates a fresh set of N random paths) is debounced behind parameter changes, while `computeDashboardMetrics` (cheap, just linear scans over already-simulated arrays) recomputes instantly when you drag a drawdown threshold or change the account target, without re-running the simulation. That split only works because the engine returns raw per-path arrays rather than pre-baked statistics.

**No backend.** Unlike OrderFlow Edge Lab, this project needed no Python engine. The simulation (up to 50,000 paths and 2,000 trades) runs in well under a second in the browser, so a pure client-side TypeScript engine gives instant interactivity (every slider re-simulates) without a server round trip, and the whole thing ships as part of the static build.

## Methodology

**Monte Carlo simulation.** Each of `numSimulations` independent paths draws `numTrades` random trade outcomes, accumulates them into an equity curve starting from `startingBalance`, and records the terminal balance, the maximum peak-to-trough drawdown, and the min/max balance reached at any point. Running thousands of paths turns "what might happen" into a measurable distribution.

**Trade-return distribution.** Rather than emitting exactly +1.2R on every win and exactly -1R on every loss, each side is drawn from a Gamma distribution whose mean is pinned to the requested average. Winners default to a lower shape parameter, giving more spread and a right-skewed tail, reflecting that a trend or breakout edge occasionally runs well past "average." Losers default to a higher shape parameter, staying tighter, reflecting that a hard stop caps most losses at close to the same size. Both shape parameters are adjustable. Dollar P&L per trade equals the R multiple times `riskPerTrade`.

**Value-at-Risk.** Computed as a percentile of the simulated terminal profit and loss distribution: sort every path's ending P&L, take the value at the `(1 - confidence)` percentile, and negate it. This is the standard historical/simulation method for VaR, applied to Monte Carlo output instead of a historical return series. Supports 95% and 99% out of the box.

**Expected Shortfall (CVaR).** The average P&L among only the outcomes at least as bad as VaR. It captures the average magnitude of the tail, not just its edge.

**Maximum drawdown, per path.** The worst `(peak - balance) / peak` seen at any point, tracked with a running high-water mark. The dashboard reports the distribution of this across all paths (percentiles, worst case, probability of exceeding a threshold) rather than a single number.

**Risk of ruin.** The fraction of paths whose balance falls to or below a user-defined floor (a percentage of starting balance) *at any point* in the simulated horizon, not just at the end. This is deliberately path-dependent, since a positive-expectancy strategy can still carry real risk of a deep intra-sequence drawdown.

**Synthetic vs. empirical.** Synthetic mode samples from the Gamma model above. Empirical mode bootstrap-resamples (draws with replacement) directly from an uploaded trade history's R multiples, so the simulation reflects whatever skew or fat tails the real distribution actually has. The tradeoff is that it can't produce outcomes the historical sample never contained.

The in-app **Methodology** tab covers all of this in the same depth, next to the numbers it explains.

## Known Limitations

Stated explicitly, not buried:

- Synthetic-mode assumptions are not verified historical performance. They're inputs you chose, not a track record.
- Monte Carlo output depends entirely on the assumed (or uploaded) trade-return distribution, so changing it changes every downstream number.
- VaR describes a threshold, not the shape of the tail beyond it. That's what CVaR is for, and even CVaR is an average, not a worst case.
- Nothing here models slippage, commissions, or a change in market regime unless it's implicitly present in uploaded historical trades.
- Position sizing is fixed dollar risk per trade, with no compounding and no scaling with account growth. This is a deliberate simplification, documented rather than hidden.
- Bootstrap resampling in empirical mode can't manufacture outcomes a short trade history never actually produced.
- There's no CME holiday calendar or session modeling. Trades are treated as an ordered sequence, not scheduled in time.

## Engineering Challenges

Found during manual browser verification of this exact build, not by the unit test suite, which checked the math in isolation and passed.

With the default MNQ assumptions (59% win rate, +1.2R/-1R, 200 trades), essentially every simulated path over that horizon ends up profitable, so the 1st and 5th percentiles of terminal P&L are themselves positive. `VaR = -percentile(P&L, 1-confidence)` is mathematically correct in that case, and the monotonicity `VaR99 >= VaR95` still holds (unit-tested against constructed data), but it makes the raw VaR value *negative*. A "-$6,150 VaR" reads, at a glance, exactly like a $6,150 loss, when it actually means a guaranteed minimum *gain* of $6,150 at that confidence level. I only caught this by reading the rendered numbers in the browser, not from any test. I fixed it at the display layer (`lib/formatters.ts`'s `formatLossMetric`) rather than touching the math: a value is now labeled "Min. gain $X" and colored accordingly whenever the tail threshold is actually favorable, instead of relying on a bare minus sign to carry that meaning. The math didn't change. The honesty of the label did.

## Future Work

- Position sizing that scales with account equity (compounding), as an alternative to the current fixed-dollar-risk model.
- A fatter-tailed synthetic distribution option (e.g. Student-t) for strategies where Gamma's thin tails understate real-world slippage/gap risk.
- Walk-forward / rolling-window empirical resampling instead of a single flat bootstrap pool.
- Persisting a saved parameter set (localStorage) so a comparison across scenarios doesn't require re-entering assumptions.

## Attribution

The Monte Carlo, VaR, and CVaR percentile methodology (historical and simulation VaR, tail-average CVaR) follows standard, widely published quantitative finance technique, the same technique demonstrated in the open-source [`MonteCarlo-simulation`](https://github.com/arunp77/MonteCarlo-simulation) repository by Arun Kumar Pandey (MIT licensed), which was used as a reference while building this project. Every line of code in `src/features/futures-risk-lab/`, including the futures/R-multiple trade model, the TypeScript simulation engine, the risk-metric functions, the CSV empirical-data pipeline, and the dashboard itself, is a from-scratch implementation written for this project, not a port of that repository's Python and Jupyter code.

## Running it

```bash
npm install
npm run dev          # http://localhost:8080/monte-carlo-var-simulation

npm test              # vitest, includes the full futures-risk-lab engine test suite
npm run lint
```

No backend, no environment variables, no separate setup step. `npm install && npm run dev` is the whole thing.

---

# OrderFlow Edge Lab

*A quantitative research platform for testing whether order-flow and market-microstructure signals carry real historical information in futures markets — not a trading dashboard, and not a signal to trade on.*

Live in this portfolio at `/orderflow`. Source: [`engine/`](engine/) (Python research engine) and [`src/features/orderflow-edge-lab/`](src/features/orderflow-edge-lab/) (React research terminal).

## Project Overview

OrderFlow Edge Lab detects combinations of order-flow conditions (a sweep of the prior session's point of control, absorption of aggressive volume, delta divergence) in CME micro futures data, scores how many of a hypothesis's predefined conditions are present at a given moment (the **Edge Score**), and then — separately — backtests whether that combination has actually preceded the outcome the hypothesis predicts, with statistical validation designed to catch the ways backtests lie to you.

The four panes of the research terminal correspond to four different questions, deliberately kept separate:

| Pane | Question |
|---|---|
| Market Data | What happened? |
| Detected Conditions | What did the system detect? |
| Edge Engine | What hypothesis do those conditions support, and how strongly? |
| Research Results | What does the historical data actually say? |

## Research Question

**Can combinations of order-flow and market-microstructure signals be systematically identified and tested to determine whether they contain statistically meaningful information about subsequent price behaviour?**

The MVP tests one hypothesis end to end — **POC Sweep + Absorption Reversal**: price sweeps through the prior session's point of control (the price where the most volume actually traded, not just a raw session high/low) on elevated volume, the opposing side absorbs the aggressive flow without price following through, and cumulative delta diverges from the new price extreme. The system does not assume this is profitable. It's built to find out.

## Why I Built It

I wanted a project that forced me to combine market knowledge, statistics, and software engineering honestly — not a demo that looks impressive because it quietly assumes away the hard parts (look-ahead bias, tiny samples, unrealistic fills). The interesting engineering problem turned out to be less "can I detect a pattern" and more "can I build a system that tells the truth about whether that pattern means anything" — see [Engineering Challenges](#engineering-challenges) below.

## Architecture

```
engine/                          Python research engine
  src/edge_lab/
    config.py                    Instrument specs (MES/MNQ tick size, session hours)
    models/                      pydantic models — the Python <-> TS contract (camelCase JSON)
    data/                        provider.py (interface) + synthetic_provider.py + synthetic_generator.py
    features/                    volume profile, market structure, order-flow features
    signals/                     poc_sweep, absorption, delta_divergence + registry
    hypotheses/                  edge_score.py + setups/poc_sweep_absorption_reversal.py
    backtest/                    fills, trade simulation, statistics, IS/OOS validation
    api/                         FastAPI app
    cli/                         export_schemas.py, export_artifacts.py
  schemas/                       JSON Schema exports (checked in, validated by a Vitest contract test)
  tests/                         80 pytest tests — models, generator, features, signals, Edge Engine, backtest, API

src/features/orderflow-edge-lab/ React research terminal
  types/                         Hand-mirrored TS types + contract.test.ts (validates against engine/schemas/)
  api/                           client.ts (interface) + liveApiClient.ts + staticArtifactClient.ts
  hooks/                         react-query wrappers
  components/                    market-data/, detected-conditions/, edge-engine/, research-results/
  lib/                           computeStatistics.ts, computeVolumeProfile.ts — TS mirrors of engine logic
```

**Two data modes, one interface.** `OrderFlowDataClient` is implemented twice: `liveApiClient` (fetches `/api/*`, proxied by Vite to a local FastAPI process) and `staticArtifactClient` (fetches precomputed JSON from `public/data/orderflow-edge-lab/`). In dev, the app checks `/api/health` and uses whichever is actually reachable — live if you've started the engine, static otherwise, with no broken UI either way. **The production build is 100% static**: `npm run build` ships only the precomputed JSON artifacts, so the deployed site needs zero backend, zero cold starts, and can't break because a Python process isn't running. The FastAPI app is fully real and tested — it's just not required to be *running* for the deployed site to work, which is the honest tradeoff for a portfolio project (see the table in the original design notes for the full reasoning).

This is the same pattern applied twice: `MarketDataProvider` (Python) and `OrderFlowDataClient` (TS) are both interfaces with a synthetic/static implementation now and a real one pluggable later, without touching anything downstream.

## Data

**Everything in this application is synthetic.** No real market data is used or implied to be used — see [`engine/SYNTHETIC_DATA_ASSUMPTIONS.md`](engine/SYNTHETIC_DATA_ASSUMPTIONS.md) for the full, specific writeup of what the generator does and doesn't model. In short: a regime-switching random walk with realistic intraday seasonality, plus an explicit, rate-controlled scenario injector that constructs the target microstructure sequence (and, importantly, negative-control sequences the detectors must correctly *not* fire on) so the hypothesis is genuinely testable rather than either never occurring or trivially always winning.

**What real data would take.** For genuine footprint/delta/absorption analysis on CME micro futures, the realistic choice is **[Databento](https://databento.com)** — CME Globex MDP3 order-book data (MBO/L2/L3, nanosecond timestamps) covering MES and MNQ, available via API or batch download, with pay-as-you-go metered pricing and a free credit tier for prototyping. Retail platforms (NinjaTrader, ATAS, Sierra Chart, Bookmap) bundle data with charting but aren't usable as a headless API for a research pipeline; Polygon and dxFeed are weaker fits for tick-level futures microstructure specifically. None of this is integrated — the `MarketDataProvider` interface exists so it can be, later, without touching the feature/signal/backtest layers at all.

## Methodology

1. **Signals** (`edge_lab/signals/`) are independent detectors over precomputed rolling features (volume multiple vs. trailing average, effort-vs-result, delta/price divergence). Each produces a `DetectedCondition` with structured evidence — never a bare boolean.
2. **The Edge Engine** (`edge_lab/hypotheses/edge_score.py`) combines a `SetupDefinition`'s weighted rules against nearby detected conditions into a score. **The score is a count of predefined conditions present, not a prediction** — this is enforced by what the code doesn't do: there is no probability-of-profit computation anywhere in this module. The UI repeats this disclaimer on every pane.
3. **Weights are configurable and versioned** (`SetupDefinition.version`), so changing them doesn't silently rewrite the meaning of historical scores.

## Backtesting

Given qualifying triggers (Edge Score ≥ threshold, required conditions met), the engine walks forward bar by bar to simulate entry, stop, and target, with these methodology choices made explicit rather than hidden:

- No overlapping positions per setup (no pyramiding).
- When a bar touches both stop and target, the stop is assumed to fill first — the conservative convention, since the true intrabar sequence isn't recoverable from OHLC bars.
- A position still open at session close is force-exited there.
- A fixed, visible cost (0.5 points) is deducted from every trade's P&L.
- **Trades with a stop distance under 2 ticks are excluded.** This one is worth calling out: an earlier version of the engine didn't have this floor, and a trigger bar closing very close to its reference level (which happens by construction — absorption bars are built to keep price contained near the sweep zone) produced a near-zero denominator in the R-multiple calculation, exploding into an average of **-11R per trade** and a **-1196R max drawdown**. Real, caught during manual verification, not a hypothetical. See [Engineering Challenges](#engineering-challenges).

**Validation, not just a profit curve**: chronological (never shuffled) in-sample/out-of-sample split, a one-sample t-test and 95% confidence interval on mean R, a Wilson interval on win rate, and auto-populated warnings — small sample size, small out-of-sample count, the standard backtesting caveats (look-ahead bias, unrealistic fills, data-snooping) — that render every time, not just when something looks wrong.

## Results

From the shipped static build — `POC Sweep + Absorption Reversal`, MES, 2026-01-05 to 2026-06-26, min Edge Score 70:

| | |
|---|---|
| Sample size | 27 (18 in-sample, 9 out-of-sample) |
| Win rate | 74.1% (95% CI: 55.3% – 86.8%) |
| Avg R | +0.39 (95% CI: -0.12 – 0.91) |
| Expectancy | +0.39R |
| Profit factor | 1.68 |
| Max drawdown | -3.73R |
| p-value | 0.129 |

These are genuine numbers from the system, on synthetic data, and this time they're a better illustration of the point than a clean result would have been: the p-value is not significant, the confidence interval on average R straddles zero, and the sample is small on both counts the system checks for (27 total, 9 out-of-sample). The honest read is "no conclusion either way" — which is a legitimate, common outcome in real research, and part of why the system is built to say so plainly instead of only ever reporting the flattering number.

## Engineering Challenges

Two real bugs, found during manual browser verification rather than by the test suite (both since covered by regression tests):

1. **Order flow uncorrelated with price.** The synthetic generator originally drew bid/ask pressure independently of the realized price step. Delta and price were statistically unrelated outside injected scenarios, which made the delta-divergence detector fire on ~30% of all bars — a meaningless rate for a "divergence" signal, since with no real correlation to diverge *from*, everything looks like divergence. Fixed by deriving order flow from the actual realized price step (with noise), which dropped the rate to a plausible level.
2. **Exploding R-multiples from near-zero risk.** Documented above under Backtesting. The lesson in both cases: unit tests on hand-built fixtures caught the *logic* being correct, but only running the full pipeline against a realistic dataset and reading the actual numbers caught that the *calibration* was wrong. Correctness and plausibility are different properties, and a synthetic-data project has to check both.

More broadly: keeping the Python engine and TypeScript frontend honestly in sync (camelCase JSON contract via a shared pydantic base model, JSON Schema exported and checked against hand-written TS fixtures in a Vitest contract test) was worth the upfront cost — it turned a whole category of "the frontend silently expects a field the backend doesn't send" bugs into a build-time test failure instead of a runtime rendering bug.

## Future Work

- Real data integration behind the existing `MarketDataProvider` interface (Databento, see Data above).
- Additional setups: failed auctions, value-area/POC reactions, higher-timeframe structure alignment — the signal registry and `SetupDefinition` schema already support this without rearchitecting.
- Footprint (per-price-level bid/ask) rendering — the data model (`SyntheticOrderFlowBar.priceLevels`) already reserves the field.
- Walk-forward testing (rolling IS/OOS windows) rather than a single chronological split.
- A live-deployed FastAPI backend for fully arbitrary backtest configurations, instead of the current curated static presets plus live client-side filtering.
- A CME holiday/early-close calendar in the synthetic session model (currently Mon–Fri only, documented as a known limitation).

## Running it

```bash
npm install
npm run engine:setup           # once — uv sync inside engine/

npm run dev                    # frontend, :8080
npm run engine:dev             # FastAPI, :8000 (optional — dev falls back to static data if not running)

npm run build && npm run preview   # production build — verify it works with ZERO Python running
npm run engine:export          # regenerate public/data/orderflow-edge-lab/*.json after an engine change

npm test                       # frontend tests (vitest)
npm run engine:test            # engine tests (pytest) — 80 tests
npm run engine:lint            # ruff check + format --check
```
