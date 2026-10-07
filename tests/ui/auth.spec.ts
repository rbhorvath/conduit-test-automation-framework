import { expect, test } from '../../fixtures';

test.describe('Authentication', () => {
  test('anonymous visitor sees sign in / sign up links', async ({ homePage, header }) => {
    await homePage.goto();
    await expect(header.signInLink).toBeVisible();
    await expect(header.signUpLink).toBeVisible();
    await expect(header.newArticleLink).toHaveCount(0);
  });

  test('sign up button is disabled until the form is filled', async ({ registerPage }) => {
    await registerPage.goto();
    await expect(registerPage.submit).toBeDisabled();
    await registerPage.username.fill('someone');
    await registerPage.email.fill('someone@example.com');
    await registerPage.password.fill('Passw0rd!123');
    await expect(registerPage.submit).toBeEnabled();
  });

  test(
    'user can register and lands on home signed in',
    { tag: '@smoke' },
    async ({ page, user, registerPage, header }) => {
      await registerPage.goto();
      await registerPage.register(user.username, user.email, user.password);

      await expect(page).toHaveURL('/');
      await expect(header.profileLink(user.username)).toBeVisible();
      await expect(header.newArticleLink).toBeVisible();
      await expect(header.signInLink).toHaveCount(0);
    },
  );

  test(
    'user can log out and log back in',
    { tag: '@smoke' },
    async ({ page, authedUser, settingsPage, loginPage, header }) => {
      await settingsPage.goto();
      await settingsPage.logout.click();
      await expect(header.signInLink).toBeVisible();

      await loginPage.goto();
      await loginPage.login(authedUser.email, authedUser.password);
      await expect(page).toHaveURL('/');
      await expect(header.profileLink(authedUser.username)).toBeVisible();
    },
  );

  test('login with wrong credentials shows an error', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login('nobody-here@example.com', 'wrong-password');
    await expect(loginPage.errors.first()).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
