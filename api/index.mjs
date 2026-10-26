import { attachDatabasePool } from '@vercel/functions';
import { createRuntime } from '../backend/dist/runtime.js';
import { removeRoutingMetadata } from '../deployment/routing.mjs';

// Build generates the backend before Vercel traces these imports.
// One bounded pool per warm function instance; sessions remain in PostgreSQL.
const runtime = createRuntime(process.env);
attachDatabasePool(runtime.database.pool);
export default function handler(request, response) {
  removeRoutingMetadata(request);
  return runtime.app(request, response);
}
// Preserve the internal cleanup hooks used by local adapter verification.
handler.locals = runtime.app.locals;
