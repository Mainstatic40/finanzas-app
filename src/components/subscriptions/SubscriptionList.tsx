import { useEffect, useState } from 'react'
import { Pencil, Trash2, Mail, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ServiceLogo } from '@/components/ui/ServiceLogo'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { Tables } from '@/types/database'

type Subscription = Tables<'subscriptions'> & {
  categories: { name: string; icon: string | null; color: string | null } | null
  credit_cards: { name: string; bank: string } | null
  debit_cards: { name: string; bank: string } | null
}

type Props = {
  onEdit: (subscription: Subscription) => void
  onDelete: (id: string) => void
}

export function SubscriptionList({ onEdit, onDelete }: Props) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  async function fetchSubscriptions() {
    setLoading(true)
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        categories (name, icon, color),
        credit_cards (name, bank),
        debit_cards (name, bank)
      `)
      .order('next_billing_date', { ascending: true })

    if (error) {
      console.error('Error fetching subscriptions:', error)
    } else {
      setSubscriptions((data as Subscription[]) ?? [])
    }
    setLoading(false)
  }

  function formatCurrency(amount: number, currency: string | null) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency ?? 'MXN',
    }).format(amount)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  function getBillingCycleLabel(cycle: string) {
    const labels: Record<string, string> = {
      weekly: 'Semanal',
      monthly: 'Mensual',
      yearly: 'Anual',
    }
    return labels[cycle] || cycle
  }

  function getDaysUntilBilling(dateStr: string): number {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const billingDate = new Date(dateStr + 'T00:00:00')
    const diffTime = billingDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  function getBorderClass(subscription: Subscription): string {
    if (!subscription.is_active) return 'border-slate-200'

    const daysUntil = getDaysUntilBilling(subscription.next_billing_date)

    if (daysUntil < 0) {
      return 'border-red-400 border-2'
    }
    if (daysUntil <= 7) {
      return 'border-yellow-400 border-2'
    }
    return 'border-slate-200'
  }

  if (loading) {
    return <p className="text-slate-600">Cargando suscripciones...</p>
  }

  if (subscriptions.length === 0) {
    return <p className="text-slate-600">No hay suscripciones. Crea una nueva.</p>
  }

  return (
    <div className="space-y-3">
      {subscriptions.map((subscription) => {
        const daysUntil = getDaysUntilBilling(subscription.next_billing_date)

        return (
          <div
            key={subscription.id}
            className={`p-4 bg-white rounded-lg border ${getBorderClass(subscription)}`}
          >
            <div className="flex items-start gap-4">
              {/* Logo - centrado verticalmente */}
              <div className="flex-shrink-0 self-center">
                <div className="p-3 rounded-xl bg-slate-100">
                  <ServiceLogo
                    serviceName={subscription.provider || subscription.name}
                    size={32}
                  />
                </div>
              </div>

              {/* Contenido - crece para ocupar espacio */}
              <div className="flex-1 min-w-0 space-y-1.5">
                {/* Nombre */}
                <h3 className="font-semibold text-lg text-slate-900 truncate">
                  {subscription.name}
                </h3>

                {/* Correo */}
                {(subscription as any).account_email && (
                  <p className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{(subscription as any).account_email}</span>
                  </p>
                )}

                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-1.5 text-sm text-slate-600">
                  <span>{getBillingCycleLabel(subscription.billing_cycle)}</span>
                  <span className="text-slate-300">·</span>

                  {subscription.credit_cards ? (
                    <span className="text-violet-600">TC: {subscription.credit_cards.name}</span>
                  ) : subscription.debit_cards ? (
                    <span className="text-emerald-600">TD: {subscription.debit_cards.name}</span>
                  ) : (
                    <span className="text-slate-400">Sin tarjeta</span>
                  )}

                  <span className="text-slate-300">·</span>
                  <span className={subscription.is_active ? 'text-green-600' : 'text-slate-400'}>
                    {subscription.is_active ? 'Activo' : 'Inactivo'}
                  </span>

                  {/* Notes indicator */}
                  {(subscription as any).notes && (
                    <>
                      <span className="text-slate-300">·</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Notas</span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 text-sm">
                          <p className="whitespace-pre-wrap text-slate-700">
                            {(subscription as any).notes}
                          </p>
                        </PopoverContent>
                      </Popover>
                    </>
                  )}
                </div>

                {/* Próximo cobro */}
                <p className="text-sm">
                  <span className="text-slate-500">Próximo cobro: </span>
                  <span
                    className={
                      daysUntil < 0
                        ? 'text-red-600 font-medium'
                        : daysUntil <= 7
                          ? 'text-yellow-600 font-medium'
                          : 'text-slate-700'
                    }
                  >
                    {formatDate(subscription.next_billing_date)}
                    {daysUntil < 0 && ` (vencido hace ${Math.abs(daysUntil)} días)`}
                    {daysUntil === 0 && ' (hoy)'}
                    {daysUntil === 1 && ' (mañana)'}
                    {daysUntil > 1 && daysUntil <= 7 && ` (en ${daysUntil} días)`}
                  </span>
                </p>
              </div>

              {/* Columna derecha - acciones y precio */}
              <div className="flex flex-col items-end justify-between self-stretch">
                {/* Botones arriba */}
                <div className="flex gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(subscription)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDelete(subscription.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                {/* Precio abajo */}
                <div className="text-right mt-auto pt-2">
                  <span className="text-xl font-bold text-slate-900">
                    {formatCurrency(subscription.amount, subscription.currency).replace(/\s/g, '')}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">
                    {subscription.currency || 'MXN'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
