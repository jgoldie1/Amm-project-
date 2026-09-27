// Supabase authentication for Google, Apple, phone/SMS, email/password, and local guest/demo access.
import { getSupabaseClient, isSupabaseConfigured } from '../../services/supabaseClient'

export type AuthProvider = 'google' | 'apple' | 'phone' | 'email' | 'mock'

export interface AuthUser {
  id: string
  name: string
  email: string
  phone?: string
  avatar_url: string | null
  provider: AuthProvider
}

function oauthRedirect() {
  // Preserve the exact installed-PWA origin and return to the app after OAuth.
  return `${window.location.origin}/?auth=callback`
}

async function signInWithProvider(provider: 'google' | 'apple'): Promise<{ user: AuthUser | null; error: string | null }> {
  const sb = getSupabaseClient()
  if (!sb) return { user: null, error: 'Secure sign-in is not configured yet.' }
  const { error } = await sb.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: oauthRedirect(),
      ...(provider === 'google' ? { queryParams: { access_type: 'offline', prompt: 'select_account' } } : {}),
    },
  })
  return { user: null, error: error?.message ?? null }
}

export const signInWithGoogle = () => signInWithProvider('google')
export const signInWithApple = () => signInWithProvider('apple')

function normalizePhone(phone: string) {
  const raw = phone.trim()
  if (raw.startsWith('+')) return '+' + raw.slice(1).replace(/\D/g, '')
  const digits = raw.replace(/\D/g, '')
  return digits.length === 10 ? `+1${digits}` : `+${digits}`
}

export async function sendPhoneOtp(phone: string) {
  const sb = getSupabaseClient()
  if (!sb) return { error: 'Phone sign-in is not configured yet.' }
  const normalized = normalizePhone(phone)
  if (!/^\+[1-9]\d{7,14}$/.test(normalized)) return { error: 'Enter a valid mobile number including country code.' }
  const { error } = await sb.auth.signInWithOtp({ phone: normalized })
  return { error: error?.message ?? null }
}

export async function verifyPhoneOtp(phone: string, token: string) {
  const sb = getSupabaseClient()
  if (!sb) return { user: null, error: 'Phone sign-in is not configured yet.' }
  const normalized = normalizePhone(phone)
  const { data, error } = await sb.auth.verifyOtp({ phone: normalized, token: token.trim(), type: 'sms' })
  return { user: data.user ? toAuthUser(data.user) : null, error: error?.message ?? null }
}

export async function signUpWithEmail(email: string, password: string, name: string) {
  const sb = getSupabaseClient()
  if (!sb) return { user: null, error: 'Email sign-up is not configured yet.' }
  const { data, error } = await sb.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { full_name: name.trim() || email.split('@')[0] } },
  })
  return { user: data.user ? toAuthUser(data.user) : null, error: error?.message ?? null }
}

export async function signInWithEmail(email: string, password: string) {
  const sb = getSupabaseClient()
  if (!sb) return { user: null, error: 'Email sign-in is not configured yet.' }
  const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password })
  return { user: data.user ? toAuthUser(data.user) : null, error: error?.message ?? null }
}

function toAuthUser(u: any): AuthUser {
  const provider = (u.app_metadata?.provider || (u.phone ? 'phone' : 'email')) as AuthProvider
  return {
    id: u.id,
    name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || u.phone || 'Creator',
    email: u.email || '',
    phone: u.phone || undefined,
    avatar_url: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
    provider,
  }
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const sb = getSupabaseClient()
  if (!sb) {
    const stored = sessionStorage.getItem('amm_mock_user')
    return stored ? JSON.parse(stored) : null
  }
  const { data } = await sb.auth.getSession()
  return data.session?.user ? toAuthUser(data.session.user) : null
}

export async function signOut(): Promise<void> {
  sessionStorage.removeItem('amm_mock_user')
  const sb = getSupabaseClient()
  if (sb) await sb.auth.signOut()
}

export function continueAsGuest(name = 'Creator'): AuthUser {
  const safe = name.trim() || 'Creator'
  const user: AuthUser = {
    id: 'guest-' + crypto.randomUUID(),
    name: safe,
    email: '',
    avatar_url: null,
    provider: 'mock',
  }
  sessionStorage.setItem('amm_mock_user', JSON.stringify(user))
  return user
}

export { isSupabaseConfigured }
