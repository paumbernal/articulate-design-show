import type { OHLCVBar } from "../types";

/**
 * Client-side mirror of engine/src/edge_lab/features/volume_profile.py.
 * Runs over already-fetched bars for a selected range — no dedicated API
 * endpoint exists for this (or needs to), it's cheap arithmetic over data
 * the Market Data pane has already loaded.
 */

export interface VolumeProfileLevel {
  price: number;
  volume: number;
}

export interface VolumeProfileResult {
  levels: VolumeProfileLevel[];
  poc: number;
  vah: number;
  val: number;
  valueAreaVolumePct: number;
  highVolumeNodes: number[];
  lowVolumeNodes: number[];
  totalVolume: number;
}

function bucketPrice(price: number, bucketSize: number): number {
  return Math.round(Math.round(price / bucketSize) * bucketSize * 1e8) / 1e8;
}

export function computeVolumeProfile(
  bars: OHLCVBar[],
  tickSize: number,
  bucketTicks = 4,
  valueAreaPct = 0.7,
): VolumeProfileResult {
  if (bars.length === 0) {
    return {
      levels: [],
      poc: 0,
      vah: 0,
      val: 0,
      valueAreaVolumePct: 0,
      highVolumeNodes: [],
      lowVolumeNodes: [],
      totalVolume: 0,
    };
  }

  const bucketSize = tickSize * bucketTicks;
  const volumeByBucket = new Map<number, number>();

  for (const bar of bars) {
    const lowBucket = bucketPrice(bar.low, bucketSize);
    const highBucket = bucketPrice(bar.high, bucketSize);
    const nBuckets = Math.max(1, Math.round((highBucket - lowBucket) / bucketSize) + 1);
    const volumePerBucket = bar.volume / nBuckets;
    for (let i = 0; i < nBuckets; i++) {
      const price = Math.round((lowBucket + i * bucketSize) * 1e8) / 1e8;
      volumeByBucket.set(price, (volumeByBucket.get(price) ?? 0) + volumePerBucket);
    }
  }

  const sortedPrices = Array.from(volumeByBucket.keys()).sort((a, b) => a - b);
  const levels = sortedPrices.map((p) => ({ price: p, volume: volumeByBucket.get(p) as number }));
  const totalVolume = levels.reduce((s, l) => s + l.volume, 0);

  let pocPrice = sortedPrices[0];
  let pocVolume = volumeByBucket.get(pocPrice) as number;
  for (const p of sortedPrices) {
    const v = volumeByBucket.get(p) as number;
    if (v > pocVolume) {
      pocPrice = p;
      pocVolume = v;
    }
  }
  const pocIdx = sortedPrices.indexOf(pocPrice);

  let lowIdx = pocIdx;
  let highIdx = pocIdx;
  let accumulated = pocVolume;
  const target = valueAreaPct * totalVolume;

  while (accumulated < target && (lowIdx > 0 || highIdx < sortedPrices.length - 1)) {
    const volBelow = lowIdx > 0 ? (volumeByBucket.get(sortedPrices[lowIdx - 1]) as number) : -1;
    const volAbove =
      highIdx < sortedPrices.length - 1 ? (volumeByBucket.get(sortedPrices[highIdx + 1]) as number) : -1;
    if (volAbove >= volBelow) {
      highIdx += 1;
      accumulated += volumeByBucket.get(sortedPrices[highIdx]) as number;
    } else {
      lowIdx -= 1;
      accumulated += volumeByBucket.get(sortedPrices[lowIdx]) as number;
    }
  }

  const val = sortedPrices[lowIdx];
  const vah = sortedPrices[highIdx];

  const volumes = sortedPrices.map((p) => volumeByBucket.get(p) as number);
  const meanVol = totalVolume / volumes.length;
  const variance = volumes.reduce((s, v) => s + (v - meanVol) ** 2, 0) / volumes.length;
  const stdVol = Math.sqrt(variance);

  const highVolumeNodes = sortedPrices.filter((p, i) => {
    const v = volumes[i];
    return (
      v > meanVol + stdVol &&
      (i === 0 || v >= volumes[i - 1]) &&
      (i === volumes.length - 1 || v >= volumes[i + 1])
    );
  });
  const lowVolumeNodes = sortedPrices.filter((p, i) => {
    const v = volumes[i];
    return (
      v < Math.max(meanVol - stdVol, 0) &&
      (i === 0 || v <= volumes[i - 1]) &&
      (i === volumes.length - 1 || v <= volumes[i + 1])
    );
  });

  return {
    levels,
    poc: pocPrice,
    vah,
    val,
    valueAreaVolumePct: totalVolume ? accumulated / totalVolume : 0,
    highVolumeNodes,
    lowVolumeNodes,
    totalVolume,
  };
}
