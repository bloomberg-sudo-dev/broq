import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorCode = requestUrl.searchParams.get('error_code')
  const errorDescription = requestUrl.searchParams.get('error_description')

  console.log('Auth callback received:', {
    code: code ? 'present' : 'missing',
    error,
    errorCode,
    errorDescription,
    fullUrl: requestUrl.toString(),
    allParams: Object.fromEntries(requestUrl.searchParams.entries())
  })

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error in callback:', {
      error,
      errorCode,
      errorDescription
    })
    
    // Redirect to home with error info
    const redirectUrl = new URL('/', request.url)
    redirectUrl.searchParams.set('auth', 'error')
    redirectUrl.searchParams.set('error_message', errorDescription || error)
    return NextResponse.redirect(redirectUrl)
  }

  // For Supabase OAuth flows, we need to exchange the code for a session
  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      
      console.log('Attempting to exchange code for session...')
      console.log('Code length:', code.length)
      console.log('Code preview:', code.substring(0, 20) + '...')
      
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Error exchanging code for session:', {
          message: exchangeError.message,
          status: exchangeError.status,
          name: exchangeError.name,
          fullError: exchangeError
        })
        
        // Redirect to home with error
        const redirectUrl = new URL('/', request.url)
        redirectUrl.searchParams.set('auth', 'error')
        redirectUrl.searchParams.set('error_message', `Authentication failed: ${exchangeError.message}`)
        return NextResponse.redirect(redirectUrl)
      }
      
      console.log('Successfully exchanged code for session:', {
        userEmail: data.user?.email,
        userId: data.user?.id,
        hasSession: !!data.session,
        sessionExpiry: data.session?.expires_at,
        providerToken: data.session?.provider_token ? 'present' : 'missing'
      })
      
      // Verify the session was properly established
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Error verifying session after exchange:', sessionError)
      } else {
        console.log('Session verification:', {
          hasSession: !!sessionData.session,
          userEmail: sessionData.session?.user?.email
        })
      }
      
    } catch (error) {
      console.error('Unexpected error in auth callback:', error)
      
      // Redirect to home with error
      const redirectUrl = new URL('/', request.url)
      redirectUrl.searchParams.set('auth', 'error')
      redirectUrl.searchParams.set('error_message', 'Authentication failed. Please try again.')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Always redirect to /app after callback processing
  // The session will be available in the AuthContext
  console.log('Redirecting to /app after OAuth callback processing')
  return NextResponse.redirect(new URL('/app', request.url))
} 