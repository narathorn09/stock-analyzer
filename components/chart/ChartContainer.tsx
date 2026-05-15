"use client"

import {
  CandlestickSeries,
  ColorType,
  createChart,
  createSeriesMarkers,
  HistogramSeries,
  LineSeries,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type SeriesMarker,
  type UTCTimestamp,
} from "lightweight-charts"
import { useEffect, useRef, useState } from "react"

import { COLORS } from "@/lib/constants"
import { useCandles } from "@/lib/hooks/useCandles"
import { useIndicators } from "@/lib/hooks/useIndicators"
import { formatVolumeData } from "@/lib/indicators/volumeAnalysis"
import { useSettings } from "@/lib/store/settings"
import type { Timeframe } from "@/lib/types/stock"
import { formatPrice, formatVolume } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

import { ChartSkeleton } from "./ChartSkeleton"

type Props = { symbol: string; timeframe: Timeframe }

type OHLCBar = {
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export function ChartContainer({ symbol, timeframe }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const [ohlcBar, setOhlcBar] = useState<OHLCBar | null>(null)

  const { candles, isLoading } = useCandles(symbol, timeframe)
  const indicators = useIndicators(candles, timeframe)

  const showPivots = useSettings((s) => s.indicators.pivots)
  const showSwings = useSettings((s) => s.indicators.swings)
  const showVwap = useSettings((s) => s.indicators.vwap)
  const showVolumeMA = useSettings((s) => s.indicators.volumeMA)

  // Create chart once on mount
  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0a0a0a" },
        textColor: "#a1a1aa",
      },
      grid: {
        vertLines: { color: "#18181b" },
        horzLines: { color: "#18181b" },
      },
      crosshair: { vertLine: { color: "#3f3f46" }, horzLine: { color: "#3f3f46" } },
      rightPriceScale: { borderColor: "#27272a" },
      timeScale: { borderColor: "#27272a", timeVisible: true, secondsVisible: false },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    })

    chartRef.current = chart

    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
    }
  }, [])

  // Rebuild series whenever candles, indicators, or toggle settings change
  useEffect(() => {
    const chart = chartRef.current
    if (!chart || !candles?.length) return

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: COLORS.candle.up,
      downColor: COLORS.candle.down,
      borderUpColor: COLORS.candle.up,
      borderDownColor: COLORS.candle.down,
      wickUpColor: COLORS.candle.wickUp,
      wickDownColor: COLORS.candle.wickDown,
    })

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    })

    chart.priceScale("volume").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })
    chart.priceScale("right").applyOptions({ scaleMargins: { top: 0.02, bottom: 0.25 } })

    const sorted = [...candles].sort((a, b) => a.time - b.time)
    const toLC = <T extends { time: number }>(d: T) => ({ ...d, time: d.time as UTCTimestamp })

    candleSeries.setData(sorted.map(toLC))
    volumeSeries.setData(formatVolumeData(sorted).map(toLC))

    // Pivot lines
    if (showPivots && indicators.pivots) {
      const { pivot, r1, r2, r3, s1, s2, s3 } = indicators.pivots
      ;[
        { price: pivot, color: COLORS.indicators.pivot, title: "P" },
        { price: r1, color: COLORS.indicators.resistance[0], title: "R1" },
        { price: r2, color: COLORS.indicators.resistance[1], title: "R2" },
        { price: r3, color: COLORS.indicators.resistance[2], title: "R3" },
        { price: s1, color: COLORS.indicators.support[0], title: "S1" },
        { price: s2, color: COLORS.indicators.support[1], title: "S2" },
        { price: s3, color: COLORS.indicators.support[2], title: "S3" },
      ].forEach((l) =>
        candleSeries.createPriceLine({
          price: l.price,
          color: l.color,
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: l.title,
        })
      )
    }

    // Swing markers
    if (showSwings && indicators.swings.length > 0) {
      const markers: SeriesMarker<UTCTimestamp>[] = indicators.swings.map((s) => ({
        time: s.time as UTCTimestamp,
        position: s.type === "high" ? "aboveBar" : "belowBar",
        shape: s.type === "high" ? "arrowDown" : "arrowUp",
        color: s.type === "high" ? COLORS.indicators.resistance[0] : COLORS.indicators.support[0],
        size: 0.6,
      }))
      createSeriesMarkers(candleSeries, markers)
    }

    let vmaSeries: ISeriesApi<"Line"> | null = null
    if (showVolumeMA && indicators.volumeMA.length) {
      const vmaData = sorted
        .map((c, i) => {
          const v = indicators.volumeMA[i]
          return v != null ? { time: c.time as UTCTimestamp, value: v } : null
        })
        .filter((x): x is NonNullable<typeof x> => x != null)
      vmaSeries = chart.addSeries(LineSeries, {
        color: COLORS.indicators.volumeMA,
        lineWidth: 1,
        priceScaleId: "volume",
        crosshairMarkerVisible: false,
      })
      vmaSeries.setData(vmaData)
    }

    let vwapSeries: ISeriesApi<"Line"> | null = null
    if (showVwap && indicators.vwap) {
      vwapSeries = chart.addSeries(LineSeries, {
        color: COLORS.indicators.vwap,
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        crosshairMarkerVisible: false,
        title: "VWAP",
      })
      vwapSeries.setData(
        indicators.vwap.map((v) => ({ time: v.time as UTCTimestamp, value: v.vwap }))
      )
    }

    chart.timeScale().fitContent()

    // Crosshair OHLC overlay
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleCrosshair = (param: any) => {
      if (!param.time) {
        setOhlcBar(null)
        return
      }
      const bar = param.seriesData.get(candleSeries)
      const vol = param.seriesData.get(volumeSeries)
      if (bar && "open" in bar) {
        setOhlcBar({
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
          volume: vol && "value" in vol ? vol.value : 0,
        })
      } else {
        setOhlcBar(null)
      }
    }
    chart.subscribeCrosshairMove(handleCrosshair)

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshair)
      try {
        chart.removeSeries(candleSeries)
        chart.removeSeries(volumeSeries)
        if (vmaSeries) chart.removeSeries(vmaSeries)
        if (vwapSeries) chart.removeSeries(vwapSeries)
      } catch {
        // chart already removed on unmount
      }
    }
  }, [candles, indicators, showPivots, showSwings, showVolumeMA, showVwap])

  return (
    <div className="relative h-full w-full">
      {/* OHLC crosshair overlay */}
      {ohlcBar && (
        <div className="absolute left-2 top-2 z-10 flex gap-3 rounded bg-zinc-950/80 px-2 py-1 font-mono text-xs backdrop-blur-sm">
          <span>
            <span className="text-zinc-500">O </span>
            <span className="text-zinc-200">{formatPrice(ohlcBar.open)}</span>
          </span>
          <span>
            <span className="text-zinc-500">H </span>
            <span className="text-teal-400">{formatPrice(ohlcBar.high)}</span>
          </span>
          <span>
            <span className="text-zinc-500">L </span>
            <span className="text-red-400">{formatPrice(ohlcBar.low)}</span>
          </span>
          <span>
            <span className="text-zinc-500">C </span>
            <span className={cn(ohlcBar.close >= ohlcBar.open ? "text-teal-400" : "text-red-400")}>
              {formatPrice(ohlcBar.close)}
            </span>
          </span>
          <span>
            <span className="text-zinc-500">V </span>
            <span className="text-zinc-200">{formatVolume(ohlcBar.volume)}</span>
          </span>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20">
          <ChartSkeleton />
        </div>
      )}

      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}
