import { useEffect, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getIconByName } from '@/lib/icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Tables } from '@/types/database'

type Category = Tables<'categories'>

type Props = {
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
}

export function CategoryList({ onEdit, onDelete }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
    } else {
      setCategories(data ?? [])
    }
    setLoading(false)
  }

  if (loading) {
    return <p className="text-slate-600">Cargando categorías...</p>
  }

  if (categories.length === 0) {
    return <p className="text-slate-600">No hay categorías. Crea una nueva.</p>
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => {
        const Icon = getIconByName(category.icon)
        return (
          <div
            key={category.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200"
          >
            <div className="flex items-center gap-3">
              <Icon
                className="h-5 w-5"
                style={{ color: category.color ?? '#6366f1' }}
              />
              <span className="font-medium text-slate-900">{category.name}</span>
              <Badge variant={category.type === 'income' ? 'default' : 'secondary'}>
                {category.type === 'income' ? 'Ingreso' : 'Gasto'}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(category)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(category.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
