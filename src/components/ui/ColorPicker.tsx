import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#78716c', '#737373', '#71717a', '#6b7280', '#64748b', '#475569', '#334155', '#1e293b',
  '#fecaca', '#fed7aa', '#fef08a', '#d9f99d', '#bbf7d0', '#a7f3d0', '#99f6e4', '#a5f3fc',
]

type ColorPickerProps = {
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false)

  function handleSelect(color: string) {
    onChange(color)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 font-normal"
        >
          <div
            className="h-5 w-5 rounded border border-slate-300"
            style={{ backgroundColor: value }}
          />
          <span className="uppercase">{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="grid grid-cols-8 gap-1.5">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={cn(
                'h-7 w-7 rounded-md border-2 transition-all hover:scale-110',
                value.toLowerCase() === color.toLowerCase()
                  ? 'border-white ring-2 ring-slate-400'
                  : 'border-transparent'
              )}
              style={{ backgroundColor: color }}
              onClick={() => handleSelect(color)}
            >
              {value.toLowerCase() === color.toLowerCase() && (
                <Check className="h-4 w-4 mx-auto text-white drop-shadow-md" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
