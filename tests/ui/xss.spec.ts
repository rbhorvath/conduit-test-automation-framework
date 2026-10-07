import { expect, test, uniqueSuffix } from '../../fixtures';

const payloads = [
  { name: 'img onerror', html: '<img src=x onerror="window.__xss = true">' },
  { name: 'script tag', html: '<script>window.__xss = true</script>' },
  { name: 'javascript link', html: '[click](javascript:window.__xss=true)' },
];

test.describe('XSS protection', () => {
  for (const { name, html } of payloads) {
    test(`article body does not execute: ${name}`, async ({ page, authedUser, editorPage, articlePage }) => {
      await editorPage.goto();
      await editorPage.publishArticle({ title: `PW XSS ${uniqueSuffix()}`, description: 'xss', body: html });
      await expect(page).toHaveURL(/\/article\//);
      await expect(articlePage.heading).toBeVisible();

      // Give any injected handler a chance to fire.
      await page.waitForTimeout(500);
      expect(await page.evaluate(() => (window as unknown as { __xss?: boolean }).__xss)).toBeUndefined();
    });
  }

  test('comments are rendered as text, not HTML', async ({ page, authedUser, editorPage, articlePage }) => {
    await editorPage.goto();
    await editorPage.publishArticle({ title: `PW XSS comment ${uniqueSuffix()}`, description: 'xss', body: 'body' });
    await expect(page).toHaveURL(/\/article\//);

    const payload = '<img src=x onerror="window.__xss = true">';
    await articlePage.postComment(payload);
    await expect(articlePage.comments).toHaveCount(1);
    await expect(articlePage.comments.first()).toContainText(payload);

    await page.waitForTimeout(500);
    expect(await page.evaluate(() => (window as unknown as { __xss?: boolean }).__xss)).toBeUndefined();
    await expect(articlePage.comments.first().locator('img[src="x"]')).toHaveCount(0);
  });

  test('article title is escaped in the feed', async ({ page, authedUser, userApi, homePage }) => {
    const title = `<b>bold</b> ${uniqueSuffix()}`;
    const res = await userApi.createArticle({ title, description: 'd', body: 'b' });
    expect(res.status()).toBe(201);

    await homePage.goto();
    const preview = homePage.articlePreviews.filter({ hasText: title });
    await expect(preview).toBeVisible();
    await expect(preview.locator('h1 b')).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { __xss?: boolean }).__xss)).toBeUndefined();
  });
});
