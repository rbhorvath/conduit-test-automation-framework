import { expect, test } from '../../fixtures';

test.describe('Settings', () => {
  test('anonymous users are redirected away from settings', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).not.toHaveURL(/\/settings/);
  });

  test('settings form is pre-filled with the current user', async ({ authedUser, settingsPage }) => {
    await settingsPage.goto();
    await expect(settingsPage.heading).toBeVisible();
    await expect(settingsPage.username).toHaveValue(authedUser.username);
    await expect(settingsPage.email).toHaveValue(authedUser.email);
  });

  test('user can update bio and see it on the profile', async ({ page, authedUser, settingsPage, profilePage }) => {
    const bio = 'Automated test bio';
    await settingsPage.goto();
    await settingsPage.bio.fill(bio);
    await settingsPage.update.click();

    await expect(page).toHaveURL(new RegExp(`/profile/${authedUser.username}`));
    await expect(profilePage.bio).toHaveText(bio);
  });

  test('logout returns the user to a signed-out state', async ({ authedUser, settingsPage, header }) => {
    await settingsPage.goto();
    await settingsPage.logout.click();
    await expect(header.signInLink).toBeVisible();
    await expect(header.settingsLink).toHaveCount(0);
  });
});
