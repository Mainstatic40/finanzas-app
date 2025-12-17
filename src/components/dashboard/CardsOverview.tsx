import { useEffect, useState } from 'react'
import { CreditCard, Wallet } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type CreditCardData = {
  totalLimit: number
  totalUsed: number
  totalAvailable: number
  usagePercentage: number
}

type DebitCardData = {
  totalBalance: number
}

export function CardsOverview() {
  const [creditData, setCreditData] = useState<CreditCardData>({
    totalLimit: 0,
    totalUsed: 0,
    totalAvailable: 0,
    usagePercentage: 0,
  })
  const [debitData, setDebitData] = useState<DebitCardData>({ totalBalance: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCardsData()
  }, [])

  async function fetchCardsData() {
    setLoading(true)

    const [creditRes, debitRes] = await Promise.all([
      supabase
        .from('credit_cards')
        .select('credit_limit, current_balance')
        .eq('is_active', true),
      supabase
        .from('debit_cards')
        .select('current_balance')
        .eq('is_active', true),
    ])

    if (creditRes.error) {
      console.error('Error fetching credit cards:', creditRes.error)
    } else if (creditRes.data) {
      const totalLimit = creditRes.data.reduce(
        (sum, card) => sum + (card.credit_limit ?? 0),
        0
      )
      const totalUsed = creditRes.data.reduce(
        (sum, card) => sum + (card.current_balance ?? 0),
        0
      )
      const totalAvailable = totalLimit - totalUsed
      const usagePercentage = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0

      setCreditData({
        totalLimit,
        totalUsed,
        totalAvailable,
        usagePercentage,
      })
    }

    if (debitRes.error) {
      console.error('Error fetching debit cards:', debitRes.error)
    } else if (debitRes.data) {
      const totalBalance = debitRes.data.reduce(
        (sum, card) => sum + (card.current_balance ?? 0),
        0
      )
      setDebitData({ totalBalance })
    }

    setLoading(false)
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  function getUsageColor(percentage: number): string {
    if (percentage >= 80) return 'bg-red-500'
    if (percentage >= 50) return 'bg-orange-500'
    return 'bg-green-500'
  }

  function getUsageTextColor(percentage: number): string {
    if (percentage >= 80) return 'text-red-600'
    if (percentage >= 50) return 'text-orange-600'
    return 'text-green-600'
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Tarjetas de Crédito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500">Cargando...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Tarjetas de Débito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500">Cargando...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Credit Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-violet-600" />
            Tarjetas de Crédito
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Uso de línea</span>
              <span className={`font-medium ${getUsageTextColor(creditData.usagePercentage)}`}>
                {creditData.usagePercentage.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${getUsageColor(creditData.usagePercentage)}`}
                style={{ width: `${Math.min(100, creditData.usagePercentage)}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-slate-500">Línea total</p>
              <p className="font-semibold">{formatCurrency(creditData.totalLimit)}</p>
            </div>
            <div>
              <p className="text-slate-500">Usado</p>
              <p className={`font-semibold ${getUsageTextColor(creditData.usagePercentage)}`}>
                {formatCurrency(creditData.totalUsed)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Disponible</p>
              <p className="font-semibold text-green-600">
                {formatCurrency(creditData.totalAvailable)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debit Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-600" />
            Tarjetas de Débito
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="text-slate-500 text-sm">Total en cuentas</p>
            <p className="text-3xl font-bold text-emerald-600">
              {formatCurrency(debitData.totalBalance)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
