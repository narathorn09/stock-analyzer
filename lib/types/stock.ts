export type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d"

export type Candle = {
  time: number // Unix timestamp (seconds)
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type Stock = {
  symbol: string
  name: string
  exchange: string
  industry?: string
  marketCap?: number
  logo?: string
}

export type Quote = {
  symbol: string
  price: number
  change: number
  changePercent: number
  high: number // day high
  low: number // day low
  open: number // day open
  previousClose: number
  timestamp: number
}

export type WatchlistItem = {
  symbol: string
  addedAt: number
  addedPrice?: number
  notes?: string
}
