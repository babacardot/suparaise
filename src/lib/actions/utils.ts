import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRandomCompanyName(): string {
  const adjectives = [
    'Blue',
    'Red',
    'Fast',
    'Smart',
    'Bold',
    'Pure',
    'Wild',
    'Cool',
    'Hot',
    'Tiny',
    'Big',
    'New',
    'Zen',
    'Pro',
    'Max',
    'Top',
    'Win',
    'Key',
    'Sky',
    'Moon',
    'Star',
    'Sun',
    'Fire',
    'Ice',
    'Arc',
    'Gem',
    'Gold',
    'Iron',
    'Neon',
    'Tech',
    'Cyber',
    'Neo',
    'Apex',
    'Peak',
    'Edge',
    'Core',
    'Flow',
    'Wave',
    'Flux',
    'Vibe',
    'Zap',
    'Buzz',
    'Rush',
    'Glow',
    'Spark',
    'Flash',
    'Bolt',
    'Dash',
    'Swift',
    'Quick',
  ]

  const nouns = [
    'Lab',
    'Tech',
    'Corp',
    'Inc',
    'Co',
    'AI',
    'App',
    'Web',
    'Net',
    'Code',
    'Data',
    'Cloud',
    'Hub',
    'Link',
    'Node',
    'Core',
    'Base',
    'Grid',
    'Flow',
    'Wave',
    'Pulse',
    'Logic',
    'Stack',
    'Suite',
    'Works',
    'Labs',
    'Forge',
    'Vault',
    'Engine',
    'Force',
    'Nexus',
    'Matrix',
    'Robot',
    'Beast',
    'Dragon',
    'Titan',
    'Phoenix',
    'Rocket',
    'Stream',
    'Box',
    'Spot',
    'Dot',
    'Zip',
    'Fox',
    'Wolf',
    'Bear',
    'Lion',
    'Bird',
    'Fish',
    'Bee',
    'Ant',
  ]

  const prefixes = ['My', 'Go', 'Up', 'In', 'On']

  const suffixes = [
    'X',
    'AI',
    'Go',
    'Up',
    'IO',
    'JS',
    'Co',
    'Inc',
    'Ltd',
    'Pro',
    'Max',
    'One',
    'Two',
  ]

  // Keep combinations under 11 characters
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]

  let result = ''
  const style = Math.random()

  // Calculate potential length before building
  const baseLength = adjective.length + noun.length

  if (style < 0.5 && baseLength <= 10) {
    // Simple: AdjectiveNoun (most common for short names)
    result = adjective + noun
  } else if (style < 0.7 && baseLength <= 8) {
    // With number: AdjectiveNoun + single digit
    const number = Math.floor(Math.random() * 9 + 1).toString()
    result = adjective + noun + number
  } else if (style < 0.85) {
    // Try with short prefix
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    if (prefix.length + noun.length <= 10) {
      result = prefix + noun
    } else {
      result = adjective + noun // fallback
    }
  } else {
    // Try with short suffix
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    if (adjective.length + suffix.length <= 10) {
      result = adjective + suffix
    } else if (noun.length + suffix.length <= 10) {
      result = noun + suffix
    } else {
      result = adjective + noun // fallback
    }
  }

  // Final safety check - if still too long, use simple combination
  if (result.length > 10) {
    // Find the shortest possible combination
    const shortAdjectives = adjectives.filter((adj) => adj.length <= 4)
    const shortNouns = nouns.filter((n) => n.length <= 4)

    const shortAdj =
      shortAdjectives[Math.floor(Math.random() * shortAdjectives.length)] ||
      'New'
    const shortNoun =
      shortNouns[Math.floor(Math.random() * shortNouns.length)] || 'Co'

    result = shortAdj + shortNoun
  }

  // Ensure first letter is capitalized
  return result.charAt(0).toUpperCase() + result.slice(1)
}
