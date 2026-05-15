"use client"

import useSWR from "swr"

import type { Quote } from "@/lib/types/stock"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useQuote(symbol: string) {
  const { data, error, isLoading } = useSWR<Quote>(
    symbol ? `/api/quote?symbol=${symbol}` : null,
    fetcher,
    { refreshInterval: 10_000 }
  )
  return { quote: data, error, isLoading }
}
