import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Automatically detect auth from URL on page load
    detectSessionInUrl: true,
    // Persist session in localStorage
    persistSession: true,
    // Auto-refresh tokens
    autoRefreshToken: true
  }
})

export type { User } from '@supabase/supabase-js' 