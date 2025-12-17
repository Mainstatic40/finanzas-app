import { Globe } from 'lucide-react'
import { getServiceConfig } from '@/lib/service-logos'
import * as SimpleIcons from '@icons-pack/react-simple-icons'
import type { ComponentType } from 'react'

type IconProps = {
  size?: number
  color?: string
  className?: string
}

type Props = {
  serviceName: string
  size?: number
  className?: string
}

// Convierte slug a PascalCase: "primevideo" -> "Primevideo", "nintendoswitch" -> "Nintendoswitch"
function slugToPascalCase(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase()
}

export function ServiceLogo({ serviceName, size = 24, className = '' }: Props) {
  const config = getServiceConfig(serviceName)

  if (config) {
    // Construir el nombre del componente: "netflix" -> "SiNetflix"
    const componentName = 'Si' + slugToPascalCase(config.iconName)
    const IconComponent = (SimpleIcons as Record<string, ComponentType<IconProps>>)[componentName]

    if (IconComponent) {
      return (
        <IconComponent
          size={size}
          color={config.color}
          className={className}
        />
      )
    }
  }

  return (
    <Globe
      size={size}
      className={`text-slate-400 ${className}`}
    />
  )
}
