import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { PriceItem, PriceSource, PriceType } from '@/types/price'

const SOURCE_NAME_MAP: Record<PriceSource, string> = {
  cardnyang: '카드냥 (역삼)',
  icu: 'ICU 너정다',
  daangn: '당근마켓',
  joongna: '중고나라',
}

const PRICE_TYPE_MAP: Record<PriceType, string> = {
  buy: '매입가',
  sell: '판매가',
  used: '중고가',
}

interface PriceTableProps {
  prices: PriceItem[]
}

export function PriceTable({ prices }: PriceTableProps) {
  const minPrice = Math.min(...prices.map((p) => p.price))

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>판매처</TableHead>
            <TableHead>구분</TableHead>
            <TableHead className="text-right">가격</TableHead>
            <TableHead>조회 시각</TableHead>
            <TableHead>링크</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prices.map((item, i) => {
            const isLowest = item.price === minPrice
            const sourceName = SOURCE_NAME_MAP[item.source] ?? item.source_name
            const priceTypeLabel = PRICE_TYPE_MAP[item.price_type]
            const fetchedDate = new Date(item.fetched_at).toLocaleString('ko-KR', {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <TableRow key={i} className={isLowest ? 'bg-primary/5' : undefined}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {sourceName}
                    {isLowest && (
                      <Badge variant="destructive" className="text-xs">
                        최저
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{priceTypeLabel}</Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {item.price.toLocaleString('ko-KR')}원
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{fetchedDate}</TableCell>
                <TableCell>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary underline-offset-4 hover:underline"
                    >
                      보기
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
