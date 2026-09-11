'use strict'

class CTVProvider {
  constructor(name) { this.name = name }
  capabilities() { return { provider: this.name, oauth: false, campaigns: false, reporting: false } }
  getAuthorizationUrl() { throw new Error('OAuth is not supported by this provider') }
  async exchangeAuthorizationCode() { throw new Error('OAuth is not supported by this provider') }
  async createCampaign() { throw new Error('Campaign creation is not implemented') }
  async getCampaignReport() { throw new Error('Reporting is not implemented') }
}

class VibeCTVProvider extends CTVProvider {
  constructor(config = {}) {
    super('vibe')
    this.clientId = config.clientId || process.env.VIBE_CLIENT_ID || ''
    this.clientSecret = config.clientSecret || process.env.VIBE_CLIENT_SECRET || ''
    this.redirectUri = config.redirectUri || process.env.VIBE_REDIRECT_URI || ''
    this.authUrl = config.authUrl || process.env.VIBE_AUTH_URL || 'https://api.vibe.co/oauth2/auth'
    this.tokenUrl = config.tokenUrl || process.env.VIBE_TOKEN_URL || ''
    this.apiBaseUrl = config.apiBaseUrl || process.env.VIBE_API_BASE_URL || 'https://api.vibe.co'
  }

  capabilities() {
    return {
      provider: this.name,
      oauth: true,
      campaigns: true,
      reporting: true,
      configured: Boolean(this.clientId && this.redirectUri),
      spendingRequiresExplicitApproval: true,
    }
  }

  getAuthorizationUrl({ state, scope } = {}) {
    if (!this.clientId || !this.redirectUri) throw new Error('Vibe OAuth is not configured')
    const url = new URL(this.authUrl)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('client_id', this.clientId)
    url.searchParams.set('redirect_uri', this.redirectUri)
    if (state) url.searchParams.set('state', state)
    if (scope) url.searchParams.set('scope', scope)
    return url.toString()
  }

  async exchangeAuthorizationCode({ code }) {
    if (!code) throw new Error('Authorization code is required')
    if (!this.tokenUrl) throw new Error('VIBE_TOKEN_URL must be configured from the Vibe developer application')
    if (!this.clientId || !this.clientSecret || !this.redirectUri) throw new Error('Vibe OAuth credentials are incomplete')
    const body = new URLSearchParams({ grant_type: 'authorization_code', code, client_id: this.clientId, client_secret: this.clientSecret, redirect_uri: this.redirectUri })
    const response = await fetch(this.tokenUrl, { method: 'POST', headers: { accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' }, body })
    if (!response.ok) throw new Error(`Vibe token exchange failed (${response.status})`)
    return response.json()
  }

  async request(path, { accessToken, method = 'GET', body } = {}) {
    if (!accessToken) throw new Error('Vibe access token is required')
    const response = await fetch(new URL(path, this.apiBaseUrl), {
      method,
      headers: { accept: 'application/json', authorization: `Bearer ${accessToken}`, ...(body ? { 'content-type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!response.ok) throw new Error(`Vibe API request failed (${response.status})`)
    return response.status === 204 ? null : response.json()
  }
}

function createCTVProvider(name, config) {
  if (name === 'vibe') return new VibeCTVProvider(config)
  throw new Error(`Unsupported CTV provider: ${name}`)
}

module.exports = { CTVProvider, VibeCTVProvider, createCTVProvider }
