'use client'

import React from 'react'
import { useSecurity } from '@/lib/hooks/use-security'

interface SecureFundsWrapperProps {
    children: React.ReactNode
}

export default function SecureFundsWrapper({ children }: SecureFundsWrapperProps) {
    const { isSecured } = useSecurity()

    React.useEffect(() => {
        // Prevent printing and add copy protection
        const style = document.createElement('style')
        style.textContent = `
      @media print {
        .secure-content { display: none !important; }
        body::after {
          content: "This document cannot be printed for security reasons.";
          display: block;
          font-size: 24px;
          text-align: center;
          margin-top: 200px;
        }
      }
      
      .secure-content {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      
      .secure-content * {
         -webkit-touch-callout: none;
         -webkit-user-select: none;
         -khtml-user-select: none;
         -moz-user-select: none;
         -ms-user-select: none;
         user-select: none;
       }

      .secure-content img, .secure-content video {
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
        pointer-events: none;
      }
    `
        document.head.appendChild(style)

        return () => {
            document.head.removeChild(style)
        }
    }, [isSecured])

    return (
        <div
            className="secure-content relative"
            style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent'
            }}
            onCopy={(e: React.ClipboardEvent) => e.preventDefault()}
            onCut={(e: React.ClipboardEvent) => e.preventDefault()}
            onPaste={(e: React.ClipboardEvent) => e.preventDefault()}
            onDragStart={(e: React.DragEvent) => e.preventDefault()}
            onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
        >
            {/* Simple watermark overlay */}
            <div
                className="absolute inset-0 pointer-events-none z-40 opacity-[0.02]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial, sans-serif' font-size='14' fill='%23000' transform='rotate(-25 100 100)' opacity='0.8'%3ESuparaise Confidential%3C/text%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '200px 200px',
                    mixBlendMode: 'overlay'
                }}
            />

            {children}
        </div>
    )
} 