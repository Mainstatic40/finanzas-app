import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Landmark,
  RefreshCw,
  Tags,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transacciones', icon: ArrowLeftRight },
  { to: '/credit-cards', label: 'Tarjetas de Crédito', icon: CreditCard },
  { to: '/credits', label: 'Créditos', icon: Landmark },
  { to: '/subscriptions', label: 'Suscripciones', icon: RefreshCw },
  { to: '/categories', label: 'Categorías', icon: Tags },
]

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-100 border-r border-slate-200 min-h-screen">
      <nav className="p-4 space-y-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-200'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
