import { Skeleton } from "@/components/ui/skeleton"

export function ChartSkeleton() {
  return (
    <div className="flex h-full w-full flex-col gap-2 p-2">
      <Skeleton className="h-full w-full rounded bg-zinc-900" />
    </div>
  )
}
