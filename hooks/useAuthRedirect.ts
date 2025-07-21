"use client"

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export function useAuthRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const redirectToApp = () => {
    console.log('useAuthRedirect: Attempting redirect to /app')
    
    // Clear any existing timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current)
    }

    // Set a timeout to ensure the redirect happens
    redirectTimeoutRef.current = setTimeout(() => {
      console.log('useAuthRedirect: Executing redirect to /app')
      router.push('/app')
    }, 100) // Small delay to ensure auth state is updated
  }

  useEffect(() => {
    return () => {
      // Cleanup timeout on unmount
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  return { redirectToApp }
} 