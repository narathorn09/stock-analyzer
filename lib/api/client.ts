import type { CandlesResponse, SearchResponse } from "@/lib/types/api"
import type { Quote, Stock, Timeframe } from "@/lib/types/stock"

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }))
    throw new Error(body.error ?? "Request failed")
  }
  return res.json() as Promise<T>
}

export const apiClient = {
  searchStocks: (q: string) => apiFetch<SearchResponse>(`/api/search?q=${encodeURIComponent(q)}`),

  getCandles: (symbol: string, tf: Timeframe) =>
    apiFetch<CandlesResponse>(`/api/candles?symbol=${encodeURIComponent(symbol)}&tf=${tf}`),

  getQuote: (symbol: string) => apiFetch<Quote>(`/api/quote?symbol=${encodeURIComponent(symbol)}`),

  getProfile: (symbol: string) =>
    apiFetch<Stock>(`/api/profile?symbol=${encodeURIComponent(symbol)}`),
}
