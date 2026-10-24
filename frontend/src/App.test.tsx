import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import App from './App';
afterEach(() => vi.unstubAllGlobals());
it('checks API liveness separately from database connectivity', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ status: 'ok' }) }),
  );
  render(<App />);
  await userEvent.click(
    screen.getByRole('button', { name: 'Check API connection' }),
  );
  expect(await screen.findByText(/API is reachable/)).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent(
    'Database connectivity is checked separately.',
  );
});
it('supports retry after a connection failure', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      }),
  );
  render(<App />);
  await userEvent.click(
    screen.getByRole('button', { name: 'Check API connection' }),
  );
  expect(await screen.findByText(/Could not reach the API/)).toBeVisible();
  await userEvent.click(
    screen.getByRole('button', { name: 'Check API connection' }),
  );
  expect(await screen.findByText(/API is reachable/)).toBeVisible();
});
