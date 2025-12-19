import { useEffect, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getIconByName } from '@/lib/icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Tables } from '@/types/database'
import type { TransactionFilters } from './TransactionFilters'

type Transaction = Tables<'transactions'> & {
  categories: { name: string; icon: string | null; color: string | null } | null
  credit_cards: { name: string; bank: string } | null
  debit_cards: { name: string; bank: string } | null
  credits: { name: string; institution: string } | null
}

type Props = {
  filters: TransactionFilters
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

export function TransactionList({ filters, onEdit, onDelete }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [filters])

  async function fetchTransactions() {
    setLoading(true)

    let query = supabase
      .from('transactions')
      .select(`
        *,
        categories (name, icon, color),
        credit_cards (name, bank),
        debit_cards (name, bank),
        credits (name, institution)
      `)

    // Apply filters dynamically
    if (filters.dateFrom) {
      query = query.gte('date', filters.dateFrom)
    }
    if (filters.dateTo) {
      query = query.lte('date', filters.dateTo)
    }
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId)
    }
    if (filters.type) {
      query = query.eq('type', filters.type)
    }
    if (filters.creditCardId) {
      query = query.eq('credit_card_id', filters.creditCardId)
    }
    if (filters.debitCardId) {
      query = query.eq('debit_card_id', filters.debitCardId)
    }

    const { data, error } = await query.order('date', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
    } else {
      setTransactions((data as Transaction[]) ?? [])
    }
    setLoading(false)
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const hasActiveFilters =
    filters.dateFrom ||
    filters.dateTo ||
    filters.categoryId ||
    filters.type ||
    filters.creditCardId ||
    filters.debitCardId

  if (loading) {
    return <p className="text-slate-600">Cargando transacciones...</p>
  }

  if (transactions.length === 0) {
    return (
      <p className="text-slate-600">
        {hasActiveFilters
          ? 'No se encontraron transacciones con los filtros seleccionados.'
          : 'No hay transacciones. Crea una nueva.'}
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-600 mb-4">
        Mostrando {transactions.length} transaccion{transactions.length !== 1 ? 'es' : ''}
      </p>
      {transactions.map((transaction) => {
        const isIncome = transaction.type === 'income'
        const CategoryIcon = transaction.categories
          ? getIconByName(transaction.categories.icon)
          : null

        return (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200"
          >
            <div className="flex items-center gap-4">
              {CategoryIcon && (
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: `${transaction.categories?.color ?? '#6366f1'}20`,
                  }}
                >
                  <CategoryIcon
                    className="h-5 w-5"
                    style={{ color: transaction.categories?.color ?? '#6366f1' }}
                  />
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">
                    {transaction.description || transaction.categories?.name || 'Sin descripción'}
                  </span>
                  {transaction.categories && (
                    <Badge variant="outline" className="text-xs">
                      {transaction.categories.name}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>{formatDate(transaction.date)}</span>
                  {transaction.credit_cards && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs text-violet-600 border-violet-300">
                        TC: {transaction.credit_cards.name}
                      </Badge>
                    </>
                  )}
                  {transaction.debit_cards && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">
                        TD: {transaction.debit_cards.name}
                      </Badge>
                    </>
                  )}
                  {transaction.is_recurring && (
                    <>
                      <span>•</span>
                      <Badge variant="secondary" className="text-xs">
                        Recurrente
                      </Badge>
                    </>
                  )}
                </div>

                {transaction.credits && (
                  <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                    Pago de: {transaction.credits.name}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`font-semibold ${
                  isIncome ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
              </span>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(transaction)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(transaction.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
