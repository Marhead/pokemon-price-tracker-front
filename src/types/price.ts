export type PriceSource = 'cardnyang' | 'icu' | 'daangn' | 'joongna'
export type PriceType = 'buy' | 'sell' | 'used'

export interface PriceItem {
  source: PriceSource
  source_name: string
  card_id: string | null
  card_name_raw: string
  price: number
  price_type: PriceType
  url: string | null
  fetched_at: string
}

export interface PricesResponse {
  card_id: string
  prices: PriceItem[]
  fetched_at: string
}
