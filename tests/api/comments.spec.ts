import { expect, test } from '../../fixtures/api';

test.describe('Comments API', () => {
  test('create, list and delete a comment', async ({ authedApi, apiUser, newArticle }) => {
    const { article } = await (await authedApi.createArticle(newArticle())).json();
    const path = `articles/${article.slug}/comments`;

    const created = await authedApi.post(path, { comment: { body: 'Great post' } });
    expect(created.status()).toBe(201);
    const { comment } = await created.json();
    expect(comment).toMatchObject({ body: 'Great post', author: { username: apiUser.username } });

    const list = await authedApi.get(path);
    expect(list.status()).toBe(200);
    expect((await list.json()).comments.map((c: { id: number }) => c.id)).toContain(comment.id);

    expect((await authedApi.delete(`${path}/${comment.id}`)).status()).toBe(204);
    const after = (await (await authedApi.get(path)).json()).comments;
    expect(after.map((c: { id: number }) => c.id)).not.toContain(comment.id);
  });

  test('POST comment with an empty body returns 422', async ({ authedApi, newArticle }) => {
    const { article } = await (await authedApi.createArticle(newArticle())).json();
    const res = await authedApi.post(`articles/${article.slug}/comments`, { comment: { body: '' } });
    expect(res.status()).toBe(422);
  });

  test('POST comment without a token returns 401', async ({ authedApi, newArticle }) => {
    const { article } = await (await authedApi.createArticle(newArticle())).json();
    const res = await authedApi.post(`articles/${article.slug}/comments`, { comment: { body: 'anon' } }, false);
    expect(res.status()).toBe(401);
  });

  test('DELETE an already deleted comment returns 404', async ({ authedApi, newArticle }) => {
    const { article } = await (await authedApi.createArticle(newArticle())).json();
    const path = `articles/${article.slug}/comments`;
    const { comment } = await (await authedApi.post(path, { comment: { body: 'temp' } })).json();

    await authedApi.delete(`${path}/${comment.id}`);
    expect((await authedApi.delete(`${path}/${comment.id}`)).status()).toBe(404);
  });

  test('comments on an unknown article return 404', async ({ authedApi }) => {
    const res = await authedApi.get('articles/no-such-article/comments');
    expect(res.status()).toBe(404);
  });
});
