import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CardVisual } from '@/components/ui/CardVisual'
import type { Tables } from '@/types/database'

type CreditCardType = Tables<'credit_cards'> & {
  bank_id?: string | null
  holder_name?: string | null
}

type Props = {
  onEdit: (card: CreditCardType) => void
  onDelete: (id: string) => void
}

export function CreditCardList({ onEdit, onDelete }: Props) {
  const [cards, setCards] = useState<CreditCardType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCards()
  }, [])

  async function fetchCards() {
    setLoading(true)
    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching credit cards:', error)
    } else {
      setCards(data ?? [])
    }
    setLoading(false)
  }

  if (loading) {
    return <p className="text-slate-600">Cargando tarjetas...</p>
  }

  if (cards.length === 0) {
    return <p className="text-slate-600">No hay tarjetas. Crea una nueva.</p>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card) => {
        const availableCredit = (card.credit_limit || 0) - (card.current_balance || 0)

        return (
          <CardVisual
            key={card.id}
            type="credit"
            bankId={card.bank_id || 'otro'}
            cardName={card.name}
            holderName={card.holder_name ?? undefined}
            lastFourDigits={card.last_four_digits ?? undefined}
            currentBalance={card.current_balance || 0}
            availableBalance={availableCredit}
            isActive={card.is_active ?? undefined}
            creditLimit={card.credit_limit ?? undefined}
            cutOffDay={card.cut_off_day}
            paymentDueDay={card.payment_due_day}
            onEdit={() => onEdit(card)}
            onDelete={() => onDelete(card.id)}
          />
        )
      })}
    </div>
  )
}
