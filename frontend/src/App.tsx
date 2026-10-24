import { useState } from 'react';
import { z } from 'zod';
import './App.css';

const healthSchema = z.object({ status: z.literal('ok') });

export default function App() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'ready' | 'error'>(
    'idle',
  );
  async function checkConnection() {
    setStatus('checking');
    try {
      const response = await fetch('/api/health', {
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error('API request failed');
      healthSchema.parse(await response.json());
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <span className="brand-mark" aria-hidden="true">
          ST
        </span>
        <span>Smart Task</span>
      </header>
      <main id="main" className="workspace">
        <p className="eyebrow">Project management workspace</p>
        <h1>Smart Task starts with a clear foundation.</h1>
        <p className="intro">
          The application starter is ready for development. Authentication,
          projects, tasks and dashboards will be added in the next approved
          milestones.
        </p>
        <section
          className="connection-panel"
          aria-labelledby="connection-title"
        >
          <div>
            <p className="eyebrow">Development check</p>
            <h2 id="connection-title">API connection</h2>
            <p>
              Check that the Express API can be reached through the application.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void checkConnection()}
            disabled={status === 'checking'}
          >
            {status === 'checking' ? 'Checking…' : 'Check API connection'}
          </button>
          <p role="status">
            {status === 'idle' && 'Not checked yet.'}
            {status === 'checking' && 'Connecting to the API…'}
            {status === 'ready' &&
              'API is reachable. Database connectivity is checked separately.'}
            {status === 'error' &&
              'Could not reach the API. Check that the backend is running, then retry.'}
          </p>
        </section>
      </main>
      <footer>Assessment prototype · Foundation milestone</footer>
    </>
  );
}
