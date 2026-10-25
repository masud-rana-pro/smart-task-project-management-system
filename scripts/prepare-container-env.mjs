import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
mkdirSync(new URL('../.local/', import.meta.url), { recursive: true });
const names = [
  'CONTAINER_POSTGRES_PASSWORD',
  'CONTAINER_DB_PASSWORD',
  'CONTAINER_SESSION_SECRET',
  'CONTAINER_ADMIN_PASSWORD',
  'CONTAINER_MEMBER_PASSWORD',
];
const content =
  names
    .map(
      (name) =>
        `${name}=${randomBytes(name === 'CONTAINER_SESSION_SECRET' ? 64 : 32).toString('hex')}`,
    )
    .join('\n') + '\n';
writeFileSync(new URL('../.local/containers.env', import.meta.url), content, {
  flag: 'wx',
  mode: 0o600,
});
console.log(
  'Created private .local/containers.env. Existing files are never overwritten; no credentials were displayed.',
);
