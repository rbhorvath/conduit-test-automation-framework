import { expect, test } from '../../fixtures';

test.describe('Profiles and following', () => {
  test('profile page shows user info and posts', async ({ profilePage }) => {
    await profilePage.goto('johndoe');
    await expect(profilePage.username).toHaveText('johndoe');
    await expect(profilePage.bio).not.toBeEmpty();
    await expect(profilePage.articlePreviews.first()).toBeVisible();
  });

  test('user can follow and unfollow an author', async ({ authedUser, profilePage }) => {
    await profilePage.goto('johndoe');
    await profilePage.followButton('johndoe').click();
    await expect(profilePage.unfollowButton('johndoe')).toBeVisible();

    await profilePage.unfollowButton('johndoe').click();
    await expect(profilePage.followButton('johndoe')).toBeVisible();
  });

  test('followed author articles appear in Your Feed', async ({ authedUser, profilePage, homePage }) => {
    await profilePage.goto('johndoe');
    await profilePage.followButton('johndoe').click();
    await expect(profilePage.unfollowButton('johndoe')).toBeVisible();

    await homePage.goto();
    await homePage.yourFeedTab.click();
    await expect(homePage.articlePreviews.first()).toBeVisible();
    await expect(homePage.articlePreviews.first()).toContainText('johndoe');
  });

  test('Your Feed is empty for a new user', async ({ authedUser, homePage }) => {
    await homePage.goto();
    await homePage.yourFeedTab.click();
    await expect(homePage.articlePreviews).toHaveCount(0);
  });
});
