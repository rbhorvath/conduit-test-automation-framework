import { Locator, Page } from '@playwright/test';

export class Header {
  readonly nav: Locator;
  readonly homeLink: Locator;
  readonly signInLink: Locator;
  readonly signUpLink: Locator;
  readonly newArticleLink: Locator;
  readonly settingsLink: Locator;

  constructor(private readonly page: Page) {
    this.nav = page.getByRole('navigation').first();
    this.homeLink = this.nav.getByRole('link', { name: 'Home' });
    this.signInLink = this.nav.getByRole('link', { name: 'Sign in' });
    this.signUpLink = this.nav.getByRole('link', { name: 'Sign up' });
    this.newArticleLink = this.nav.getByRole('link', { name: 'New Article' });
    this.settingsLink = this.nav.getByRole('link', { name: 'Settings' });
  }

  profileLink(username: string): Locator {
    return this.nav.getByRole('link', { name: username });
  }
}
