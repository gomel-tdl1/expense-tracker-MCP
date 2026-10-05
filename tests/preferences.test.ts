import { describe, expect, it, vi } from 'vitest';
const store = vi.hoisted(() => new Map<string, string>());
vi.mock('next/headers', () => ({ cookies: async () => ({ get: (name: string) => store.has(name) ? { value: store.get(name) } : undefined }) }));
import { getPreferences } from '../src/lib/preferences';

describe('server display preferences', () => {
  it('renders saved language, theme and motion preference on the initial request', async () => {
    store.set('expense-locale', 'pl');
    store.set('expense-theme', 'light');
    store.set('expense-motion', 'off');
    expect(await getPreferences()).toEqual({ locale: 'pl', theme: 'light', motion: false });
    store.clear();
  });
  it('uses valid defaults for absent or unrecognized cookies', async () => {
    store.set('expense-locale', '<script>');
    store.set('expense-theme', 'invalid');
    expect(await getPreferences()).toEqual({ locale: 'ru', theme: 'dark', motion: true });
    store.clear();
  });
});
