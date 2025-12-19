import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/DatePicker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Tables } from '@/types/database'

type Category = Tables<'categories'>
type CreditCard = Tables<'credit_cards'>
type DebitCard = Tables<'debit_cards'>
type Credit = Tables<'credits'>

// UI type includes 'credit_payment' for better UX, but stores as 'expense' in DB
type UITransactionType = 'income' | 'expense' | 'credit_payment'

const transactionSchema = z.object({
  ui_type: z.enum(['income', 'expense', 'credit_payment'], { message: 'Selecciona un tipo' }),
  amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
  description: z.string().optional(),
  date: z.string().min(1, 'La fecha es requerida'),
  category_id: z.string().optional(),
  credit_card_id: z.string().optional(),
  debit_card_id: z.string().optional(),
  credit_id: z.string().optional(),
  is_recurring: z.boolean().default(false),
})

type TransactionFormData = z.infer<typeof transactionSchema>

type Props = {
  onSuccess: () => void
  initialData?: Tables<'transactions'>
}

export function TransactionForm({ onSuccess, initialData }: Props) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [debitCards, setDebitCards] = useState<DebitCard[]>([])
  const [credits, setCredits] = useState<Credit[]>([])

  const today = new Date().toISOString().split('T')[0]

  // Determine initial UI type based on existing data
  function getInitialUIType(): UITransactionType | undefined {
    if (!initialData) return undefined
    if (initialData.credit_id) return 'credit_payment'
    return initialData.type as 'income' | 'expense'
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: {
      ui_type: getInitialUIType(),
      amount: initialData?.amount ?? undefined,
      description: initialData?.description ?? '',
      date: initialData?.date ?? today,
      category_id: initialData?.category_id ?? '',
      credit_card_id: initialData?.credit_card_id ?? '',
      debit_card_id: initialData?.debit_card_id ?? '',
      credit_id: initialData?.credit_id ?? '',
      is_recurring: initialData?.is_recurring ?? false,
    },
  })

  const selectedUIType = watch('ui_type')
  const selectedCategoryId = watch('category_id') || ''
  const selectedCreditCardId = watch('credit_card_id') || ''
  const selectedDebitCardId = watch('debit_card_id') || ''
  const selectedCreditId = watch('credit_id') || ''
  const isRecurring = watch('is_recurring')

  // Derived: actual DB type
  const actualType = selectedUIType === 'credit_payment' ? 'expense' : selectedUIType

  // Fetch categories, credit cards, debit cards, and credits on mount
  useEffect(() => {
    async function fetchData() {
      const [categoriesRes, creditCardsRes, debitCardsRes, creditsRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('credit_cards').select('*').neq('is_active', false).order('name'),
        supabase.from('debit_cards').select('*').neq('is_active', false).order('name'),
        supabase.from('credits').select('*').neq('is_active', false).order('name'),
      ])

      if (categoriesRes.data) setCategories(categoriesRes.data)
      if (creditCardsRes.data) setCreditCards(creditCardsRes.data)
      if (debitCardsRes.data) setDebitCards(debitCardsRes.data)
      if (creditsRes.data) setCredits(creditsRes.data)
    }

    fetchData()
  }, [])

  // Filter categories by actual type (income/expense)
  const filteredCategories = categories.filter(
    (cat) => !actualType || cat.type === actualType
  )

  // Filter credits: for credit_payment show all, for expense filter by card
  const filteredCredits = selectedUIType === 'credit_payment'
    ? credits // Show all credits for credit payment
    : selectedCreditCardId
      ? credits.filter((credit) => credit.credit_card_id === selectedCreditCardId)
      : credits

  // Reset category when type changes if current category doesn't match
  useEffect(() => {
    if (actualType && selectedCategoryId) {
      const currentCategory = categories.find((c) => c.id === selectedCategoryId)
      if (currentCategory && currentCategory.type !== actualType) {
        setValue('category_id', '')
      }
    }
  }, [actualType, selectedCategoryId, categories, setValue])

  // Reset credit_id when type changes to income
  useEffect(() => {
    if (selectedUIType === 'income' && selectedCreditId) {
      setValue('credit_id', '')
    }
  }, [selectedUIType, selectedCreditId, setValue])

  // Reset credit_id when switching away from credit_payment mode
  useEffect(() => {
    if (selectedUIType === 'expense' && selectedCreditId) {
      // Keep credit_id only if it matches the selected card
      const selectedCredit = credits.find((c) => c.id === selectedCreditId)
      if (selectedCredit && selectedCreditCardId && selectedCredit.credit_card_id !== selectedCreditCardId) {
        setValue('credit_id', '')
      }
    }
  }, [selectedUIType, selectedCreditCardId, selectedCreditId, credits, setValue])

  // Auto-populate credit_card_id when selecting a credit in credit_payment mode
  useEffect(() => {
    if (selectedUIType === 'credit_payment' && selectedCreditId) {
      const selectedCredit = credits.find((c) => c.id === selectedCreditId)
      if (selectedCredit?.credit_card_id) {
        setValue('credit_card_id', selectedCredit.credit_card_id)
        setValue('debit_card_id', '') // Clear debit card
      }
    }
  }, [selectedUIType, selectedCreditId, credits, setValue])

  // Mutual exclusivity: clear debit card when credit card is selected
  useEffect(() => {
    if (selectedCreditCardId && selectedDebitCardId) {
      setValue('debit_card_id', '')
    }
  }, [selectedCreditCardId, selectedDebitCardId, setValue])

  // Mutual exclusivity: clear credit card when debit card is selected
  useEffect(() => {
    if (selectedDebitCardId && selectedCreditCardId && selectedUIType !== 'credit_payment') {
      setValue('credit_card_id', '')
    }
  }, [selectedDebitCardId, selectedCreditCardId, selectedUIType, setValue])

  // Helper to update debit card balance
  async function updateDebitCardBalance(cardId: string, amount: number, isIncome: boolean) {
    const { data: card } = await supabase
      .from('debit_cards')
      .select('current_balance')
      .eq('id', cardId)
      .single()

    if (card) {
      const currentBalance = card.current_balance ?? 0
      // Income adds, expense subtracts
      const newBalance = isIncome ? currentBalance + amount : currentBalance - amount
      await supabase
        .from('debit_cards')
        .update({ current_balance: Math.max(0, newBalance) })
        .eq('id', cardId)
    }
  }

  // Helper to update credit card balance (for non-MSI purchases)
  async function updateCreditCardBalance(cardId: string, amount: number, isAdding: boolean) {
    const { data: card } = await supabase
      .from('credit_cards')
      .select('current_balance')
      .eq('id', cardId)
      .single()

    if (card) {
      const currentBalance = card.current_balance ?? 0
      const newBalance = isAdding ? currentBalance + amount : currentBalance - amount
      await supabase
        .from('credit_cards')
        .update({ current_balance: Math.max(0, newBalance) })
        .eq('id', cardId)
    }
  }

  async function onSubmit(data: TransactionFormData) {
    if (!user) return

    // Convert UI type to DB type
    const dbType = data.ui_type === 'credit_payment' ? 'expense' : data.ui_type

    const transactionData = {
      type: dbType,
      amount: data.amount,
      description: data.description || null,
      date: data.date,
      category_id: data.category_id || null,
      credit_card_id: data.credit_card_id || null,
      debit_card_id: data.debit_card_id || null,
      credit_id: data.credit_id || null,
      is_recurring: data.is_recurring,
      user_id: user.id,
    }

    if (initialData) {
      // EDITING: First revert old card balances, then apply new ones
      const oldType = initialData.type
      const oldAmount = initialData.amount

      // Revert old debit card balance
      if (initialData.debit_card_id) {
        // If it was income, subtract to revert; if expense, add to revert
        await updateDebitCardBalance(initialData.debit_card_id, oldAmount, oldType !== 'income')
      }

      // Revert old credit card balance (only if no credit_id - not MSI)
      if (initialData.credit_card_id && !initialData.credit_id && oldType === 'expense') {
        await updateCreditCardBalance(initialData.credit_card_id, oldAmount, false)
      }

      // Update the transaction
      const { error } = await supabase
        .from('transactions')
        .update(transactionData)
        .eq('id', initialData.id)

      if (error) throw error

      // Apply new debit card balance
      if (data.debit_card_id) {
        await updateDebitCardBalance(data.debit_card_id, data.amount, dbType === 'income')
      }

      // Apply new credit card balance (only if no credit_id - not MSI)
      if (data.credit_card_id && !data.credit_id && dbType === 'expense') {
        await updateCreditCardBalance(data.credit_card_id, data.amount, true)
      }
    } else {
      // CREATING: Insert new transaction
      const { error } = await supabase.from('transactions').insert(transactionData)

      if (error) throw error

      // Update debit card balance
      if (data.debit_card_id) {
        await updateDebitCardBalance(data.debit_card_id, data.amount, dbType === 'income')
      }

      // Update credit card balance (only for regular expenses, not MSI payments)
      if (data.credit_card_id && !data.credit_id && dbType === 'expense') {
        await updateCreditCardBalance(data.credit_card_id, data.amount, true)
      }

      // If credit_id is selected (credit/MSI payment), update the credit's current_balance
      if (data.credit_id && (data.ui_type === 'credit_payment' || data.ui_type === 'expense')) {
        const selectedCredit = credits.find((c) => c.id === data.credit_id)
        if (selectedCredit) {
          const newBalance = Math.max(0, selectedCredit.current_balance - data.amount)

          // Update credit balance
          const creditUpdate: { current_balance: number; is_active?: boolean } = {
            current_balance: newBalance
          }

          // If credit is fully paid, mark as inactive
          if (newBalance <= 0) {
            creditUpdate.is_active = false
          }

          const { error: creditError } = await supabase
            .from('credits')
            .update(creditUpdate)
            .eq('id', data.credit_id)

          if (creditError) {
            console.error('Error updating credit balance:', creditError)
          }

          // If credit is fully paid and linked to a card, release the card balance
          if (newBalance <= 0 && selectedCredit.credit_card_id) {
            const { data: card } = await supabase
              .from('credit_cards')
              .select('current_balance')
              .eq('id', selectedCredit.credit_card_id)
              .single()

            if (card) {
              const newCardBalance = Math.max(0, (card.current_balance ?? 0) - selectedCredit.original_amount)
              await supabase
                .from('credit_cards')
                .update({ current_balance: newCardBalance })
                .eq('id', selectedCredit.credit_card_id)
            }
          }
        }
      }
    }

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select
          value={selectedUIType}
          onValueChange={(value: UITransactionType) => setValue('ui_type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Ingreso</SelectItem>
            <SelectItem value="expense">Gasto</SelectItem>
            <SelectItem value="credit_payment">Pago de crédito</SelectItem>
          </SelectContent>
        </Select>
        {errors.ui_type && (
          <p className="text-sm text-red-500">{errors.ui_type.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Monto</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('amount')}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Fecha</Label>
          <DatePicker
            value={watch('date') ? new Date(watch('date') + 'T00:00:00') : undefined}
            onChange={(date) => setValue('date', date ? format(date, 'yyyy-MM-dd') : '')}
            placeholder="Fecha de transacción"
          />
          {errors.date && (
            <p className="text-sm text-red-500">{errors.date.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Input
          id="description"
          placeholder="Ej: Compra en supermercado"
          {...register('description')}
        />
      </div>

      {/* Category selector - hide for credit_payment */}
      {selectedUIType !== 'credit_payment' && (
        <div className="space-y-2">
          <Label>Categoría</Label>
          <Select
            value={selectedCategoryId}
            onValueChange={(value) => setValue('category_id', value)}
            disabled={!selectedUIType}
          >
            <SelectTrigger>
              <SelectValue placeholder={selectedUIType ? 'Selecciona categoría' : 'Primero selecciona un tipo'} />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom" className="max-h-[200px] overflow-y-auto">
              {filteredCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Debit card selector - show for income (deposits) */}
      {selectedUIType === 'income' && (
        <div className="space-y-2">
          <Label>Tarjeta de débito (opcional)</Label>
          <Select
            value={selectedDebitCardId}
            onValueChange={(value) => setValue('debit_card_id', value === 'none' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sin tarjeta" />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom" className="max-h-[200px] overflow-y-auto">
              <SelectItem value="none">Sin tarjeta</SelectItem>
              {debitCards.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  {card.name} ({card.bank})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-slate-500">
            Selecciona la cuenta donde se depositó el ingreso.
          </p>
        </div>
      )}

      {/* Payment method for expense - credit or debit card */}
      {selectedUIType === 'expense' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tarjeta de crédito (opcional)</Label>
            <Select
              value={selectedCreditCardId}
              onValueChange={(value) => {
                setValue('credit_card_id', value === 'none' ? '' : value)
                if (value !== 'none') setValue('debit_card_id', '')
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin tarjeta de crédito" />
              </SelectTrigger>
              <SelectContent position="popper" side="bottom" className="max-h-[200px] overflow-y-auto">
                <SelectItem value="none">Sin tarjeta de crédito</SelectItem>
                {creditCards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.name} ({card.bank})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tarjeta de débito (opcional)</Label>
            <Select
              value={selectedDebitCardId}
              onValueChange={(value) => {
                setValue('debit_card_id', value === 'none' ? '' : value)
                if (value !== 'none') setValue('credit_card_id', '')
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin tarjeta de débito" />
              </SelectTrigger>
              <SelectContent position="popper" side="bottom" className="max-h-[200px] overflow-y-auto">
                <SelectItem value="none">Sin tarjeta de débito</SelectItem>
                {debitCards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.name} ({card.bank})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Credit selector for credit_payment - shows all credits */}
      {selectedUIType === 'credit_payment' && (
        <div className="space-y-2">
          <Label>Selecciona el crédito a pagar</Label>
          <Select
            value={selectedCreditId}
            onValueChange={(value) => setValue('credit_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un crédito" />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom" className="max-h-[200px] overflow-y-auto">
              {filteredCredits.map((credit) => (
                <SelectItem key={credit.id} value={credit.id}>
                  {credit.name} - Saldo: {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(credit.current_balance)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filteredCredits.length === 0 && (
            <p className="text-sm text-slate-500">
              No hay créditos activos.
            </p>
          )}
          {selectedCreditId && !initialData && (
            <p className="text-sm text-slate-500">
              Al guardar, se descontará el monto del saldo del crédito.
            </p>
          )}
        </div>
      )}

      {/* Credit selector for expense - optional, filtered by card */}
      {selectedUIType === 'expense' && (
        <div className="space-y-2">
          <Label>¿Es pago de un crédito? (opcional)</Label>
          <Select
            value={selectedCreditId}
            onValueChange={(value) => setValue('credit_id', value === 'none' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="No es pago de crédito" />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom" className="max-h-[200px] overflow-y-auto">
              <SelectItem value="none">No es pago de crédito</SelectItem>
              {filteredCredits.map((credit) => (
                <SelectItem key={credit.id} value={credit.id}>
                  {credit.name} - Saldo: {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(credit.current_balance)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCreditCardId && filteredCredits.length === 0 && (
            <p className="text-sm text-slate-500">
              No hay créditos vinculados a esta tarjeta.
            </p>
          )}
          {selectedCreditId && !initialData && (
            <p className="text-sm text-slate-500">
              Al guardar, se descontará el monto del saldo del crédito.
            </p>
          )}
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_recurring"
          checked={isRecurring}
          onCheckedChange={(checked) => setValue('is_recurring', checked === true)}
        />
        <Label htmlFor="is_recurring" className="cursor-pointer">
          Transacción recurrente
        </Label>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
      </Button>
    </form>
  )
}
