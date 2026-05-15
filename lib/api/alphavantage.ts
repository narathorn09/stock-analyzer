import { aggregateTo4H } from "@/lib/api/finnhub"
import type { Candle, Timeframe } from "@/lib/types/stock"
import { etStringToUnix, getDefaultRange } from "@/lib/utils/date"

const BASE_URL = "https://www.alphavantage.co/query"

type AVInterval = "1min" | "5min" | "15min" | "60min"

type OHLCVEntry = {
  "1. open": string
  "2. high": string
  "3. low": string
  "4. close": string
  "5. volume": string
}

type AVResponse = {
  "Error Message"?: string
  Information?: string // appears when rate limited
  [key: string]: unknown
}

// Interval to use for AV requests (4h fetches 60min then aggregates)
const AV_INTERVAL_MAP: Partial<Record<Timeframe, AVInterval>> = {
  "1m": "1min",
  "5m": "5min",
  "15m": "15min",
  "1h": "60min",
  "4h": "60min",
}

export class AVRateLimitError extends Error {
  readonly code = "RATE_LIMIT" as const
  constructor() {
    super("Alpha Vantage rate limit reached. Free tier allows 25 requests/day.")
    this.name = "AVRateLimitError"
  }
}

export class AVNotFoundError extends Error {
  readonly code = "NOT_FOUND" as const
  constructor(symbol: string) {
    super(`No data found for symbol: ${symbol}`)
    this.name = "AVNotFoundError"
  }
}

function parseTimeSeries(series: Record<string, OHLCVEntry>, from: number, to: number): Candle[] {
  return Object.entries(series)
    .map(([timeStr, v]) => ({
      time: etStringToUnix(timeStr),
      open: parseFloat(v["1. open"]),
      high: parseFloat(v["2. high"]),
      low: parseFloat(v["3. low"]),
      close: parseFloat(v["4. close"]),
      volume: parseFloat(v["5. volume"]),
    }))
    .filter((c) => c.time >= from && c.time <= to)
    .sort((a, b) => a.time - b.time) // AV returns newest-first; sort ascending
}

async function avFetch<T extends AVResponse>(
  params: Record<string, string>,
  revalidate = 30
): Promise<T> {
  const url = new URL(BASE_URL)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  url.searchParams.set("apikey", process.env.ALPHA_VANTAGE_API_KEY ?? "")

  const res = await fetch(url.toString(), { next: { revalidate } })
  if (!res.ok) throw new Error(`Alpha Vantage HTTP ${res.status}`)

  const data = (await res.json()) as T

  if (data["Information"]) throw new AVRateLimitError()
  if (data["Error Message"]) return data // caller checks for missing series

  return data
}

export async function fetchCandles(symbol: string, tf: Timeframe): Promise<Candle[]> {
  const { from, to } = getDefaultRange(tf)

  if (tf === "1d") {
    const data = await avFetch<AVResponse>(
      { function: "TIME_SERIES_DAILY", symbol, outputsize: "full" },
      300 // cache 5 min for daily
    )
    const series = data["Time Series (Daily)"] as Record<string, OHLCVEntry> | undefined
    if (!series) throw new AVNotFoundError(symbol)
    return parseTimeSeries(series, from, to)
  }

  const interval = AV_INTERVAL_MAP[tf]
  if (!interval) throw new Error(`Unsupported timeframe: ${tf}`)

  const data = await avFetch<AVResponse>({
    function: "TIME_SERIES_INTRADAY",
    symbol,
    interval,
    outputsize: "full",
  })

  const seriesKey = `Time Series (${interval})`
  const series = data[seriesKey] as Record<string, OHLCVEntry> | undefined
  if (!series) throw new AVNotFoundError(symbol)

  const candles = parseTimeSeries(series, from, to)
  return tf === "4h" ? aggregateTo4H(candles) : candles
}
