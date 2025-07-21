"use client"

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export function useAuthRedirect() {
  const { user, loading, clearAuthError } = useAuth()
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

  const handleAuthError = async (error: any) => {
    console.log('useAuthRedirect: Handling auth error:', error.message)
    
    // Check if it's a refresh token error
    if (error.message && (
        error.message.includes('refresh_token_not_found') || 
        error.message.includes('Invalid Refresh Token') ||
        error.message.includes('AuthApiError')
    )) {
      console.log('useAuthRedirect: Refresh token error detected, clearing auth state')
      await clearAuthError()
      
      // Redirect to home with auth modal
      router.push('/?auth=required')
      
      return 'Your session has expired. Please sign in again.'
    }
    
    return error.message || 'An authentication error occurred'
  }

  useEffect(() => {
    return () => {
      // Cleanup timeout on unmount
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  return { redirectToApp, handleAuthError }
} 