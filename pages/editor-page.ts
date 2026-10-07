import { Locator, Page } from '@playwright/test';

export interface ArticleData {
  title: string;
  description: string;
  body: string;
  tags?: string[];
}

export class EditorPage {
  readonly title: Locator;
  readonly description: Locator;
  readonly body: Locator;
  readonly tagInput: Locator;
  readonly publish: Locator;
  readonly errors: Locator;

  constructor(private readonly page: Page) {
    this.title = page.locator('input[name="title"]');
    this.description = page.locator('input[name="description"]');
    this.body = page.locator('textarea[name="body"]');
    this.tagInput = page.getByPlaceholder('Enter tags');
    this.publish = page.getByRole('button', { name: 'Publish Article' });
    this.errors = page.locator('.error-messages li');
  }

  async goto(slug?: string) {
    await this.page.goto(slug ? `/editor/${slug}` : '/editor');
  }

  async fill(article: ArticleData) {
    await this.title.fill(article.title);
    await this.description.fill(article.description);
    await this.body.fill(article.body);
    for (const tag of article.tags ?? []) {
      await this.tagInput.fill(tag);
      await this.tagInput.press('Enter');
    }
  }

  async publishArticle(article: ArticleData) {
    await this.fill(article);
    await this.publish.click();
  }
}
