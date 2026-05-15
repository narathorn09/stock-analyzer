import type { Candle } from "@/lib/types/stock"
import type { VolumeStats } from "@/lib/types/indicators"

export function calculateVolumeMA(candles: Candle[], period = 20): (number | null)[] {
  return candles.map((_, i) => {
    if (i < period - 1) return null
    const slice = candles.slice(i - period + 1, i + 1)
    return slice.reduce((sum, c) => sum + c.volume, 0) / period
  })
}

export function getVolumeStats(candles: Candle[], period = 20): VolumeStats {
  const ma = calculateVolumeMA(candles, period)
  const lastIdx = candles.length - 1
  const current = candles[lastIdx]?.volume ?? 0
  const average20 = ma[lastIdx] ?? 0
  const ratio = average20 > 0 ? current / average20 : 0

  let status: VolumeStats["status"] = "normal"
  if (ratio >= 1.5) status = "high"
  else if (ratio <= 0.5) status = "low"

  return { current, average20, ratio, status }
}

export function formatVolumeData(candles: Candle[]) {
  return candles.map((c) => ({
    time: c.time,
    value: c.volume,
    color: c.close >= c.open ? "#26a69a" : "#ef5350",
  }))
}
