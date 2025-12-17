import { MainLayout } from '@/components/layout/MainLayout'
import { MonthlyBalance } from '@/components/dashboard/MonthlyBalance'
import { CardsOverview } from '@/components/dashboard/CardsOverview'
import { UpcomingPayments } from '@/components/dashboard/UpcomingPayments'
import { ExpensesByCategory } from '@/components/dashboard/ExpensesByCategory'
import { useAuth } from '@/hooks/useAuth'

export function Dashboard() {
  const { user } = useAuth()

  function getGreeting(): string {
    const hour = new Date().getHours()

    if (hour >= 5 && hour < 12) {
      return 'Buenos días'
    }
    if (hour >= 12 && hour < 19) {
      return 'Buenas tardes'
    }
    return 'Buenas noches'
  }

  function getUserName(): string {
    if (!user?.email) return ''

    // Get part before @ and capitalize first letter
    const namePart = user.email.split('@')[0]
    return namePart.charAt(0).toUpperCase() + namePart.slice(1)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Greeting */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {getGreeting()}, {getUserName()}
          </h2>
          <p className="text-slate-500 mt-1">
            Aquí está el resumen de tus finanzas
          </p>
        </div>

        {/* Monthly Balance - Full width */}
        <MonthlyBalance />

        {/* Two column grid for Cards Overview and Upcoming Payments */}
        <div className="grid gap-6 md:grid-cols-2">
          <CardsOverview />
          <UpcomingPayments />
        </div>

        {/* Expenses by Category - Full width */}
        <ExpensesByCategory />
      </div>
    </MainLayout>
  )
}
