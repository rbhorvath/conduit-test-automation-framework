import { Locator, Page } from '@playwright/test';

export class SettingsPage {
  readonly heading: Locator;
  readonly image: Locator;
  readonly username: Locator;
  readonly bio: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly update: Locator;
  readonly logout: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Your Settings' });
    this.image = page.locator('input[name="image"]');
    this.username = page.locator('input[name="username"]');
    this.bio = page.locator('textarea[name="bio"]');
    this.email = page.locator('input[name="email"]');
    this.password = page.locator('input[name="password"]');
    this.update = page.getByRole('button', { name: 'Update Settings' });
    this.logout = page.getByRole('button', { name: /click here to logout/i });
  }

  async goto() {
    await this.page.goto('/settings');
  }
}
