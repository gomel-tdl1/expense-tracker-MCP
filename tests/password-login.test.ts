import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  redirect: vi.fn(),
}))

vi.mock('../src/lib/supabase/server', () => ({
  createServerClient: async () => ({ auth: { signInWithPassword: mocks.signInWithPassword } }),
}))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))

import { signInWithPassword } from '../src/app/login/actions'

function credentials(email: string, password: string, destination: string): FormData {
  const form = new FormData()
  form.set('email', email)
  form.set('password', password)
  form.set('redirect', destination)
  return form
}

describe('password login', () => {
  beforeEach(() => {
    mocks.signInWithPassword.mockReset()
    mocks.redirect.mockReset()
    mocks.redirect.mockImplementation((path: string) => { throw new Error(`redirect:${path}`) })
  })

  it('signs in an existing user and returns to the requested consent screen', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: null })
    await expect(signInWithPassword(credentials(' user@example.com ', 'secret123', '/oauth/consent?authorization_id=abc')))
      .rejects.toThrow('redirect:/oauth/consent?authorization_id=abc')
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secret123' })
  })

  it('returns one generic error for invalid credentials and never redirects', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } })
    await expect(signInWithPassword(credentials('missing@example.com', 'wrong', '/dashboard')))
      .resolves.toEqual({ error: 'Неверный email или пароль.' })
    expect(mocks.redirect).not.toHaveBeenCalled()
  })

  it('rejects missing fields before contacting Supabase', async () => {
    await expect(signInWithPassword(credentials(' ', '', '/dashboard')))
      .resolves.toEqual({ error: 'Введите email и пароль.' })
    expect(mocks.signInWithPassword).not.toHaveBeenCalled()
  })
})

it('localizes the generic sign-in error without exposing provider details', async () => {
  mocks.signInWithPassword.mockResolvedValue({ error: { message: 'Internal provider detail' } });
  const form = credentials('user@example.com', 'wrong', '/dashboard');
  form.set('locale', 'pl');
  await expect(signInWithPassword(form)).resolves.toEqual({ error: 'Nieprawidłowy email lub hasło.' });
});
