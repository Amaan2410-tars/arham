import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Validate Supabase URL to prevent DNS_HOSTNAME_RESOLVED_PRIVATE errors
if (supabaseUrl && import.meta.env.PROD) {
  // Log the actual value for debugging (safe to log - it's a public URL)
  console.log('🔍 [DEBUG] VITE_SUPABASE_URL value:', supabaseUrl)
  
  const isPrivateIP = 
    supabaseUrl.includes('localhost') ||
    supabaseUrl.includes('127.0.0.1') ||
    supabaseUrl.match(/^(http:\/\/|https:\/\/)?(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/) ||
    supabaseUrl.startsWith('postgres://')
  
  if (isPrivateIP) {
    console.error('❌ ERROR: VITE_SUPABASE_URL points to a private IP or localhost!')
    console.error('Current value:', supabaseUrl)
    console.error('This will cause DNS_HOSTNAME_RESOLVED_PRIVATE error on Vercel.')
    console.error('Use your public Supabase API URL: https://xxxxx.supabase.co')
    console.error('Get it from: Supabase Dashboard → Settings → API → Project URL')
    throw new Error(
      `Invalid VITE_SUPABASE_URL: Cannot use localhost or private IP in production. ` +
      `Current value: "${supabaseUrl}". ` +
      `Use your public Supabase API URL from the Supabase dashboard.`
    )
  }
  
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    console.warn('⚠️ WARNING: VITE_SUPABASE_URL may be incorrect.')
    console.warn('Expected format: https://xxxxx.supabase.co')
    console.warn('Current value:', supabaseUrl)
  }
}

// Create client (will work even without real credentials for UI development)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Log warning if using placeholder credentials
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase environment variables not set. Some features may not work.')
  console.warn('Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

