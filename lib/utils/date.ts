import type { Timeframe } from "@/lib/types/stock"

const RANGE_SECONDS: Record<Timeframe, number> = {
  "1m": 1 * 24 * 60 * 60,
  "5m": 5 * 24 * 60 * 60,
  "15m": 30 * 24 * 60 * 60,
  "1h": 90 * 24 * 60 * 60,
  "4h": 180 * 24 * 60 * 60,
  "1d": 365 * 24 * 60 * 60,
}

export function getDefaultRange(tf: Timeframe): { from: number; to: number } {
  const to = Math.floor(Date.now() / 1000)
  const from = to - RANGE_SECONDS[tf]
  return { from, to }
}

export function unixNow(): number {
  return Math.floor(Date.now() / 1000)
}

/**
 * Convert a US/Eastern datetime string to Unix seconds.
 * Handles both EST (UTC-5) and EDT (UTC-4) via the Intl API — no DST guessing.
 *
 * Accepts: "2024-01-15" (daily) or "2024-01-15 09:30:00" (intraday)
 */
export function etStringToUnix(etDateStr: string): number {
  const normalized = etDateStr.includes(" ") ? etDateStr.replace(" ", "T") : `${etDateStr}T00:00:00`

  // Treat ET string as UTC to get a reference Date object
  const refDate = new Date(`${normalized}Z`)

  // Ask Intl what ET displays for this UTC moment (reveals the actual ET offset)
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const parts = formatter.formatToParts(refDate)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00"

  // Reconstruct the ET display as a UTC timestamp to find the offset
  const etAsUtc = new Date(
    `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}Z`
  )

  // offsetMs = how many ms ET lags behind UTC at this moment
  const offsetMs = refDate.getTime() - etAsUtc.getTime()

  // Actual UTC = ET input interpreted as UTC + offset
  return Math.floor((refDate.getTime() + offsetMs) / 1000)
}
