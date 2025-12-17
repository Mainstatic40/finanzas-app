import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, CreditCard, Wallet, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type UpcomingPayment = {
  id: string
  name: string
  amount: number
  date: Date
  type: 'credit' | 'subscription'
  cardType: 'credit' | 'debit' | null
  cardName: string | null
}

export function UpcomingPayments() {
  const [payments, setPayments] = useState<UpcomingPayment[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUpcomingPayments()
  }, [])

  async function fetchUpcomingPayments() {
    setLoading(true)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    const [creditsRes, subscriptionsRes] = await Promise.all([
      supabase
        .from('credits')
        .select('id, name, monthly_payment, payment_day, credit_cards(name)')
        .eq('is_active', true),
      supabase
        .from('subscriptions')
        .select('id, name, amount, next_billing_date, credit_cards(name), debit_cards(name)')
        .eq('is_active', true)
        .gte('next_billing_date', today.toISOString().split('T')[0])
        .lte('next_billing_date', nextWeek.toISOString().split('T')[0]),
    ])

    const upcomingPayments: UpcomingPayment[] = []

    // Process credits - calculate next payment date based on payment_day
    if (creditsRes.data) {
      creditsRes.data.forEach((credit) => {
        const paymentDate = getNextPaymentDate(credit.payment_day)
        if (paymentDate <= nextWeek) {
          upcomingPayments.push({
            id: credit.id,
            name: credit.name,
            amount: credit.monthly_payment,
            date: paymentDate,
            type: 'credit',
            cardType: credit.credit_cards ? 'credit' : null,
            cardName: (credit.credit_cards as { name: string } | null)?.name ?? null,
          })
        }
      })
    }

    // Process subscriptions
    if (subscriptionsRes.data) {
      subscriptionsRes.data.forEach((sub) => {
        const creditCard = sub.credit_cards as { name: string } | null
        const debitCard = sub.debit_cards as { name: string } | null

        upcomingPayments.push({
          id: sub.id,
          name: sub.name,
          amount: sub.amount,
          date: new Date(sub.next_billing_date + 'T00:00:00'),
          type: 'subscription',
          cardType: creditCard ? 'credit' : debitCard ? 'debit' : null,
          cardName: creditCard?.name ?? debitCard?.name ?? null,
        })
      })
    }

    // Sort by date
    upcomingPayments.sort((a, b) => a.date.getTime() - b.date.getTime())

    setTotalCount(upcomingPayments.length)
    setPayments(upcomingPayments.slice(0, 5))
    setLoading(false)
  }

  function getNextPaymentDate(paymentDay: number): Date {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), paymentDay)

    if (thisMonth >= today) {
      return thisMonth
    }

    // Payment day already passed, use next month
    return new Date(today.getFullYear(), today.getMonth() + 1, paymentDay)
  }

  function formatDate(date: Date): string {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.getTime() === today.getTime()) {
      return 'Hoy'
    }
    if (date.getTime() === tomorrow.getTime()) {
      return 'Mañana'
    }

    return date.toLocaleDateString('es-MX', {
      weekday: 'short',
      day: 'numeric',
    })
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Próximos Pagos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Cargando...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-orange-500" />
          Próximos Pagos
          <span className="text-sm font-normal text-slate-500">(7 días)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <CalendarDays className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p>No hay pagos en los próximos 7 días</p>
            <p className="text-sm">¡Disfruta tu tranquilidad!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={`${payment.type}-${payment.id}`}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  {/* Date */}
                  <div className="w-14 text-center">
                    <span
                      className={`text-sm font-medium ${
                        formatDate(payment.date) === 'Hoy'
                          ? 'text-red-600'
                          : formatDate(payment.date) === 'Mañana'
                            ? 'text-orange-600'
                            : 'text-slate-600'
                      }`}
                    >
                      {formatDate(payment.date)}
                    </span>
                  </div>

                  {/* Info */}
                  <div>
                    <p className="font-medium text-slate-900">{payment.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          payment.type === 'credit'
                            ? 'text-blue-600 border-blue-300'
                            : 'text-purple-600 border-purple-300'
                        }`}
                      >
                        {payment.type === 'credit' ? 'Crédito' : 'Suscripción'}
                      </Badge>
                      {payment.cardName && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          {payment.cardType === 'credit' ? (
                            <CreditCard className="h-3 w-3" />
                          ) : (
                            <Wallet className="h-3 w-3" />
                          )}
                          {payment.cardName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <span className="font-semibold text-slate-900">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
            ))}

            {/* Show more link */}
            {totalCount > 5 && (
              <Link
                to="/subscriptions"
                className="flex items-center justify-center gap-1 pt-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Ver todos ({totalCount})
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
