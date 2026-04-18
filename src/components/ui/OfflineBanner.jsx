import { useState, useEffect } from 'react'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    function onOnline() { setOffline(false) }
    function onOffline() { setOffline(true) }
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="app-floating-nav fixed left-1/2 top-3 z-50 w-[calc(100%-1.5rem)] max-w-[398px] -translate-x-1/2 rounded-full px-4 py-2 text-center text-xs font-medium text-[#18211d]">
      No internet connection. Some features may not be available.
    </div>
  )
}
