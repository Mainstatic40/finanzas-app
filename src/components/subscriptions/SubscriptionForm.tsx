import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, ChevronsUpDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import {
  SUBSCRIPTION_TYPES,
  getAllTypes,
  getProvidersByType,
  getTypeById,
} from '@/lib/subscription-types'
import { Button } from '@/components/ui/button'
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { Tables } from '@/types/database'

type Category = Tables<'categories'>
type CreditCard = Tables<'credit_cards'>
type DebitCard = Tables<'debit_cards'>

const subscriptionSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
  currency: z.string().default('MXN'),
  billing_cycle: z.string().default('monthly'),
  billing_day: z.coerce.number().min(1).max(31),
  next_billing_date: z.string().min(1, 'La fecha es requerida'),
  category_id: z.string().optional(),
  credit_card_id: z.string().optional(),
  debit_card_id: z.string().optional(),
  provider: z.string().optional(),
  subscription_type: z.string().optional(),
  is_active: z.boolean().default(true),
})

type SubscriptionFormData = z.infer<typeof subscriptionSchema>

type Props = {
  onSuccess: () => void
  initialData?: Tables<'subscriptions'>
}

export function SubscriptionForm({ onSuccess, initialData }: Props) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [debitCards, setDebitCards] = useState<DebitCard[]>([])

  // Combobox states
  const [typeOpen, setTypeOpen] = useState(false)
  const [providerOpen, setProviderOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string>(
    initialData?.subscription_type ?? ''
  )
  const [selectedProvider, setSelectedProvider] = useState<string>(
    initialData?.provider ?? ''
  )
  const [customType, setCustomType] = useState('')
  const [customProvider, setCustomProvider] = useState('')

  // Payment type state
  const [paymentType, setPaymentType] = useState<'credit' | 'debit' | 'none'>(
    initialData?.credit_card_id
      ? 'credit'
      : initialData?.debit_card_id
        ? 'debit'
        : 'none'
  )

  const today = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(subscriptionSchema) as any,
    defaultValues: {
      name: initialData?.name ?? '',
      amount: initialData?.amount ?? undefined,
      currency: initialData?.currency ?? 'MXN',
      billing_cycle: initialData?.billing_cycle ?? 'monthly',
      billing_day: initialData?.billing_day ?? 1,
      next_billing_date: initialData?.next_billing_date ?? today,
      category_id: initialData?.category_id ?? '',
      credit_card_id: initialData?.credit_card_id ?? '',
      debit_card_id: initialData?.debit_card_id ?? '',
      provider: initialData?.provider ?? '',
      subscription_type: initialData?.subscription_type ?? '',
      is_active: initialData?.is_active ?? true,
    },
  })

  const watchName = watch('name')
  const isActive = watch('is_active')
  const selectedCreditCardId = watch('credit_card_id') || ''
  const selectedDebitCardId = watch('debit_card_id') || ''

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      const [categoriesRes, creditCardsRes, debitCardsRes] = await Promise.all([
        supabase.from('categories').select('*').eq('type', 'expense').order('name'),
        supabase.from('credit_cards').select('*').neq('is_active', false).order('name'),
        supabase.from('debit_cards').select('*').neq('is_active', false).order('name'),
      ])

      if (categoriesRes.data) setCategories(categoriesRes.data)
      if (creditCardsRes.data) setCreditCards(creditCardsRes.data)
      if (debitCardsRes.data) setDebitCards(debitCardsRes.data)
    }

    fetchData()
  }, [])

  // Auto-fill name with provider
  useEffect(() => {
    if (selectedProvider && !watchName) {
      setValue('name', selectedProvider)
    }
  }, [selectedProvider, watchName, setValue])

  // Update form values when combobox changes
  useEffect(() => {
    setValue('subscription_type', selectedType || customType)
  }, [selectedType, customType, setValue])

  useEffect(() => {
    setValue('provider', selectedProvider || customProvider)
  }, [selectedProvider, customProvider, setValue])

  // Handle payment type changes
  useEffect(() => {
    if (paymentType === 'credit') {
      setValue('debit_card_id', '')
    } else if (paymentType === 'debit') {
      setValue('credit_card_id', '')
    } else {
      setValue('credit_card_id', '')
      setValue('debit_card_id', '')
    }
  }, [paymentType, setValue])

  // Get providers for selected type
  const availableProviders = selectedType ? getProvidersByType(selectedType) : []
  const subscriptionTypes = getAllTypes()

  async function onSubmit(data: SubscriptionFormData) {
    if (!user) return

    const subscriptionData = {
      name: data.name,
      amount: data.amount,
      currency: data.currency,
      billing_cycle: data.billing_cycle,
      billing_day: data.billing_day,
      next_billing_date: data.next_billing_date,
      category_id: data.category_id || null,
      credit_card_id: data.credit_card_id || null,
      debit_card_id: data.debit_card_id || null,
      provider: data.provider || null,
      subscription_type: data.subscription_type || null,
      is_active: data.is_active,
      user_id: user.id,
    }

    if (initialData) {
      const { error } = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', initialData.id)

      if (error) throw error
    } else {
      const { error } = await supabase.from('subscriptions').insert(subscriptionData)

      if (error) throw error
    }

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Subscription Type Combobox */}
      <div className="space-y-2">
        <Label>Tipo de suscripción</Label>
        <Popover open={typeOpen} onOpenChange={setTypeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={typeOpen}
              className="w-full justify-between font-normal"
            >
              {selectedType ? (
                <span className="flex items-center gap-2">
                  {(() => {
                    const type = getTypeById(selectedType)
                    if (type) {
                      const Icon = type.icon
                      return (
                        <>
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </>
                      )
                    }
                    return selectedType
                  })()}
                </span>
              ) : customType ? (
                customType
              ) : (
                'Selecciona o escribe el tipo'
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Buscar tipo..."
                value={customType}
                onValueChange={(value) => {
                  setCustomType(value)
                  if (!SUBSCRIPTION_TYPES[value]) {
                    setSelectedType('')
                  }
                }}
              />
              <CommandList>
                <CommandEmpty>
                  {customType ? (
                    <button
                      type="button"
                      className="w-full p-2 text-left text-sm hover:bg-slate-100"
                      onClick={() => {
                        setSelectedType('')
                        setTypeOpen(false)
                      }}
                    >
                      Usar "{customType}" como tipo personalizado
                    </button>
                  ) : (
                    'No se encontraron tipos'
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {subscriptionTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <CommandItem
                        key={type.id}
                        value={type.id}
                        onSelect={(value) => {
                          setSelectedType(value)
                          setCustomType('')
                          setSelectedProvider('')
                          setCustomProvider('')
                          setTypeOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedType === type.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <Icon className="mr-2 h-4 w-4" />
                        {type.label}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Provider Combobox */}
      <div className="space-y-2">
        <Label>Plataforma</Label>
        <Popover open={providerOpen} onOpenChange={setProviderOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={providerOpen}
              className="w-full justify-between font-normal"
            >
              {selectedProvider || customProvider || 'Selecciona o escribe la plataforma'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Buscar plataforma..."
                value={customProvider}
                onValueChange={(value) => {
                  setCustomProvider(value)
                  if (!availableProviders.includes(value)) {
                    setSelectedProvider('')
                  }
                }}
              />
              <CommandList>
                <CommandEmpty>
                  {customProvider ? (
                    <button
                      type="button"
                      className="w-full p-2 text-left text-sm hover:bg-slate-100"
                      onClick={() => {
                        setSelectedProvider('')
                        setValue('name', customProvider)
                        setProviderOpen(false)
                      }}
                    >
                      Usar "{customProvider}" como plataforma
                    </button>
                  ) : (
                    'No se encontraron plataformas'
                  )}
                </CommandEmpty>
                {availableProviders.length > 0 && (
                  <CommandGroup heading="Sugerencias">
                    {availableProviders.map((provider) => (
                      <CommandItem
                        key={provider}
                        value={provider}
                        onSelect={(value) => {
                          setSelectedProvider(value)
                          setCustomProvider('')
                          setValue('name', value)
                          setProviderOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedProvider === provider ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {provider}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la suscripción</Label>
        <Input
          id="name"
          placeholder="Ej: Netflix Familiar"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Amount and Currency */}
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
          <Label>Moneda</Label>
          <Select
            defaultValue={initialData?.currency ?? 'MXN'}
            onValueChange={(value) => setValue('currency', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MXN">MXN</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Billing Cycle and Day */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Ciclo de facturación</Label>
          <Select
            defaultValue={initialData?.billing_cycle ?? 'monthly'}
            onValueChange={(value) => setValue('billing_cycle', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensual</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Día de cobro</Label>
          <Select
            defaultValue={String(initialData?.billing_day ?? 1)}
            onValueChange={(value) => setValue('billing_day', Number(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <SelectItem key={day} value={String(day)}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Next Billing Date */}
      <div className="space-y-2">
        <Label htmlFor="next_billing_date">Próxima fecha de cobro</Label>
        <Input
          id="next_billing_date"
          type="date"
          {...register('next_billing_date')}
        />
        {errors.next_billing_date && (
          <p className="text-sm text-red-500">{errors.next_billing_date.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Categoría</Label>
        <Select
          defaultValue={initialData?.category_id ?? ''}
          onValueChange={(value) => setValue('category_id', value === 'none' ? '' : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            <SelectItem value="none">Sin categoría</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Payment Type */}
      <div className="space-y-3">
        <Label>Método de pago</Label>
        <RadioGroup
          value={paymentType}
          onValueChange={(value: 'credit' | 'debit' | 'none') => setPaymentType(value)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="credit" id="credit" />
            <Label htmlFor="credit" className="cursor-pointer font-normal">
              Tarjeta de Crédito
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="debit" id="debit" />
            <Label htmlFor="debit" className="cursor-pointer font-normal">
              Tarjeta de Débito
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="none" />
            <Label htmlFor="none" className="cursor-pointer font-normal">
              Ninguna
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Credit Card Selector */}
      {paymentType === 'credit' && (
        <div className="space-y-2">
          <Label>Tarjeta de crédito</Label>
          <Select
            value={selectedCreditCardId}
            onValueChange={(value) => setValue('credit_card_id', value === 'none' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tarjeta" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              <SelectItem value="none">Sin tarjeta</SelectItem>
              {creditCards.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  {card.name} ({card.bank})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Debit Card Selector */}
      {paymentType === 'debit' && (
        <div className="space-y-2">
          <Label>Tarjeta de débito</Label>
          <Select
            value={selectedDebitCardId}
            onValueChange={(value) => setValue('debit_card_id', value === 'none' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tarjeta" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              <SelectItem value="none">Sin tarjeta</SelectItem>
              {debitCards.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  {card.name} ({card.bank})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Is Active */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_active"
          checked={isActive}
          onCheckedChange={(checked) => setValue('is_active', checked === true)}
        />
        <Label htmlFor="is_active" className="cursor-pointer">
          Suscripción activa
        </Label>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
      </Button>
    </form>
  )
}
