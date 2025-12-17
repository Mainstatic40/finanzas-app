import { useState } from 'react'
import { Info, X, Pencil, Trash2 } from 'lucide-react'
import { getBankById } from '@/lib/bank-styles'

type Props = {
  type: 'credit' | 'debit'
  bankId: string
  cardName: string
  holderName?: string
  lastFourDigits?: string
  currentBalance: number
  availableBalance?: number
  isActive?: boolean
  // Credit card specific
  creditLimit?: number
  cutOffDay?: number
  paymentDueDay?: number
  // Callbacks
  onEdit?: () => void
  onDelete?: () => void
}

export function CardVisual({
  type,
  bankId,
  cardName,
  holderName,
  lastFourDigits,
  currentBalance,
  availableBalance,
  isActive = true,
  creditLimit,
  cutOffDay,
  paymentDueDay,
  onEdit,
  onDelete,
}: Props) {
  const [logoError, setLogoError] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const bank = getBankById(bankId)

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  function formatCardNumber(digits?: string) {
    if (!digits) return '•••• •••• •••• ••••'
    return `•••• •••• •••• ${digits}`
  }

  const displayName = holderName || cardName
  const displayBalance = type === 'credit' ? availableBalance ?? 0 : currentBalance
  const balanceLabel = type === 'credit' ? 'Disponible' : 'Saldo'

  function handleFlip(e: React.MouseEvent) {
    e.stopPropagation()
    setIsFlipped(!isFlipped)
  }

  return (
    <div
      className="w-full select-none"
      style={{
        perspective: '1000px',
        maxWidth: '256px',
      }}
    >
      <div
        className="relative w-full cursor-pointer"
        style={{
          aspectRatio: '1.586 / 1',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
        onClick={handleFlip}
      >
        {/* FRONT FACE */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            borderRadius: '10px',
            background: bank.gradient,
          }}
        >
          {/* Card content */}
          <div
            className="absolute inset-0 p-3 flex flex-col justify-between"
            style={{ color: bank.textColor }}
          >
            {/* Top row: Logo and Badge */}
            <div className="flex items-start justify-between">
              {/* Bank logo or name */}
              <div className="h-5 flex items-center">
                {bank.logo && !logoError ? (
                  <img
                    src={bank.logo}
                    alt={bank.name}
                    className="h-5 w-auto object-contain"
                    style={{
                      filter: bank.logoFilter ?? (bank.textColor === 'white' ? 'brightness(0) invert(1)' : 'none'),
                    }}
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="text-sm font-bold">{bank.name}</span>
                )}
              </div>

              {/* Card type badge */}
              <div
                className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor:
                    bank.textColor === 'white'
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(0, 0, 0, 0.1)',
                }}
              >
                {type === 'credit' ? 'Crédito' : 'Débito'}
              </div>
            </div>

            {/* Middle: Chip and Card Number */}
            <div className="space-y-2">
              {/* Chip */}
              <div
                className="w-8 h-6 rounded"
                style={{
                  background:
                    bank.chipColor === 'gold'
                      ? 'linear-gradient(135deg, #d4af37 0%, #f9df7b 50%, #d4af37 100%)'
                      : 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 50%, #c0c0c0 100%)',
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.2)',
                }}
              >
                {/* Chip lines */}
                <div className="w-full h-full flex flex-col justify-center px-1">
                  <div
                    className="h-px mb-0.5"
                    style={{
                      backgroundColor:
                        bank.chipColor === 'gold'
                          ? 'rgba(180, 140, 40, 0.5)'
                          : 'rgba(150, 150, 150, 0.5)',
                    }}
                  />
                  <div
                    className="h-px mb-0.5"
                    style={{
                      backgroundColor:
                        bank.chipColor === 'gold'
                          ? 'rgba(180, 140, 40, 0.5)'
                          : 'rgba(150, 150, 150, 0.5)',
                    }}
                  />
                  <div
                    className="h-px"
                    style={{
                      backgroundColor:
                        bank.chipColor === 'gold'
                          ? 'rgba(180, 140, 40, 0.5)'
                          : 'rgba(150, 150, 150, 0.5)',
                    }}
                  />
                </div>
              </div>

              {/* Card number */}
              <div
                className="font-mono text-sm tracking-widest"
                style={{
                  textShadow:
                    bank.textColor === 'white'
                      ? '0 1px 2px rgba(0,0,0,0.3)'
                      : '0 1px 2px rgba(255,255,255,0.3)',
                }}
              >
                {formatCardNumber(lastFourDigits)}
              </div>
            </div>

            {/* Bottom row: Name and Balance */}
            <div className="flex items-end justify-between">
              {/* Holder name */}
              <div className="space-y-0.5">
                <p className="text-[9px] opacity-70 uppercase tracking-wider">Titular</p>
                <p
                  className="text-xs font-medium uppercase tracking-wide truncate max-w-[100px]"
                  style={{
                    textShadow:
                      bank.textColor === 'white'
                        ? '0 1px 2px rgba(0,0,0,0.3)'
                        : 'none',
                  }}
                >
                  {displayName}
                </p>
              </div>

              {/* Balance and flip icon */}
              <div className="flex items-end gap-2">
                <div className="text-right">
                  <p className="text-[9px] opacity-70">{balanceLabel}</p>
                  <p
                    className="text-sm font-bold"
                    style={{
                      textShadow:
                        bank.textColor === 'white'
                          ? '0 1px 2px rgba(0,0,0,0.3)'
                          : 'none',
                    }}
                  >
                    {formatCurrency(displayBalance)}
                  </p>
                </div>
                <Info
                  className="h-4 w-4 opacity-60 hover:opacity-100 transition-opacity"
                  onClick={handleFlip}
                />
              </div>
            </div>
          </div>

          {/* Inactive overlay */}
          {!isActive && (
            <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center rounded-[10px]">
              <span className="text-white text-xl font-bold tracking-widest uppercase">
                Inactiva
              </span>
            </div>
          )}

          {/* Subtle shine effect */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
              borderRadius: '10px',
            }}
          />
        </div>

        {/* BACK FACE */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            borderRadius: '10px',
            background: bank.gradient,
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
          />

          {/* Back content */}
          <div
            className="absolute inset-0 p-3 flex flex-col"
            style={{ color: bank.textColor }}
          >
            {/* Close button */}
            <div className="flex justify-end">
              <button
                onClick={handleFlip}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col justify-center space-y-2">
              {type === 'credit' ? (
                <>
                  <div className="text-center">
                    <p className="text-[10px] opacity-70 uppercase">Límite de crédito</p>
                    <p className="text-sm font-bold">{formatCurrency(creditLimit ?? 0)}</p>
                  </div>
                  <div className="flex justify-center gap-4">
                    <div className="text-center">
                      <p className="text-[10px] opacity-70">Día corte</p>
                      <p className="text-sm font-semibold">{cutOffDay ?? '-'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] opacity-70">Día pago</p>
                      <p className="text-sm font-semibold">{paymentDueDay ?? '-'}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-[10px] opacity-70 uppercase">Banco</p>
                    <p className="text-sm font-bold">{bank.name}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] opacity-70 uppercase">Estado</p>
                    <p className="text-sm font-semibold">{isActive ? 'Activa' : 'Inactiva'}</p>
                  </div>
                </>
              )}
            </div>

            {/* Separator and buttons */}
            {(onEdit || onDelete) && (
              <>
                <div
                  className="h-px my-2"
                  style={{
                    backgroundColor:
                      bank.textColor === 'white'
                        ? 'rgba(255, 255, 255, 0.3)'
                        : 'rgba(0, 0, 0, 0.2)',
                  }}
                />
                <div className="flex justify-center gap-3">
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit()
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium hover:bg-white/20 transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete()
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Eliminar
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Subtle shine effect */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
              borderRadius: '10px',
            }}
          />
        </div>
      </div>
    </div>
  )
}
