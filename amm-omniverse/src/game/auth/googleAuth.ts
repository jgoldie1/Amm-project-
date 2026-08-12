// Google OAuth via the shared Supabase client.
// Without Supabase keys the app still supports the existing mock/demo login.

import { getSupabaseClient, isSupabaseConfigured } from '../../services/supabaseClient'

export interface AuthUser {
  id: string
  name: string
  email: string
  avatar_url: string | null
  provider: 'google' | 'mock'
}

export async function signInWithGoogle(): Promise<{ user: AuthUser | null; error: string | null }> {
  const sb = getSupabaseClient()
  if (!sb) return mockGoogleLogin()

  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })
  if (error) return { user: null, error: error.message }
  return { user: null, error: null }
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const sb = getSupabaseClient()
  if (!sb) {
    const stored = sessionStorage.getItem('amm_mock_user')
    return stored ? JSON.parse(stored) : null
  }

  const { data } = await sb.auth.getSession()
  const u = data.session?.user
  if (!u) return null
  return {
    id: u.id,
    name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Creator',
    email: u.email || '',
    avatar_url: u.user_metadata?.avatar_url || null,
    provider: 'google',
  }
}

export async function signOut(): Promise<void> {
  sessionStorage.removeItem('amm_mock_user')
  const sb = getSupabaseClient()
  if (sb) await sb.auth.signOut()
}

function mockGoogleLogin(): { user: AuthUser; error: null } {
  const names = ['King James', 'QueenZion', 'ProphetEzra', 'WarriorFaith', 'CreatorSoul']
  const picked = names[Math.floor(Math.random() * names.length)]
  const user: AuthUser = {
    id: 'mock-' + Math.random().toString(36).slice(2),
    name: picked,
    email: picked.toLowerCase().replace(' ', '.') + '@tryamm.com',
    avatar_url: null,
    provider: 'mock',
  }
  sessionStorage.setItem('amm_mock_user', JSON.stringify(user))
  return { user, error: null }
}

export { isSupabaseConfigured }
