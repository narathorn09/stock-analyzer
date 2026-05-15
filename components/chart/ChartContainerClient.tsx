"use client"

import dynamic from "next/dynamic"

import { ChartSkeleton } from "./ChartSkeleton"
import type { Timeframe } from "@/lib/types/stock"

const ChartContainer = dynamic(
  () => import("./ChartContainer").then((m) => ({ default: m.ChartContainer })),
  { ssr: false, loading: () => <ChartSkeleton /> }
)

export function ChartContainerClient({
  symbol,
  timeframe,
}: {
  symbol: string
  timeframe: Timeframe
}) {
  return <ChartContainer symbol={symbol} timeframe={timeframe} />
}
