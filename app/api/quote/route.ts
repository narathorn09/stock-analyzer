import { NextRequest } from "next/server"

import { errorToResponse, finnhub } from "@/lib/api/finnhub"

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.trim().toUpperCase()

  if (!symbol) {
    return Response.json(
      { error: "Missing required param: symbol", code: "INVALID_PARAMS" },
      { status: 400 }
    )
  }

  try {
    const raw = await finnhub.getQuote(symbol)

    if (!raw.c) {
      return Response.json({ error: "Symbol not found", code: "NOT_FOUND" }, { status: 404 })
    }

    const quote = {
      symbol,
      price: raw.c,
      change: raw.d,
      changePercent: raw.dp,
      high: raw.h,
      low: raw.l,
      open: raw.o,
      previousClose: raw.pc,
      timestamp: raw.t,
    }

    return Response.json(quote, {
      headers: { "Cache-Control": "s-maxage=10, stale-while-revalidate=30" },
    })
  } catch (err) {
    return errorToResponse(err)
  }
}
