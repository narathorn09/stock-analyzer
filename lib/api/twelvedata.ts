import type { Candle, Timeframe } from "@/lib/types/stock"
import { etStringToUnix } from "@/lib/utils/date"

const BASE_URL = "https://api.twelvedata.com"

// Twelve Data has native 4H — no aggregation needed
const TD_INTERVAL: Record<Timeframe, string> = {
  "1m": "1min",
  "5m": "5min",
  "15m": "15min",
  "1h": "1h",
  "4h": "4h",
  "1d": "1day",
}

// Number of bars to request per timeframe
const TD_OUTPUTSIZE: Record<Timeframe, number> = {
  "1m": 390, // 1 trading day
  "5m": 390, // ~5 trading days
  "15m": 572, // ~1 month (22 days × 26 bars)
  "1h": 400, // ~3 months
  "4h": 360, // ~6 months
  "1d": 252, // ~1 year
}

type TDValue = {
  datetime: string
  open: string
  high: string
  low: string
  close: string
  volume: string
}

type TDResponse = {
  meta?: { symbol: string; interval: string; exchange_timezone: string }
  values?: TDValue[]
  status: "ok" | "error"
  code?: number
  message?: string
}

export class TDRateLimitError extends Error {
  readonly code = "RATE_LIMIT" as const
  constructor() {
    super("Twelve Data rate limit reached (8 requests/min or 800 credits/day on free tier).")
    this.name = "TDRateLimitError"
  }
}

export class TDNotFoundError extends Error {
  readonly code = "NOT_FOUND" as const
  constructor(symbol: string) {
    super(`No data found for symbol: ${symbol}`)
    this.name = "TDNotFoundError"
  }
}

export class TDAuthError extends Error {
  readonly code = "AUTH" as const
  constructor() {
    super("Invalid Twelve Data API key.")
    this.name = "TDAuthError"
  }
}

async function tdFetch(
  params: Record<string, string | number>,
  revalidate = 30
): Promise<TDResponse> {
  const url = new URL(`${BASE_URL}/time_series`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  url.searchParams.set("apikey", process.env.TWELVE_DATA_API_KEY ?? "")

  const res = await fetch(url.toString(), { next: { revalidate } })
  if (!res.ok) throw new Error(`Twelve Data HTTP ${res.status}`)

  const data = (await res.json()) as TDResponse

  if (data.status === "error") {
    if (data.code === 429) throw new TDRateLimitError()
    if (data.code === 401 || data.code === 403) throw new TDAuthError()
    if (data.code === 400 || data.code === 404)
      throw new TDNotFoundError(String(params.symbol ?? ""))
    throw new Error(data.message ?? "Twelve Data error")
  }

  return data
}

function transformValues(values: TDValue[]): Candle[] {
  return (
    values
      .map((v) => ({
        time: etStringToUnix(v.datetime),
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: parseFloat(v.volume),
      }))
      // TD returns newest-first by default; sort ascending for the chart
      .sort((a, b) => a.time - b.time)
  )
}

export async function fetchCandles(symbol: string, tf: Timeframe): Promise<Candle[]> {
  const isIntraday = tf !== "1d"
  const revalidate = isIntraday ? 30 : 300

  const data = await tdFetch(
    {
      symbol,
      interval: TD_INTERVAL[tf],
      outputsize: TD_OUTPUTSIZE[tf],
      order: "DESC", // newest-first; we sort ascending in transformValues
    },
    revalidate
  )

  if (!data.values || data.values.length === 0) {
    throw new TDNotFoundError(symbol)
  }

  return transformValues(data.values)
}
