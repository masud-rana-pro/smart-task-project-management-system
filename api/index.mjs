import { attachDatabasePool } from '@vercel/functions';
import { createRuntime } from '../backend/dist/runtime.js';

// Build generates the backend before Vercel traces these imports.
// One bounded pool per warm function instance; sessions remain in PostgreSQL.
const runtime = createRuntime(process.env);
attachDatabasePool(runtime.database.pool);
export default runtime.app;
