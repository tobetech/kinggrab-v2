import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://henhksozqbpacmptiaoh.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhlbmhrc296cWJwYWNtcHRpYW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MzcxNDYsImV4cCI6MjA1NDIxMzE0Nn0.K5CUSZQsviKyvV6j3sGKhQ6TixieL82N0w0lRaM43kM'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials are missing. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
