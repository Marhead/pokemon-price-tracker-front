export interface Card {
  id: string
  name: string
  expansion: string
  rarity: string
  card_type: string
  image_url: string
  official_url: string
}

export interface CardListResponse {
  cards: Card[]
  total: number
  page: number
  per_page: number
}

export interface CardSearchParams {
  q?: string
  expansion?: string
  rarity?: string
  page?: number
  per_page?: number
}
