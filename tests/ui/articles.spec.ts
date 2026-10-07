import { expect, test, uniqueSuffix } from '../../fixtures';

function articleData() {
  const id = uniqueSuffix();
  return {
    title: `PW Article ${id}`,
    description: `Description ${id}`,
    body: 'Hello **bold** world',
    tags: ['playwright', `tag${id}`],
  };
}

test.describe('Articles', () => {
  test('anonymous users are redirected away from the editor', async ({ page }) => {
    await page.goto('/editor');
    await expect(page).not.toHaveURL(/\/editor/);
  });

  test('global feed lists seeded articles and popular tags', { tag: '@smoke' }, async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.articlePreviews.first()).toBeVisible();
    await expect(homePage.tagLink('javascript')).toBeVisible();
  });

  test('user can publish an article', { tag: '@smoke' }, async ({ page, authedUser, editorPage, articlePage }) => {
    const article = articleData();
    await editorPage.goto();
    await editorPage.publishArticle(article);

    await expect(page).toHaveURL(/\/article\/pw-article-/);
    await expect(articlePage.heading).toHaveText(article.title);
    await expect(articlePage.content.locator('strong')).toHaveText('bold');
    await expect(articlePage.tags).toHaveText(article.tags);
    await expect(articlePage.editLink).toBeVisible();
    await expect(articlePage.deleteButton).toBeVisible();
  });

  test('publishing without required fields keeps the user on the editor', async ({ page, authedUser, editorPage }) => {
    await editorPage.goto();
    await editorPage.publish.click();
    await expect(page).toHaveURL(/\/editor$/);
  });

  test('published article appears in the global feed and author profile', async ({
    page,
    authedUser,
    editorPage,
    homePage,
    profilePage,
  }) => {
    const article = articleData();
    await editorPage.goto();
    await editorPage.publishArticle(article);
    await expect(page).toHaveURL(/\/article\//);

    await homePage.goto();
    await expect(homePage.articleByTitle(article.title)).toBeVisible();

    await profilePage.goto(authedUser.username);
    await expect(profilePage.articlePreviews.filter({ hasText: article.title })).toBeVisible();
  });

  test('user can edit an article', async ({ page, authedUser, editorPage, articlePage }) => {
    const article = articleData();
    await editorPage.goto();
    await editorPage.publishArticle({ ...article, tags: [] });
    await articlePage.editLink.click();

    await expect(editorPage.title).toHaveValue(article.title);
    const newBody = 'Updated body text';
    await editorPage.body.fill(newBody);
    await editorPage.publish.click();

    await expect(page).toHaveURL(/\/article\//);
    await expect(articlePage.content).toContainText(newBody);
  });

  test('user can delete an article', async ({ page, authedUser, editorPage, articlePage, homePage }) => {
    const article = articleData();
    await editorPage.goto();
    await editorPage.publishArticle(article);
    await articlePage.deleteButton.click();

    await expect(page).toHaveURL('/');
    await homePage.goto();
    await expect(homePage.articleByTitle(article.title)).toHaveCount(0);
  });

  test('user can favorite and unfavorite an article', async ({ authedUser, homePage, profilePage }) => {
    await homePage.goto();
    const preview = homePage.articlePreviews.first();
    const favorite = preview.getByRole('button');
    const before = Number((await favorite.innerText()).trim());

    await favorite.click();
    await expect(favorite).toContainText(String(before + 1));

    await favorite.click();
    await expect(favorite).toContainText(String(before));
  });

  test('filtering by tag shows only the tag feed', async ({ page, homePage }) => {
    await homePage.goto();
    await homePage.tagLink('javascript').click();
    await expect(page).toHaveURL(/\/tag\/javascript/);
    await expect(homePage.articlePreviews.first()).toBeVisible();
    await expect(homePage.articlePreviews.first().locator('.tag-list')).toContainText('javascript');
  });

  test('opening an article from the feed shows its details', async ({ page, homePage, articlePage }) => {
    await homePage.goto();
    await homePage.articleByTitle('How to Learn JavaScript Efficiently').getByRole('heading').click();
    await expect(page).toHaveURL(/\/article\/how-to-learn-javascript-efficiently/);
    await expect(articlePage.heading).toHaveText('How to Learn JavaScript Efficiently');
  });
});
