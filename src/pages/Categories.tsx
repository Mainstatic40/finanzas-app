import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { CategoryForm } from '@/components/categories/CategoryForm'
import { CategoryList } from '@/components/categories/CategoryList'
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

type Category = Tables<'categories'>

export function Categories() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  function handleNewCategory() {
    setEditingCategory(null)
    setIsDialogOpen(true)
  }

  function handleEdit(category: Category) {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm('¿Estás seguro de eliminar esta categoría?')
    if (!confirmed) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting category:', error)
      return
    }

    setRefreshKey((prev) => prev + 1)
  }

  function handleSuccess() {
    setIsDialogOpen(false)
    setEditingCategory(null)
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Categorías</h2>
          <Button onClick={handleNewCategory}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
        </div>

        <CategoryList
          key={refreshKey}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Modifica los datos de la categoría.' : 'Crea una nueva categoría para organizar tus finanzas.'}
              </DialogDescription>
            </DialogHeader>
            <CategoryForm
              onSuccess={handleSuccess}
              initialData={editingCategory ?? undefined}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
