import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { CreditForm } from '@/components/credits/CreditForm'
import { CreditList } from '@/components/credits/CreditList'
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

type CreditType = Tables<'credits'>

export function Credits() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCredit, setEditingCredit] = useState<CreditType | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  function handleNewCredit() {
    setEditingCredit(null)
    setIsDialogOpen(true)
  }

  function handleEdit(credit: CreditType) {
    setEditingCredit(credit)
    setIsDialogOpen(true)
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm('¿Estás seguro de eliminar este crédito?')
    if (!confirmed) return

    // 1. Get the credit to check if it has a linked card
    const { data: credit, error: fetchError } = await supabase
      .from('credits')
      .select('id, credit_card_id, current_balance, is_active')
      .eq('id', id)
      .single()

    if (fetchError || !credit) {
      console.error('Error fetching credit:', fetchError)
      return
    }

    // 2. If credit has a linked card, restore the card's balance
    if (credit.credit_card_id) {
      // Get the card's current balance
      const { data: card, error: cardFetchError } = await supabase
        .from('credit_cards')
        .select('current_balance')
        .eq('id', credit.credit_card_id)
        .single()

      if (cardFetchError || !card) {
        console.error('Error fetching card:', cardFetchError)
      } else {
        // Subtract credit's current_balance from card's current_balance
        const newCardBalance = Math.max(0, (card.current_balance ?? 0) - credit.current_balance)

        const { error: cardUpdateError } = await supabase
          .from('credit_cards')
          .update({ current_balance: newCardBalance })
          .eq('id', credit.credit_card_id)

        if (cardUpdateError) {
          console.error('Error updating card balance:', cardUpdateError)
        }
      }
    }

    // 3. Delete the credit
    const { error } = await supabase
      .from('credits')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting credit:', error)
      return
    }

    setRefreshKey((prev) => prev + 1)
  }

  function handleSuccess() {
    setIsDialogOpen(false)
    setEditingCredit(null)
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Créditos</h2>
          <Button onClick={handleNewCredit}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Crédito
          </Button>
        </div>

        <CreditList
          key={refreshKey}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingCredit ? 'Editar Crédito' : 'Nuevo Crédito'}
              </DialogTitle>
              <DialogDescription>
                {editingCredit ? 'Modifica los datos del crédito.' : 'Registra un nuevo préstamo o crédito.'}
              </DialogDescription>
            </DialogHeader>
            <CreditForm
              onSuccess={handleSuccess}
              initialData={editingCredit ?? undefined}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
