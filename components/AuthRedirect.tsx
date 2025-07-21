"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export function AuthRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't redirect if still loading or already on app pages
    if (loading || pathname?.startsWith('/app')) {
      return
    }

    // If user just became authenticated and is on the landing page,
    // check if they should be redirected to the app
    if (user) {
      // Check for specific redirect scenarios
      const urlParams = new URLSearchParams(window.location.search)
      const redirectAfterAuth = urlParams.get('redirect')
      
      // If there's a redirect parameter or user just verified email
      if (redirectAfterAuth === 'app' || urlParams.get('type') === 'email_verification') {
        router.push('/app')
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }, [user, loading, pathname, router])

  return null // This component doesn't render anything
} 