import { useQuery } from '@tanstack/react-query'
import { fetchCards, fetchCard, fetchExpansions } from '../lib/api'
import type { CardSearchParams } from '../types/card'

export function useCards(params: CardSearchParams) {
  return useQuery({
    queryKey: ['cards', params],
    queryFn: () => fetchCards(params),
  })
}

export function useCard(id: string) {
  return useQuery({
    queryKey: ['card', id],
    queryFn: () => fetchCard(id),
    enabled: !!id,
  })
}

export function useExpansions() {
  return useQuery({
    queryKey: ['expansions'],
    queryFn: fetchExpansions,
    staleTime: 1000 * 60 * 10,
  })
}
