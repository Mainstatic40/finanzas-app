import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { TransactionList } from '@/components/transactions/TransactionList'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { Plus } from 'lucide-react'
import type { Tables } from '@/types/database'

type Transaction = Tables<'transactions'> & {
  categories: { name: string; icon: string | null; color: string | null } | null
  credit_cards: { name: string; bank: string } | null
  credits: { name: string; institution: string } | null
}

export function Transactions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  function handleNewTransaction() {
    setEditingTransaction(null)
    setIsDialogOpen(true)
  }

  function handleEdit(transaction: Transaction) {
    setEditingTransaction(transaction)
    setIsDialogOpen(true)
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm('¿Estás seguro de eliminar esta transacción?')
    if (!confirmed) return

    // First, get the transaction with all related data
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching transaction:', fetchError)
      return
    }

    // Revert debit card balance if applicable
    if (transaction.debit_card_id) {
      const { data: debitCard } = await supabase
        .from('debit_cards')
        .select('current_balance')
        .eq('id', transaction.debit_card_id)
        .single()

      if (debitCard) {
        const currentBalance = debitCard.current_balance ?? 0
        // Reverse the original operation: income was added, so subtract; expense was subtracted, so add
        const newBalance = transaction.type === 'income'
          ? currentBalance - transaction.amount
          : currentBalance + transaction.amount

        await supabase
          .from('debit_cards')
          .update({ current_balance: Math.max(0, newBalance) })
          .eq('id', transaction.debit_card_id)
      }
    }

    // Revert credit card balance if applicable (only for purchases, not credit payments)
    if (transaction.credit_card_id && !transaction.credit_id && transaction.type === 'expense') {
      const { data: creditCard } = await supabase
        .from('credit_cards')
        .select('current_balance')
        .eq('id', transaction.credit_card_id)
        .single()

      if (creditCard) {
        const currentBalance = creditCard.current_balance ?? 0
        // Expense added to balance, so subtract it back
        const newBalance = currentBalance - transaction.amount

        await supabase
          .from('credit_cards')
          .update({ current_balance: Math.max(0, newBalance) })
          .eq('id', transaction.credit_card_id)
      }
    }

    // Revert credit (loan) balance if this was a credit payment
    if (transaction.credit_id && transaction.type === 'expense') {
      const { data: credit } = await supabase
        .from('credits')
        .select('current_balance')
        .eq('id', transaction.credit_id)
        .single()

      if (credit) {
        const currentBalance = credit.current_balance ?? 0
        // Payment reduced balance, so add it back
        const newBalance = currentBalance + transaction.amount

        await supabase
          .from('credits')
          .update({ current_balance: newBalance })
          .eq('id', transaction.credit_id)
      }
    }

    // Delete the transaction
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting transaction:', error)
      return
    }

    setRefreshKey((prev) => prev + 1)
  }

  function handleSuccess() {
    setIsDialogOpen(false)
    setEditingTransaction(null)
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Transacciones</h2>
          <Button onClick={handleNewTransaction}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Transacción
          </Button>
        </div>

        <TransactionList
          key={refreshKey}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? 'Editar Transacción' : 'Nueva Transacción'}
              </DialogTitle>
              <DialogDescription>
                {editingTransaction ? 'Modifica los datos de la transacción.' : 'Registra un nuevo ingreso o gasto.'}
              </DialogDescription>
            </DialogHeader>
            <TransactionForm
              onSuccess={handleSuccess}
              initialData={editingTransaction ?? undefined}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
