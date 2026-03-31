import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Card as CardType } from '@/types/card'

interface CardListItemProps {
  card: CardType
}

export function CardListItem({ card }: CardListItemProps) {
  const navigate = useNavigate()

  return (
    <Card
      className="cursor-pointer transition-transform hover:scale-105 overflow-hidden"
      onClick={() => navigate(`/card/${card.id}`)}
    >
      <div className="aspect-[3/4] bg-muted overflow-hidden">
        <img
          src={card.image_url}
          alt={card.name}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="133" viewBox="0 0 100 133"%3E%3Crect width="100" height="133" fill="%23e5e7eb"/%3E%3Ctext x="50" y="70" text-anchor="middle" fill="%239ca3af" font-size="12"%3E%3F%3C/text%3E%3C/svg%3E'
          }}
        />
      </div>
      <CardContent className="p-3 space-y-1">
        <p className="font-semibold text-sm truncate">{card.name}</p>
        <p className="text-muted-foreground text-xs truncate">{card.expansion}</p>
        <Badge variant="secondary" className="text-xs">
          {card.rarity}
        </Badge>
      </CardContent>
    </Card>
  )
}
