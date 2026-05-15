import type {
  FinnhubCandleParams,
  FinnhubCandleResponse,
  FinnhubCompanyProfile,
  FinnhubQuoteResponse,
  FinnhubSymbolSearchResponse,
} from "@/lib/types/api"
import type { Candle } from "@/lib/types/stock"

const BASE_URL = "https://finnhub.io/api/v1"

class FinnhubClient {
  private apiKey: string

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("FINNHUB_API_KEY is required")
    this.apiKey = apiKey
  }

  private async request<T>(
    endpoint: string,
    params: Record<string, string | number> = {},
    revalidate = 30
  ): Promise<T> {
    const url = new URL(`${BASE_URL}${endpoint}`)
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
    url.searchParams.set("token", this.apiKey)

    const res = await fetch(url.toString(), { next: { revalidate } })

    if (res.status === 429) throw new RateLimitError()
    // 403 can mean invalid key OR subscription required
    if (res.status === 403) throw new AuthError()
    if (!res.ok) throw new Error(`Finnhub ${res.status}: ${res.statusText}`)

    return res.json() as Promise<T>
  }

  searchSymbol(query: string) {
    return this.request<FinnhubSymbolSearchResponse>("/search", { q: query }, 3600)
  }

  getCandles(params: FinnhubCandleParams) {
    return this.request<FinnhubCandleResponse>("/stock/candle", params, 30)
  }

  getQuote(symbol: string) {
    return this.request<FinnhubQuoteResponse>("/quote", { symbol }, 10)
  }

  getProfile(symbol: string) {
    return this.request<FinnhubCompanyProfile>("/stock/profile2", { symbol }, 86400)
  }
}

export class RateLimitError extends Error {
  readonly code = "RATE_LIMIT" as const
  constructor() {
    super("Rate limit exceeded. Please try again shortly.")
    this.name = "RateLimitError"
  }
}

export class AuthError extends Error {
  readonly code = "AUTH" as const
  constructor() {
    super("Access denied — check API key or subscription plan.")
    this.name = "AuthError"
  }
}

export function transformCandles(res: FinnhubCandleResponse): Candle[] {
  if (res.s !== "ok") return []
  return res.t.map((time, i) => ({
    time,
    open: res.o[i],
    high: res.h[i],
    low: res.l[i],
    close: res.c[i],
    volume: res.v[i],
  }))
}

// Finnhub has no native 4H — aggregate every 4 consecutive 1H candles
export function aggregateTo4H(hourly: Candle[]): Candle[] {
  const result: Candle[] = []
  for (let i = 0; i < hourly.length; i += 4) {
    const group = hourly.slice(i, i + 4)
    if (group.length === 0) continue
    result.push({
      time: group[0].time,
      open: group[0].open,
      high: Math.max(...group.map((c) => c.high)),
      low: Math.min(...group.map((c) => c.low)),
      close: group[group.length - 1].close,
      volume: group.reduce((sum, c) => sum + c.volume, 0),
    })
  }
  return result
}

export function errorToResponse(err: unknown): Response {
  if (err instanceof RateLimitError) {
    return Response.json({ error: err.message, code: err.code }, { status: 429 })
  }
  if (err instanceof AuthError) {
    return Response.json({ error: err.message, code: err.code }, { status: 403 })
  }
  console.error("[finnhub]", err)
  return Response.json({ error: "Internal server error", code: "INTERNAL" }, { status: 500 })
}

export const finnhub = new FinnhubClient(process.env.FINNHUB_API_KEY ?? "")
