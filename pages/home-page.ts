import { Locator, Page } from '@playwright/test';

export class HomePage {
  readonly globalFeedTab: Locator;
  readonly yourFeedTab: Locator;
  readonly articlePreviews: Locator;
  readonly pagination: Locator;

  constructor(private readonly page: Page) {
    this.globalFeedTab = page.getByRole('link', { name: 'Global Feed' });
    this.yourFeedTab = page.getByRole('link', { name: 'Your Feed' });
    this.articlePreviews = page.locator('app-article-preview');
    this.pagination = page.locator('ul.pagination li.page-item');
  }

  pageButton(n: number): Locator {
    return this.pagination.getByRole('button', { name: String(n), exact: true });
  }

  async goto() {
    await this.page.goto('/');
  }

  articleByTitle(title: string): Locator {
    return this.articlePreviews.filter({ has: this.page.getByRole('heading', { name: title, level: 1 }) });
  }

  tagLink(tag: string): Locator {
    return this.page.locator(`a[href="/tag/${tag}"]`);
  }
}
