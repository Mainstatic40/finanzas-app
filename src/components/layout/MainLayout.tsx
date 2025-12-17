import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Sidebar } from './Sidebar'

type Props = {
  children: React.ReactNode
}

export function MainLayout({ children }: Props) {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 fixed top-0 left-0 right-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-slate-900">FinTrack</h1>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={signOut}>
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
