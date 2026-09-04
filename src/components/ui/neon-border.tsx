// Neon Border — Originkit, trimmed to a static glow.
// The original component animated the glow around the perimeter via a
// requestAnimationFrame loop; this project only ever uses it frozen in
// place, so the animation/easing machinery was removed rather than left
// unused — see git history if the animated version is needed again.

import * as React from "react";
import { useEffect, useRef, useState } from "react";

type Props = {
    color?: string;
    rounded?: number;
    thickness?: number;
    borderSize?: number;
    glow?: number;
    style?: React.CSSProperties;
};

const DEFAULTS = {
    color: "#CC9149",
    rounded: 24,
    thickness: 6,
    borderSize: 50,
    glow: 100,
};

const EDGE_COPIES = 2;
const GLOW_LAYERS = [
    { blur: 8, opacity: 0.5, reach: 0.3 },
    { blur: 15, opacity: 0.3, reach: 0.6 },
    { blur: 57, opacity: 0.18, reach: 1 },
];
const MAX_GLOW_BLUR = Math.max(...GLOW_LAYERS.map((l) => l.blur));
const MAX_GLOW_REACH = 36;

function withAlpha(input: string, alpha: number) {
    const a = Math.max(0, Math.min(1, alpha));
    if (typeof input !== "string") return `rgba(0,0,0,${a})`;
    const s = input.trim();

    const hex = s.match(/^#([0-9a-f]{3,8})$/i);
    if (hex) {
        let h = hex[1];
        if (h.length === 3 || h.length === 4) {
            h = h
                .split("")
                .map((c) => c + c)
                .join("");
        }
        const n = parseInt(h.slice(0, 6), 16);
        if (!Number.isFinite(n)) return `rgba(0,0,0,${a})`;
        return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    }

    const rgb = s.match(/^rgba?\(([^)]+)\)/i);
    if (rgb) {
        const parts = rgb[1].split(",").map((v) => parseFloat(v));
        if (parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite)) {
            return `rgba(${parts[0]},${parts[1]},${parts[2]},${a})`;
        }
    }
    return `rgba(0,0,0,${a})`;
}

function perimeterPoint(u: number, w: number, h: number): [number, number] {
    const d = (((u % 1) + 1) % 1) * 2 * (w + h);
    if (d < w) return [d, 0];
    if (d < w + h) return [w, d - w];
    if (d < w * 2 + h) return [w - (d - w - h), h];
    return [0, h - (d - w * 2 - h)];
}

function perimeterAngle(u: number, w: number, h: number) {
    const [x, y] = perimeterPoint(u, w, h);
    return (Math.atan2(x - w / 2, h / 2 - y) * 180) / Math.PI;
}

const ARC_SAMPLES = 24;
const MIN_ARC = 0.015;

function buildArc(
    lap: number,
    lengthPct: number,
    w: number,
    h: number,
    color: string
) {
    const fw = w > 0 ? w : 100;
    const fh = h > 0 ? h : 100;

    const len = Math.max(0, Math.min(100, lengthPct));
    const span = Math.max(MIN_ARC, (len / 100) * 0.5);
    const solidT = len / 100;

    const stops: string[] = [];
    let base = 0;
    let prev = 0;
    let acc = 0;

    for (let i = 0; i <= ARC_SAMPLES; i++) {
        const f = i / ARC_SAMPLES;
        const angle = perimeterAngle(lap + (f - 0.5) * span, fw, fh);
        if (i === 0) {
            base = angle;
        } else {
            let d = angle - prev;
            while (d > 180) d -= 360;
            while (d < -180) d += 360;
            acc += d;
        }
        prev = angle;

        const t = Math.abs(f - 0.5) * 2;
        const k =
            solidT >= 1 ? 1 : t <= solidT ? 1 : 1 - (t - solidT) / (1 - solidT);
        stops.push(
            `${withAlpha(color, k * k * (3 - 2 * k))} ${acc.toFixed(2)}deg`
        );
    }

    const end = acc.toFixed(2);
    stops.push(`${withAlpha(color, 0)} ${end}deg`);
    stops.push(`${withAlpha(color, 0)} 360deg`);

    return `conic-gradient(from ${base.toFixed(2)}deg at 50% 50%, ${stops.join(
        ", "
    )})`;
}

const BAND_MASK: React.CSSProperties = {
    WebkitMaskImage: "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
    WebkitMaskClip: "content-box, border-box",
    WebkitMaskComposite: "xor",
    maskImage: "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
    maskClip: "content-box, border-box",
    maskComposite: "exclude",
} as React.CSSProperties;

export default function NeonBorder(props: Props) {
    const {
        color = DEFAULTS.color,
        rounded = DEFAULTS.rounded,
        thickness = DEFAULTS.thickness,
        borderSize = DEFAULTS.borderSize,
        glow = DEFAULTS.glow,
        style,
    } = props;

    const rootRef = useRef<HTMLDivElement>(null);
    const sizeRef = useRef({ w: 0, h: 0 });
    const [size, setSize] = useState({ w: 0, h: 0 });

    useEffect(() => {
        const el = rootRef.current;
        if (!el || typeof ResizeObserver === "undefined") return;
        const ro = new ResizeObserver(() => {
            const r = el.getBoundingClientRect();
            if (r.width === sizeRef.current.w && r.height === sizeRef.current.h)
                return;
            sizeRef.current = { w: r.width, h: r.height };
            setSize(sizeRef.current);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const thick = Math.max(1, Math.min(10, thickness));

    const radius =
        (Math.max(0, Math.min(100, rounded)) / 100) *
        (Math.min(size.w, size.h) / 2);

    const amount = Math.max(0, Math.min(100, glow)) / 100;

    const ringAt = (share: number) => thick + amount * MAX_GLOW_REACH * share;
    const glowOuter = 10 + MAX_GLOW_REACH + MAX_GLOW_BLUR * 2;

    const band = (r: number, offset = 0) => (
        <div
            style={{
                position: "absolute",
                inset: offset - r,
                boxSizing: "border-box",
                padding: r,
                borderRadius: radius > 0 ? radius + r : 0,
                background: "var(--arc)",
                ...BAND_MASK,
            }}
        />
    );

    const glowLayer = (
        key: string,
        r: number,
        blurPx: number,
        opacity: number
    ) => (
        <div
            key={key}
            style={{
                position: "absolute",
                inset: -glowOuter,
                boxSizing: "border-box",
                padding: glowOuter,
                borderRadius: radius > 0 ? radius + glowOuter : 0,
                opacity,
                mixBlendMode: "plus-lighter",
                filter: blurPx ? `blur(${blurPx.toFixed(1)}px)` : "none",
                WebkitFilter: blurPx ? `blur(${blurPx.toFixed(1)}px)` : "none",
                ...BAND_MASK,
            } as React.CSSProperties}
        >
            {band(r, glowOuter)}
        </div>
    );

    // start = 0 and 0.5 park the two glow arcs at opposite corners of the
    // perimeter; since there's no animation loop anymore, that's where
    // they stay.
    const glowGroup = (start: number) => (
        <div
            style={
                {
                    position: "absolute",
                    inset: 0,
                    overflow: "visible",
                    pointerEvents: "none",
                    "--arc": buildArc(start, borderSize, size.w, size.h, color),
                } as React.CSSProperties
            }
        >
            {amount > 0 &&
                GLOW_LAYERS.map((l, i) =>
                    glowLayer(`glow-${i}`, ringAt(l.reach), l.blur, l.opacity)
                )}
            {Array.from({ length: EDGE_COPIES }).map((_, i) => (
                <div
                    key={`edge-${i}`}
                    style={{
                        position: "absolute",
                        inset: 0,
                        mixBlendMode: "plus-lighter",
                    } as React.CSSProperties}
                >
                    {band(thick)}
                </div>
            ))}
        </div>
    );

    return (
        <div
            ref={rootRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                flexShrink: 0,
                borderRadius: radius,
                ...style,
            }}
        >
            {glowGroup(0)}
            {glowGroup(0.5)}
        </div>
    );
}
