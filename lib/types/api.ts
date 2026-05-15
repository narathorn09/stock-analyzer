import type { Candle, Timeframe } from "./stock"

// Internal API wrapper
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

export type SearchResponse = {
  results: Array<{
    symbol: string
    description: string
  }>
}

export type CandlesResponse = {
  symbol: string
  timeframe: Timeframe
  candles: Candle[]
}

// --- Finnhub raw response types ---

export type FinnhubSymbolSearchResponse = {
  count: number
  result: Array<{
    description: string // "APPLE INC"
    displaySymbol: string // "AAPL"
    symbol: string // "AAPL"
    type: string // "Common Stock"
  }>
}

export type FinnhubResolution = "1" | "5" | "15" | "30" | "60" | "D" | "W" | "M"

export type FinnhubCandleParams = {
  symbol: string
  resolution: FinnhubResolution
  from: number // Unix timestamp
  to: number // Unix timestamp
}

export type FinnhubCandleResponse = {
  c: number[] // close prices
  h: number[] // high prices
  l: number[] // low prices
  o: number[] // open prices
  s: "ok" | "no_data"
  t: number[] // timestamps (Unix seconds)
  v: number[] // volumes
}

export type FinnhubQuoteResponse = {
  c: number // current price
  d: number // change
  dp: number // percent change
  h: number // high of the day
  l: number // low of the day
  o: number // open of the day
  pc: number // previous close
  t: number // timestamp
}

export type FinnhubCompanyProfile = {
  country: string
  currency: string
  exchange: string
  ipo: string
  marketCapitalization: number
  name: string
  phone: string
  shareOutstanding: number
  ticker: string
  weburl: string
  logo: string
  finnhubIndustry: string
}
