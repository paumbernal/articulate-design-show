import { Badge } from "@/components/ui/badge";
import type { Direction } from "../types";

interface DirectionBadgeProps {
  direction: Direction;
  className?: string;
}

const DirectionBadge = ({ direction, className = "" }: DirectionBadgeProps) => {
  const isBullish = direction === "bullish";
  return (
    <Badge
      variant={isBullish ? "default" : "destructive"}
      className={`font-mono text-[10px] ${isBullish ? "bg-emerald-500 text-white hover:bg-emerald-500/80" : ""} ${className}`}
    >
      {direction}
    </Badge>
  );
};

export default DirectionBadge;
