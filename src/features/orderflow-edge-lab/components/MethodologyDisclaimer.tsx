import { AlertTriangle } from "lucide-react";
import { useMeta } from "../hooks/useOrderFlowData";

const MethodologyDisclaimer = () => {
  const { data: meta } = useMeta();

  return (
    <div className="flex items-start gap-2 border border-amber-500/25 bg-amber-500/[0.06] rounded-lg px-3 py-2 text-[11px] font-mono text-amber-600 dark:text-amber-400">
      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <span>
        {meta?.disclaimer ??
          "All market data in this application is synthetically generated for methodology demonstration. It is not real market data."}{" "}
        Edge Score is a count of predefined conditions present — not a prediction of price.
      </span>
    </div>
  );
};

export default MethodologyDisclaimer;
