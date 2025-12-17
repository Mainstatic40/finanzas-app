import { useEffect, useState } from 'react'
import { Wallet, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Tables } from '@/types/database'

type DebitCardType = Tables<'debit_cards'>

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

  function formatCurrency(amount: number | null) {
    if (amount === null) return '-'
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  if (loading) {
    return <p className="text-slate-600">Cargando tarjetas...</p>
  }

  if (cards.length === 0) {
    return <p className="text-slate-600">No hay tarjetas de débito. Crea una nueva.</p>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.id}
          className="p-4 bg-white rounded-lg border border-slate-200 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
              <span className="font-medium text-slate-900">{card.name}</span>
            </div>
            <Badge variant={card.is_active ? 'default' : 'secondary'}>
              {card.is_active ? 'Activa' : 'Inactiva'}
            </Badge>
          </div>

          <div className="text-sm text-slate-600">
            <p>{card.bank} {card.last_four_digits && `•••• ${card.last_four_digits}`}</p>
          </div>

          <div className="text-sm">
            <p className="text-slate-500">Saldo disponible</p>
            <p className="text-xl font-semibold text-emerald-600">
              {formatCurrency(card.current_balance)}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => onEdit(card)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(card.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
