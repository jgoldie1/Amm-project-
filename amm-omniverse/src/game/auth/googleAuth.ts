// Google OAuth via Supabase
// In production: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
// Falls back to mock login so the game always runs even without keys

export interface AuthUser {
  id: string
  name: string
  email: string
  avatar_url: string | null
  provider: 'google' | 'mock'
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

let supabase: import('@supabase/supabase-js').SupabaseClient | null = null

async function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON) return null
  if (supabase) return supabase
  const { createClient } = await import('@supabase/supabase-js')
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
  return supabase
}

export async function signInWithGoogle(): Promise<{ user: AuthUser | null; error: string | null }> {
  const sb = await getSupabase()

  if (!sb) {
    // Mock login — works with no Supabase keys, perfect for dev/demo
    return mockGoogleLogin()
  }

  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: { access_type: 'offline', prompt: 'consent' }
    }
  })
  if (error) return { user: null, error: error.message }
  return { user: null, error: null } // redirect happens, page reloads
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const sb = await getSupabase()
  if (!sb) {
    // Check if mock session exists in sessionStorage
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
    provider: 'google'
  }
}

export async function signOut(): Promise<void> {
  sessionStorage.removeItem('amm_mock_user')
  const sb = await getSupabase()
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
    provider: 'mock'
  }
  sessionStorage.setItem('amm_mock_user', JSON.stringify(user))
  return { user, error: null }
}

export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON)
}
