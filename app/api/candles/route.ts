import { NextRequest } from "next/server"

import { errorToResponse } from "@/lib/api/finnhub"
import { TDAuthError, TDNotFoundError, TDRateLimitError, fetchCandles } from "@/lib/api/twelvedata"
import { TIMEFRAMES } from "@/lib/constants"
import type { Timeframe } from "@/lib/types/stock"
import { isValidTimeframe } from "@/lib/utils/typeGuards"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const symbol = searchParams.get("symbol")?.trim().toUpperCase()
  const tfParam = searchParams.get("tf")?.trim()

  if (!symbol) {
    return Response.json(
      { error: "Missing required param: symbol", code: "INVALID_PARAMS" },
      { status: 400 }
    )
  }

  if (!tfParam || !isValidTimeframe(tfParam)) {
    return Response.json(
      {
        error: `Invalid timeframe. Must be one of: ${TIMEFRAMES.join(", ")}`,
        code: "INVALID_PARAMS",
      },
      { status: 400 }
    )
  }

  const tf = tfParam as Timeframe

  try {
    const candles = await fetchCandles(symbol, tf)

    const isIntraday = tf !== "1d"
    const cacheSeconds = isIntraday ? 30 : 300

    return Response.json(
      { symbol, timeframe: tf, candles },
      { headers: { "Cache-Control": `s-maxage=${cacheSeconds}, stale-while-revalidate=60` } }
    )
  } catch (err) {
    if (err instanceof TDRateLimitError) {
      return Response.json({ error: err.message, code: err.code }, { status: 429 })
    }
    if (err instanceof TDNotFoundError) {
      return Response.json({ error: err.message, code: err.code }, { status: 404 })
    }
    if (err instanceof TDAuthError) {
      return Response.json({ error: err.message, code: err.code }, { status: 403 })
    }
    return errorToResponse(err)
  }
}
