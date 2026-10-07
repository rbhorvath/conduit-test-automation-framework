import { expect, test } from '../../fixtures/api';

test.describe('Profiles API', () => {
  test('GET /profiles/:username returns a profile', async ({ authedApi }) => {
    const res = await authedApi.get('profiles/johndoe');
    expect(res.status()).toBe(200);
    expect((await res.json()).profile).toMatchObject({ username: 'johndoe', following: false });
  });

  test('GET /profiles/:username for an unknown user returns 404', async ({ authedApi }) => {
    const res = await authedApi.get('profiles/nobody-xyz-123');
    expect(res.status()).toBe(404);
  });

  test('follow and unfollow a user', async ({ authedApi }) => {
    const follow = await authedApi.post('profiles/johndoe/follow');
    expect(follow.status()).toBe(200);
    expect((await follow.json()).profile).toMatchObject({ username: 'johndoe', following: true });

    const profile = await authedApi.get('profiles/johndoe');
    expect((await profile.json()).profile.following).toBe(true);

    const unfollow = await authedApi.delete('profiles/johndoe/follow');
    expect(unfollow.status()).toBe(200);
    expect((await unfollow.json()).profile.following).toBe(false);
  });

  test('follow without a token returns 401', async ({ api }) => {
    const res = await api.post('profiles/johndoe/follow', undefined, false);
    expect(res.status()).toBe(401);
  });

  test('GET /articles/feed contains only followed authors', async ({ authedApi }) => {
    const empty = await authedApi.get('articles/feed');
    expect(empty.status()).toBe(200);
    expect((await empty.json()).articles).toHaveLength(0);

    await authedApi.post('profiles/johndoe/follow');
    const feed = (await (await authedApi.get('articles/feed')).json()).articles;
    expect(feed.length).toBeGreaterThan(0);
    for (const a of feed) expect(a.author.username).toBe('johndoe');
  });

  test('GET /articles/feed without a token returns 401', async ({ api }) => {
    const res = await api.get('articles/feed', false);
    expect(res.status()).toBe(401);
  });
});
