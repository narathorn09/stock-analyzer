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
    const raw = await finnhub.getProfile(symbol)

    if (!raw.name) {
      return Response.json({ error: "Symbol not found", code: "NOT_FOUND" }, { status: 404 })
    }

    const profile = {
      symbol: raw.ticker ?? symbol,
      name: raw.name,
      exchange: raw.exchange,
      industry: raw.finnhubIndustry,
      marketCap: raw.marketCapitalization,
      logo: raw.logo,
      weburl: raw.weburl,
    }

    return Response.json(profile, { headers: { "Cache-Control": "s-maxage=86400" } })
  } catch (err) {
    return errorToResponse(err)
  }
}
