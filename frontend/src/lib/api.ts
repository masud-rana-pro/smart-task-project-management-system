let csrfToken: string | undefined;
export class ApiError extends Error {
  status: number;
  code: string;
  fields: { field: string; message: string }[];
  constructor(
    status: number,
    code: string,
    message: string,
    fields: { field: string; message: string }[] = [],
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}
async function refreshToken() {
  const response = await fetch('/api/auth/csrf', {
    credentials: 'same-origin',
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok)
    throw new ApiError(
      response.status,
      'TOKEN_ERROR',
      'Unable to start a secure request. Please retry shortly.',
    );
  const data = (await response.json()) as { csrfToken: string };
  csrfToken = data.csrfToken;
}
export async function api<T>(
  path: string,
  method = 'GET',
  body?: unknown,
  retried = false,
): Promise<T> {
  const mutation = !['GET', 'HEAD'].includes(method);
  if (mutation && !csrfToken) await refreshToken();
  let response: Response;
  try {
    response = await fetch('/api' + path, {
      method,
      credentials: 'same-origin',
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(mutation ? { 'X-CSRF-Token': csrfToken! } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Could not connect. Check your connection and try again.',
    );
  }
  if (response.status === 204) {
    if (path === '/auth/logout') csrfToken = undefined;
    return undefined as T;
  }
  const data = await response.json();
  if (!response.ok) {
    if (data.error?.code === 'CSRF_REJECTED' && !retried) {
      await refreshToken();
      return api<T>(path, method, body, true);
    }
    if (
      response.status === 401 &&
      path !== '/auth/login' &&
      path !== '/auth/me'
    )
      window.dispatchEvent(new Event('session-expired'));
    throw new ApiError(
      response.status,
      data.error?.code ?? 'REQUEST_FAILED',
      data.error?.message ?? 'The request could not be completed.',
      data.error?.fields,
    );
  }
  if (path === '/auth/login') csrfToken = data.csrfToken;
  return data as T;
}
