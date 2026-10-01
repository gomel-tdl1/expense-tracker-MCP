import { NextResponse, type NextRequest } from 'next/server';
import { safeLocalPath } from '../../../lib/auth-flow';
import { createServerClient } from '../../../lib/supabase/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const next = safeLocalPath(url.searchParams.get('next'));
  const supabase = await createServerClient();
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  const result = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type === 'email'
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'email' })
      : { error: { message: 'Ссылка недействительна.' } };
  if (result.error) {
    const errorUrl = new URL('/login', url.origin);
    errorUrl.searchParams.set('redirect', next);
    errorUrl.searchParams.set('error', 'Ссылка для входа недействительна или устарела.');
    return NextResponse.redirect(errorUrl);
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
