import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

// OWASP's scrypt option: N=2^17, r=8, p=1; 128 MiB plus overhead.
function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      64,
      { N: 131072, r: 8, p: 1, maxmem: 192 * 1024 * 1024 },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const key = await derive(password, salt);
  return `$scrypt$131072$8$1$${salt}$${key.toString('hex')}`;
}
export async function verifyPassword(
  password: string,
  encoded: string | undefined,
) {
  const match = encoded?.match(
    /^\$scrypt\$131072\$8\$1\$([a-f0-9]{32})\$([a-f0-9]{128})$/,
  );
  // Perform the expensive operation for unknown accounts too.
  const key = await derive(password, match?.[1] ?? '0'.repeat(32));
  const expected = Buffer.from(match?.[2] ?? '0'.repeat(128), 'hex');
  return timingSafeEqual(key, expected) && !!match;
}
