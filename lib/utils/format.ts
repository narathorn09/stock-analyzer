export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : ""
  return `${sign}${change.toFixed(2)}`
}

export function formatPercent(pct: number): string {
  const sign = pct >= 0 ? "+" : ""
  return `${sign}${pct.toFixed(2)}%`
}

export function formatVolume(vol: number): string {
  if (vol >= 1_000_000_000) return `${(vol / 1_000_000_000).toFixed(2)}B`
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`
  return vol.toString()
}

// Finnhub marketCapitalization is in millions USD
export function formatMarketCap(capInMillions: number): string {
  if (capInMillions >= 1_000_000) return `$${(capInMillions / 1_000_000).toFixed(2)}T`
  if (capInMillions >= 1_000) return `$${(capInMillions / 1_000).toFixed(2)}B`
  return `$${capInMillions.toFixed(0)}M`
}

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}x`
}
