import { expect, test } from '../../fixtures';

test.describe('Form validation', () => {
  test('login shows an error for invalid credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('nobody@example.com', 'wrong-password');
    await expect(loginPage.errors).toHaveText(['credentials invalid']);
  });

  test('sign in is disabled until both fields are filled', async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.submit).toBeDisabled();
    await loginPage.email.fill('someone@example.com');
    await expect(loginPage.submit).toBeDisabled();
    await loginPage.password.fill('Passw0rd!123');
    await expect(loginPage.submit).toBeEnabled();
  });

  test('sign up requires all three fields', async ({ registerPage }) => {
    await registerPage.goto();
    await registerPage.username.fill('someone');
    await registerPage.email.fill('someone@example.com');
    await expect(registerPage.submit).toBeDisabled();
    await registerPage.password.fill('Passw0rd!123');
    await expect(registerPage.submit).toBeEnabled();
    await registerPage.username.clear();
    await expect(registerPage.submit).toBeDisabled();
  });

  test('editor shows validation errors when required fields are missing', async ({ page, authedUser, editorPage }) => {
    await editorPage.goto();
    await editorPage.title.fill('Only a title');
    await editorPage.publish.click();

    await expect(page).toHaveURL(/\/editor$/);
    await expect(editorPage.errors.first()).toBeVisible();
    await expect(editorPage.title).toHaveValue('Only a title');
  });

  test('editor tags can be added and removed before publishing', async ({ authedUser, editorPage, page }) => {
    await editorPage.goto();
    await editorPage.tagInput.fill('keepme');
    await editorPage.tagInput.press('Enter');
    await editorPage.tagInput.fill('dropme');
    await editorPage.tagInput.press('Enter');

    const tags = page.locator('.tag-list .tag-default');
    await expect(tags).toHaveCount(2);
    await tags.filter({ hasText: 'dropme' }).locator('i').click();
    await expect(tags).toHaveCount(1);
    await expect(tags).toContainText('keepme');
  });
});
