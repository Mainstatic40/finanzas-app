import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type MonthlyData = {
  income: number
  expenses: number
  balance: number
}

export function MonthlyBalance() {
  const [data, setData] = useState<MonthlyData>({ income: 0, expenses: 0, balance: 0 })
  const [loading, setLoading] = useState(true)

  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  })
  // Capitalize first letter
  const monthTitle = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)

  useEffect(() => {
    fetchMonthlyData()
  }, [])

  async function fetchMonthlyData() {
    setLoading(true)

    // Get first and last day of current month
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const startDate = firstDay.toISOString().split('T')[0]
    const endDate = lastDay.toISOString().split('T')[0]

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('type, amount')
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) {
      console.error('Error fetching monthly data:', error)
      setLoading(false)
      return
    }

    if (transactions) {
      const income = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

      const expenses = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      setData({
        income,
        expenses,
        balance: income - expenses,
      })
    }

    setLoading(false)
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
          <CardTitle className="text-lg">{monthTitle}</CardTitle>
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
        <CardTitle className="text-lg">{monthTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {/* Income */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Ingresos
            </div>
            <p className="text-xl font-semibold text-green-600">
              {formatCurrency(data.income)}
            </p>
          </div>

          {/* Expenses */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Gastos
            </div>
            <p className="text-xl font-semibold text-red-600">
              {formatCurrency(data.expenses)}
            </p>
          </div>

          {/* Balance */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Wallet className="h-4 w-4 text-blue-500" />
              Balance
            </div>
            <p
              className={`text-xl font-semibold ${
                data.balance >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(data.balance)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
