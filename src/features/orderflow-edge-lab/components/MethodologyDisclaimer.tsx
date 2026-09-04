import { AlertTriangle } from "lucide-react";
import { useMeta } from "../hooks/useOrderFlowData";

const DEFAULT_DISCLAIMER =
  "All market data in this application is synthetically generated for methodology demonstration on this website. The real repository is private.";

const MethodologyDisclaimer = () => {
  const { data: meta } = useMeta();
  const sentences = (meta?.disclaimer ?? DEFAULT_DISCLAIMER)
    .split(". ")
    .map((s) => (s.endsWith(".") ? s : `${s}.`));

  return (
    <div className="flex items-start gap-2 border border-amber-500/25 bg-amber-500/[0.06] rounded-lg px-3 py-2 text-[11px] text-amber-600 dark:text-amber-400">
      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <div className="flex flex-col">
        {sentences.map((sentence) => (
          <span key={sentence}>{sentence}</span>
        ))}
      </div>
    </div>
  );
};

export default MethodologyDisclaimer;
