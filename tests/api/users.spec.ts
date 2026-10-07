import { expect, test } from '../../fixtures/api';
import { newUser } from '../../fixtures';

test.describe('Users & authentication API', () => {
  test('POST /users registers a user and returns a token', { tag: '@smoke' }, async ({ api }) => {
    const user = newUser();
    const res = await api.register(user);

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.user).toMatchObject({ username: user.username, email: user.email });
    expect(body.user.token).toBeTruthy();
    expect(body.user).not.toHaveProperty('password');
  });

  test('POST /users with blank fields returns 422', async ({ api }) => {
    const res = await api.post('users', { user: { username: '', email: '', password: '' } }, false);
    expect(res.status()).toBe(422);
  });

  test('POST /users/login with valid credentials returns the user', { tag: '@smoke' }, async ({ api }) => {
    const user = newUser();
    await api.register(user);

    const res = await api.login(user.email, user.password);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.user).toMatchObject({ username: user.username, email: user.email });
    expect(body.user.token).toBeTruthy();
  });

  test('POST /users/login with a wrong password returns 401', async ({ api }) => {
    const user = newUser();
    await api.register(user);

    const res = await api.post('users/login', { user: { email: user.email, password: 'wrong-password' } }, false);
    expect(res.status()).toBe(401);
  });

  test('GET /user without a token returns 401', async ({ api }) => {
    const res = await api.get('user', false);
    expect(res.status()).toBe(401);
  });

  test('GET /user returns the current user', async ({ authedApi, apiUser }) => {
    const res = await authedApi.get('user');
    expect(res.status()).toBe(200);
    expect((await res.json()).user).toMatchObject({ username: apiUser.username, email: apiUser.email });
  });

  test('PUT /user updates the bio', async ({ authedApi, apiUser }) => {
    const res = await authedApi.put('user', { user: { bio: 'API bio' } });
    expect(res.status()).toBe(200);
    expect((await res.json()).user).toMatchObject({ username: apiUser.username, bio: 'API bio' });

    const current = await authedApi.get('user');
    expect((await current.json()).user.bio).toBe('API bio');
  });
});
