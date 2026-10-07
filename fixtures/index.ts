import { test as base, expect } from '@playwright/test';
import { ArticlePage } from '../pages/article-page';
import { LoginPage, RegisterPage } from '../pages/auth-page';
import { EditorPage } from '../pages/editor-page';
import { Header } from '../pages/header';
import { HomePage } from '../pages/home-page';
import { ProfilePage } from '../pages/profile-page';
import { SettingsPage } from '../pages/settings-page';
import { ApiClient } from './api-client';
import { newUser, User } from './data';
import { API_URL } from './env';

export { newArticleData, newUser, uniqueSuffix } from './data';
export type { User } from './data';

type Fixtures = {
  header: Header;
  homePage: HomePage;
  registerPage: RegisterPage;
  loginPage: LoginPage;
  editorPage: EditorPage;
  articlePage: ArticlePage;
  settingsPage: SettingsPage;
  profilePage: ProfilePage;
  user: User;
  /** API client authenticated as `authedUser`, handy for seeding data. */
  userApi: ApiClient;
  /**
   * A freshly registered user who is already signed in on `page`.
   * Registration happens through the API and the token is injected into localStorage,
   * which is much faster than going through the sign-up form.
   */
  authedUser: User;
};

export const test = base.extend<Fixtures>({
  header: async ({ page }, use) => use(new Header(page)),
  homePage: async ({ page }, use) => use(new HomePage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  editorPage: async ({ page }, use) => use(new EditorPage(page)),
  articlePage: async ({ page }, use) => use(new ArticlePage(page)),
  settingsPage: async ({ page }, use) => use(new SettingsPage(page)),
  profilePage: async ({ page }, use) => use(new ProfilePage(page)),
  user: async ({}, use) => use(newUser()),
  userApi: async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: { 'Content-Type': 'application/json' },
    });
    await use(new ApiClient(ctx));
    await ctx.dispose();
  },
  authedUser: async ({ page, user, userApi }, use) => {
    const res = await userApi.register(user);
    expect(res.status()).toBe(201);
    // Seed once per tab so that a later logout is not undone by a page reload.
    await page.addInitScript((token) => {
      if (!sessionStorage.getItem('__seeded')) {
        localStorage.setItem('jwtToken', token);
        sessionStorage.setItem('__seeded', '1');
      }
    }, userApi.token!);
    await use(user);
  },
});

export { expect };
