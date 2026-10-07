import { expect, test as base } from '@playwright/test';
import { ApiClient, ApiUser, ArticleInput } from './api-client';
import { newArticleData, newUser } from './data';
import { API_URL } from './env';

type ApiFixtures = {
  /** Unauthenticated client. */
  api: ApiClient;
  /** Client authenticated as a freshly registered user. */
  authedApi: ApiClient;
  apiUser: ApiUser;
  newArticle: () => ArticleInput;
};

export const test = base.extend<ApiFixtures>({
  api: async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: { 'Content-Type': 'application/json' },
    });
    await use(new ApiClient(ctx));
    await ctx.dispose();
  },
  authedApi: async ({ api }, use) => {
    const res = await api.register(newUser());
    expect(res.status()).toBe(201);
    await use(api);
  },
  apiUser: async ({ authedApi }, use) => {
    const res = await authedApi.get('user');
    const { user } = await res.json();
    await use({ ...user, password: 'Passw0rd!123' });
  },
  newArticle: async ({}, use) => {
    await use(() => newArticleData('API Article'));
  },
});

export { expect };
