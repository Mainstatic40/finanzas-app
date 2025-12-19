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

type CreditCard = Tables<'credit_cards'>

const creditSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  institution: z.string().min(1, 'La institución es requerida'),
  original_amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
  current_balance: z.coerce.number().min(0, 'El saldo no puede ser negativo'),
  monthly_payment: z.coerce.number().positive('El pago debe ser mayor a 0'),
  interest_rate: z.coerce.number().min(0).optional(),
  payment_day: z.coerce.number().min(1).max(31, 'Debe ser entre 1 y 31'),
  start_date: z.string().min(1, 'La fecha de inicio es requerida'),
  end_date: z.string().optional(),
  credit_card_id: z.string().optional(),
  is_active: z.boolean().default(true),
})

type CreditFormData = z.infer<typeof creditSchema>

type Props = {
  onSuccess: () => void
  initialData?: Tables<'credits'> & { credit_card_id?: string | null }
}

const days = Array.from({ length: 31 }, (_, i) => i + 1)

export function CreditForm({ onSuccess, initialData }: Props) {
  const { user } = useAuth()
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreditFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(creditSchema) as any,
    defaultValues: {
      name: initialData?.name ?? '',
      institution: initialData?.institution ?? '',
      original_amount: initialData?.original_amount ?? undefined,
      current_balance: initialData?.current_balance ?? undefined,
      monthly_payment: initialData?.monthly_payment ?? undefined,
      interest_rate: initialData?.interest_rate ?? undefined,
      payment_day: initialData?.payment_day ?? 1,
      start_date: initialData?.start_date ?? '',
      end_date: initialData?.end_date ?? '',
      credit_card_id: initialData?.credit_card_id ?? '',
      is_active: initialData?.is_active ?? true,
    },
  })

  const paymentDay = watch('payment_day')
  const selectedCreditCardId = watch('credit_card_id') || ''
  const isActive = watch('is_active')

  // Fetch credit cards on mount
  useEffect(() => {
    async function fetchCreditCards() {
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .neq('is_active', false)
        .order('name')

      if (error) {
        console.error('Error fetching credit cards:', error)
      } else {
        setCreditCards(data ?? [])
      }
    }

    fetchCreditCards()
  }, [])

  async function onSubmit(data: CreditFormData) {
    if (!user) return

    const creditData = {
      name: data.name,
      institution: data.institution,
      original_amount: data.original_amount,
      current_balance: data.current_balance,
      monthly_payment: data.monthly_payment,
      interest_rate: data.interest_rate ?? null,
      payment_day: data.payment_day,
      start_date: data.start_date,
      end_date: data.end_date || null,
      credit_card_id: data.credit_card_id || null,
      is_active: data.is_active,
      user_id: user.id,
    }

    if (initialData) {
      // Editing existing credit
      const oldCardId = initialData.credit_card_id
      const newCardId = data.credit_card_id || null
      const oldAmount = initialData.original_amount
      const newAmount = data.original_amount

      // If card changed or amount changed, adjust balances
      if (oldCardId !== newCardId || oldAmount !== newAmount) {
        // Remove old amount from old card
        if (oldCardId && initialData.is_active) {
          try {
            await supabase.rpc('increment_card_balance', {
              card_id: oldCardId,
              amount: -oldAmount
            })
          } catch {
            // Fallback if RPC doesn't exist
            const { data: card } = await supabase
              .from('credit_cards')
              .select('current_balance')
              .eq('id', oldCardId)
              .single()

            if (card) {
              await supabase
                .from('credit_cards')
                .update({ current_balance: Math.max(0, (card.current_balance ?? 0) - oldAmount) })
                .eq('id', oldCardId)
            }
          }
        }

        // Add new amount to new card
        if (newCardId && data.is_active) {
          const { data: card } = await supabase
            .from('credit_cards')
            .select('current_balance')
            .eq('id', newCardId)
            .single()

          if (card) {
            await supabase
              .from('credit_cards')
              .update({ current_balance: (card.current_balance ?? 0) + newAmount })
              .eq('id', newCardId)
          }
        }
      }

      const { error } = await supabase
        .from('credits')
        .update(creditData)
        .eq('id', initialData.id)

      if (error) throw error
    } else {
      // Creating new credit
      const { error } = await supabase.from('credits').insert(creditData)

      if (error) throw error

      // If credit is linked to a card, add original_amount to card's current_balance
      if (data.credit_card_id) {
        const { data: card } = await supabase
          .from('credit_cards')
          .select('current_balance')
          .eq('id', data.credit_card_id)
          .single()

        if (card) {
          await supabase
            .from('credit_cards')
            .update({ current_balance: (card.current_balance ?? 0) + data.original_amount })
            .eq('id', data.credit_card_id)
        }
      }
    }

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del crédito</Label>
          <Input
            id="name"
            placeholder="Ej: Préstamo auto"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="institution">Institución</Label>
          <Input
            id="institution"
            placeholder="Ej: Banco XYZ"
            {...register('institution')}
          />
          {errors.institution && (
            <p className="text-sm text-red-500">{errors.institution.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tarjeta de crédito (opcional)</Label>
        <Select
          value={selectedCreditCardId}
          onValueChange={(value) => setValue('credit_card_id', value === 'none' ? '' : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sin tarjeta vinculada" />
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" className="max-h-[200px] overflow-y-auto">
            <SelectItem value="none">Sin tarjeta vinculada</SelectItem>
            {creditCards.map((card) => (
              <SelectItem key={card.id} value={card.id}>
                {card.name} ({card.bank})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500">
          Vincula este crédito a una tarjeta si fue comprado a meses sin intereses.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="original_amount">Monto original</Label>
          <Input
            id="original_amount"
            type="number"
            placeholder="100000"
            {...register('original_amount')}
          />
          {errors.original_amount && (
            <p className="text-sm text-red-500">{errors.original_amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="current_balance">Saldo actual</Label>
          <Input
            id="current_balance"
            type="number"
            placeholder="75000"
            {...register('current_balance')}
          />
          {errors.current_balance && (
            <p className="text-sm text-red-500">{errors.current_balance.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="monthly_payment">Pago mensual</Label>
          <Input
            id="monthly_payment"
            type="number"
            placeholder="5000"
            {...register('monthly_payment')}
          />
          {errors.monthly_payment && (
            <p className="text-sm text-red-500">{errors.monthly_payment.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="interest_rate">Tasa de interés (% anual)</Label>
          <Input
            id="interest_rate"
            type="number"
            step="0.01"
            placeholder="12.5"
            {...register('interest_rate')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Día de pago</Label>
        <Select
          value={String(paymentDay)}
          onValueChange={(value) => setValue('payment_day', Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona día" />
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" className="max-h-[200px] overflow-y-auto">
            {days.map((day) => (
              <SelectItem key={day} value={String(day)}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.payment_day && (
          <p className="text-sm text-red-500">{errors.payment_day.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fecha de inicio</Label>
          <DatePicker
            value={watch('start_date') ? new Date(watch('start_date') + 'T00:00:00') : undefined}
            onChange={(date) => setValue('start_date', date ? format(date, 'yyyy-MM-dd') : '')}
            placeholder="Fecha de inicio"
          />
          {errors.start_date && (
            <p className="text-sm text-red-500">{errors.start_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Fecha de término (opcional)</Label>
          <DatePicker
            value={watch('end_date') ? new Date(watch('end_date') + 'T00:00:00') : undefined}
            onChange={(date) => setValue('end_date', date ? format(date, 'yyyy-MM-dd') : '')}
            placeholder="Fecha de término"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_active"
          checked={isActive}
          onCheckedChange={(checked) => setValue('is_active', checked === true)}
        />
        <Label htmlFor="is_active" className="cursor-pointer">
          Crédito activo
        </Label>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
      </Button>
    </form>
  )
}
