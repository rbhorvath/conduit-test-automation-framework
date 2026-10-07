import { Locator, Page } from '@playwright/test';

export class ArticlePage {
  readonly heading: Locator;
  readonly content: Locator;
  readonly tags: Locator;
  readonly editLink: Locator;
  readonly deleteButton: Locator;
  readonly commentInput: Locator;
  readonly postCommentButton: Locator;
  readonly comments: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.locator('.banner h1');
    this.content = page.locator('.article-content');
    this.tags = page.locator('.article-content .tag-list li');
    // The meta block is rendered twice (banner and footer); use the banner one.
    this.editLink = page.locator('.banner').getByRole('link', { name: 'Edit Article' });
    this.deleteButton = page.locator('.banner').getByRole('button', { name: 'Delete Article' });
    this.commentInput = page.getByPlaceholder('Write a comment...');
    this.postCommentButton = page.getByRole('button', { name: 'Post Comment' });
    this.comments = page.locator('app-article-comment');
  }

  async goto(slug: string) {
    await this.page.goto(`/article/${slug}`);
  }

  async postComment(text: string) {
    await this.commentInput.fill(text);
    await this.postCommentButton.click();
  }

  commentByText(text: string): Locator {
    return this.comments.filter({ hasText: text });
  }

  async deleteComment(text: string) {
    await this.commentByText(text).locator('.mod-options i.ion-trash-a').click();
  }
}
