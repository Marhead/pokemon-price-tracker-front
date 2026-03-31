import { Skeleton } from '@/components/ui/skeleton'

export function PriceSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-16" />
        </div>
      ))}
    </div>
  )
}
