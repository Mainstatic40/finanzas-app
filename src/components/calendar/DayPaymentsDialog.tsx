import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CreditCard, Repeat } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

type Payment = {
  id: string
  name: string
  amount: number
  type: 'credit' | 'subscription'
  cardName?: string
  currency?: string
}

type DayPaymentsDialogProps = {
  isOpen: boolean
  onClose: () => void
  date: Date
  payments: Payment[]
}

export function DayPaymentsDialog({
  isOpen,
  onClose,
  date,
  payments,
}: DayPaymentsDialogProps) {
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)

  function formatCurrency(amount: number, currency = 'MXN') {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">
            {format(date, "EEEE d 'de' MMMM", { locale: es })}
          </DialogTitle>
          <DialogDescription>
            {payments.length > 0
              ? `${payments.length} pago${payments.length > 1 ? 's' : ''} programado${payments.length > 1 ? 's' : ''}`
              : 'Sin pagos programados'}
          </DialogDescription>
        </DialogHeader>

        {payments.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No hay pagos programados para este día
          </div>
        ) : (
          <div className="space-y-4">
            <ul className="space-y-2">
              {payments.map((payment) => (
                <li
                  key={payment.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  {payment.type === 'credit' ? (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100">
                      <Repeat className="h-4 w-4 text-purple-600" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{payment.name}</p>
                    {payment.cardName && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700 mt-1">
                        {payment.cardName}
                      </span>
                    )}
                  </div>

                  <span className="font-semibold text-right shrink-0">
                    {formatCurrency(payment.amount, payment.currency)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total del día</span>
              <span className="text-lg font-bold">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
