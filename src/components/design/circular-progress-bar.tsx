import React, { useEffect, useState } from 'react'

interface CircularProgressBarProps {
  size?: number
  strokeWidth?: number
  color?: string
  duration?: number // Duration in seconds
  onCompletion?: () => void
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  size = 20,
  strokeWidth = 2,
  color = '#22c55e',
  duration = 600, // 10 minutes
  onCompletion,
}) => {
  const [progress, setProgress] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  useEffect(() => {
    let startTime: number | null = null
    let animationFrameId: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsedTime = (timestamp - startTime) / 1000 // in seconds

      // Animate to 95% over the specified duration
      const targetProgress = Math.min((elapsedTime / duration) * 95, 95)
      setProgress(targetProgress)

      if (elapsedTime < duration) {
        animationFrameId = requestAnimationFrame(animate)
      } else if (onCompletion) {
        // Optional: keep it at 95 until completion is signaled
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrameId)
  }, [duration, onCompletion])

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#e2e8f0"
        strokeWidth={strokeWidth}
        fill="transparent"
        className="dark:stroke-gray-700"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.1s linear' }}
      />
    </svg>
  )
}

export default CircularProgressBar
