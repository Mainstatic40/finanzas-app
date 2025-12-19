import { useState, useEffect } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  getDate,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CreditCard, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Credit = Database['public']['Tables']['credits']['Row']
type Subscription = Database['public']['Tables']['subscriptions']['Row']
type CreditCard = Database['public']['Tables']['credit_cards']['Row']

type PaymentItem = {
  id: string
  name: string
  amount: number
  type: 'credit' | 'subscription'
  cardName?: string
}

type DayPayments = {
  credits: PaymentItem[]
  subscriptions: PaymentItem[]
}

type PaymentCalendarProps = {
  month: Date
  onMonthChange: (date: Date) => void
}

export function PaymentCalendar({ month, onMonthChange }: PaymentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [credits, setCredits] = useState<(Credit & { credit_card?: CreditCard | null })[]>([])
  const [subscriptions, setSubscriptions] = useState<(Subscription & { credit_card?: CreditCard | null })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [month])

  async function fetchPayments() {
    setLoading(true)

    const [creditsResult, subscriptionsResult] = await Promise.all([
      supabase
        .from('credits')
        .select('*, credit_card:credit_cards(*)')
        .eq('is_active', true),
      supabase
        .from('subscriptions')
        .select('*, credit_card:credit_cards(*)')
        .eq('is_active', true),
    ])

    if (creditsResult.error) {
      console.error('Error fetching credits:', creditsResult.error)
    } else {
      setCredits(creditsResult.data || [])
    }

    if (subscriptionsResult.error) {
      console.error('Error fetching subscriptions:', subscriptionsResult.error)
    } else {
      setSubscriptions(subscriptionsResult.data || [])
    }

    setLoading(false)
  }

  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  function getPaymentsForDay(date: Date): DayPayments {
    const dayOfMonth = getDate(date)
    const result: DayPayments = { credits: [], subscriptions: [] }

    if (!isSameMonth(date, month)) {
      return result
    }

    // Créditos: se pagan en su payment_day
    credits.forEach((credit) => {
      if (credit.payment_day === dayOfMonth) {
        result.credits.push({
          id: credit.id,
          name: credit.name,
          amount: credit.monthly_payment,
          type: 'credit',
          cardName: credit.credit_card?.name,
        })
      }
    })

    // Suscripciones: depende del billing_cycle
    subscriptions.forEach((subscription) => {
      const shouldInclude = shouldIncludeSubscription(subscription, date)
      if (shouldInclude) {
        result.subscriptions.push({
          id: subscription.id,
          name: subscription.name,
          amount: subscription.amount,
          type: 'subscription',
          cardName: subscription.credit_card?.name,
        })
      }
    })

    return result
  }

  function shouldIncludeSubscription(subscription: Subscription, date: Date): boolean {
    const dayOfMonth = getDate(date)

    switch (subscription.billing_cycle) {
      case 'monthly':
        return subscription.billing_day === dayOfMonth

      case 'weekly': {
        // Para semanal, verificar si la fecha cae en el día correcto de la semana
        const nextBillingDate = new Date(subscription.next_billing_date)
        const dayOfWeek = nextBillingDate.getDay()
        return date.getDay() === dayOfWeek && isSameMonth(date, month)
      }

      case 'yearly': {
        // Para anual, solo si next_billing_date coincide
        const nextBillingDate = new Date(subscription.next_billing_date)
        return isSameDay(date, nextBillingDate)
      }

      default:
        return false
    }
  }

  function calculateMonthlyTotals() {
    let totalCredits = 0
    let totalSubscriptions = 0
    let creditCount = 0
    let subscriptionCount = 0

    // Contar créditos activos (todos se pagan una vez al mes)
    credits.forEach((credit) => {
      totalCredits += credit.monthly_payment
      creditCount++
    })

    // Contar suscripciones según su ciclo
    subscriptions.forEach((subscription) => {
      switch (subscription.billing_cycle) {
        case 'monthly':
          totalSubscriptions += subscription.amount
          subscriptionCount++
          break

        case 'weekly': {
          // Contar cuántas semanas hay en el mes
          const weeksInMonth = getWeeksInMonthRange(monthStart, monthEnd, subscription)
          totalSubscriptions += subscription.amount * weeksInMonth
          subscriptionCount += weeksInMonth
          break
        }

        case 'yearly': {
          // Solo contar si cae en este mes
          const nextBillingDate = new Date(subscription.next_billing_date)
          if (isSameMonth(nextBillingDate, month)) {
            totalSubscriptions += subscription.amount
            subscriptionCount++
          }
          break
        }
      }
    })

    return {
      total: totalCredits + totalSubscriptions,
      totalCredits,
      totalSubscriptions,
      creditCount,
      subscriptionCount,
    }
  }

  function getWeeksInMonthRange(start: Date, end: Date, subscription: Subscription): number {
    const nextBillingDate = new Date(subscription.next_billing_date)
    const dayOfWeek = nextBillingDate.getDay()
    let count = 0
    const currentDate = new Date(start)

    while (currentDate <= end) {
      if (currentDate.getDay() === dayOfWeek) {
        count++
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return count
  }

  const totals = calculateMonthlyTotals()
  const selectedDayPayments = selectedDate ? getPaymentsForDay(selectedDate) : null

  return (
    <div className="bg-card rounded-lg border p-4">
      {/* Header con navegación */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onMonthChange(subMonths(month, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h2 className="text-lg font-semibold capitalize">
          {format(month, 'MMMM yyyy', { locale: es })}
        </h2>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Grid del calendario */}
      <div className="grid grid-cols-7 gap-1">
        {/* Días de la semana */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}

        {/* Días del mes */}
        {calendarDays.map((day) => {
          const payments = getPaymentsForDay(day)
          const allPayments = [...payments.credits, ...payments.subscriptions]
          const hasPayments = allPayments.length > 0
          const isCurrentMonth = isSameMonth(day, month)
          const isCurrentDay = isToday(day)

          const maxVisible = 2
          const visiblePayments = allPayments.slice(0, maxVisible)
          const remainingCount = allPayments.length - maxVisible

          return (
            <button
              key={day.toISOString()}
              onClick={() => {
                if (isCurrentMonth && hasPayments) {
                  setSelectedDate(day)
                }
              }}
              disabled={!isCurrentMonth || loading}
              className={`
                relative min-h-[80px] p-1 text-sm rounded-md transition-colors flex flex-col
                ${isCurrentMonth ? 'hover:bg-accent' : 'text-muted-foreground/50'}
                ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}
                ${hasPayments && isCurrentMonth ? 'cursor-pointer' : ''}
              `}
            >
              <span className={`text-right text-xs mb-1 ${isCurrentDay ? 'font-bold' : ''}`}>
                {format(day, 'd')}
              </span>

              {/* Chips de pagos */}
              {isCurrentMonth && hasPayments && (
                <div className="flex flex-col gap-0.5 flex-1 overflow-hidden">
                  {visiblePayments.map((payment) => (
                    <span
                      key={payment.id}
                      className={`
                        text-[10px] leading-tight px-1 py-0.5 rounded truncate text-left
                        ${payment.type === 'credit'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                        }
                      `}
                      title={payment.name}
                    >
                      {payment.name.length > 10
                        ? `${payment.name.slice(0, 10)}...`
                        : payment.name
                      }
                    </span>
                  ))}
                  {remainingCount > 0 && (
                    <span className="text-[10px] text-muted-foreground text-left">
                      +{remainingCount} más
                    </span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Footer con resumen */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            Total del mes:{' '}
            <span className="font-semibold text-foreground">
              ${totals.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>{totals.creditCount} créditos</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>{totals.subscriptionCount} suscripciones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog para detalles del día */}
      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Pagos del {selectedDate && format(selectedDate, "d 'de' MMMM", { locale: es })}
            </DialogTitle>
            <DialogDescription>
              Detalle de pagos programados para este día
            </DialogDescription>
          </DialogHeader>

          {selectedDayPayments && (
            <div className="space-y-4">
              {/* Créditos */}
              {selectedDayPayments.credits.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-medium mb-2">
                    <CreditCard className="h-4 w-4 text-blue-500" />
                    Créditos
                  </h4>
                  <ul className="space-y-2">
                    {selectedDayPayments.credits.map((payment) => (
                      <li
                        key={payment.id}
                        className="flex justify-between items-center p-2 bg-muted/50 rounded"
                      >
                        <div>
                          <p className="font-medium">{payment.name}</p>
                          {payment.cardName && (
                            <p className="text-xs text-muted-foreground">
                              {payment.cardName}
                            </p>
                          )}
                        </div>
                        <span className="font-semibold">
                          ${payment.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suscripciones */}
              {selectedDayPayments.subscriptions.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-medium mb-2">
                    <RefreshCw className="h-4 w-4 text-purple-500" />
                    Suscripciones
                  </h4>
                  <ul className="space-y-2">
                    {selectedDayPayments.subscriptions.map((payment) => (
                      <li
                        key={payment.id}
                        className="flex justify-between items-center p-2 bg-muted/50 rounded"
                      >
                        <div>
                          <p className="font-medium">{payment.name}</p>
                          {payment.cardName && (
                            <p className="text-xs text-muted-foreground">
                              {payment.cardName}
                            </p>
                          )}
                        </div>
                        <span className="font-semibold">
                          ${payment.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Total del día */}
              <div className="pt-2 border-t flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total del día</span>
                <span className="font-bold">
                  $
                  {(
                    [...selectedDayPayments.credits, ...selectedDayPayments.subscriptions].reduce(
                      (sum, p) => sum + p.amount,
                      0
                    )
                  ).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
