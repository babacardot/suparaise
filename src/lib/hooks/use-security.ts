import { useEffect, useState } from 'react'

export function useSecurity() {
  const [isSecured] = useState(true)

  useEffect(() => {
    // Prevent context menu
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Prevent key combinations
    const preventKeyCombinations = (e: KeyboardEvent) => {
      // Prevent Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+S, Ctrl+P, F12, Ctrl+Shift+I, Ctrl+U
      if (
        (e.ctrlKey && ['a', 'c', 'v', 'x', 's', 'p', 'u'].includes(e.key.toLowerCase())) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && e.key === 'K') // Ctrl+Shift+K (Console)
      ) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    // Prevent drag operations
    const preventDrag = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    // Prevent selection
    const preventSelection = () => {
      window.getSelection()?.removeAllRanges()
    }

    // Add event listeners
    document.addEventListener('contextmenu', preventContextMenu)
    document.addEventListener('keydown', preventKeyCombinations)
    document.addEventListener('dragstart', preventDrag)
    document.addEventListener('selectstart', preventSelection)

    // Disable image saving
    const images = document.querySelectorAll('img')
    images.forEach(img => {
      img.setAttribute('draggable', 'false')
      img.style.pointerEvents = 'none'
    })

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu)
      document.removeEventListener('keydown', preventKeyCombinations)
      document.removeEventListener('dragstart', preventDrag)
      document.removeEventListener('selectstart', preventSelection)
    }
  }, [])

  return { isSecured }
} 