import type { Candle } from "@/lib/types/stock"
import type { PivotLevels } from "@/lib/types/indicators"

export type { PivotLevels }

export type PivotInput = { high: number; low: number; close: number }

export function calculatePivotPoints({ high, low, close }: PivotInput): PivotLevels {
  const pivot = (high + low + close) / 3
  const range = high - low
  return {
    pivot,
    r1: 2 * pivot - low,
    r2: pivot + range,
    r3: high + 2 * (pivot - low),
    s1: 2 * pivot - high,
    s2: pivot - range,
    s3: low - 2 * (high - pivot),
  }
}

// Uses the second-to-last candle as the "previous completed period"
export function calculatePivotsFromCandles(candles: Candle[]): PivotLevels | null {
  if (candles.length < 2) return null
  const prev = candles[candles.length - 2]
  return calculatePivotPoints({ high: prev.high, low: prev.low, close: prev.close })
}
