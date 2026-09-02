export function formatPrice(price: number, tickSize: number): string {
  const decimals = tickSize < 1 ? 2 : 0;
  return price.toFixed(decimals);
}

export function formatPercent(value: number | null | undefined, decimals = 0): string {
  if (value == null) return "N/A";
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatR(value: number | null | undefined, decimals = 2): string {
  if (value == null) return "N/A";
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}R`;
}

export function formatSigned(value: number | null | undefined, decimals = 2): string {
  if (value == null) return "N/A";
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}`;
}

export function formatTime(iso: string, timezone: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  });
}

export function formatDate(iso: string, timezone: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: timezone,
  });
}
