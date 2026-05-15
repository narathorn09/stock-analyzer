"use client"

import { useMemo } from "react"

import { calculatePivotsFromCandles } from "@/lib/indicators/pivotPoints"
import { findSwingPoints } from "@/lib/indicators/swingLevels"
import { calculateVolumeMA, getVolumeStats } from "@/lib/indicators/volumeAnalysis"
import { calculateVWAP } from "@/lib/indicators/vwap"
import type { Candle, Timeframe } from "@/lib/types/stock"
import { isIntradayTimeframe } from "@/lib/utils/typeGuards"

export function useIndicators(candles: Candle[] | undefined, tf: Timeframe) {
  return useMemo(() => {
    if (!candles || candles.length === 0) {
      return { pivots: null, swings: [], volumeMA: [], volumeStats: null, vwap: null }
    }
    return {
      pivots: calculatePivotsFromCandles(candles),
      swings: findSwingPoints(candles),
      volumeMA: calculateVolumeMA(candles),
      volumeStats: getVolumeStats(candles),
      vwap: isIntradayTimeframe(tf) ? calculateVWAP(candles) : null,
    }
  }, [candles, tf])
}
