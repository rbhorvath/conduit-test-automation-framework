import { Locator, Page } from '@playwright/test';

export class ProfilePage {
  readonly username: Locator;
  readonly bio: Locator;
  readonly myPostsTab: Locator;
  readonly favoritedPostsTab: Locator;
  readonly articlePreviews: Locator;

  constructor(private readonly page: Page) {
    this.username = page.locator('.user-info h4');
    this.bio = page.locator('.user-info p');
    this.myPostsTab = page.getByRole('link', { name: 'My Posts' });
    this.favoritedPostsTab = page.getByRole('link', { name: 'Favorited Posts' });
    this.articlePreviews = page.locator('app-article-preview');
  }

  async goto(username: string) {
    await this.page.goto(`/profile/${username}`);
  }

  followButton(username: string): Locator {
    return this.page.getByRole('button', { name: `Follow ${username}` });
  }

  unfollowButton(username: string): Locator {
    return this.page.getByRole('button', { name: `Unfollow ${username}` });
  }
}
