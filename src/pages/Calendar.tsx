import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { PaymentCalendar } from '@/components/calendar/PaymentCalendar'
import { Calendar as CalendarIcon, CreditCard, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  format,
  addDays,
  startOfMonth,
  endOfMonth,
  getDate,
  isSameMonth,
  getDaysInMonth,
} from 'date-fns'
import { es } from 'date-fns/locale'
import type { Database } from '@/types/database'

type Credit = Database['public']['Tables']['credits']['Row'] & {
  credit_cards: { name: string; bank: string } | null
}

type Subscription = Database['public']['Tables']['subscriptions']['Row'] & {
  credit_cards: { name: string; bank: string } | null
}

type UpcomingPayment = {
  id: string
  name: string
  amount: number
  date: Date
  type: 'credit' | 'subscription'
  cardName?: string
}

export function Calendar() {
  const [month, setMonth] = useState(new Date())
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([])
  const [monthSummary, setMonthSummary] = useState({ total: 0, avgDaily: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [month])

  async function fetchData() {
    setLoading(true)

    const [creditsResult, subscriptionsResult] = await Promise.all([
      supabase
        .from('credits')
        .select('*, credit_cards:credit_cards(name, bank)')
        .eq('is_active', true),
      supabase
        .from('subscriptions')
        .select('*, credit_cards:credit_cards(name, bank)')
        .eq('is_active', true),
    ])

    const credits = (creditsResult.data || []) as Credit[]
    const subscriptions = (subscriptionsResult.data || []) as Subscription[]

    // Calcular próximos 7 días
    const today = new Date()
    const next7Days: UpcomingPayment[] = []

    for (let i = 0; i < 7; i++) {
      const checkDate = addDays(today, i)
      const dayOfMonth = getDate(checkDate)

      // Créditos
      credits.forEach((credit) => {
        if (credit.payment_day === dayOfMonth) {
          next7Days.push({
            id: credit.id,
            name: credit.name,
            amount: credit.monthly_payment,
            date: checkDate,
            type: 'credit',
            cardName: credit.credit_cards?.name,
          })
        }
      })

      // Suscripciones
      subscriptions.forEach((subscription) => {
        const shouldInclude = shouldIncludeSubscription(subscription, checkDate)
        if (shouldInclude) {
          next7Days.push({
            id: subscription.id,
            name: subscription.name,
            amount: subscription.amount,
            date: checkDate,
            type: 'subscription',
            cardName: subscription.credit_cards?.name,
          })
        }
      })
    }

    setUpcomingPayments(next7Days)

    // Calcular resumen del mes
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    let monthTotal = 0

    // Créditos (todos se pagan una vez al mes)
    credits.forEach((credit) => {
      monthTotal += credit.monthly_payment
    })

    // Suscripciones según ciclo
    subscriptions.forEach((subscription) => {
      switch (subscription.billing_cycle) {
        case 'monthly':
          monthTotal += subscription.amount
          break
        case 'weekly': {
          const weeksInMonth = countWeeklyOccurrences(monthStart, monthEnd, subscription)
          monthTotal += subscription.amount * weeksInMonth
          break
        }
        case 'yearly': {
          const nextBillingDate = new Date(subscription.next_billing_date)
          if (isSameMonth(nextBillingDate, month)) {
            monthTotal += subscription.amount
          }
          break
        }
      }
    })

    const daysInMonth = getDaysInMonth(month)
    setMonthSummary({
      total: monthTotal,
      avgDaily: monthTotal / daysInMonth,
    })

    setLoading(false)
  }

  function shouldIncludeSubscription(subscription: Subscription, date: Date): boolean {
    const dayOfMonth = getDate(date)

    switch (subscription.billing_cycle) {
      case 'monthly':
        return subscription.billing_day === dayOfMonth
      case 'weekly': {
        const nextBillingDate = new Date(subscription.next_billing_date)
        return date.getDay() === nextBillingDate.getDay()
      }
      case 'yearly': {
        const nextBillingDate = new Date(subscription.next_billing_date)
        return (
          date.getDate() === nextBillingDate.getDate() &&
          date.getMonth() === nextBillingDate.getMonth()
        )
      }
      default:
        return false
    }
  }

  function countWeeklyOccurrences(start: Date, end: Date, subscription: Subscription): number {
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

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-7 w-7 text-slate-700" />
          <h2 className="text-2xl font-bold text-slate-900">Calendario de Pagos</h2>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendario */}
          <div className="lg:col-span-2">
            <PaymentCalendar month={month} onMonthChange={setMonth} />
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Próximos 7 días */}
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-semibold text-slate-900 mb-4">Próximos 7 días</h3>

              {loading ? (
                <div className="text-sm text-muted-foreground">Cargando...</div>
              ) : upcomingPayments.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No hay pagos programados
                </div>
              ) : (
                <ul className="space-y-3">
                  {upcomingPayments.map((payment, index) => (
                    <li
                      key={`${payment.id}-${index}`}
                      className="flex items-start gap-3 p-2 rounded-md bg-muted/50"
                    >
                      {payment.type === 'credit' ? (
                        <CreditCard className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                      ) : (
                        <RefreshCw className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{payment.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(payment.date, "EEEE d 'de' MMM", { locale: es })}
                          {payment.cardName && ` • ${payment.cardName}`}
                        </p>
                      </div>
                      <span className="text-sm font-semibold shrink-0">
                        {formatCurrency(payment.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {upcomingPayments.length > 0 && (
                <div className="mt-4 pt-3 border-t flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total próximos 7 días</span>
                  <span className="font-bold">
                    {formatCurrency(upcomingPayments.reduce((sum, p) => sum + p.amount, 0))}
                  </span>
                </div>
              )}
            </div>

            {/* Resumen del mes */}
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-semibold text-slate-900 mb-4">
                Resumen de {format(month, 'MMMM', { locale: es })}
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total a pagar</span>
                  <span className="text-lg font-bold text-slate-900">
                    {formatCurrency(monthSummary.total)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Promedio diario</span>
                  <span className="font-semibold text-slate-700">
                    {formatCurrency(monthSummary.avgDaily)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
