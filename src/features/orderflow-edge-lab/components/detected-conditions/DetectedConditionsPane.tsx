import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useConditions } from "../../hooks/useOrderFlowData";
import { CHART_WINDOW } from "../../lib/dataWindow";
import { INSTRUMENTS } from "../../lib/instrumentSpecs";
import { formatDate, formatTime } from "../../lib/formatters";
import type { InstrumentSymbol } from "../../types";
import DirectionBadge from "../DirectionBadge";

interface DetectedConditionsPaneProps {
  symbol: InstrumentSymbol;
}

const SIGNAL_LABELS: Record<string, string> = {
  poc_sweep: "POC Sweep",
  absorption: "Absorption",
  delta_divergence: "Delta Divergence",
};

const SIGNAL_DOT: Record<string, string> = {
  poc_sweep: "bg-amber-500",
  absorption: "bg-violet-500",
  delta_divergence: "bg-sky-500",
};

const DetectedConditionsPane = ({ symbol }: DetectedConditionsPaneProps) => {
  const spec = INSTRUMENTS[symbol];
  const query = useMemo(
    () => ({ symbol, timeframe: "5m" as const, start: CHART_WINDOW.start, end: CHART_WINDOW.end }),
    [symbol],
  );
  const { data: conditions, isLoading } = useConditions(query);
  const [activeTypes, setActiveTypes] = useState<Set<string>>(
    new Set(["poc_sweep", "absorption", "delta_divergence"]),
  );

  const filtered = useMemo(() => {
    if (!conditions) return [];
    return [...conditions].filter((c) => activeTypes.has(c.signalType)).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [conditions, activeTypes]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of conditions ?? []) map.set(c.signalType, (map.get(c.signalType) ?? 0) + 1);
    return map;
  }, [conditions]);

  const toggleType = (type: string) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  if (isLoading) {
    return <div className="p-8 text-text-muted text-sm font-mono">Loading detected conditions…</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-muted max-w-2xl">
        Everything the detectors picked up on {spec.name} over the last six weeks, whether or not it ends up
        mattering for a setup. Head to Edge Engine to see how these actually get combined and scored.
      </p>

      <div className="flex flex-wrap gap-2">
        {Object.entries(SIGNAL_LABELS).map(([type, label]) => (
          <button
            key={type}
            type="button"
            onClick={() => toggleType(type)}
            className={`flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-full border transition-colors ${
              activeTypes.has(type)
                ? "border-foreground/30 text-foreground"
                : "border-foreground/10 text-text-faded"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${SIGNAL_DOT[type]}`} />
            {label}
            <span className="text-text-muted">{counts.get(type) ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="border border-foreground/10 rounded-xl overflow-hidden">
        <div className="max-h-[480px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono text-xs">Signal</TableHead>
                <TableHead className="font-mono text-xs">Direction</TableHead>
                <TableHead className="font-mono text-xs">Date</TableHead>
                <TableHead className="font-mono text-xs">Time</TableHead>
                <TableHead className="font-mono text-xs">Strength</TableHead>
                <TableHead className="font-mono text-xs">Evidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(0, 200).map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs whitespace-nowrap">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${SIGNAL_DOT[c.signalType]}`} />
                    {SIGNAL_LABELS[c.signalType] ?? c.signalType}
                  </TableCell>
                  <TableCell>
                    <DirectionBadge direction={c.direction} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-text-muted">{formatDate(c.timestamp, spec.timezone)}</TableCell>
                  <TableCell className="font-mono text-xs text-text-muted">{formatTime(c.timestamp, spec.timezone)}</TableCell>
                  <TableCell className="font-mono text-xs">{(c.strength * 100).toFixed(0)}%</TableCell>
                  <TableCell className="font-mono text-[10px] text-text-muted">
                    {Object.entries(c.evidence)
                      .map(([k, v]) => `${k}=${typeof v === "number" ? v.toFixed(2) : v}`)
                      .join(", ")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {filtered.length === 0 && (
        <p className="text-text-muted text-sm font-mono text-center py-8">No conditions match the current filter.</p>
      )}
    </div>
  );
};

export default DetectedConditionsPane;
