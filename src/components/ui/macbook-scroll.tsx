import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Command,
  Globe,
  LayoutGrid,
  Mic,
  Moon,
  Play,
  Search,
  SkipBack,
  SkipForward,
  Sun,
  SunDim,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * MacbookScroll — scroll-driven MacBook that opens as the page scrolls.
 * Ported from the Aceternity UI component to this project's stack:
 * framer-motion instead of motion/react, lucide-react instead of
 * @tabler/icons-react, and a plain <img> instead of next/image.
 */
export const MacbookScroll = ({
  src,
  alt = "laptop screen",
  showGradient,
  title,
  badge,
}: {
  src?: string;
  alt?: string;
  showGradient?: boolean;
  title?: string | React.ReactNode;
  badge?: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 768) setIsMobile(true);
  }, []);

  const scaleX = useTransform(scrollYProgress, [0, 0.3], [1.2, isMobile ? 1 : 1.5]);
  const scaleY = useTransform(scrollYProgress, [0, 0.3], [0.6, isMobile ? 1 : 1.5]);
  const translate = useTransform(scrollYProgress, [0, 1], [0, 1500]);
  const rotate = useTransform(scrollYProgress, [0.1, 0.12, 0.3], [-28, -28, 0]);
  const textTransform = useTransform(scrollYProgress, [0, 0.3], [0, 100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div
      ref={ref}
      className="flex min-h-[200vh] shrink-0 scale-[0.35] transform flex-col items-center justify-start py-0 [perspective:800px] sm:scale-50 md:scale-100 md:py-40"
    >
      <motion.h1
        style={{ translateY: textTransform, opacity: textOpacity }}
        className="mb-20 text-center text-3xl font-bold text-foreground"
      >
        {title || (
          <span>
            This Macbook is built with Tailwindcss. <br /> No kidding.
          </span>
        )}
      </motion.h1>

      <Lid src={src} alt={alt} scaleX={scaleX} scaleY={scaleY} rotate={rotate} translate={translate} />

      {/* Base area */}
      <div className="relative -z-10 h-[22rem] w-[32rem] overflow-hidden rounded-2xl bg-gray-200 dark:bg-[#272729]">
        {/* above keyboard bar */}
        <div className="relative h-10 w-full">
          <div className="absolute inset-x-0 mx-auto h-4 w-[80%] bg-[#050505]" />
        </div>
        <div className="relative flex">
          <div className="mx-auto h-full w-[10%] overflow-hidden">
            <SpeakerGrid />
          </div>
          <div className="mx-auto h-full w-[80%]">
            <Keypad />
          </div>
          <div className="mx-auto h-full w-[10%] overflow-hidden">
            <SpeakerGrid />
          </div>
        </div>
        <Trackpad />
        <div className="absolute inset-x-0 bottom-0 mx-auto h-2 w-20 rounded-tl-3xl rounded-tr-3xl bg-gradient-to-t from-[#272729] to-[#050505]" />
        {showGradient && (
          <div className="absolute inset-x-0 bottom-0 z-50 h-40 w-full bg-gradient-to-t from-background via-background to-transparent" />
        )}
        {badge && <div className="absolute bottom-4 left-4">{badge}</div>}
      </div>
    </div>
  );
};

export const Lid = ({
  scaleX,
  scaleY,
  rotate,
  translate,
  src,
  alt = "laptop screen",
}: {
  scaleX: MotionValue<number>;
  scaleY: MotionValue<number>;
  rotate: MotionValue<number>;
  translate: MotionValue<number>;
  src?: string;
  alt?: string;
}) => {
  return (
    <div className="relative [perspective:800px]">
      <div
        style={{ transform: "perspective(800px) rotateX(-25deg) translateZ(0px)", transformOrigin: "bottom", transformStyle: "preserve-3d" }}
        className="relative h-[12rem] w-[32rem] rounded-2xl bg-[#010101] p-2"
      >
        <div
          style={{ boxShadow: "0px 2px 0px 2px #171717 inset" }}
          className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#010101]"
        >
          <span className="text-white">
            <MacbookLogo />
          </span>
        </div>
      </div>

      <motion.div
        style={{ scaleX, scaleY, rotateX: rotate, translateY: translate, transformStyle: "preserve-3d", transformOrigin: "top" }}
        className="absolute inset-0 h-96 w-[32rem] rounded-2xl bg-[#010101] p-2"
      >
        <div className="absolute inset-0 rounded-lg bg-[#272729]" />
        {src ? (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="absolute inset-0 h-full w-full rounded-lg object-cover object-left-top"
          />
        ) : (
          <ScreenFallback />
        )}
      </motion.div>
    </div>
  );
};

/**
 * Shown when no screenshot is supplied — a small, seeded candlestick chart so
 * the lid reads as a market terminal rather than an empty black rectangle.
 */
const ScreenFallback = () => {
  const candles = React.useMemo(() => {
    // mulberry32, same seeded approach used elsewhere in this project
    let a = 7;
    const rng = () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const out: { open: number; high: number; low: number; close: number }[] = [];
    let price = 50;
    for (let i = 0; i < 48; i++) {
      const open = price;
      const close = price + (rng() - 0.47) * 4;
      const wick = 1 + rng() * 2.5;
      out.push({
        open,
        close,
        high: Math.max(open, close) + rng() * wick,
        low: Math.min(open, close) - rng() * wick,
      });
      price = close;
    }
    return out;
  }, []);

  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const max = Math.max(...highs);
  const min = Math.min(...lows);
  const pad = (max - min) * 0.15;
  const VIEW_W = 512;
  const VIEW_H = 384;
  const y = (v: number) => VIEW_H - 40 - ((v - (min - pad)) / (max - min + pad * 2)) * (VIEW_H - 80);
  const barW = VIEW_W / candles.length;

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden rounded-lg bg-[#0a0a0a]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="ml-3 font-mono text-[10px] uppercase tracking-widest text-white/40">
          OrderFlow Edge Lab
        </span>
      </div>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-full w-full" preserveAspectRatio="none">
        {candles.map((c, i) => {
          const cx = i * barW + barW / 2;
          const up = c.close >= c.open;
          const color = up ? "#34d399" : "#f87171";
          const top = y(Math.max(c.open, c.close));
          const bottom = y(Math.min(c.open, c.close));
          return (
            <g key={i}>
              <line x1={cx} x2={cx} y1={y(c.high)} y2={y(c.low)} stroke={color} strokeWidth={1.2} />
              <rect
                x={cx - barW * 0.3}
                y={top}
                width={barW * 0.6}
                height={Math.max(bottom - top, 1)}
                fill={color}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/** Apple mark on the lid — visible while the laptop is closed. */
const MacbookLogo = () => (
  <svg width="46" height="46" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
);

export const Trackpad = () => (
  <div
    className="mx-auto my-1 h-32 w-[40%] rounded-xl"
    style={{ boxShadow: "0px 0px 1px 1px #00000020 inset" }}
  />
);

export const Keypad = () => {
  const icon = "h-[6px] w-[6px]";
  return (
    <div className="mx-1 h-full [transform:translateZ(0)] rounded-md bg-[#050505] p-1 [will-change:transform]">
      {/* Function row */}
      <Row>
        <KBtn className="w-10 items-end justify-start pb-[2px] pl-[4px]" childrenClassName="items-start">
          esc
        </KBtn>
        <KBtn><SunDim className={icon} /><span className="mt-1 inline-block">F1</span></KBtn>
        <KBtn><Sun className={icon} /><span className="mt-1 inline-block">F2</span></KBtn>
        <KBtn><LayoutGrid className={icon} /><span className="mt-1 inline-block">F3</span></KBtn>
        <KBtn><Search className={icon} /><span className="mt-1 inline-block">F4</span></KBtn>
        <KBtn><Mic className={icon} /><span className="mt-1 inline-block">F5</span></KBtn>
        <KBtn><Moon className={icon} /><span className="mt-1 inline-block">F6</span></KBtn>
        <KBtn><SkipBack className={icon} /><span className="mt-1 inline-block">F7</span></KBtn>
        <KBtn><Play className={icon} /><span className="mt-1 inline-block">F8</span></KBtn>
        <KBtn><SkipForward className={icon} /><span className="mt-1 inline-block">F9</span></KBtn>
        <KBtn><VolumeX className={icon} /><span className="mt-1 inline-block">F10</span></KBtn>
        <KBtn><Volume1 className={icon} /><span className="mt-1 inline-block">F11</span></KBtn>
        <KBtn><Volume2 className={icon} /><span className="mt-1 inline-block">F12</span></KBtn>
        <KBtn><div className="h-4 w-4 rounded-full bg-gradient-to-b from-neutral-900 from-20% via-black via-50% to-neutral-900 to-95% p-px"><div className="h-full w-full rounded-full bg-black" /></div></KBtn>
      </Row>

      {/* Number row */}
      <Row>
        <KBtn><span className="block">~</span><span className="mt-1 block">`</span></KBtn>
        {[
          ["!", "1"], ["@", "2"], ["#", "3"], ["$", "4"], ["%", "5"],
          ["^", "6"], ["&", "7"], ["*", "8"], ["(", "9"], [")", "0"],
          ["—", "_"], ["+", "="],
        ].map(([top, bottom]) => (
          <KBtn key={bottom}><span className="block">{top}</span><span className="block">{bottom}</span></KBtn>
        ))}
        <KBtn className="w-10 items-end justify-end pb-[2px] pr-[4px]" childrenClassName="items-end">
          delete
        </KBtn>
      </Row>

      {/* qwerty row */}
      <Row>
        <KBtn className="w-10 items-end justify-start pb-[2px] pl-[4px]" childrenClassName="items-start">
          tab
        </KBtn>
        {["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"].map((k) => (
          <KBtn key={k}><span className="block">{k}</span></KBtn>
        ))}
        <KBtn><span className="block">{"{"}</span><span className="block">{"["}</span></KBtn>
        <KBtn><span className="block">{"}"}</span><span className="block">{"]"}</span></KBtn>
        <KBtn><span className="block">{"|"}</span><span className="block">{"\\"}</span></KBtn>
      </Row>

      {/* asdf row */}
      <Row>
        <KBtn className="w-[2.8rem] items-end justify-start pb-[2px] pl-[4px]" childrenClassName="items-start">
          caps lock
        </KBtn>
        {["A", "S", "D", "F", "G", "H", "J", "K", "L"].map((k) => (
          <KBtn key={k}><span className="block">{k}</span></KBtn>
        ))}
        <KBtn><span className="block">:</span><span className="block">;</span></KBtn>
        <KBtn><span className="block">&quot;</span><span className="block">&apos;</span></KBtn>
        <KBtn className="w-[2.85rem] items-end justify-end pb-[2px] pr-[4px]" childrenClassName="items-end">
          return
        </KBtn>
      </Row>

      {/* zxcv row */}
      <Row>
        <KBtn className="w-[3.65rem] items-end justify-start pb-[2px] pl-[4px]" childrenClassName="items-start">
          shift
        </KBtn>
        {["Z", "X", "C", "V", "B", "N", "M"].map((k) => (
          <KBtn key={k}><span className="block">{k}</span></KBtn>
        ))}
        <KBtn><span className="block">&lt;</span><span className="block">,</span></KBtn>
        <KBtn><span className="block">&gt;</span><span className="block">.</span></KBtn>
        <KBtn><span className="block">?</span><span className="block">/</span></KBtn>
        <KBtn className="w-[3.65rem] items-end justify-end pb-[2px] pr-[4px]" childrenClassName="items-end">
          shift
        </KBtn>
      </Row>

      {/* modifier row */}
      <Row>
        <KBtn className="" childrenClassName="h-full justify-between py-[4px]">
          <div className="flex w-full justify-end pr-1"><span className="block">fn</span></div>
          <div className="flex w-full justify-start pl-1"><Globe className={icon} /></div>
        </KBtn>
        <KBtn className="" childrenClassName="h-full justify-between py-[4px]">
          <div className="flex w-full justify-end pr-1"><ChevronUp className={icon} /></div>
          <div className="flex w-full justify-start pl-1"><span className="block">control</span></div>
        </KBtn>
        <KBtn className="" childrenClassName="h-full justify-between py-[4px]">
          <div className="flex w-full justify-end pr-1"><ChevronUp className={icon} /></div>
          <div className="flex w-full justify-start pl-1"><span className="block">option</span></div>
        </KBtn>
        <KBtn className="w-8" childrenClassName="h-full justify-between py-[4px]">
          <div className="flex w-full justify-end pr-1"><Command className={icon} /></div>
          <div className="flex w-full justify-start pl-1"><span className="block">command</span></div>
        </KBtn>
        <KBtn className="w-[8.2rem]" />
        <KBtn className="w-8" childrenClassName="h-full justify-between py-[4px]">
          <div className="flex w-full justify-start pl-1"><Command className={icon} /></div>
          <div className="flex w-full justify-start pl-1"><span className="block">command</span></div>
        </KBtn>
        <KBtn className="" childrenClassName="h-full justify-between py-[4px]">
          <div className="flex w-full justify-start pl-1"><ChevronUp className={icon} /></div>
          <div className="flex w-full justify-start pl-1"><span className="block">option</span></div>
        </KBtn>
        <div className="mt-[2px] flex h-6 w-[4.9rem] flex-col items-center justify-end rounded-[4px] p-[0.5px]">
          <KBtn className="h-3 w-6"><ChevronUp className={icon} /></KBtn>
          <div className="flex">
            <KBtn className="h-3 w-6"><ChevronLeft className={icon} /></KBtn>
            <KBtn className="h-3 w-6"><ChevronDown className={icon} /></KBtn>
            <KBtn className="h-3 w-6"><ChevronRight className={icon} /></KBtn>
          </div>
        </div>
      </Row>
    </div>
  );
};

export const KBtn = ({
  className,
  children,
  childrenClassName,
  backlit = true,
}: {
  className?: string;
  children?: React.ReactNode;
  childrenClassName?: string;
  backlit?: boolean;
}) => (
  <div
    className={cn("[transform:translateZ(0)] rounded-[4px] p-[0.5px] [will-change:transform]", backlit && "bg-white/[0.2] shadow-xl shadow-white")}
  >
    <div
      className={cn("flex h-6 w-6 items-center justify-center rounded-[3.5px] bg-[#0A090D]", className)}
      style={{ boxShadow: "0px -0.5px 2px 0 #0D0D0F inset, -0.5px 0px 2px 0 #0D0D0F inset" }}
    >
      <div className={cn("flex w-full flex-col items-center justify-center text-[5px] text-neutral-200", childrenClassName, backlit && "text-white")}>
        {children}
      </div>
    </div>
  </div>
);

export const Row = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-[2px] flex w-full flex-shrink-0 gap-[2px]">{children}</div>
);

export const SpeakerGrid = () => (
  <div
    className="mt-2 flex h-40 gap-[2px] px-[0.5px]"
    style={{
      backgroundImage: "radial-gradient(circle, #08080A 0.5px, transparent 0.5px)",
      backgroundSize: "3px 3px",
    }}
  />
);

export default MacbookScroll;
