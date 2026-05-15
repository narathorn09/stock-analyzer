import { create } from "zustand"
import { persist } from "zustand/middleware"

import { DEFAULT_SETTINGS } from "@/lib/constants"
import type { AppSettings, IndicatorVisibility } from "@/lib/types/settings"

type SettingsStore = AppSettings & {
  setIndicator: (key: keyof IndicatorVisibility, value: boolean) => void
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setIndicator: (key, value) => set((s) => ({ indicators: { ...s.indicators, [key]: value } })),
    }),
    { name: "stock-settings" }
  )
)
