import { expect, test } from '../../fixtures/api';

test.describe('Articles API', () => {
  test('GET /articles returns the seeded list with pagination fields', { tag: '@smoke' }, async ({ authedApi }) => {
    const res = await authedApi.get('articles?limit=2');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.articles).toHaveLength(2);
    expect(body.articlesCount).toBeGreaterThanOrEqual(2);
    expect(body.articles[0]).toMatchObject({
      slug: expect.any(String),
      title: expect.any(String),
      tagList: expect.any(Array),
      favoritesCount: expect.any(Number),
      author: { username: expect.any(String) },
    });
  });

  test('GET /articles supports offset', async ({ authedApi }) => {
    const first = (await (await authedApi.get('articles?limit=1&offset=0')).json()).articles[0];
    const second = (await (await authedApi.get('articles?limit=1&offset=1')).json()).articles[0];
    expect(second.slug).not.toBe(first.slug);
  });

  test('GET /articles filters by tag and author', async ({ authedApi }) => {
    const byTag = (await (await authedApi.get('articles?tag=react')).json()).articles;
    expect(byTag.length).toBeGreaterThan(0);
    for (const a of byTag) expect(a.tagList).toContain('react');

    const byAuthor = (await (await authedApi.get('articles?author=johndoe')).json()).articles;
    expect(byAuthor.length).toBeGreaterThan(0);
    for (const a of byAuthor) expect(a.author.username).toBe('johndoe');
  });

  test('GET /tags returns the popular tags', async ({ authedApi }) => {
    const res = await authedApi.get('tags');
    expect(res.status()).toBe(200);
    expect((await res.json()).tags).toEqual(expect.arrayContaining(['javascript', 'react']));
  });

  test('POST /articles creates an article', { tag: '@smoke' }, async ({ authedApi, apiUser, newArticle }) => {
    const input = newArticle();
    const res = await authedApi.createArticle(input);

    expect(res.status()).toBe(201);
    const { article } = await res.json();
    expect(article).toMatchObject({
      title: input.title,
      description: input.description,
      body: input.body,
      favorited: false,
      favoritesCount: 0,
      author: { username: apiUser.username },
    });
    expect(article.slug).toMatch(/^api-article-/);
    expect([...article.tagList].sort()).toEqual([...input.tagList!].sort());
  });

  test('POST /articles without a token returns 401', async ({ api, newArticle }) => {
    const res = await api.post('articles', { article: newArticle() }, false);
    expect(res.status()).toBe(401);
  });

  test('POST /articles with missing fields returns 422', async ({ authedApi }) => {
    const res = await authedApi.post('articles', { article: { title: 'Only a title' } });
    expect(res.status()).toBe(422);
    expect((await res.json()).errors).toHaveProperty('body');
  });

  test('GET /articles/:slug returns the article', async ({ authedApi, newArticle }) => {
    const { article } = await (await authedApi.createArticle(newArticle())).json();

    const res = await authedApi.get(`articles/${article.slug}`);
    expect(res.status()).toBe(200);
    expect((await res.json()).article.title).toBe(article.title);
  });

  test('GET /articles/:slug for an unknown slug returns 404', async ({ authedApi }) => {
    const res = await authedApi.get('articles/this-slug-does-not-exist');
    expect(res.status()).toBe(404);
  });

  test('PUT /articles/:slug updates the article', async ({ authedApi, newArticle }) => {
    const { article } = await (await authedApi.createArticle(newArticle())).json();

    const res = await authedApi.put(`articles/${article.slug}`, { article: { body: 'Updated body' } });
    expect(res.status()).toBe(200);
    const updated = (await res.json()).article;
    expect(updated.body).toBe('Updated body');
    expect(updated.title).toBe(article.title);
  });

  test('PUT /articles/:slug without a token returns 401', async ({ authedApi, newArticle }) => {
    const { article } = await (await authedApi.createArticle(newArticle())).json();
    const res = await authedApi.put(`articles/${article.slug}`, { article: { body: 'nope' } }, false);
    expect(res.status()).toBe(401);
  });

  test('DELETE /articles/:slug removes the article', async ({ authedApi, newArticle }) => {
    const { article } = await (await authedApi.createArticle(newArticle())).json();

    const res = await authedApi.delete(`articles/${article.slug}`);
    expect(res.status()).toBe(204);
    expect((await authedApi.get(`articles/${article.slug}`)).status()).toBe(404);
  });

  test('DELETE /articles/:slug without a token returns 401', async ({ authedApi, newArticle }) => {
    const { article } = await (await authedApi.createArticle(newArticle())).json();
    const res = await authedApi.delete(`articles/${article.slug}`, false);
    expect(res.status()).toBe(401);
  });

  test('favorite and unfavorite an article', async ({ authedApi, newArticle }) => {
    const { article } = await (await authedApi.createArticle(newArticle())).json();

    const fav = await authedApi.post(`articles/${article.slug}/favorite`);
    expect(fav.status()).toBe(200);
    expect((await fav.json()).article).toMatchObject({ favorited: true, favoritesCount: 1 });

    const unfav = await authedApi.delete(`articles/${article.slug}/favorite`);
    expect(unfav.status()).toBe(200);
    expect((await unfav.json()).article).toMatchObject({ favorited: false, favoritesCount: 0 });
  });

  test('GET /articles?favorited= lists favorited articles', async ({ authedApi, apiUser, newArticle }) => {
    const { article } = await (await authedApi.createArticle(newArticle())).json();
    await authedApi.post(`articles/${article.slug}/favorite`);

    const res = await authedApi.get(`articles?favorited=${apiUser.username}`);
    const slugs = (await res.json()).articles.map((a: { slug: string }) => a.slug);
    expect(slugs).toContain(article.slug);
  });
});
