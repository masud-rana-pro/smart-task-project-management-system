import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

config({ path: 'backend/.env', quiet: true });
const testDatabase = process.env.TEST_DATABASE_URL;
if (!testDatabase || !new URL(testDatabase).pathname.endsWith('_test'))
  throw new Error(
    'Browser workflows require a migrated isolated TEST_DATABASE_URL ending in _test.',
  );

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  // Workflows share a workspace-wide dashboard; serialize fixtures for deterministic totals.
  workers: 1,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://127.0.0.1:5173', trace: 'retain-on-failure' },
  projects: [
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(process.env.PLAYWRIGHT_CHANNEL
          ? { channel: process.env.PLAYWRIGHT_CHANNEL }
          : {}),
      },
    },
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Pixel 7'],
        ...(process.env.PLAYWRIGHT_CHANNEL
          ? { channel: process.env.PLAYWRIGHT_CHANNEL }
          : {}),
      },
    },
  ],
  webServer: [
    {
      command: 'npm run start -w backend',
      url: 'http://127.0.0.1:3001/api/health',
      reuseExistingServer: false,
      env: { DATABASE_URL: testDatabase },
    },
    {
      command: 'npm run dev -w frontend',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
