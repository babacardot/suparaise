'use client'

import React from 'react'

interface DockProps {
  children: React.ReactNode
}

export const Dock: React.FC<DockProps> = ({ children }) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[976px] max-w-full border border-border rounded-xs">
      {children}
    </div>
  )
}
