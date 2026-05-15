import { NextRequest } from "next/server"

import { errorToResponse, finnhub } from "@/lib/api/finnhub"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim()

  if (!q || q.length < 1) {
    return Response.json({ results: [] })
  }

  try {
    const data = await finnhub.searchSymbol(q)
    const results = data.result
      .filter((r) => r.type === "Common Stock")
      .slice(0, 10)
      .map((r) => ({ symbol: r.displaySymbol, description: r.description }))

    return Response.json({ results }, { headers: { "Cache-Control": "s-maxage=3600" } })
  } catch (err) {
    return errorToResponse(err)
  }
}
