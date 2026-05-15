"use client"

import useSWR from "swr"

import type { SearchResponse } from "@/lib/types/api"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useStockSearch(query: string) {
  const { data, isLoading } = useSWR<SearchResponse>(
    query.trim().length >= 1 ? `/api/search?q=${encodeURIComponent(query)}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )
  return { results: data?.results ?? [], isLoading }
}
