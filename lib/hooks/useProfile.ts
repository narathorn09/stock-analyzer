"use client"

import useSWR from "swr"

import type { Stock } from "@/lib/types/stock"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useProfile(symbol: string) {
  const { data, error, isLoading } = useSWR<Stock>(
    symbol ? `/api/profile?symbol=${symbol}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )
  return { profile: data, error, isLoading }
}
