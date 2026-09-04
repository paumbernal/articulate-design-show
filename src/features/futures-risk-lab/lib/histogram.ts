export interface HistogramBin {
  binStart: number;
  binEnd: number;
  midpoint: number;
  count: number;
}

/** Buckets `values` into `binCount` equal-width bins spanning their min/max. */
export function buildHistogram(values: ArrayLike<number>, binCount: number): HistogramBin[] {
  const n = values.length;
  if (n === 0 || binCount <= 0) return [];

  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < n; i++) {
    if (values[i] < min) min = values[i];
    if (values[i] > max) max = values[i];
  }

  if (min === max) {
    return [{ binStart: min, binEnd: max, midpoint: min, count: n }];
  }

  const width = (max - min) / binCount;
  const bins: HistogramBin[] = Array.from({ length: binCount }, (_, i) => ({
    binStart: min + i * width,
    binEnd: min + (i + 1) * width,
    midpoint: min + (i + 0.5) * width,
    count: 0,
  }));

  for (let i = 0; i < n; i++) {
    const idx = Math.min(binCount - 1, Math.floor((values[i] - min) / width));
    bins[idx].count++;
  }

  return bins;
}
