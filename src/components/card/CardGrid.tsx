import { Skeleton } from '@/components/ui/skeleton'
import { CardListItem } from './CardListItem'
import type { Card } from '@/types/card'

interface CardGridProps {
  cards: Card[] | undefined
  isPending: boolean
  isError: boolean
}

function SkeletonCard() {
  return (
    <div className="space-y-2">
      <Skeleton className="aspect-[3/4] w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-5 w-12" />
    </div>
  )
}

export function CardGrid({ cards, isPending, isError }: CardGridProps) {
  if (isError) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        카드 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {isPending
        ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
        : cards?.map((card) => <CardListItem key={card.id} card={card} />)}
    </div>
  )
}
