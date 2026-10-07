import { defineConfig, devices } from '@playwright/test';
import { API_URL, BASE_URL } from './fixtures/env';

const uiProject = (name: string, device: (typeof devices)[string]) => ({
  name,
  testDir: './tests/ui',
  use: { ...device, baseURL: BASE_URL },
});

export default defineConfig({
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // The shared demo backend isolates data per client, so parallel workers interfere with each other.
  workers: Number(process.env.WORKERS ?? 1),
  reporter: process.env.CI
    ? [['github'], ['list'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    uiProject('ui', devices['Desktop Chrome']),
    uiProject('ui-firefox', devices['Desktop Firefox']),
    uiProject('ui-webkit', devices['Desktop Safari']),
    uiProject('ui-mobile', devices['Pixel 7']),
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: API_URL },
    },
  ],
});
