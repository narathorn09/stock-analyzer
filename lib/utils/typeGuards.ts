import { TIMEFRAMES } from "@/lib/constants"
import type { Timeframe } from "@/lib/types/stock"

export function isValidTimeframe(value: string): value is Timeframe {
  return (TIMEFRAMES as readonly string[]).includes(value)
}

export function isIntradayTimeframe(tf: Timeframe): boolean {
  return ["1m", "5m", "15m", "1h"].includes(tf)
}
