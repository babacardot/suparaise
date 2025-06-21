interface SpinnerProps {
  className?: string
}

export default function Spinner({ className = '' }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        className={`animate-spin ${className}`}
      >
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1="12"
            y1="3"
            x2="12"
            y2="7"
            className="stroke-gray-400 dark:stroke-gray-500"
            style={{
              opacity: Math.max(0.15, 0.7 - i * 0.08),
            }}
            strokeWidth="1.5"
            strokeLinecap="round"
            transform={`rotate(${i * 45} 12 12)`}
          />
        ))}
      </svg>
    </div>
  )
}
