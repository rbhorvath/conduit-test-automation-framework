import { validateAgainstSpec } from '../../fixtures/contract';
import { expect, test } from '../../fixtures/api';

// Responses are validated against specs/openapi.yml (copied from the RealWorld repo).
test.describe('API contract (OpenAPI)', () => {
  test('user endpoints match the spec', async ({ api, apiUser }) => {
    const registered = await api.register({
      username: `${apiUser.username}x`,
      email: `x${apiUser.email}`,
      password: 'Passw0rd!123',
    });
    expect(registered.status()).toBe(201);
    expect(await validateAgainstSpec(registered, 'post', '/users')).toEqual({ valid: true, errors: '' });

    const login = await api.login(`x${apiUser.email}`, 'Passw0rd!123');
    expect(await validateAgainstSpec(login, 'post', '/users/login')).toEqual({ valid: true, errors: '' });

    const current = await api.get('user');
    expect(await validateAgainstSpec(current, 'get', '/user')).toEqual({ valid: true, errors: '' });

    const updated = await api.put('user', { user: { bio: 'contract bio' } });
    expect(await validateAgainstSpec(updated, 'put', '/user')).toEqual({ valid: true, errors: '' });
  });

  test('article endpoints match the spec', async ({ authedApi, newArticle }) => {
    const created = await authedApi.createArticle(newArticle());
    expect(await validateAgainstSpec(created, 'post', '/articles')).toEqual({ valid: true, errors: '' });
    const { slug } = (await created.json()).article;

    const list = await authedApi.get('articles?limit=3');
    expect(await validateAgainstSpec(list, 'get', '/articles')).toEqual({ valid: true, errors: '' });

    const feed = await authedApi.get('articles/feed');
    expect(await validateAgainstSpec(feed, 'get', '/articles/feed')).toEqual({ valid: true, errors: '' });

    const single = await authedApi.get(`articles/${slug}`);
    expect(await validateAgainstSpec(single, 'get', '/articles/{slug}')).toEqual({ valid: true, errors: '' });

    const updated = await authedApi.put(`articles/${slug}`, { article: { body: 'changed' } });
    expect(await validateAgainstSpec(updated, 'put', '/articles/{slug}')).toEqual({ valid: true, errors: '' });

    const favorited = await authedApi.post(`articles/${slug}/favorite`);
    expect(await validateAgainstSpec(favorited, 'post', '/articles/{slug}/favorite')).toEqual({
      valid: true,
      errors: '',
    });

    const unfavorited = await authedApi.delete(`articles/${slug}/favorite`);
    expect(await validateAgainstSpec(unfavorited, 'delete', '/articles/{slug}/favorite')).toEqual({
      valid: true,
      errors: '',
    });

    const deleted = await authedApi.delete(`articles/${slug}`);
    expect(deleted.status()).toBe(204);
  });

  test('comment, profile and tag endpoints match the spec', async ({ authedApi, newArticle }) => {
    const { article } = await (await authedApi.createArticle(newArticle())).json();
    const base = `articles/${article.slug}/comments`;

    const created = await authedApi.post(base, { comment: { body: 'contract comment' } });
    expect(await validateAgainstSpec(created, 'post', '/articles/{slug}/comments')).toEqual({
      valid: true,
      errors: '',
    });

    const list = await authedApi.get(base);
    expect(await validateAgainstSpec(list, 'get', '/articles/{slug}/comments')).toEqual({ valid: true, errors: '' });

    const profile = await authedApi.get('profiles/johndoe');
    expect(await validateAgainstSpec(profile, 'get', '/profiles/{username}')).toEqual({ valid: true, errors: '' });

    const follow = await authedApi.post('profiles/johndoe/follow');
    expect(await validateAgainstSpec(follow, 'post', '/profiles/{username}/follow')).toEqual({
      valid: true,
      errors: '',
    });

    const unfollow = await authedApi.delete('profiles/johndoe/follow');
    expect(await validateAgainstSpec(unfollow, 'delete', '/profiles/{username}/follow')).toEqual({
      valid: true,
      errors: '',
    });

    const tags = await authedApi.get('tags');
    expect(await validateAgainstSpec(tags, 'get', '/tags')).toEqual({ valid: true, errors: '' });
  });

  test('the validator rejects a response that does not match the schema', async ({ authedApi }) => {
    const tags = await authedApi.get('tags');
    const result = await validateAgainstSpec(tags, 'get', '/articles');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('articles');
  });

  test('error responses match the spec', async ({ api, authedApi }) => {
    const unauthorized = await api.get('user', false);
    expect(await validateAgainstSpec(unauthorized, 'get', '/user')).toEqual({ valid: true, errors: '' });

    const notFound = await authedApi.get('articles/no-such-article');
    expect(await validateAgainstSpec(notFound, 'get', '/articles/{slug}')).toEqual({ valid: true, errors: '' });

    const invalid = await authedApi.post('articles', { article: { title: 'only title' } });
    expect(await validateAgainstSpec(invalid, 'post', '/articles')).toEqual({ valid: true, errors: '' });
  });
});
