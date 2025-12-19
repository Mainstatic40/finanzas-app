import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfMonth,
  subMonths,
  format,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/DatePicker'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type TransactionFilters = {
  dateFrom: string | null
  dateTo: string | null
  categoryId: string | null
  type: 'income' | 'expense' | 'credit_payment' | null
  creditCardId: string | null
  debitCardId: string | null
}

type Category = { id: string; name: string }
type Card = { id: string; name: string }

type Props = {
  filters: TransactionFilters
  onFiltersChange: (filters: TransactionFilters) => void
  categories: Category[]
  creditCards: Card[]
  debitCards: Card[]
}

type QuickFilterKey = 'today' | 'thisWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | null

export function TransactionFiltersComponent({
  filters,
  onFiltersChange,
  categories,
  creditCards,
  debitCards,
}: Props) {
  const today = startOfDay(new Date())

  // Calculate date ranges for quick filters
  const quickFilters = {
    today: {
      from: format(today, 'yyyy-MM-dd'),
      to: format(today, 'yyyy-MM-dd'),
    },
    thisWeek: {
      from: format(startOfWeek(today, { locale: es, weekStartsOn: 1 }), 'yyyy-MM-dd'),
      to: format(today, 'yyyy-MM-dd'),
    },
    thisMonth: {
      from: format(startOfMonth(today), 'yyyy-MM-dd'),
      to: format(today, 'yyyy-MM-dd'),
    },
    lastMonth: {
      from: format(startOfMonth(subMonths(today, 1)), 'yyyy-MM-dd'),
      to: format(endOfMonth(subMonths(today, 1)), 'yyyy-MM-dd'),
    },
    thisYear: {
      from: format(startOfYear(today), 'yyyy-MM-dd'),
      to: format(today, 'yyyy-MM-dd'),
    },
  }

  // Determine which quick filter is active
  function getActiveQuickFilter(): QuickFilterKey {
    if (!filters.dateFrom || !filters.dateTo) return null

    for (const [key, range] of Object.entries(quickFilters)) {
      if (filters.dateFrom === range.from && filters.dateTo === range.to) {
        return key as QuickFilterKey
      }
    }
    return null
  }

  const activeQuickFilter = getActiveQuickFilter()

  function handleQuickFilter(key: QuickFilterKey) {
    if (!key) return

    const range = quickFilters[key]
    onFiltersChange({
      ...filters,
      dateFrom: range.from,
      dateTo: range.to,
    })
  }

  function handleCategoryChange(value: string) {
    onFiltersChange({
      ...filters,
      categoryId: value === 'all' ? null : value,
    })
  }

  function handleTypeChange(value: string) {
    onFiltersChange({
      ...filters,
      type: value === 'all' ? null : (value as TransactionFilters['type']),
    })
  }

  function handleCardChange(value: string) {
    if (value === 'all') {
      onFiltersChange({
        ...filters,
        creditCardId: null,
        debitCardId: null,
      })
    } else if (value.startsWith('credit:')) {
      onFiltersChange({
        ...filters,
        creditCardId: value.replace('credit:', ''),
        debitCardId: null,
      })
    } else if (value.startsWith('debit:')) {
      onFiltersChange({
        ...filters,
        creditCardId: null,
        debitCardId: value.replace('debit:', ''),
      })
    }
  }

  function clearFilters() {
    onFiltersChange({
      dateFrom: null,
      dateTo: null,
      categoryId: null,
      type: null,
      creditCardId: null,
      debitCardId: null,
    })
  }

  const hasActiveFilters =
    filters.dateFrom ||
    filters.dateTo ||
    filters.categoryId ||
    filters.type ||
    filters.creditCardId ||
    filters.debitCardId

  // Determine selected card value for the Select
  const selectedCardValue = filters.creditCardId
    ? `credit:${filters.creditCardId}`
    : filters.debitCardId
      ? `debit:${filters.debitCardId}`
      : 'all'

  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border">
      {/* Quick filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeQuickFilter === 'today' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleQuickFilter('today')}
        >
          Hoy
        </Button>
        <Button
          variant={activeQuickFilter === 'thisWeek' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleQuickFilter('thisWeek')}
        >
          Esta semana
        </Button>
        <Button
          variant={activeQuickFilter === 'thisMonth' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleQuickFilter('thisMonth')}
        >
          Este mes
        </Button>
        <Button
          variant={activeQuickFilter === 'lastMonth' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleQuickFilter('lastMonth')}
        >
          Último mes
        </Button>
        <Button
          variant={activeQuickFilter === 'thisYear' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleQuickFilter('thisYear')}
        >
          Este año
        </Button>
      </div>

      {/* Detailed filters */}
      <div className="flex flex-wrap gap-4">
        {/* Date range */}
        <div className="flex items-end gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Desde</Label>
            <DatePicker
              value={filters.dateFrom ? new Date(filters.dateFrom + 'T00:00:00') : undefined}
              onChange={(date) => onFiltersChange({ ...filters, dateFrom: date ? format(date, 'yyyy-MM-dd') : null })}
              placeholder="Desde"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Hasta</Label>
            <DatePicker
              value={filters.dateTo ? new Date(filters.dateTo + 'T00:00:00') : undefined}
              onChange={(date) => onFiltersChange({ ...filters, dateTo: date ? format(date, 'yyyy-MM-dd') : null })}
              placeholder="Hasta"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-1">
          <Label className="text-xs">Categoría</Label>
          <Select
            value={filters.categoryId || 'all'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type */}
        <div className="space-y-1">
          <Label className="text-xs">Tipo</Label>
          <Select
            value={filters.type || 'all'}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="income">Ingresos</SelectItem>
              <SelectItem value="expense">Gastos</SelectItem>
              <SelectItem value="credit_payment">Pagos de crédito</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Card */}
        <div className="space-y-1">
          <Label className="text-xs">Tarjeta</Label>
          <Select
            value={selectedCardValue}
            onValueChange={handleCardChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas las tarjetas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las tarjetas</SelectItem>
              {creditCards.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Tarjetas de Crédito</SelectLabel>
                  {creditCards.map((card) => (
                    <SelectItem key={card.id} value={`credit:${card.id}`}>
                      {card.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
              {debitCards.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Tarjetas de Débito</SelectLabel>
                  {debitCards.map((card) => (
                    <SelectItem key={card.id} value={`debit:${card.id}`}>
                      {card.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
