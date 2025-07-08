export interface DynamicGreeting {
  message: string
  timeRange: string
}

export function getDynamicGreeting(founderName?: string): DynamicGreeting {
  const hour = new Date().getHours()
  const name = founderName || 'founder'

  // Define time-based greetings with hour ranges
  const greetings: { [key: string]: { message: string; hours: number[] } } = {
    'Late-night hustle! Ready to automate some outreach?': {
      message: 'Late-night hustle! Ready to automate some outreach?',
      hours: [0, 1, 2],
    },
    'Early birds get the money!': {
      message: 'Early birds get the money!',
      hours: [3, 4, 5],
    },
    'Good morning, {name}!': {
      message: `Good morning, ${name}!`,
      hours: [6, 7, 8],
    },
    'Time for a coffee and to check the submission pipeline.': {
      message: 'Time for a coffee and to check the submission pipeline.',
      hours: [9, 10],
    },
    "Let's get this bread! How many intros are you aiming for?": {
      message: "Let's get this bread! How many intros are you aiming for?",
      hours: [11, 12],
    },
    'Hello {name}, how are you doing?': {
      message: 'Hello {name}, how are you doing?',
      hours: [13],
    },
    'Afternoon grind.': {
      message: 'Afternoon grind.',
      hours: [14, 15, 16],
    },
    'Time to send out those applications.': {
      message: 'Time to send out those applications.',
      hours: [17, 18],
    },
    'Burning the midnight oil?': {
      message: `Dedication pays off.`,
      hours: [19, 20, 21],
    },
    'Let the agents work while you sleep.': {
      message: 'Let the agents work while you sleep.',
      hours: [22, 23],
    },
  }

  // Find the appropriate greeting for the current hour
  for (const value of Object.values(greetings)) {
    if (value.hours.includes(hour)) {
      return {
        message: value.message.replace('{name}', name),
        timeRange: getTimeRangeString(value.hours),
      }
    }
  }

  // Default fallback
  return {
    message: `Hello ${name}, how are you doing?`,
    timeRange: 'All day',
  }
}

function getTimeRangeString(hours: number[]): string {
  if (hours.length === 1 && hours[0] !== undefined) {
    const hour = hours[0]
    const nextHour = (hour + 1) % 24
    return `${formatHour(hour)} - ${formatHour(nextHour)}`
  } else if (hours.length > 0) {
    const minHour = Math.min(...hours)
    const maxHour = Math.max(...hours)
    return `${formatHour(minHour)} - ${formatHour((maxHour + 1) % 24)}`
  }
  return 'Unknown time range'
}

function formatHour(hour: number): string {
  if (hour === 0) return '12:00 AM'
  if (hour === 12) return '12:00 PM'
  if (hour < 12) return `${hour}:00 AM`
  return `${hour - 12}:00 PM`
}

export default getDynamicGreeting
