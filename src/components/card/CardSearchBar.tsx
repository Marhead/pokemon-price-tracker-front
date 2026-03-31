import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useExpansions } from '@/hooks/useCards'
import type { CardSearchParams } from '@/types/card'

const RARITIES = ['C', 'U', 'R', 'RR', 'RRR', 'SR', 'SAR', 'UR', 'HR']

interface CardSearchBarProps {
  onSearch: (params: CardSearchParams) => void
}

export function CardSearchBar({ onSearch }: CardSearchBarProps) {
  const [query, setQuery] = useState('')
  const [expansion, setExpansion] = useState<string | null>(null)
  const [rarity, setRarity] = useState<string | null>(null)
  const { data: expansions } = useExpansions()

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch({
        q: query || undefined,
        expansion: (expansion && expansion !== 'all') ? expansion : undefined,
        rarity: (rarity && rarity !== 'all') ? rarity : undefined,
        page: 1,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [query, expansion, rarity, onSearch])

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Input
        placeholder="카드명 검색..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1"
      />
      <Select value={expansion} onValueChange={setExpansion}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="확장팩 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체</SelectItem>
          {expansions?.map((exp) => (
            <SelectItem key={exp} value={exp}>
              {exp}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={rarity} onValueChange={setRarity}>
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="희귀도" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체</SelectItem>
          {RARITIES.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
