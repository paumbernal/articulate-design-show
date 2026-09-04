import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DisclaimerBanner from "./components/DisclaimerBanner";
import ParameterPanel from "./components/ParameterPanel";
import KeyMetricsGrid from "./components/KeyMetricsGrid";
import EquityCurveFanChart from "./components/EquityCurveFanChart";
import TerminalBalanceHistogram from "./components/TerminalBalanceHistogram";
import DrawdownDistributionChart from "./components/DrawdownDistributionChart";
import VaRTailChart from "./components/VaRTailChart";
import DrawdownThresholdChart from "./components/DrawdownThresholdChart";
import RiskOfRuinPanel from "./components/RiskOfRuinPanel";
import TargetProbabilityPanel from "./components/TargetProbabilityPanel";
import CsvUploadPanel from "./components/CsvUploadPanel";
import MethodologyPanel from "./components/MethodologyPanel";
import { runMonteCarloSimulation } from "./lib/monteCarlo";
import { computeDashboardMetrics } from "./lib/dashboardMetrics";
import { validateConfig } from "./lib/validateConfig";
import { DEFAULT_CONFIG, DEFAULT_DRAWDOWN_THRESHOLDS_PCT, DEFAULT_RUIN_THRESHOLD_PCT, DEFAULT_TARGET_BALANCE } from "./lib/defaults";
import type { SimulationConfig } from "./types";

const DEBOUNCE_MS = 300;

const FuturesRiskLab = () => {
  const [draftConfig, setDraftConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [committedConfig, setCommittedConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [isPending, setIsPending] = useState(false);

  const [ruinThresholdPct, setRuinThresholdPct] = useState(DEFAULT_RUIN_THRESHOLD_PCT);
  const [targetBalance, setTargetBalance] = useState(DEFAULT_TARGET_BALANCE);

  useEffect(() => {
    setIsPending(true);
    const timer = setTimeout(() => {
      setCommittedConfig(draftConfig);
      setIsPending(false);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draftConfig]);

  const issues = useMemo(() => validateConfig(committedConfig), [committedConfig]);

  const result = useMemo(() => {
    if (issues.length > 0) return null;
    return runMonteCarloSimulation(committedConfig);
  }, [committedConfig, issues.length]);

  const metrics = useMemo(() => {
    if (!result) return null;
    return computeDashboardMetrics(result, {
      ruinThresholdPct,
      targetBalance,
      drawdownThresholdsPct: DEFAULT_DRAWDOWN_THRESHOLDS_PCT,
    });
  }, [result, ruinThresholdPct, targetBalance]);

  const handleModeChange = (mode: SimulationConfig["mode"]) => setDraftConfig((c) => ({ ...c, mode }));
  const handleEmpiricalRMultiplesChange = (rMultiples: number[]) =>
    setDraftConfig((c) => ({ ...c, empiricalRMultiples: rMultiples }));

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-8 pb-24">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <p className="text-text-muted text-xs uppercase tracking-wide mb-1">Risk Terminal</p>
          <h1 className="font-bold text-2xl">Monte Carlo VaR Simulation</h1>
        </div>
        {isPending && (
          <span className="text-[10px] uppercase tracking-wide text-text-muted animate-pulse">
            Recalculating…
          </span>
        )}
      </div>

      <div className="mb-6">
        <DisclaimerBanner />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ParameterPanel config={draftConfig} onChange={setDraftConfig} />
        </div>

        <div>
          {issues.length > 0 ? (
            <div className="border border-red-500/25 bg-red-500/[0.06] rounded-xl p-5">
              <p className="text-xs uppercase tracking-wide text-red-500 mb-2">Fix the following to run the simulation</p>
              <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1">
                {issues.map((issue) => (
                  <li key={issue.field}>{issue.message}</li>
                ))}
              </ul>
            </div>
          ) : (
            result &&
            metrics && (
              <Tabs defaultValue="dashboard">
                <TabsList className="mb-6 flex-wrap h-auto">
                  <TabsTrigger value="dashboard" className="text-xs">
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="risk" className="text-xs">
                    VaR &amp; CVaR
                  </TabsTrigger>
                  <TabsTrigger value="drawdown" className="text-xs">
                    Drawdown &amp; Ruin
                  </TabsTrigger>
                  <TabsTrigger value="historical" className="text-xs">
                    Historical Data
                  </TabsTrigger>
                  <TabsTrigger value="methodology" className="text-xs">
                    Methodology
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="space-y-8">
                  <KeyMetricsGrid metrics={metrics} />
                  <EquityCurveFanChart result={result} />
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-text-muted mb-2">
                      Terminal Account Balance Distribution
                    </p>
                    <TerminalBalanceHistogram
                      terminalBalances={result.terminalBalances}
                      startingBalance={committedConfig.startingBalance}
                      medianFinalBalance={metrics.medianFinalBalance}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="risk" className="space-y-8">
                  <VaRTailChart terminalBalances={result.terminalBalances} startingBalance={committedConfig.startingBalance} />
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-text-muted mb-2">
                      Maximum Drawdown Distribution
                    </p>
                    <DrawdownDistributionChart
                      maxDrawdownPcts={result.maxDrawdownPcts}
                      medianMaxDrawdownPct={metrics.medianMaxDrawdownPct}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="drawdown" className="space-y-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-text-muted mb-2">
                      Probability of Exceeding Drawdown Thresholds
                    </p>
                    <DrawdownThresholdChart maxDrawdownPcts={result.maxDrawdownPcts} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RiskOfRuinPanel
                      startingBalance={committedConfig.startingBalance}
                      ruinThresholdPct={ruinThresholdPct}
                      onRuinThresholdPctChange={setRuinThresholdPct}
                      riskOfRuin={metrics.riskOfRuin}
                    />
                    <TargetProbabilityPanel
                      startingBalance={committedConfig.startingBalance}
                      targetBalance={targetBalance}
                      onTargetBalanceChange={setTargetBalance}
                      probabilities={metrics.targetProbabilities}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="historical">
                  <CsvUploadPanel
                    mode={draftConfig.mode}
                    onModeChange={handleModeChange}
                    riskPerTrade={draftConfig.riskPerTrade}
                    onEmpiricalRMultiplesChange={handleEmpiricalRMultiplesChange}
                  />
                </TabsContent>

                <TabsContent value="methodology">
                  <MethodologyPanel />
                </TabsContent>
              </Tabs>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default FuturesRiskLab;
