import { useCallback, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CardSearchBar } from '@/components/card/CardSearchBar'
import { CardGrid } from '@/components/card/CardGrid'
import { Button } from '@/components/ui/button'
import { useCards } from '@/hooks/useCards'
import type { CardSearchParams } from '@/types/card'

export function MainPage() {
  const [searchParams, setSearchParams] = useState<CardSearchParams>({
    page: 1,
    per_page: 20,
  })

  const { data, isPending, isError } = useCards(searchParams)

  const handleSearch = useCallback((params: CardSearchParams) => {
    setSearchParams((prev) => ({ ...prev, ...params, page: 1 }))
  }, [])

  const handlePrevPage = () => {
    setSearchParams((prev) => ({ ...prev, page: Math.max(1, (prev.page ?? 1) - 1) }))
  }

  const handleNextPage = () => {
    setSearchParams((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))
  }

  const currentPage = searchParams.page ?? 1
  const totalPages = data ? Math.ceil(data.total / (data.per_page || 20)) : 1

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">카드 목록</h1>
            <p className="text-muted-foreground text-sm">
              {data ? `총 ${data.total.toLocaleString('ko-KR')}장` : ''}
            </p>
          </div>

          <CardSearchBar onSearch={handleSearch} />

          <CardGrid cards={data?.cards} isPending={isPending} isError={isError} />

          {data && data.total > 0 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
              >
                ← 이전
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
              >
                다음 →
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
