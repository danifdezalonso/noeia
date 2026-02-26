import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export const useSupabase = (): SupabaseClient | null => {
  if (!import.meta.client) return null
  if (_client) return _client
  try {
    const config = useRuntimeConfig()
    const url = config.public.supabaseUrl as string
    const key = config.public.supabaseAnonKey as string
    if (!url || !key || url.startsWith('your_')) {
      console.warn('[supabase] client not created: SUPABASE_URL or SUPABASE_ANON_KEY env vars are missing.')
      return null
    }
    _client = createClient(url, key)
    console.log('[supabase] client initialized ✓')
    return _client
  } catch (e) {
    console.warn('[supabase] client not created (useRuntimeConfig unavailable):', e)
    return null
  }
}
