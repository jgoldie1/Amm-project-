import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

let client: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anon)
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (!client) client = createClient(url!, anon!)
  return client
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
