import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRandomCompanyName(): string {
  const adjectives = [
    'Magnificent',
    'Distinguished',
    'Brilliant',
    'Cosmic',
    'Legendary',
    'Mysterious',
    'Spectacular',
    'Majestic',
    'Fantastic',
    'Supreme',
    'Stellar',
    'Epic',
    'Heroic',
    'Phenomenal',
    'Elite',
    'Premium',
    'Glorious',
    'Illustrious',
    'Notable',
    'Jazzy',
    'Fancy',
    'Super',
    'Ultra',
    'Mega',
    'Hyper',
    'Turbo',
    'Amazing',
    'Fabulous',
    'Splendid',
    'Unstoppable',
    'Unbeatable',
    'Ultimate',
    'Unmatched',
    'Quantum',
    'Cyber',
    'Digital',
    'Techno',
    'Neo',
    'Alpha',
    'Omega',
    'Prime',
    'Swift',
    'Blazing',
    'Lightning',
    'Rocket',
    'Ninja',
    'Samurai',
    'Phoenix',
    'Dragon',
    'Titan',
    'Nexus',
    'Vertex',
    'Zenith',
  ]

  const nouns = [
    'Ventures',
    'Labs',
    'Works',
    'Systems',
    'Solutions',
    'Digital',
    'Dynamics',
    'Technologies',
    'Innovations',
    'Studios',
    'Industries',
    'Corp',
    'Enterprises',
    'Holdings',
    'Group',
    'Partners',
    'Capital',
    'Forge',
    'Factory',
    'Workshop',
    'Foundry',
    'Arsenal',
    'Vault',
    'Engine',
    'Machine',
    'Robot',
    'Nexus',
    'Matrix',
    'Grid',
    'Cloud',
    'Stream',
    'Flow',
    'Wave',
    'Pulse',
    'Force',
    'Logic',
    'Code',
    'Data',
    'Net',
    'Web',
    'Link',
    'Hub',
    'Node',
    'Core',
    'Base',
    'Stack',
    'Suite',
    'Unicorn',
    'Rocket',
    'Phoenix',
    'Dragon',
    'Titan',
    'Beast',
  ]

  const prefixes = ['The', 'Meta', 'Super', 'Pro', 'Ultra', 'Mega']

  const suffixes = [
    'Pro',
    'Elite',
    'Supreme',
    'Prime',
    'Max',
    'Plus',
    'X',
    'AI',
    'Tech',
    'Labs',
    'Co',
    'Inc',
  ]

  // Random style selection (similar to your username generator)
  const usePrefix = Math.random() < 0.15 // 15% chance
  const useSuffix = Math.random() < 0.2 // 20% chance
  const useNumber = Math.random() < 0.3 // 30% chance

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const number = useNumber ? Math.floor(Math.random() * 99 + 1).toString() : ''

  let result = ''

  // Style variations (keeping your humor but for companies)
  const style = Math.random()

  if (style < 0.4) {
    // Basic style: AdjectiveNoun or AdjectiveNoun + Number
    result = adjective + noun + number
  } else if (style < 0.6 && usePrefix) {
    // Prefix style: The/Meta/Super + AdjectiveNoun
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    result = prefix + adjective + noun
  } else if (style < 0.8 && useSuffix) {
    // Suffix style: AdjectiveNoun + Pro/Elite/Supreme
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    result = adjective + noun + suffix
  } else {
    // Complex style: Prefix + Adjective + Noun + Suffix + Number (but shorter)
    const parts = [adjective, noun]
    if (useSuffix && parts.join('').length < 12) {
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
      parts.push(suffix)
    }
    if (useNumber && parts.join('').length < 15) {
      parts.push(number)
    }
    result = parts.join('')
  }

  // Ensure reasonable length (your style but company appropriate)
  if (result.length > 20) {
    // Fallback to simpler style
    result =
      adjective +
      noun +
      (Math.random() > 0.7 ? Math.floor(Math.random() * 9 + 1).toString() : '')
  }

  // Ensure first letter is capitalized for company names
  return result.charAt(0).toUpperCase() + result.slice(1)
}
