import { expect, newArticleData, test } from '../../fixtures';

test.describe('Pagination', () => {
  test('global feed paginates once there are more articles than fit on a page', async ({
    authedUser,
    userApi,
    homePage,
  }) => {
    // The 4 seeded articles plus these 12 exceed the 10-per-page limit.
    const created = await Promise.all(
      Array.from({ length: 12 }, () => userApi.createArticle(newArticleData('PW Pagination'))),
    );
    created.forEach((res) => expect(res.status()).toBe(201));

    await homePage.goto();
    await expect(homePage.articlePreviews).toHaveCount(10);
    await expect(homePage.pagination).toHaveCount(2);
    await expect(homePage.pagination.first()).toHaveClass(/active/);

    await homePage.pageButton(2).click();
    await expect(homePage.pagination.nth(1)).toHaveClass(/active/);
    await expect(homePage.articlePreviews.first()).toBeVisible();
    expect(await homePage.articlePreviews.count()).toBeLessThanOrEqual(10);
    expect(await homePage.articlePreviews.count()).toBeGreaterThan(0);
  });

  test('a single page of articles shows one page button', async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.articlePreviews.first()).toBeVisible();
    await expect(homePage.pagination).toHaveCount(1);
  });
});
