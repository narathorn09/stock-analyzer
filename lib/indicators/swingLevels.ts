import type { Candle } from "@/lib/types/stock"
import type { SwingPoint } from "@/lib/types/indicators"

// Detect swing highs and lows using a lookback window
export function findSwingPoints(candles: Candle[], lookback = 5): SwingPoint[] {
  const swings: SwingPoint[] = []

  for (let i = lookback; i < candles.length - lookback; i++) {
    const window = candles.slice(i - lookback, i + lookback + 1)
    const current = candles[i]
    const isHigh = window.every((c) => c.high <= current.high)
    const isLow = window.every((c) => c.low >= current.low)

    if (isHigh) {
      swings.push({ time: current.time, price: current.high, type: "high", strength: lookback })
    } else if (isLow) {
      swings.push({ time: current.time, price: current.low, type: "low", strength: lookback })
    }
  }

  return swings
}
