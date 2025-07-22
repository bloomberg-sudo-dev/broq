"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  signOut: () => Promise<void>
  clearAuthError: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Debug: Check Supabase configuration
  useEffect(() => {
    console.log('AuthContext: Supabase configuration check:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'MISSING',
      urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'MISSING',
      anonKeyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
      client: !!supabase
    })
  }, [])

  useEffect(() => {
    // Handle OAuth tokens in URL fragment
    const handleOAuthTokens = async () => {
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        console.log('AuthContext: OAuth tokens detected in URL, processing...')
        
        // Parse the URL fragment to extract tokens
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        if (accessToken) {
          console.log('AuthContext: Setting session from OAuth tokens...')
          
          try {
            // Set the session using the tokens from URL
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            })
            
            if (error) {
              console.error('AuthContext: Error setting session from tokens:', error)
            } else if (data.session) {
              console.log('AuthContext: Successfully set session from OAuth tokens:', data.session.user?.email)
              setUser(data.session.user)
              
              // Clear URL fragment
              window.history.replaceState({}, document.title, window.location.pathname)
              return true // Successfully processed
            }
          } catch (error) {
            console.error('AuthContext: Error processing OAuth tokens:', error)
          }
        }
      }
      return false // No tokens processed
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthContext: Getting initial session...')
        
        // First try to handle OAuth tokens if present
        const tokensProcessed = await handleOAuthTokens()
        
        if (!tokensProcessed) {
          // Normal session check
          const { data: { session }, error } = await supabase.auth.getSession()
          
          console.log('AuthContext: Initial session result:', {
            hasSession: !!session,
            userEmail: session?.user?.email,
            sessionExpiry: session?.expires_at,
            error: error?.message,
            accessToken: session?.access_token ? 'present' : 'missing'
          })
          
          if (error) {
            console.warn('AuthContext: Session error:', {
              message: error.message,
              status: error.status,
              name: error.name
            })
            
            // If there's an auth error (like invalid refresh token), clear the session
            if (error.message.includes('refresh_token_not_found') || 
                error.message.includes('Invalid Refresh Token') ||
                error.message.includes('AuthApiError') ||
                error.status === 401) {
              console.log('AuthContext: Clearing invalid session due to auth error')
              await supabase.auth.signOut()
              setUser(null)
            }
          } else {
            setUser(session?.user ?? null)
            
            if (session?.user) {
              console.log('AuthContext: User successfully authenticated:', session.user.email)
            }
          }
        }
      } catch (error) {
        console.error('AuthContext: Unexpected error getting session:', error)
        // Clear potentially corrupted auth state
        await supabase.auth.signOut()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', {
          event,
          userEmail: session?.user?.email || 'No user',
          hasSession: !!session,
          sessionExpiry: session?.expires_at
        })
        
        // Handle specific auth events
        if (event === 'TOKEN_REFRESHED') {
          console.log('AuthContext: Token refreshed successfully')
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthContext: User signed out')
          setUser(null)
        } else if (event === 'SIGNED_IN') {
          console.log('AuthContext: User signed in successfully')
          setUser(session?.user ?? null)
        }
        
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    console.log('AuthContext: Signing up user:', email)
    
    // Use current domain for redirect URL (works for both localhost and production)
    const emailRedirectTo = `${window.location.origin}/?redirect=app`
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo
      }
    })
    if (error) {
      console.error('AuthContext: Sign up error:', error)
      throw error
    }
    console.log('AuthContext: Sign up successful:', data.user?.email, 'Session:', !!data.session)
  }

  const signIn = async (email: string, password: string) => {
    console.log('AuthContext: Signing in user:', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      console.error('AuthContext: Sign in error:', error)
      throw error
    }
    console.log('AuthContext: Sign in successful:', data.user?.email)
  }

  const signInWithGoogle = async () => {
    // Use current domain for OAuth callback URL (works for both localhost and production)
    const redirectTo = `${window.location.origin}/auth/callback`
      
    console.log('AuthContext: Initiating Google OAuth...')
    console.log('AuthContext: Google OAuth redirect URL:', redirectTo)
    console.log('AuthContext: NODE_ENV:', process.env.NODE_ENV)
    console.log('AuthContext: window.location.origin:', window.location.origin)
    console.log('AuthContext: Current URL:', window.location.href)
      
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo
      }
    })
    
    console.log('AuthContext: Google OAuth response:', { data, error })
    
    if (error) {
      console.error('AuthContext: Google OAuth error:', error)
      throw error
    }
    
    console.log('AuthContext: Google OAuth initiated successfully')
  }

  const signInWithGitHub = async () => {
    // Use current domain for OAuth callback URL (works for both localhost and production)
    const redirectTo = `${window.location.origin}/auth/callback`
      
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const clearAuthError = async () => {
    console.log('AuthContext: Clearing auth error and invalid tokens')
    try {
      // Force sign out to clear any invalid tokens
      await supabase.auth.signOut()
      
      // Clear user state
      setUser(null)
      
      // Clear any stored auth data from localStorage
      if (typeof window !== 'undefined') {
        // Clear Supabase auth related localStorage items
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('sb-')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      }
      
      console.log('AuthContext: Auth error cleared successfully')
    } catch (error) {
      console.error('AuthContext: Error clearing auth state:', error)
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
    clearAuthError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 