import { useParams, useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { PriceTable } from '@/components/price/PriceTable'
import { PriceSkeleton } from '@/components/price/PriceSkeleton'
import { useCard } from '@/hooks/useCards'
import { usePrices } from '@/hooks/usePrices'

export function CardDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const cardId = id ?? ''
  const { data: card, isPending: isCardPending, isError: isCardError } = useCard(cardId)
  const { data: pricesData, isPending: isPricesPending, isError: isPricesError } = usePrices(cardId)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          ← 목록으로
        </Button>

        {isCardError ? (
          <div className="text-center py-12 text-muted-foreground">
            카드 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Card Info Section */}
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-shrink-0">
                {isCardPending ? (
                  <Skeleton className="w-[280px] h-[390px] rounded-xl" />
                ) : (
                  <img
                    src={card?.image_url}
                    alt={card?.name}
                    className="max-w-[280px] w-full rounded-xl shadow-lg"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="280" height="390" viewBox="0 0 280 390"%3E%3Crect width="280" height="390" fill="%23e5e7eb" rx="12"/%3E%3Ctext x="140" y="200" text-anchor="middle" fill="%239ca3af" font-size="20"%3E이미지 없음%3C/text%3E%3C/svg%3E'
                    }}
                  />
                )}
              </div>

              <div className="flex-1 space-y-4">
                {isCardPending ? (
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-1/4" />
                  </div>
                ) : card ? (
                  <>
                    <h1 className="text-3xl font-bold">{card.name}</h1>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{card.id}</Badge>
                      <Badge variant="secondary">{card.expansion}</Badge>
                      <Badge>{card.rarity}</Badge>
                    </div>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">타입:</span> {card.card_type}
                    </p>
                    {card.official_url && (
                      <a
                        href={card.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline border border-border rounded-lg px-3 py-1.5"
                      >
                        공식 사이트 보기 ↗
                      </a>
                    )}
                  </>
                ) : null}
              </div>
            </div>

            <Separator />

            {/* Price Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">실시간 시세 비교</h2>
              {isPricesPending ? (
                <PriceSkeleton />
              ) : isPricesError ? (
                <p className="text-muted-foreground py-4">
                  시세를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
                </p>
              ) : pricesData && pricesData.prices.length > 0 ? (
                <PriceTable prices={pricesData.prices} />
              ) : (
                <p className="text-muted-foreground py-4">현재 시세 정보가 없습니다.</p>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
