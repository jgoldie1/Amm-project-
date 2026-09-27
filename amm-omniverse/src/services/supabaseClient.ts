import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

let client: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anon)
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (!client) client = createClient(url!, anon!, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  })
  return client
}

export async function completeAuthCallback(callbackUrl = window.location.href): Promise<string | null> {
  const sb = getSupabaseClient()
  if (!sb) return null
  const parsed = new URL(callbackUrl)
  const error = parsed.searchParams.get('error_description') || parsed.searchParams.get('error')
  if (error) throw new Error(error)
  const code = parsed.searchParams.get('code')
  if (!code) return null
  const { error: exchangeError } = await sb.auth.exchangeCodeForSession(code)
  if (exchangeError) throw exchangeError
  parsed.searchParams.delete('code')
  parsed.searchParams.delete('error')
  parsed.searchParams.delete('error_code')
  parsed.searchParams.delete('error_description')
  window.history.replaceState({}, document.title, parsed.pathname + parsed.search + parsed.hash)
  return parsed.pathname
}

export async function getAccessToken(): Promise<string | null> {
  const sb = getSupabaseClient()
  if (!sb) return null
  const { data } = await sb.auth.getSession()
  return data.session?.access_token ?? null
}

export async function getAuthenticatedUserId(): Promise<string | null> {
  const sb = getSupabaseClient()
  if (!sb) return null
  const { data } = await sb.auth.getUser()
  return data.user?.id ?? null
}
