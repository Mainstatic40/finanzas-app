import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import type { Tables } from '@/types/database'

const debitCardSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  bank: z.string().min(1, 'El banco es requerido'),
  last_four_digits: z.string().max(4).optional(),
  current_balance: z.coerce.number().min(0, 'El saldo no puede ser negativo').optional(),
  is_active: z.boolean().default(true),
})

type DebitCardFormData = z.infer<typeof debitCardSchema>

type Props = {
  onSuccess: () => void
  initialData?: Tables<'debit_cards'>
}

export function DebitCardForm({ onSuccess, initialData }: Props) {
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DebitCardFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(debitCardSchema) as any,
    defaultValues: {
      name: initialData?.name ?? '',
      bank: initialData?.bank ?? '',
      last_four_digits: initialData?.last_four_digits ?? '',
      current_balance: initialData?.current_balance ?? 0,
      is_active: initialData?.is_active ?? true,
    },
  })

  const isActive = watch('is_active')

  async function onSubmit(data: DebitCardFormData) {
    if (!user) return

    const cardData = {
      name: data.name,
      bank: data.bank,
      last_four_digits: data.last_four_digits || null,
      current_balance: data.current_balance ?? 0,
      is_active: data.is_active,
      user_id: user.id,
    }

    if (initialData) {
      const { error } = await supabase
        .from('debit_cards')
        .update(cardData)
        .eq('id', initialData.id)

      if (error) throw error
    } else {
      const { error } = await supabase.from('debit_cards').insert(cardData)

      if (error) throw error
    }

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre de la tarjeta</Label>
          <Input
            id="name"
            placeholder="Ej: Cuenta principal"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bank">Banco</Label>
          <Input
            id="bank"
            placeholder="Ej: BBVA"
            {...register('bank')}
          />
          {errors.bank && (
            <p className="text-sm text-red-500">{errors.bank.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="last_four_digits">Últimos 4 dígitos (opcional)</Label>
          <Input
            id="last_four_digits"
            placeholder="1234"
            maxLength={4}
            {...register('last_four_digits')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="current_balance">Saldo actual</Label>
          <Input
            id="current_balance"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('current_balance')}
          />
          {errors.current_balance && (
            <p className="text-sm text-red-500">{errors.current_balance.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_active"
          checked={isActive}
          onCheckedChange={(checked) => setValue('is_active', checked === true)}
        />
        <Label htmlFor="is_active" className="cursor-pointer">
          Tarjeta activa
        </Label>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
      </Button>
    </form>
  )
}
