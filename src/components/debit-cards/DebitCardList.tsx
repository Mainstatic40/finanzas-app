import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CardVisual } from '@/components/ui/CardVisual'
import type { Tables } from '@/types/database'

type DebitCardType = Tables<'debit_cards'> & {
  bank_id?: string | null
  holder_name?: string | null
}

type Props = {
  onEdit: (card: DebitCardType) => void
  onDelete: (id: string) => void
}

export function DebitCardList({ onEdit, onDelete }: Props) {
  const [cards, setCards] = useState<DebitCardType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCards()
  }, [])

  async function fetchCards() {
    setLoading(true)
    const { data, error } = await supabase
      .from('debit_cards')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching debit cards:', error)
    } else {
      setCards(data ?? [])
    }
    setLoading(false)
  }

  if (loading) {
    return <p className="text-slate-600">Cargando tarjetas...</p>
  }

  if (cards.length === 0) {
    return <p className="text-slate-600">No hay tarjetas de débito. Crea una nueva.</p>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card) => (
        <CardVisual
          key={card.id}
          type="debit"
          bankId={card.bank_id || 'otro'}
          cardName={card.name}
          holderName={card.holder_name ?? undefined}
          lastFourDigits={card.last_four_digits ?? undefined}
          currentBalance={card.current_balance || 0}
          isActive={card.is_active ?? undefined}
          onEdit={() => onEdit(card)}
          onDelete={() => onDelete(card.id)}
        />
      ))}
    </div>
  )
}
