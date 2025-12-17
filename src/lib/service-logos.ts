// Mapeo de servicios a iconos de Simple Icons
// Los nombres deben coincidir con los providers de subscription-types.ts
// iconName debe ser el slug exacto de simpleicons.org (en minúsculas)

export type ServiceConfig = {
  iconName: string
  color: string
}

export const SERVICE_MAP: Record<string, ServiceConfig> = {
  // ========== STREAMING VIDEO ==========
  'netflix': { iconName: 'netflix', color: '#E50914' },
  'disney+': { iconName: 'disneyplus', color: '#113CCF' },
  'disney plus': { iconName: 'disneyplus', color: '#113CCF' },
  'hbo max': { iconName: 'hbo', color: '#000000' },
  'hbo': { iconName: 'hbo', color: '#000000' },
  'max': { iconName: 'hbo', color: '#000000' },
  'amazon prime': { iconName: 'primevideo', color: '#00A8E1' },
  'prime video': { iconName: 'primevideo', color: '#00A8E1' },
  'apple tv+': { iconName: 'appletv', color: '#000000' },
  'apple tv': { iconName: 'appletv', color: '#000000' },
  'paramount+': { iconName: 'paramountplus', color: '#0064FF' },
  'paramount plus': { iconName: 'paramountplus', color: '#0064FF' },
  'crunchyroll': { iconName: 'crunchyroll', color: '#F47521' },
  'star+': { iconName: 'starplus', color: '#FF0073' },
  'star plus': { iconName: 'starplus', color: '#FF0073' },
  'youtube': { iconName: 'youtube', color: '#FF0000' },
  'youtube premium': { iconName: 'youtube', color: '#FF0000' },
  'twitch': { iconName: 'twitch', color: '#9146FF' },
  'hulu': { iconName: 'hulu', color: '#1CE783' },

  // ========== STREAMING MÚSICA ==========
  'spotify': { iconName: 'spotify', color: '#1DB954' },
  'apple music': { iconName: 'applemusic', color: '#FA243C' },
  'youtube music': { iconName: 'youtubemusic', color: '#FF0000' },
  'amazon music': { iconName: 'amazonmusic', color: '#00A8E1' },
  'deezer': { iconName: 'deezer', color: '#FEAA2D' },
  'tidal': { iconName: 'tidal', color: '#000000' },
  'soundcloud': { iconName: 'soundcloud', color: '#FF5500' },

  // ========== INTELIGENCIA ARTIFICIAL ==========
  'chatgpt': { iconName: 'openai', color: '#412991' },
  'chatgpt plus': { iconName: 'openai', color: '#412991' },
  'openai': { iconName: 'openai', color: '#412991' },
  'claude': { iconName: 'anthropic', color: '#D4A574' },
  'claude pro': { iconName: 'anthropic', color: '#D4A574' },
  'anthropic': { iconName: 'anthropic', color: '#D4A574' },
  'midjourney': { iconName: 'midjourney', color: '#000000' },
  'github copilot': { iconName: 'github', color: '#181717' },
  'copilot': { iconName: 'github', color: '#181717' },
  'notion ai': { iconName: 'notion', color: '#000000' },
  'grammarly': { iconName: 'grammarly', color: '#15C39A' },

  // ========== CURSOS Y EDUCACIÓN ==========
  'coursera': { iconName: 'coursera', color: '#0056D2' },
  'udemy': { iconName: 'udemy', color: '#A435F0' },
  'platzi': { iconName: 'platzi', color: '#98CA3F' },
  'domestika': { iconName: 'domestika', color: '#000000' },
  'skillshare': { iconName: 'skillshare', color: '#00FF84' },
  'linkedin learning': { iconName: 'linkedin', color: '#0A66C2' },
  'masterclass': { iconName: 'masterclass', color: '#000000' },
  'duolingo': { iconName: 'duolingo', color: '#58CC02' },
  'duolingo plus': { iconName: 'duolingo', color: '#58CC02' },

  // ========== GAMING ==========
  'xbox': { iconName: 'xbox', color: '#107C10' },
  'xbox game pass': { iconName: 'xbox', color: '#107C10' },
  'game pass': { iconName: 'xbox', color: '#107C10' },
  'playstation': { iconName: 'playstation', color: '#003791' },
  'playstation plus': { iconName: 'playstation', color: '#003791' },
  'ps plus': { iconName: 'playstation', color: '#003791' },
  'nintendo': { iconName: 'nintendoswitch', color: '#E60012' },
  'nintendo online': { iconName: 'nintendoswitch', color: '#E60012' },
  'nintendo switch online': { iconName: 'nintendoswitch', color: '#E60012' },
  'steam': { iconName: 'steam', color: '#000000' },
  'ea play': { iconName: 'ea', color: '#000000' },
  'geforce now': { iconName: 'nvidia', color: '#76B900' },
  'nvidia': { iconName: 'nvidia', color: '#76B900' },

  // ========== SOFTWARE ==========
  'microsoft': { iconName: 'microsoft', color: '#5E5E5E' },
  'microsoft 365': { iconName: 'microsoft365', color: '#5E5E5E' },
  'office 365': { iconName: 'microsoft365', color: '#5E5E5E' },
  'google': { iconName: 'google', color: '#4285F4' },
  'google one': { iconName: 'google', color: '#4285F4' },
  'adobe creative cloud': { iconName: 'adobe', color: '#FF0000' },
  'adobe': { iconName: 'adobe', color: '#FF0000' },
  'notion': { iconName: 'notion', color: '#000000' },
  'canva': { iconName: 'canva', color: '#00C4CC' },
  'canva pro': { iconName: 'canva', color: '#00C4CC' },
  'dropbox': { iconName: 'dropbox', color: '#0061FF' },
  'icloud': { iconName: 'icloud', color: '#3693F3' },
  'icloud+': { iconName: 'icloud', color: '#3693F3' },
  'slack': { iconName: 'slack', color: '#4A154B' },

  // ========== LECTURA ==========
  'kindle': { iconName: 'amazon', color: '#FF9900' },
  'kindle unlimited': { iconName: 'amazon', color: '#FF9900' },
  'audible': { iconName: 'audible', color: '#F8991C' },
  'medium': { iconName: 'medium', color: '#000000' },
  'the new york times': { iconName: 'newyorktimes', color: '#000000' },
  'scribd': { iconName: 'scribd', color: '#1E7B85' },

  // ========== FITNESS ==========
  'strava': { iconName: 'strava', color: '#FC4C02' },
  'nike training': { iconName: 'nike', color: '#000000' },
  'nike': { iconName: 'nike', color: '#000000' },
  'calm': { iconName: 'calm', color: '#5ACBFA' },
  'headspace': { iconName: 'headspace', color: '#F47D31' },
  'myfitnesspal': { iconName: 'myfitnesspal', color: '#0069D1' },

  // ========== SOCIAL/OTROS ==========
  'github': { iconName: 'github', color: '#181717' },
  'linkedin': { iconName: 'linkedin', color: '#0A66C2' },
  'discord': { iconName: 'discord', color: '#5865F2' },
  'amazon': { iconName: 'amazon', color: '#FF9900' },
  'apple': { iconName: 'apple', color: '#000000' },
}

export function getServiceConfig(serviceName: string): ServiceConfig | null {
  const normalizedName = serviceName.toLowerCase().trim()
  return SERVICE_MAP[normalizedName] ?? null
}
