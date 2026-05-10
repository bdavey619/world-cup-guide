import { useState, useEffect } from 'react'

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < 680
  )
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 680)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}
