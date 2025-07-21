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

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('AuthContext: Session error:', error.message)
          // If there's an auth error (like invalid refresh token), clear the session
          if (error.message.includes('refresh_token_not_found') || 
              error.message.includes('Invalid Refresh Token') ||
              error.message.includes('AuthApiError')) {
            console.log('AuthContext: Clearing invalid session due to token error')
            await supabase.auth.signOut()
            setUser(null)
          }
        } else {
          setUser(session?.user ?? null)
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
        console.log('AuthContext: Auth state changed:', event, session?.user?.email || 'No user')
        
        // Handle specific auth events
        if (event === 'TOKEN_REFRESHED') {
          console.log('AuthContext: Token refreshed successfully')
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthContext: User signed out')
          setUser(null)
        } else if (event === 'SIGNED_IN') {
          console.log('AuthContext: User signed in')
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
    
    // Use production URL when deployed, localhost only in development
    const emailRedirectTo = process.env.NODE_ENV === 'production' 
      ? 'https://broq.vercel.app/?redirect=app'
      : `${window.location.origin}/?redirect=app`
    
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
    // Use production URL when deployed, localhost only in development
    const redirectTo = process.env.NODE_ENV === 'production' 
      ? 'https://broq.vercel.app/auth/callback'
      : `${window.location.origin}/auth/callback`
      
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo
      }
    })
    if (error) throw error
  }

  const signInWithGitHub = async () => {
    // Use production URL when deployed, localhost only in development
    const redirectTo = process.env.NODE_ENV === 'production' 
      ? 'https://broq.vercel.app/auth/callback'
      : `${window.location.origin}/auth/callback`
      
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