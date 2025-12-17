import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, ChevronsUpDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { availableIcons, getIconByName } from '@/lib/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import type { Tables } from '@/types/database'

const expenseSuggestions = [
  'Alimentación',
  'Transporte',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Servicios',
  'Hogar',
  'Ropa',
  'Otros',
]

const incomeSuggestions = [
  'Salario',
  'Freelance',
  'Inversiones',
  'Ventas',
  'Regalos',
  'Otros',
]

const categorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  type: z.enum(['income', 'expense'], { message: 'Selecciona un tipo' }),
  icon: z.string().optional(),
  color: z.string().optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

type Props = {
  onSuccess: () => void
  initialData?: Tables<'categories'>
}

export function CategoryForm({ onSuccess, initialData }: Props) {
  const { user } = useAuth()
  const [nameOpen, setNameOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name ?? '',
      type: initialData?.type as 'income' | 'expense' | undefined,
      icon: initialData?.icon ?? '',
      color: initialData?.color ?? '#6366f1',
    },
  })

  const selectedType = watch('type')
  const selectedName = watch('name')
  const selectedIcon = watch('icon')

  const suggestions = selectedType === 'income' ? incomeSuggestions : expenseSuggestions

  async function onSubmit(data: CategoryFormData) {
    if (!user) return

    const categoryData = {
      name: data.name,
      type: data.type,
      icon: data.icon || null,
      color: data.color || null,
      user_id: user.id,
    }

    if (initialData) {
      const { error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', initialData.id)

      if (error) throw error
    } else {
      const { error } = await supabase.from('categories').insert(categoryData)

      if (error) throw error
    }

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Tipo</Label>
        <Select
          value={selectedType}
          onValueChange={(value: 'income' | 'expense') => setValue('type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Ingreso</SelectItem>
            <SelectItem value="expense">Gasto</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Nombre</Label>
        <Popover open={nameOpen} onOpenChange={setNameOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={nameOpen}
              className="w-full justify-between font-normal"
              disabled={!selectedType}
            >
              {selectedName || 'Selecciona o escribe un nombre'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Buscar o escribir..."
                value={selectedName}
                onValueChange={(value) => setValue('name', value)}
              />
              <CommandList>
                <CommandEmpty>
                  <button
                    type="button"
                    className="w-full p-2 text-left hover:bg-slate-100"
                    onClick={() => {
                      setNameOpen(false)
                    }}
                  >
                    Usar "{selectedName}"
                  </button>
                </CommandEmpty>
                <CommandGroup heading="Sugerencias">
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion}
                      value={suggestion}
                      onSelect={() => {
                        setValue('name', suggestion)
                        setNameOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedName === suggestion ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {suggestion}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Ícono</Label>
        <div className="grid grid-cols-5 gap-2">
          {availableIcons.map((iconName) => {
            const Icon = getIconByName(iconName)
            return (
              <button
                key={iconName}
                type="button"
                onClick={() => setValue('icon', iconName)}
                className={cn(
                  'p-3 rounded-lg border-2 flex items-center justify-center transition-colors',
                  selectedIcon === iconName
                    ? 'border-slate-900 bg-slate-100'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <Icon className="h-5 w-5" />
              </button>
            )
          })}
        </div>
        <input type="hidden" {...register('icon')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Color</Label>
        <Input
          id="color"
          type="color"
          className="h-10 w-20"
          {...register('color')}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
      </Button>
    </form>
  )
}
