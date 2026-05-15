import type { Timeframe } from "./stock"

export type Theme = "dark" | "light"

export type IndicatorVisibility = {
  pivots: boolean
  swings: boolean
  vwap: boolean
  volumeMA: boolean
}

export type AppSettings = {
  theme: Theme
  defaultTimeframe: Timeframe
  indicators: IndicatorVisibility
}
