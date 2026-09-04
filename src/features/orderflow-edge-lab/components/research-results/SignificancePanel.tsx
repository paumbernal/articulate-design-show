import { AlertTriangle } from "lucide-react";
import type { ValidationSummary } from "../../types";
import { formatPercent } from "../../lib/formatters";

interface SignificancePanelProps {
  validation: ValidationSummary;
}

const SignificancePanel = ({ validation }: SignificancePanelProps) => {
  const { significance } = validation;
  const isSignificant = significance.pValue != null && significance.pValue < 0.05;

  return (
    <div className="border border-foreground/10 rounded-xl p-5 bg-foreground/[0.02] flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="text-xs uppercase tracking-wide text-text-muted">Statistical Validation</h4>
        <span className="text-xs text-text-muted">
          in-sample {validation.inSampleN} · out-of-sample {validation.outOfSampleN}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <p className="text-[10px] uppercase text-text-muted mb-1">p-value</p>
          <p className={`font-bold ${isSignificant ? "text-emerald-500" : ""}`}>
            {significance.pValue != null ? significance.pValue.toFixed(3) : "N/A"}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-text-muted mb-1">Avg R 95% CI</p>
          <p className="font-bold">
            {significance.ciLow != null && significance.ciHigh != null
              ? `${significance.ciLow.toFixed(2)} to ${significance.ciHigh.toFixed(2)}`
              : "N/A"}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-text-muted mb-1">Win Rate 95% CI</p>
          <p className="font-bold">
            {significance.winRateCiLow != null && significance.winRateCiHigh != null
              ? `${formatPercent(significance.winRateCiLow)} to ${formatPercent(significance.winRateCiHigh)}`
              : "N/A"}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-text-muted mb-1">Method</p>
          <p className="text-[11px] leading-tight">{significance.method}</p>
        </div>
      </div>

      {validation.warnings.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-foreground/10 pt-3">
          {validation.warnings.map((w) => (
            <div key={w} className="flex items-start gap-2 text-[11px] text-text-muted">
              <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-amber-500" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SignificancePanel;
