import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { SessionProvider, useSession } from './lib/session';
import AuthPage from './pages/AuthPage';
import { displayDate, isOverdue } from './lib/types';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
function renderAuth(registration = false) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'UNAUTHENTICATED' } }), {
        status: 401,
      }),
    ),
  );
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <SessionProvider>
          <AuthPage register={registration} />
        </SessionProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
it('validates login fields before sending credentials', async () => {
  renderAuth();
  await screen.findByRole('heading', { name: 'Welcome back' });
  await userEvent.click(
    screen.getByRole('button', { name: 'Sign in to workspace' }),
  );
  expect(await screen.findByText('Enter a valid email address.')).toBeVisible();
  expect(screen.getByText('Enter your password.')).toBeVisible();
  expect(fetch).toHaveBeenCalledTimes(1);
});
it('notifies the active session observer on login and logout', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string) => {
      if (input.endsWith('/auth/me'))
        return new Response('{}', { status: 401 });
      if (input.endsWith('/auth/logout'))
        return new Response(null, { status: 204 });
      if (input.endsWith('/auth/csrf'))
        return new Response(JSON.stringify({ csrfToken: 'a'.repeat(64) }));
      return new Response(
        JSON.stringify({
          user: {
            id: 'member-id',
            name: 'Example Member',
            email: 'member@example.invalid',
            role: 'TEAM_MEMBER',
          },
          csrfToken: 'b'.repeat(64),
        }),
      );
    }),
  );
  function Observer() {
    const { user, pending, signIn, signOut } = useSession();
    return (
      <>
        <p>{pending ? 'Restoring session' : (user?.name ?? 'Signed out')}</p>
        <button
          onClick={() =>
            void signIn('member@example.invalid', 'Fictional test password')
          }
        >
          Test login
        </button>
        <button onClick={() => void signOut()}>Test logout</button>
      </>
    );
  }
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  render(
    <QueryClientProvider client={client}>
      <SessionProvider>
        <Observer />
      </SessionProvider>
    </QueryClientProvider>,
  );
  await screen.findByText('Signed out');
  await userEvent.click(screen.getByRole('button', { name: 'Test login' }));
  expect(await screen.findByText('Example Member')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Test logout' }));
  expect(await screen.findByText('Signed out')).toBeVisible();
});
it('explains member registration and rejects a short password locally', async () => {
  renderAuth(true);
  await screen.findByRole('heading', { name: 'Create your account' });
  await userEvent.type(screen.getByLabelText('Full name'), 'Example Member');
  await userEvent.type(
    screen.getByLabelText('Email address'),
    'member@example.invalid',
  );
  await userEvent.type(screen.getByLabelText('Password'), 'short');
  await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
  expect(await screen.findByText('Use at least 12 characters.')).toBeVisible();
  expect(fetch).toHaveBeenCalledTimes(1);
});
it('displays deadline dates independently of local timezone', () => {
  expect(displayDate('2026-10-26')).toBe('26 Oct 2026');
});
it('changes overdue state at Bangladesh midnight and excludes completed tasks', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-25T17:59:59Z'));
  expect(isOverdue({ dueDate: '2026-10-25', status: 'TODO' })).toBe(false);
  vi.setSystemTime(new Date('2026-10-25T18:00:00Z'));
  expect(isOverdue({ dueDate: '2026-10-25', status: 'TODO' })).toBe(true);
  expect(isOverdue({ dueDate: '2026-10-25', status: 'COMPLETED' })).toBe(false);
});
