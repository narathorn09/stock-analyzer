import type { FinnhubResolution } from "@/lib/types/api"
import type { AppSettings } from "@/lib/types/settings"
import type { Timeframe } from "@/lib/types/stock"

// Re-export Timeframe for convenience
export type { Timeframe }

export const TIMEFRAMES = [
  "1m",
  "5m",
  "15m",
  "1h",
  "4h",
  "1d",
] as const satisfies readonly Timeframe[]

export const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  "1m": "1 Min",
  "5m": "5 Min",
  "15m": "15 Min",
  "1h": "1 Hour",
  "4h": "4 Hour",
  "1d": "1 Day",
}

// 4h is not native in Finnhub — aggregated from 60-min candles in the API layer
export const FINNHUB_RESOLUTION_MAP: Record<Timeframe, FinnhubResolution | null> = {
  "1m": "1",
  "5m": "5",
  "15m": "15",
  "1h": "60",
  "4h": null,
  "1d": "D",
}

export const COLORS = {
  candle: {
    up: "#26a69a",
    down: "#ef5350",
    wickUp: "#26a69a",
    wickDown: "#ef5350",
  },
  volume: {
    up: "#26a69a80",
    down: "#ef535080",
  },
  indicators: {
    pivot: "#FFA500",
    resistance: ["#FF6B6B", "#FF4444", "#CC0000"],
    support: ["#51CF66", "#37B24D", "#2B8A3E"],
    vwap: "#FF9800",
    volumeMA: "#7E57C2",
  },
} as const

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  defaultTimeframe: "1d",
  indicators: {
    pivots: true,
    swings: true,
    vwap: false,
    volumeMA: true,
  },
}
