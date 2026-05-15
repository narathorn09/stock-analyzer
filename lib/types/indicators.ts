export type PivotLevels = {
  pivot: number
  r1: number
  r2: number
  r3: number
  s1: number
  s2: number
  s3: number
}

export type SwingPoint = {
  time: number
  price: number
  type: "high" | "low"
  strength: number
}

export type VolumeStats = {
  current: number
  average20: number
  ratio: number
  status: "high" | "normal" | "low"
}

export type VWAPPoint = {
  time: number
  vwap: number
}

export type IndicatorSet = {
  pivots: PivotLevels | null
  swings: SwingPoint[]
  volumeMA: (number | null)[]
  volumeStats: VolumeStats
  vwap: VWAPPoint[] | null // null if not intraday
}
