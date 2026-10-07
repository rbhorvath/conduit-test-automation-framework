import { expect, test, uniqueSuffix } from '../../fixtures';

test.describe('Comments', () => {
  test(
    'user can post and delete a comment',
    { tag: '@smoke' },
    async ({ page, authedUser, editorPage, articlePage }) => {
      const id = uniqueSuffix();
      await editorPage.goto();
      await editorPage.publishArticle({ title: `PW Comments ${id}`, description: 'd', body: 'b' });
      await expect(page).toHaveURL(/\/article\//);

      const text = `Nice article ${id}`;
      await articlePage.postComment(text);
      await expect(articlePage.commentByText(text)).toBeVisible();
      await expect(articlePage.commentByText(text)).toContainText(authedUser.username);
      await expect(articlePage.commentInput).toHaveValue('');

      await articlePage.deleteComment(text);
      await expect(articlePage.commentByText(text)).toHaveCount(0);
    },
  );

  test('anonymous users cannot see the comment form', async ({ articlePage }) => {
    await articlePage.goto('how-to-learn-javascript-efficiently');
    await expect(articlePage.heading).toHaveText('How to Learn JavaScript Efficiently');
    await expect(articlePage.commentInput).toHaveCount(0);
  });
});
