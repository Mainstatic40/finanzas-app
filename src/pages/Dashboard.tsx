import { MainLayout } from '@/components/layout/MainLayout'

export function Dashboard() {
  return (
    <MainLayout>
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-600 mt-2">Bienvenido a FinTrack</p>
      </div>
    </MainLayout>
  )
}
