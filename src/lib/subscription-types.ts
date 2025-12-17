import {
  Tv,
  Music,
  Bot,
  GraduationCap,
  Gamepad2,
  AppWindow,
  BookOpen,
  Dumbbell,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react'

export type SubscriptionType = {
  id: string
  label: string
  icon: LucideIcon
  providers: string[]
}

export const SUBSCRIPTION_TYPES: Record<string, SubscriptionType> = {
  streaming_video: {
    id: 'streaming_video',
    label: 'Streaming Video',
    icon: Tv,
    providers: [
      'Netflix',
      'Disney+',
      'HBO Max',
      'Amazon Prime',
      'Apple TV+',
      'Paramount+',
      'Crunchyroll',
      'Star+',
    ],
  },
  streaming_music: {
    id: 'streaming_music',
    label: 'Streaming Música',
    icon: Music,
    providers: [
      'Spotify',
      'Apple Music',
      'YouTube Music',
      'Amazon Music',
      'Deezer',
      'Tidal',
    ],
  },
  ai: {
    id: 'ai',
    label: 'Inteligencia Artificial',
    icon: Bot,
    providers: [
      'ChatGPT Plus',
      'Claude Pro',
      'Midjourney',
      'GitHub Copilot',
      'Notion AI',
      'Grammarly',
    ],
  },
  courses: {
    id: 'courses',
    label: 'Cursos y Educación',
    icon: GraduationCap,
    providers: [
      'Coursera',
      'Udemy',
      'Platzi',
      'Domestika',
      'Skillshare',
      'LinkedIn Learning',
      'MasterClass',
      'Duolingo Plus',
    ],
  },
  gaming: {
    id: 'gaming',
    label: 'Gaming',
    icon: Gamepad2,
    providers: [
      'Xbox Game Pass',
      'PlayStation Plus',
      'Nintendo Online',
      'EA Play',
      'GeForce Now',
    ],
  },
  software: {
    id: 'software',
    label: 'Software',
    icon: AppWindow,
    providers: [
      'Microsoft 365',
      'Google One',
      'Adobe Creative Cloud',
      'Notion',
      'Canva Pro',
      'Dropbox',
      'iCloud+',
    ],
  },
  reading: {
    id: 'reading',
    label: 'Lectura',
    icon: BookOpen,
    providers: [
      'Kindle Unlimited',
      'Audible',
      'Medium',
      'The New York Times',
      'Scribd',
    ],
  },
  fitness: {
    id: 'fitness',
    label: 'Fitness y Bienestar',
    icon: Dumbbell,
    providers: [
      'Strava',
      'Nike Training',
      'Calm',
      'Headspace',
      'MyFitnessPal',
    ],
  },
  other: {
    id: 'other',
    label: 'Otro',
    icon: MoreHorizontal,
    providers: [],
  },
}

export function getTypeById(id: string): SubscriptionType | undefined {
  return SUBSCRIPTION_TYPES[id]
}

export function getProvidersByType(typeId: string): string[] {
  return SUBSCRIPTION_TYPES[typeId]?.providers ?? []
}

export function getAllTypes(): SubscriptionType[] {
  return Object.values(SUBSCRIPTION_TYPES)
}
