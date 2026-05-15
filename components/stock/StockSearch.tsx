"use client"

import { Clock, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"

import { Input } from "@/components/ui/input"
import { useStockSearch } from "@/lib/hooks/useStockSearch"
import { useHistory } from "@/lib/store/history"
import { cn } from "@/lib/utils"

export function StockSearch({ className }: { className?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { results, isLoading } = useStockSearch(query)
  const { recentSearches, addRecentSearch, clearRecentSearches } = useHistory()

  const showRecent = open && query.length === 0 && recentSearches.length > 0
  const showResults = open && query.length >= 1

  function handleSelect(symbol: string) {
    addRecentSearch(symbol)
    setQuery("")
    setOpen(false)
    router.push(`/stock/${symbol}`)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && query.trim()) {
      handleSelect(query.trim().toUpperCase())
    }
    if (e.key === "Escape") setOpen(false)
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search symbol…"
          className="pl-8 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-amber-500/50"
        />
      </div>

      {showRecent && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 shadow-xl">
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-xs text-zinc-600">Recent</span>
            <button
              onMouseDown={clearRecentSearches}
              className="text-xs text-zinc-600 hover:text-zinc-400"
            >
              Clear
            </button>
          </div>
          {recentSearches.map((sym) => (
            <button
              key={sym}
              onMouseDown={() => handleSelect(sym)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-zinc-800 transition-colors"
            >
              <Clock className="h-3 w-3 text-zinc-600" />
              <span className="font-mono text-sm font-semibold text-zinc-200">{sym}</span>
            </button>
          ))}
        </div>
      )}

      {showResults && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 shadow-xl">
          {isLoading && <div className="px-3 py-2 text-sm text-zinc-500">Searching…</div>}
          {!isLoading && results.length === 0 && (
            <div className="px-3 py-2 text-sm text-zinc-500">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
          {results.map((r) => (
            <button
              key={r.symbol}
              onMouseDown={() => handleSelect(r.symbol)}
              className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-zinc-800 transition-colors"
            >
              <span className="font-mono text-sm font-semibold text-zinc-100">{r.symbol}</span>
              <span className="truncate text-xs text-zinc-400">{r.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
