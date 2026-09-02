import { useMemo, useRef, useState } from "react";
import type { OHLCVBar } from "../../types";
import { computeVolumeProfile } from "../../lib/computeVolumeProfile";
import { formatPrice } from "../../lib/formatters";

interface VolumeProfilePanelProps {
  bars: OHLCVBar[];
  tickSize: number;
  height?: number;
  onHoverPrice?: (price: number | null) => void;
}

const VIEW_WIDTH = 220;

const VolumeProfilePanel = ({ bars, tickSize, height = 420, onHoverPrice }: VolumeProfilePanelProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const profile = useMemo(() => computeVolumeProfile(bars, tickSize, 4), [bars, tickSize]);
  const levels = useMemo(() => [...profile.levels].reverse(), [profile.levels]);

  if (bars.length === 0 || profile.levels.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-muted text-xs font-mono">No data</div>;
  }

  const maxVolume = Math.max(...profile.levels.map((l) => l.volume));
  const rowHeight = height / levels.length;

  const handleMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const local = point.matrixTransform(ctm.inverse());
    const idx = Math.min(Math.max(Math.floor(local.y / rowHeight), 0), levels.length - 1);
    if (idx !== hoverIndex) {
      setHoverIndex(idx);
      onHoverPrice?.(levels[idx].price);
    }
  };

  const handleLeave = () => {
    setHoverIndex(null);
    onHoverPrice?.(null);
  };

  const hovered = hoverIndex != null ? levels[hoverIndex] : null;

  return (
    <div className="w-full flex flex-col">
      <div className="relative w-full" style={{ height }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
          className="w-full h-full cursor-crosshair"
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
        >
          {levels.map((level, i) => {
            const y = i * rowHeight;
            const barWidth = (level.volume / maxVolume) * 150;
            const inValueArea = level.price >= profile.val && level.price <= profile.vah;
            const isPoc = level.price === profile.poc;
            const isHovered = i === hoverIndex;
            return (
              <g key={level.price}>
                {isHovered && (
                  <rect x={0} y={y} width={VIEW_WIDTH} height={rowHeight} className="fill-foreground/[0.06]" />
                )}
                <rect
                  x={40}
                  y={y + rowHeight * 0.12}
                  width={Math.max(barWidth, 0.5)}
                  height={Math.max(rowHeight * 0.76, 0.5)}
                  fill={isPoc ? "hsl(38 92% 50%)" : inValueArea ? "hsl(199 89% 58% / 0.55)" : "hsl(0 0% 60% / 0.3)"}
                  stroke={isHovered ? "currentColor" : "none"}
                  strokeWidth={isHovered ? 1 : 0}
                  className={isHovered ? "text-foreground" : ""}
                />
                {(isHovered || i === 0 || i % Math.ceil(levels.length / 12) === 0) && (
                  <text
                    x={0}
                    y={y + rowHeight * 0.7}
                    className={`text-[8px] font-mono ${isHovered ? "fill-foreground font-bold" : "fill-text-muted"}`}
                  >
                    {formatPrice(level.price, tickSize)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {hovered && (
          <div
            className="absolute right-1 font-mono text-[10px] bg-background border border-foreground/15 rounded px-2 py-1 pointer-events-none shadow-sm"
            style={{ top: Math.min((hoverIndex as number) * rowHeight, height - 54) }}
          >
            <div className="font-bold">{formatPrice(hovered.price, tickSize)}</div>
            <div className="text-text-muted">{Math.round(hovered.volume).toLocaleString()} vol</div>
            <div className="text-text-muted">
              {((hovered.volume / profile.totalVolume) * 100).toFixed(1)}% of range
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 mt-2 font-mono text-[10px] text-text-muted shrink-0">
        <div>
          <span className="text-foreground">POC</span> {formatPrice(profile.poc, tickSize)}
        </div>
        <div>
          <span className="text-foreground">VAH</span> {formatPrice(profile.vah, tickSize)} ·{" "}
          <span className="text-foreground">VAL</span> {formatPrice(profile.val, tickSize)}
        </div>
        <div>Value area holds {(profile.valueAreaVolumePct * 100).toFixed(0)}% of the volume traded here.</div>
      </div>
    </div>
  );
};

export default VolumeProfilePanel;
