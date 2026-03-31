import { useQuery } from '@tanstack/react-query'
import { fetchPrices } from '../lib/api'

export function usePrices(cardId: string) {
  return useQuery({
    queryKey: ['prices', cardId],
    queryFn: () => fetchPrices(cardId),
    staleTime: 0,
    gcTime: 0,
    retry: 1,
    enabled: !!cardId,
  })
}
