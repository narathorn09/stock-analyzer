import { BarChart3 } from "lucide-react"
import Link from "next/link"

import { StockSearch } from "@/components/stock/StockSearch"

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-zinc-800 bg-zinc-950 px-4">
      <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
        <BarChart3 className="h-5 w-5" />
        <span className="font-semibold tracking-tight">StockAnalyzer</span>
      </Link>
      <div className="flex-1 max-w-md">
        <StockSearch />
      </div>
    </header>
  )
}
