// Indian Rupee formatting helpers
export function formatINR(value: number, opts: { compact?: boolean; decimals?: number } = {}) {
  const { compact = false, decimals = 0 } = opts;
  if (!isFinite(value)) return "—";
  if (compact) {
    const abs = Math.abs(value);
    if (abs >= 1e7) return `₹${(value / 1e7).toFixed(2)} Cr`;
    if (abs >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`;
    if (abs >= 1e3) return `₹${(value / 1e3).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

export function formatPct(value: number, decimals = 1) {
  return `${value.toFixed(decimals)}%`;
}

export function parseNum(value: string | number): number {
  if (typeof value === "number") return value;
  const n = parseFloat(value.replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}
