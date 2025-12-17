import { useEffect, useState } from 'react'
import { PieChart, MoreHorizontal } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getIconByName } from '@/lib/icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type CategoryExpense = {
  id: string | null
  name: string
  icon: string | null
  color: string | null
  amount: number
}

export function ExpensesByCategory() {
  const [categories, setCategories] = useState<CategoryExpense[]>([])
  const [total, setTotal] = useState(0)
  const [maxAmount, setMaxAmount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExpensesByCategory()
  }, [])

  async function fetchExpensesByCategory() {
    setLoading(true)

    // Get first and last day of current month
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const startDate = firstDay.toISOString().split('T')[0]
    const endDate = lastDay.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, category_id, categories(id, name, icon, color)')
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) {
      console.error('Error fetching expenses:', error)
      setLoading(false)
      return
    }

    if (data) {
      // Group by category
      const categoryMap = new Map<string, CategoryExpense>()

      data.forEach((transaction) => {
        const category = transaction.categories as {
          id: string
          name: string
          icon: string | null
          color: string | null
        } | null

        const key = category?.id ?? 'uncategorized'
        const existing = categoryMap.get(key)

        if (existing) {
          existing.amount += transaction.amount
        } else {
          categoryMap.set(key, {
            id: category?.id ?? null,
            name: category?.name ?? 'Sin categoría',
            icon: category?.icon ?? null,
            color: category?.color ?? null,
            amount: transaction.amount,
          })
        }
      })

      // Convert to array and sort by amount descending
      let sortedCategories = Array.from(categoryMap.values()).sort(
        (a, b) => b.amount - a.amount
      )

      // Calculate total
      const totalAmount = sortedCategories.reduce((sum, cat) => sum + cat.amount, 0)
      setTotal(totalAmount)

      // Group categories beyond top 5 into "Otros"
      if (sortedCategories.length > 5) {
        const top5 = sortedCategories.slice(0, 5)
        const others = sortedCategories.slice(5)
        const othersAmount = others.reduce((sum, cat) => sum + cat.amount, 0)

        sortedCategories = [
          ...top5,
          {
            id: null,
            name: 'Otros',
            icon: null,
            color: '#94a3b8', // slate-400
            amount: othersAmount,
          },
        ]
      }

      // Set max amount for progress bar calculation
      const max = sortedCategories.length > 0 ? sortedCategories[0].amount : 0
      setMaxAmount(max)

      setCategories(sortedCategories)
    }

    setLoading(false)
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  function getProgressWidth(amount: number): number {
    if (maxAmount === 0) return 0
    return (amount / maxAmount) * 100
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Gastos por Categoría
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
          <PieChart className="h-5 w-5 text-rose-500" />
          Gastos por Categoría
        </CardTitle>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <PieChart className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p>No hay gastos este mes</p>
            <p className="text-sm">¡Excelente ahorro!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Category list */}
            <div className="space-y-3">
              {categories.map((category, index) => {
                const Icon = category.icon
                  ? getIconByName(category.icon)
                  : category.name === 'Otros'
                    ? MoreHorizontal
                    : null

                return (
                  <div key={category.id ?? `other-${index}`} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {Icon && (
                          <div
                            className="p-1.5 rounded"
                            style={{
                              backgroundColor: `${category.color ?? '#6366f1'}20`,
                            }}
                          >
                            <Icon
                              className="h-4 w-4"
                              style={{ color: category.color ?? '#6366f1' }}
                            />
                          </div>
                        )}
                        <span className="text-sm font-medium text-slate-700">
                          {category.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        {formatCurrency(category.amount)}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${getProgressWidth(category.amount)}%`,
                          backgroundColor: category.color ?? '#6366f1',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Total del mes</span>
                <span className="text-lg font-bold text-slate-900">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
