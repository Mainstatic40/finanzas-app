import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { CreditCardForm } from '@/components/credit-cards/CreditCardForm'
import { CreditCardList } from '@/components/credit-cards/CreditCardList'
import { DebitCardForm } from '@/components/debit-cards/DebitCardForm'
import { DebitCardList } from '@/components/debit-cards/DebitCardList'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import { Plus } from 'lucide-react'
import type { Tables } from '@/types/database'

type CreditCardType = Tables<'credit_cards'>
type DebitCardType = Tables<'debit_cards'>

export function Cards() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'credit' | 'debit'>('credit')

  // Credit card state
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false)
  const [editingCreditCard, setEditingCreditCard] = useState<CreditCardType | null>(null)
  const [creditRefreshKey, setCreditRefreshKey] = useState(0)

  // Debit card state
  const [isDebitDialogOpen, setIsDebitDialogOpen] = useState(false)
  const [editingDebitCard, setEditingDebitCard] = useState<DebitCardType | null>(null)
  const [debitRefreshKey, setDebitRefreshKey] = useState(0)

  // Credit card handlers
  function handleNewCreditCard() {
    setEditingCreditCard(null)
    setIsCreditDialogOpen(true)
  }

  function handleEditCreditCard(card: CreditCardType) {
    setEditingCreditCard(card)
    setIsCreditDialogOpen(true)
  }

  async function handleDeleteCreditCard(id: string) {
    const confirmed = window.confirm('¿Estás seguro de eliminar esta tarjeta de crédito?')
    if (!confirmed) return

    const { error } = await supabase
      .from('credit_cards')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting credit card:', error)
      return
    }

    setCreditRefreshKey((prev) => prev + 1)
  }

  function handleCreditSuccess() {
    setIsCreditDialogOpen(false)
    setEditingCreditCard(null)
    setCreditRefreshKey((prev) => prev + 1)
  }

  // Debit card handlers
  function handleNewDebitCard() {
    setEditingDebitCard(null)
    setIsDebitDialogOpen(true)
  }

  function handleEditDebitCard(card: DebitCardType) {
    setEditingDebitCard(card)
    setIsDebitDialogOpen(true)
  }

  async function handleDeleteDebitCard(id: string) {
    const confirmed = window.confirm('¿Estás seguro de eliminar esta tarjeta de débito?')
    if (!confirmed) return

    const { error } = await supabase
      .from('debit_cards')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting debit card:', error)
      return
    }

    setDebitRefreshKey((prev) => prev + 1)
  }

  function handleDebitSuccess() {
    setIsDebitDialogOpen(false)
    setEditingDebitCard(null)
    setDebitRefreshKey((prev) => prev + 1)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Tarjetas</h2>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'credit' | 'debit')} className="w-full">
          <div className="flex items-center justify-between">
            <TabsList className="grid grid-cols-2 w-64">
              <TabsTrigger value="credit">Crédito</TabsTrigger>
              <TabsTrigger value="debit">Débito</TabsTrigger>
            </TabsList>
            {activeTab === 'credit' ? (
              <Button onClick={handleNewCreditCard}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Tarjeta de Crédito
              </Button>
            ) : (
              <Button onClick={handleNewDebitCard}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Tarjeta de Débito
              </Button>
            )}
          </div>

          <TabsContent value="credit" className="mt-4">
            <CreditCardList
              key={creditRefreshKey}
              onEdit={handleEditCreditCard}
              onDelete={handleDeleteCreditCard}
            />
          </TabsContent>

          <TabsContent value="debit" className="mt-4">
            <DebitCardList
              key={debitRefreshKey}
              onEdit={handleEditDebitCard}
              onDelete={handleDeleteDebitCard}
            />
          </TabsContent>
        </Tabs>

        {/* Credit Card Dialog */}
        <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingCreditCard ? 'Editar Tarjeta de Crédito' : 'Nueva Tarjeta de Crédito'}
              </DialogTitle>
              <DialogDescription>
                {editingCreditCard ? 'Modifica los datos de la tarjeta.' : 'Registra una nueva tarjeta de crédito.'}
              </DialogDescription>
            </DialogHeader>
            <CreditCardForm
              onSuccess={handleCreditSuccess}
              initialData={editingCreditCard ?? undefined}
            />
          </DialogContent>
        </Dialog>

        {/* Debit Card Dialog */}
        <Dialog open={isDebitDialogOpen} onOpenChange={setIsDebitDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingDebitCard ? 'Editar Tarjeta de Débito' : 'Nueva Tarjeta de Débito'}
              </DialogTitle>
              <DialogDescription>
                {editingDebitCard ? 'Modifica los datos de la tarjeta.' : 'Registra una nueva tarjeta de débito.'}
              </DialogDescription>
            </DialogHeader>
            <DebitCardForm
              onSuccess={handleDebitSuccess}
              initialData={editingDebitCard ?? undefined}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
