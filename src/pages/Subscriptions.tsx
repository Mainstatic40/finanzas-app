import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { SubscriptionForm } from '@/components/subscriptions/SubscriptionForm'
import { SubscriptionList } from '@/components/subscriptions/SubscriptionList'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { Plus, RefreshCw } from 'lucide-react'
import type { Tables } from '@/types/database'

type Subscription = Tables<'subscriptions'> & {
  categories: { name: string; icon: string | null; color: string | null } | null
  credit_cards: { name: string; bank: string } | null
  debit_cards: { name: string; bank: string } | null
}

export function Subscriptions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [summary, setSummary] = useState({ monthlyTotal: 0, activeCount: 0 })

  // Fetch summary data
  useEffect(() => {
    fetchSummary()
  }, [refreshKey])

  async function fetchSummary() {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('amount, billing_cycle, is_active')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching summary:', error)
      return
    }

    if (data) {
      const monthlyTotal = data.reduce((sum, sub) => {
        let monthlyAmount = sub.amount
        switch (sub.billing_cycle) {
          case 'weekly':
            monthlyAmount = sub.amount * 4
            break
          case 'yearly':
            monthlyAmount = sub.amount / 12
            break
          // monthly stays as is
        }
        return sum + monthlyAmount
      }, 0)

      setSummary({
        monthlyTotal,
        activeCount: data.length,
      })
    }
  }

  function handleNewSubscription() {
    setEditingSubscription(null)
    setIsDialogOpen(true)
  }

  function handleEdit(subscription: Subscription) {
    setEditingSubscription(subscription)
    setIsDialogOpen(true)
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm('¿Estás seguro de eliminar esta suscripción?')
    if (!confirmed) return

    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting subscription:', error)
      return
    }

    setRefreshKey((prev) => prev + 1)
  }

  function handleSuccess() {
    setIsDialogOpen(false)
    setEditingSubscription(null)
    setRefreshKey((prev) => prev + 1)
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
        {/* Header with summary */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Suscripciones</h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <RefreshCw className="h-4 w-4" />
                {summary.activeCount} activas
              </span>
              <span className="text-slate-400">•</span>
              <span>
                Total mensual estimado:{' '}
                <span className="font-semibold text-slate-900">
                  {formatCurrency(summary.monthlyTotal)}
                </span>
              </span>
            </div>
          </div>
          <Button onClick={handleNewSubscription}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Suscripción
          </Button>
        </div>

        {/* Subscription List */}
        <SubscriptionList
          key={refreshKey}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Dialog for Create/Edit */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSubscription ? 'Editar Suscripción' : 'Nueva Suscripción'}
              </DialogTitle>
              <DialogDescription>
                {editingSubscription
                  ? 'Modifica los datos de la suscripción.'
                  : 'Registra una nueva suscripción recurrente.'}
              </DialogDescription>
            </DialogHeader>
            <SubscriptionForm
              onSuccess={handleSuccess}
              initialData={editingSubscription ?? undefined}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
