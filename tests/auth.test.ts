import { describe, expect, it } from 'vitest'
import { consentDecision, loadConsentDetails, loginPathFor, safeLocalPath } from '../src/lib/auth-flow'

describe('auth redirects', () => {
  it('sends unauthenticated dashboard and consent visits to login', () => {
    expect(loginPathFor('/dashboard?month=2026-10', false)).toBe('/login?redirect=%2Fdashboard%3Fmonth%3D2026-10')
    expect(loginPathFor('/oauth/consent?authorization_id=abc', false)).toBe('/login?redirect=%2Foauth%2Fconsent%3Fauthorization_id%3Dabc')
  })

  it('rejects an external return URL', () => {
    expect(safeLocalPath('https://evil.example')).toBe('/dashboard')
    expect(safeLocalPath('//evil.example')).toBe('/dashboard')
  })
})

describe('OAuth consent', () => {
  it('exposes the requesting client and scopes', async () => {
    const auth = { oauth: { getAuthorizationDetails: async () => ({
      data: { authorization_id: 'abc', client: { name: 'My Chat' }, scope: 'openid email' }, error: null
    }) } }
    expect(await loadConsentDetails(auth, 'abc')).toEqual({
      kind: 'pending', clientName: 'My Chat', scopes: ['openid', 'email']
    })
  })

  it('denies without approving when the user chooses deny', async () => {
    const auth = { oauth: {
      approveAuthorization: async () => { throw new Error('approval must not run') },
      denyAuthorization: async () => ({ data: { redirect_url: 'https://chatgpt.com/denied' }, error: null })
    } }
    expect(await consentDecision(auth, 'abc', 'deny')).toBe('https://chatgpt.com/denied')
  })

  it('reports an invalid authorization id', async () => {
    const auth = { oauth: { getAuthorizationDetails: async () => ({ data: null, error: new Error('not found') }) } }
    expect(await loadConsentDetails(auth, 'bad')).toEqual({ kind: 'error', message: 'Invalid authorization request' })
  })
})
