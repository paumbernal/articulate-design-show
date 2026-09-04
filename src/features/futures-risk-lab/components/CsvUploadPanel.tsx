import { useMemo, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { UploadCloud, FileText, X } from "lucide-react";
import { parseTradeCsv, computeEmpiricalStats, resolveRMultiples, type CsvParseIssue } from "../lib/csvParser";
import { formatPercent, formatR } from "../lib/formatters";
import type { EmpiricalTradeRecord, SimulationMode } from "../types";

interface CsvUploadPanelProps {
  mode: SimulationMode;
  onModeChange: (mode: SimulationMode) => void;
  riskPerTrade: number;
  onEmpiricalRMultiplesChange: (rMultiples: number[]) => void;
}

function outcomeBuckets(rMultiples: number[]) {
  const defs: [string, (r: number) => boolean][] = [
    ["<= -2R", (r) => r <= -2],
    ["-2R to -1R", (r) => r > -2 && r <= -1],
    ["-1R to 0R", (r) => r > -1 && r <= 0],
    ["0R to 1R", (r) => r > 0 && r <= 1],
    ["1R to 2R", (r) => r > 1 && r <= 2],
    ["> 2R", (r) => r > 2],
  ];
  return defs.map(([label, predicate]) => ({
    label,
    n: rMultiples.filter(predicate).length,
    negative: label.startsWith("-") || label.startsWith("<="),
  }));
}

const CsvUploadPanel = ({ mode, onModeChange, riskPerTrade, onEmpiricalRMultiplesChange }: CsvUploadPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [issues, setIssues] = useState<CsvParseIssue[]>([]);
  const [trades, setTrades] = useState<EmpiricalTradeRecord[]>([]);

  const stats = useMemo(() => computeEmpiricalStats(trades, riskPerTrade), [trades, riskPerTrade]);
  const buckets = useMemo(() => outcomeBuckets(stats.rMultiples), [stats.rMultiples]);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const result = parseTradeCsv(text);
      setFileName(file.name);
      setIssues(result.issues);
      setTrades(result.trades);
      onModeChange("empirical");
      onEmpiricalRMultiplesChange(resolveRMultiples(result.trades, riskPerTrade));
    };
    reader.readAsText(file);
  };

  const clearFile = () => {
    setFileName(null);
    setIssues([]);
    setTrades([]);
    onEmpiricalRMultiplesChange([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1 border border-foreground/10 rounded-lg p-1 w-fit">
        <button
          type="button"
          onClick={() => onModeChange("synthetic")}
          className={`text-xs px-4 py-1.5 rounded-md transition-colors ${
            mode === "synthetic" ? "bg-foreground text-background" : "text-text-muted hover:text-foreground"
          }`}
        >
          Synthetic Model
        </button>
        <button
          type="button"
          onClick={() => trades.length > 0 && onModeChange("empirical")}
          disabled={trades.length === 0}
          className={`text-xs px-4 py-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            mode === "empirical" ? "bg-foreground text-background" : "text-text-muted hover:text-foreground"
          }`}
        >
          Historical / Empirical
        </button>
      </div>

      <div className="border border-foreground/10 rounded-xl p-4 md:p-5 bg-foreground/[0.02]">
        <p className="text-[10px] uppercase tracking-wide text-text-muted mb-2">Upload Historical Trades</p>
        <p className="text-sm text-foreground/70 leading-relaxed mb-4">
          Expected columns: <code className="text-xs bg-foreground/10 rounded px-1 py-0.5">date,pnl,r_multiple</code>.
          Optional columns (<code className="text-xs">instrument</code>,{" "}
          <code className="text-xs">entry_price</code>, <code className="text-xs">exit_price</code>,{" "}
          <code className="text-xs">position_size</code>, <code className="text-xs">fees</code>,{" "}
          <code className="text-xs">entry_time</code>, <code className="text-xs">exit_time</code>) are
          parsed if present. If a row is missing <code className="text-xs">r_multiple</code>, it's derived from{" "}
          <code className="text-xs">pnl / risk_per_trade</code>, which assumes historical risk sizing was
          roughly constant.
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-md border border-foreground/15 hover:border-foreground/30 hover:bg-foreground/5 transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            Choose CSV file
          </button>
          <a
            href="/data/monte-carlo-var-simulation/sample-trades.csv"
            download
            className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-md border border-foreground/10 text-text-muted hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Download sample CSV
          </a>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          {fileName && (
            <span className="inline-flex items-center gap-2 text-xs text-text-muted">
              {fileName} ({trades.length} trades)
              <button type="button" onClick={clearFile} className="hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
        </div>

        {issues.length > 0 && (
          <div className="mt-4 border border-amber-500/25 bg-amber-500/[0.06] rounded-lg p-3 max-h-32 overflow-y-auto">
            <p className="text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1.5">
              Parse notes ({issues.length})
            </p>
            {issues.slice(0, 20).map((issue, i) => (
              <p key={i} className="text-[11px] text-amber-600/90 dark:text-amber-400/90">
                Row {issue.row}: {issue.message}
              </p>
            ))}
          </div>
        )}
      </div>

      {stats.sampleSize > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Sample Size", value: `${stats.sampleSize}` },
              { label: "Actual Win Rate", value: formatPercent(stats.winRate) },
              { label: "Actual Avg Win", value: formatR(stats.avgWinR) },
              { label: "Actual Avg Loss", value: formatR(stats.avgLossR) },
              { label: "Actual Expectancy", value: formatR(stats.expectancyR) },
              { label: "Profit Factor", value: stats.profitFactor != null ? stats.profitFactor.toFixed(2) : "N/A" },
            ].map((cell) => (
              <div key={cell.label} className="border border-foreground/10 rounded-lg p-3 bg-foreground/[0.02]">
                <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1">{cell.label}</p>
                <p className="font-bold text-base">{cell.value}</p>
              </div>
            ))}
          </div>

          <div className="border border-foreground/10 rounded-lg p-3 bg-foreground/[0.02]">
            <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1">Historical Max Drawdown</p>
            <p className="font-bold text-lg">{formatR(stats.historicalMaxDrawdownR ? -stats.historicalMaxDrawdownR : null)}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wide text-text-muted mb-2">Actual R-Multiple Distribution</p>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buckets} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-foreground/5" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} stroke="currentColor" className="text-text-muted" />
                  <YAxis tick={{ fontSize: 9 }} stroke="currentColor" className="text-text-muted" allowDecimals={false} />
                  <Bar dataKey="n" radius={[3, 3, 0, 0]}>
                    {buckets.map((b) => (
                      <Cell key={b.label} fill={b.negative ? "hsl(0 72% 58%)" : "hsl(142 71% 45%)"} fillOpacity={0.6} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {mode === "empirical" && (
            <p className="text-[11px] text-emerald-500">
              Historical/Empirical mode is active. Monte Carlo simulations now bootstrap-sample trades from this
              uploaded dataset instead of the synthetic distribution.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CsvUploadPanel;
