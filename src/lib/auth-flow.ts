type OAuthResponse = { data: any; error: { message?: string } | null }
type OAuthClient = {
  oauth: {
    getAuthorizationDetails?: (id: string) => Promise<OAuthResponse>
    approveAuthorization?: (id: string, options?: { skipBrowserRedirect?: boolean }) => Promise<OAuthResponse>
    denyAuthorization?: (id: string, options?: { skipBrowserRedirect?: boolean }) => Promise<OAuthResponse>
  }
}

export function safeLocalPath(value: string | null | undefined): string {
  if (!value?.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/dashboard'
  try {
    const url = new URL(value, 'https://expense.local')
    if (url.origin !== 'https://expense.local') return '/dashboard'
    if (url.pathname !== '/dashboard' && url.pathname !== '/oauth/consent') return '/dashboard'
    return url.pathname + url.search + url.hash
  } catch {
    return '/dashboard'
  }
}

export function loginPathFor(target: string, hasSession: boolean): string | null {
  return hasSession ? null : `/login?redirect=${encodeURIComponent(safeLocalPath(target))}`
}

export async function loadConsentDetails(auth: OAuthClient, id: string): Promise<
  | { kind: 'pending'; clientName: string; scopes: string[] }
  | { kind: 'redirect'; url: string }
  | { kind: 'error'; message: string }
> {
  if (!id || !auth.oauth.getAuthorizationDetails) return { kind: 'error', message: 'Invalid authorization request' }
  const { data, error } = await auth.oauth.getAuthorizationDetails(id)
  if (error || !data) return { kind: 'error', message: 'Invalid authorization request' }
  if (!('authorization_id' in data) && typeof data.redirect_url === 'string') {
    return { kind: 'redirect', url: data.redirect_url }
  }
  return {
    kind: 'pending',
    clientName: data.client?.name ?? 'MCP client',
    scopes: typeof data.scope === 'string' ? data.scope.split(' ').filter(Boolean) : []
  }
}

export async function consentDecision(auth: OAuthClient, id: string, decision: 'approve' | 'deny'): Promise<string> {
  if (!id) throw new Error('Invalid authorization request')
  const method = decision === 'approve' ? auth.oauth.approveAuthorization : auth.oauth.denyAuthorization
  if (!method) throw new Error('OAuth consent is unavailable')
  const { data, error } = await method.call(auth.oauth, id, { skipBrowserRedirect: true })
  if (error || !data?.redirect_url) throw new Error(error?.message ?? 'OAuth consent failed')
  return data.redirect_url
}
