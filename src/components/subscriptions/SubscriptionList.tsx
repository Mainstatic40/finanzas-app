import { useEffect, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getIconByName } from '@/lib/icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ServiceLogo } from '@/components/ui/ServiceLogo'
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
        const CategoryIcon = subscription.categories
          ? getIconByName(subscription.categories.icon)
          : null
        const daysUntil = getDaysUntilBilling(subscription.next_billing_date)

        return (
          <div
            key={subscription.id}
            className={`p-4 bg-white rounded-lg border ${getBorderClass(subscription)}`}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left side: Icon and info */}
              <div className="flex items-start gap-4 flex-1">
                {/* Service Logo */}
                <div className="p-2 rounded-lg bg-slate-100">
                  <ServiceLogo
                    serviceName={subscription.provider || subscription.name}
                    size={24}
                  />
                </div>

                {/* Main info */}
                <div className="flex-1 space-y-2">
                  {/* Name and provider */}
                  <div>
                    <h3 className="font-medium text-slate-900">
                      {subscription.name}
                    </h3>
                    {subscription.provider && subscription.provider !== subscription.name && (
                      <p className="text-sm text-slate-500">{subscription.provider}</p>
                    )}
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Billing cycle */}
                    <Badge variant="secondary" className="text-xs">
                      {getBillingCycleLabel(subscription.billing_cycle)}
                    </Badge>

                    {/* Category */}
                    {subscription.categories && (
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1"
                        style={{
                          borderColor: subscription.categories.color ?? undefined,
                          color: subscription.categories.color ?? undefined,
                        }}
                      >
                        {CategoryIcon && (
                          <CategoryIcon className="h-3 w-3" />
                        )}
                        {subscription.categories.name}
                      </Badge>
                    )}

                    {/* Card badge */}
                    {subscription.credit_cards ? (
                      <Badge
                        variant="outline"
                        className="text-xs text-violet-600 border-violet-300"
                      >
                        TC: {subscription.credit_cards.name}
                      </Badge>
                    ) : subscription.debit_cards ? (
                      <Badge
                        variant="outline"
                        className="text-xs text-emerald-600 border-emerald-300"
                      >
                        TD: {subscription.debit_cards.name}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-slate-400">
                        Sin tarjeta
                      </Badge>
                    )}

                    {/* Active/Inactive */}
                    <Badge
                      variant={subscription.is_active ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {subscription.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>

                  {/* Next billing date */}
                  <div className="text-sm">
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
                  </div>
                </div>
              </div>

              {/* Right side: Amount and actions */}
              <div className="flex flex-col items-end gap-2">
                <span className="text-lg font-semibold text-slate-900">
                  {formatCurrency(subscription.amount, subscription.currency)}
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(subscription)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(subscription.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
