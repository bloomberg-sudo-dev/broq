// import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Temporarily disabled to fix auth flow issues
  return NextResponse.next()
  
  // Only protect /app routes
  // if (!request.nextUrl.pathname.startsWith('/app')) {
  //   return NextResponse.next()
  // }

  // let response = NextResponse.next({
  //   request: {
  //     headers: request.headers,
  //   },
  // })

  // const supabase = createServerClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  //   {
  //     cookies: {
  //       get(name: string) {
  //         return request.cookies.get(name)?.value
  //       },
  //       set(name: string, value: string, options: any) {
  //         request.cookies.set({
  //           name,
  //           value,
  //           ...options,
  //         })
  //         response = NextResponse.next({
  //           request: {
  //             headers: request.headers,
  //           },
  //         })
  //         response.cookies.set({
  //           name,
  //           value,
  //           ...options,
  //         })
  //       },
  //       remove(name: string, options: any) {
  //         request.cookies.set({
  //           name,
  //           value: '',
  //           ...options,
  //         })
  //         response = NextResponse.next({
  //           request: {
  //             headers: request.headers,
  //           },
  //         })
  //         response.cookies.set({
  //           name,
  //           value: '',
  //           ...options,
  //         })
  //       },
  //     },
  //   }
  // )

  // const {
  //   data: { user },
  // } = await supabase.auth.getUser()

  // // If no user and trying to access /app, redirect to home with auth modal
  // if (!user) {
  //   const redirectUrl = request.nextUrl.clone()
  //   redirectUrl.pathname = '/'
  //   redirectUrl.searchParams.set('auth', 'required')
  //   return NextResponse.redirect(redirectUrl)
  // }

  // return response
}

export const config = {
  matcher: []  // Temporarily disable middleware to fix auth flow first
} 