"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import type { Timeframe } from "@/lib/types/stock"

const KEY_MAP: Record<string, Timeframe> = {
  "1": "1m",
  "5": "5m",
  f: "15m",
  h: "1h",
  "4": "4h",
  d: "1d",
}

export function useTimeframeShortcuts(symbol: string, current: Timeframe) {
  const router = useRouter()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const tf = KEY_MAP[e.key.toLowerCase()]
      if (tf && tf !== current) {
        router.push(`/stock/${symbol}?tf=${tf}`)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [symbol, current, router])
}
