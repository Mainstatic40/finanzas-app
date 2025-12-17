import { useEffect, useState } from 'react'
import { CreditCard, Landmark, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Tables } from '@/types/database'

type Credit = Tables<'credits'> & {
  credit_cards: { name: string; bank: string } | null
}

type Props = {
  onEdit: (credit: Credit) => void
  onDelete: (id: string) => void
}

export function CreditList({ onEdit, onDelete }: Props) {
  const [credits, setCredits] = useState<Credit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCredits()
  }, [])

  async function fetchCredits() {
    setLoading(true)
    const { data, error } = await supabase
      .from('credits')
      .select(`
        *,
        credit_cards (name, bank)
      `)
      .order('name')

    if (error) {
      console.error('Error fetching credits:', error)
    } else {
      setCredits((data as Credit[]) ?? [])
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

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  function getProgress(credit: Credit) {
    const paid = credit.original_amount - credit.current_balance
    const percentage = (paid / credit.original_amount) * 100
    return Math.min(100, Math.max(0, percentage))
  }

  if (loading) {
    return <p className="text-slate-600">Cargando créditos...</p>
  }

  if (credits.length === 0) {
    return <p className="text-slate-600">No hay créditos. Crea uno nuevo.</p>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {credits.map((credit) => {
        const progress = getProgress(credit)
        const paidAmount = credit.original_amount - credit.current_balance
        return (
          <div
            key={credit.id}
            className="p-4 bg-white rounded-lg border border-slate-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-slate-600" />
                <span className="font-medium text-slate-900">{credit.name}</span>
              </div>
              <Badge variant={credit.is_active ? 'default' : 'secondary'}>
                {credit.is_active ? 'Activo' : 'Liquidado'}
              </Badge>
            </div>

            <div className="text-sm text-slate-600">
              <p>{credit.institution}</p>
            </div>

            {credit.credit_cards && (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-500" />
                <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                  {credit.credit_cards.name} ({credit.credit_cards.bank})
                </Badge>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Progreso</span>
                <span className="font-medium">{progress.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-slate-500">Monto original</p>
                <p className="font-medium">{formatCurrency(credit.original_amount)}</p>
              </div>
              <div>
                <p className="text-slate-500">Saldo actual</p>
                <p className="font-medium text-red-600">{formatCurrency(credit.current_balance)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-slate-500">Pagado</p>
                <p className="font-medium text-green-600">{formatCurrency(paidAmount)}</p>
              </div>
              <div>
                <p className="text-slate-500">Pago mensual</p>
                <p className="font-medium">{formatCurrency(credit.monthly_payment)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-slate-500">Día de pago</p>
                <p className="font-medium">{credit.payment_day}</p>
              </div>
              {credit.interest_rate && (
                <div>
                  <p className="text-slate-500">Tasa de interés</p>
                  <p className="font-medium">{credit.interest_rate}%</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-slate-500">Inicio</p>
                <p className="font-medium">{formatDate(credit.start_date)}</p>
              </div>
              <div>
                <p className="text-slate-500">Término</p>
                <p className="font-medium">{formatDate(credit.end_date)}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={() => onEdit(credit)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(credit.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
