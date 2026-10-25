import { afterEach, expect, it, vi } from 'vitest';
afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});
it('shows a safe retry message for an HTML proxy error', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response('<html>upstream unavailable</html>', { status: 502 }),
      ),
  );
  const { api } = await import('./api');
  await expect(api('/dashboard')).rejects.toMatchObject({
    status: 502,
    code: 'INVALID_RESPONSE',
    message: 'The service is temporarily unavailable. Please retry.',
  });
});
it('refreshes a rejected CSRF token once and does not retry a failing mutation indefinitely', async () => {
  const fetcher = vi.fn().mockImplementation(async (input: string) =>
    input.endsWith('/auth/csrf')
      ? new Response(JSON.stringify({ csrfToken: 'a'.repeat(64) }))
      : new Response(
          JSON.stringify({
            error: {
              code: 'CSRF_REJECTED',
              message: 'Security token rejected.',
            },
          }),
          { status: 403 },
        ),
  );
  vi.stubGlobal('fetch', fetcher);
  const { api } = await import('./api');
  await expect(
    api('/projects', 'POST', { name: 'Example', description: 'Example' }),
  ).rejects.toMatchObject({ code: 'CSRF_REJECTED' });
  expect(
    fetcher.mock.calls.filter(([path]) => path === '/api/projects'),
  ).toHaveLength(2);
  expect(
    fetcher.mock.calls.filter(([path]) => path === '/api/auth/csrf'),
  ).toHaveLength(2);
});
it('does not submit a mutation when CSRF bootstrap fails', async () => {
  const fetcher = vi
    .fn()
    .mockRejectedValue(new TypeError('network failure detail'));
  vi.stubGlobal('fetch', fetcher);
  const { api } = await import('./api');
  await expect(api('/projects', 'POST', {})).rejects.toMatchObject({
    code: 'NETWORK_ERROR',
  });
  expect(fetcher).toHaveBeenCalledTimes(1);
});
