export function formatCurrency(value: number, decimals = 0): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatSignedCurrency(value: number, decimals = 0): string {
  const formatted = formatCurrency(Math.abs(value), decimals);
  return value < 0 ? `-${formatted}` : `+${formatted}`;
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value == null || Number.isNaN(value)) return "N/A";
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatR(value: number | null | undefined, decimals = 2): string {
  if (value == null || Number.isNaN(value)) return "N/A";
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}R`;
}

export function formatCompactNumber(value: number): string {
  return value.toLocaleString("en-US");
}

export function formatCompactCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  });
}

/**
 * VaR/CVaR are computed as -percentile(P&L). When a strategy's edge is strong relative to the
 * simulated horizon, even the tail percentile of terminal P&L can be positive (a gain) — which
 * makes the raw VaR value negative. A bare "-$X" in that case reads as a loss to anyone skimming
 * the dashboard, when it actually means the opposite: no loss occurred even in that tail, with a
 * guaranteed minimum gain of $X. This formats both cases unambiguously.
 */
export function formatLossMetric(value: number): { text: string; isActualLoss: boolean } {
  if (value > 0) {
    return { text: formatCurrency(value), isActualLoss: true };
  }
  return { text: `Min. gain ${formatCurrency(-value)}`, isActualLoss: false };
}
