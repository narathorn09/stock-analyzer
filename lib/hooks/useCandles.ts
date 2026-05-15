"use client"

import useSWR from "swr"

import type { CandlesResponse } from "@/lib/types/api"
import type { Candle, Timeframe } from "@/lib/types/stock"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const REFRESH_INTERVAL: Record<Timeframe, number> = {
  "1m": 30_000,
  "5m": 30_000,
  "15m": 60_000,
  "1h": 60_000,
  "4h": 300_000,
  "1d": 300_000,
}

export function useCandles(symbol: string, tf: Timeframe) {
  const { data, error, isLoading } = useSWR<CandlesResponse>(
    symbol ? `/api/candles?symbol=${symbol}&tf=${tf}` : null,
    fetcher,
    { refreshInterval: REFRESH_INTERVAL[tf] }
  )
  return { candles: data?.candles as Candle[] | undefined, error, isLoading }
}
