import { useMemo, useRef, useState } from "react";
import type { DetectedCondition, OHLCVBar } from "../../types";
import { formatPrice, formatTime } from "../../lib/formatters";

interface CandlestickChartProps {
  bars: OHLCVBar[];
  conditions?: DetectedCondition[];
  tickSize: number;
  timezone: string;
  height?: number;
  /** Draws an amber reference line at this price, e.g. from hovering the volume profile. */
  highlightPrice?: number | null;
}

const SIGNAL_COLORS: Record<string, string> = {
  poc_sweep: "hsl(38 92% 50%)",
  absorption: "hsl(271 81% 66%)",
  delta_divergence: "hsl(199 89% 58%)",
};

const PADDING = { left: 8, right: 56, top: 12 };

const CandlestickChart = ({
  bars,
  conditions = [],
  tickSize,
  timezone,
  height = 420,
  highlightPrice,
}: CandlestickChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const width = 900;
  const priceHeight = height * 0.72;
  const volumeHeight = height * 0.2;
  const volumeTop = priceHeight + 16;
  const plotWidth = width - PADDING.left - PADDING.right;

  const conditionsByBar = useMemo(() => {
    const map = new Map<number, DetectedCondition[]>();
    for (const c of conditions) {
      const list = map.get(c.barIndex);
      if (list) list.push(c);
      else map.set(c.barIndex, [c]);
    }
    return map;
  }, [conditions]);

  const { priceScale, volumeScale, candleWidth } = useMemo(() => {
    if (bars.length === 0) {
      return { priceScale: (v: number) => v, volumeScale: (v: number) => v, candleWidth: 4 };
    }
    const lowMin = Math.min(...bars.map((b) => b.low));
    const highMax = Math.max(...bars.map((b) => b.high));
    const pad = (highMax - lowMin) * 0.08 || tickSize * 4;
    const yMin = lowMin - pad;
    const yMax = highMax + pad;
    const volMax = Math.max(...bars.map((b) => b.volume));

    const priceScale = (price: number) => PADDING.top + ((yMax - price) / (yMax - yMin)) * priceHeight;
    const volumeScale = (vol: number) => volumeTop + volumeHeight - (vol / (volMax || 1)) * volumeHeight;
    const cw = Math.max(1.5, (plotWidth / bars.length) * 0.62);
    return { priceScale, volumeScale, candleWidth: cw };
  }, [bars, priceHeight, volumeHeight, volumeTop, plotWidth, tickSize]);

  const xForIndex = (i: number) => PADDING.left + (i + 0.5) * (plotWidth / Math.max(bars.length, 1));

  const handleMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg || bars.length === 0) return;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const local = point.matrixTransform(ctm.inverse());
    const step = plotWidth / bars.length;
    const idx = Math.round((local.x - PADDING.left) / step - 0.5);
    setHoverIndex(Math.min(Math.max(idx, 0), bars.length - 1));
  };

  const hovered = hoverIndex != null ? bars[hoverIndex] : null;

  if (bars.length === 0) {
    return (
      <div className="flex items-center justify-center h-[420px] text-text-muted text-sm ">
        No bars in the selected range.
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto select-none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {/* Price gridlines + axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const lowMin = Math.min(...bars.map((b) => b.low));
          const highMax = Math.max(...bars.map((b) => b.high));
          const pad = (highMax - lowMin) * 0.08 || tickSize * 4;
          const price = highMax + pad - t * (highMax - lowMin + 2 * pad);
          const y = PADDING.top + t * priceHeight;
          return (
            <g key={t}>
              <line x1={PADDING.left} x2={width - PADDING.right} y1={y} y2={y} className="stroke-foreground/5" />
              <text x={width - PADDING.right + 6} y={y + 3} className="fill-text-muted text-[9px] ">
                {formatPrice(price, tickSize)}
              </text>
            </g>
          );
        })}

        {/* Candles */}
        {bars.map((bar, i) => {
          const x = xForIndex(i);
          const isUp = bar.close >= bar.open;
          const color = isUp ? "hsl(142 71% 45%)" : "hsl(0 72% 58%)";
          const bodyTop = priceScale(Math.max(bar.open, bar.close));
          const bodyBottom = priceScale(Math.min(bar.open, bar.close));
          return (
            <g key={bar.barIndex}>
              <line
                x1={x}
                x2={x}
                y1={priceScale(bar.high)}
                y2={priceScale(bar.low)}
                stroke={color}
                strokeWidth={1}
              />
              <rect
                x={x - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={Math.max(bodyBottom - bodyTop, 0.75)}
                fill={color}
              />
              {conditionsByBar.get(bar.barIndex)?.map((c, ci) => (
                <circle
                  key={c.id}
                  cx={x}
                  cy={priceScale(c.direction === "bullish" ? bar.low : bar.high) + (c.direction === "bullish" ? 8 : -8) - ci * 8}
                  r={3}
                  fill={SIGNAL_COLORS[c.signalType] ?? "hsl(0 0% 60%)"}
                >
                  <title>
                    {c.signalType} ({c.direction})
                  </title>
                </circle>
              ))}
              <rect
                x={x - candleWidth / 2}
                y={volumeScale(bar.volume)}
                width={candleWidth}
                height={volumeTop + volumeHeight - volumeScale(bar.volume)}
                fill={color}
                opacity={0.5}
              />
            </g>
          );
        })}

        {/* Crosshair */}
        {hovered && (
          <g pointerEvents="none">
            <line
              x1={xForIndex(hoverIndex as number)}
              x2={xForIndex(hoverIndex as number)}
              y1={PADDING.top}
              y2={volumeTop + volumeHeight}
              className="stroke-foreground/25"
              strokeDasharray="2,2"
            />
            <line
              x1={PADDING.left}
              x2={width - PADDING.right}
              y1={priceScale(hovered.close)}
              y2={priceScale(hovered.close)}
              className="stroke-foreground/25"
              strokeDasharray="2,2"
            />
          </g>
        )}

        {/* Volume-profile hover reference line */}
        {highlightPrice != null && (
          <g pointerEvents="none">
            <line
              x1={PADDING.left}
              x2={width - PADDING.right}
              y1={priceScale(highlightPrice)}
              y2={priceScale(highlightPrice)}
              stroke="hsl(38 92% 50%)"
              strokeWidth={1}
              strokeDasharray="4,2"
            />
            <text
              x={width - PADDING.right + 6}
              y={priceScale(highlightPrice) + 3}
              className="text-[9px] font-bold"
              fill="hsl(38 92% 50%)"
            >
              {formatPrice(highlightPrice, tickSize)}
            </text>
          </g>
        )}
      </svg>

      {hovered && (
        <div className="absolute top-0 left-0 text-[10px] bg-background/90 border border-foreground/10 rounded px-2 py-1 pointer-events-none">
          <span className="text-text-muted">{formatTime(hovered.timestamp, timezone)}</span>{" "}
          <span>O {formatPrice(hovered.open, tickSize)}</span>{" "}
          <span>H {formatPrice(hovered.high, tickSize)}</span>{" "}
          <span>L {formatPrice(hovered.low, tickSize)}</span>{" "}
          <span>C {formatPrice(hovered.close, tickSize)}</span>{" "}
          <span className="text-text-muted">V {hovered.volume.toFixed(0)}</span>
        </div>
      )}
    </div>
  );
};

export default CandlestickChart;
