import { useMemo } from "react";
import type { OHLCVBar } from "../../types";
import { computeVolumeProfile } from "../../lib/computeVolumeProfile";
import { formatPrice } from "../../lib/formatters";

interface VolumeProfilePanelProps {
  bars: OHLCVBar[];
  tickSize: number;
  height?: number;
}

const VolumeProfilePanel = ({ bars, tickSize, height = 420 }: VolumeProfilePanelProps) => {
  const profile = useMemo(() => computeVolumeProfile(bars, tickSize, 4), [bars, tickSize]);

  if (bars.length === 0 || profile.levels.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-muted text-xs font-mono">No data</div>;
  }

  const maxVolume = Math.max(...profile.levels.map((l) => l.volume));
  const rowHeight = height / profile.levels.length;

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 220 ${height}`} className="w-full h-full">
        {[...profile.levels].reverse().map((level, i) => {
          const y = i * rowHeight;
          const barWidth = (level.volume / maxVolume) * 150;
          const inValueArea = level.price >= profile.val && level.price <= profile.vah;
          const isPoc = level.price === profile.poc;
          return (
            <g key={level.price}>
              <rect
                x={40}
                y={y + rowHeight * 0.12}
                width={Math.max(barWidth, 0.5)}
                height={Math.max(rowHeight * 0.76, 0.5)}
                fill={isPoc ? "hsl(38 92% 50%)" : inValueArea ? "hsl(199 89% 58% / 0.55)" : "hsl(0 0% 60% / 0.3)"}
              />
              {(i === 0 || i % Math.ceil(profile.levels.length / 12) === 0) && (
                <text x={0} y={y + rowHeight * 0.7} className="fill-text-muted text-[8px] font-mono">
                  {formatPrice(level.price, tickSize)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-col gap-1 mt-2 font-mono text-[10px] text-text-muted">
        <div>
          <span className="text-foreground">POC</span> {formatPrice(profile.poc, tickSize)}
        </div>
        <div>
          <span className="text-foreground">VAH</span> {formatPrice(profile.vah, tickSize)} · {" "}
          <span className="text-foreground">VAL</span> {formatPrice(profile.val, tickSize)}
        </div>
        <div>Value area {(profile.valueAreaVolumePct * 100).toFixed(0)}% of volume</div>
      </div>
    </div>
  );
};

export default VolumeProfilePanel;
