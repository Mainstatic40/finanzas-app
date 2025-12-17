import { useEffect, useState } from 'react'
import { CreditCard, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Tables } from '@/types/database'

type CreditCardType = Tables<'credit_cards'>

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

  function formatCurrency(amount: number | null) {
    if (amount === null) return '-'
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  function getAvailableCredit(card: CreditCardType) {
    if (card.credit_limit === null || card.current_balance === null) return null
    return card.credit_limit - card.current_balance
  }

  function getUsagePercentage(card: CreditCardType) {
    if (card.credit_limit === null || card.credit_limit === 0 || card.current_balance === null) return 0
    return Math.min(100, (card.current_balance / card.credit_limit) * 100)
  }

  if (loading) {
    return <p className="text-slate-600">Cargando tarjetas...</p>
  }

  if (cards.length === 0) {
    return <p className="text-slate-600">No hay tarjetas. Crea una nueva.</p>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const availableCredit = getAvailableCredit(card)
        const usagePercentage = getUsagePercentage(card)
        return (
          <div
            key={card.id}
            className="p-4 bg-white rounded-lg border border-slate-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-slate-600" />
                <span className="font-medium text-slate-900">{card.name}</span>
              </div>
              <Badge variant={card.is_active ? 'default' : 'secondary'}>
                {card.is_active ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>

            <div className="text-sm text-slate-600">
              <p>{card.bank} {card.last_four_digits && `•••• ${card.last_four_digits}`}</p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Uso</span>
                <span className="font-medium">{usagePercentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${usagePercentage > 80 ? 'bg-red-500' : usagePercentage > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-slate-500">Disponible</p>
                <p className="font-medium text-green-600">{formatCurrency(availableCredit)}</p>
              </div>
              <div>
                <p className="text-slate-500">Usado/Comprometido</p>
                <p className="font-medium text-red-600">{formatCurrency(card.current_balance)}</p>
              </div>
            </div>

            <div className="text-sm">
              <p className="text-slate-500">Límite de crédito</p>
              <p className="font-medium">{formatCurrency(card.credit_limit)}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-slate-500">Día de corte</p>
                <p className="font-medium">{card.cut_off_day}</p>
              </div>
              <div>
                <p className="text-slate-500">Día de pago</p>
                <p className="font-medium">{card.payment_due_day}</p>
              </div>
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
        )
      })}
    </div>
  )
}
