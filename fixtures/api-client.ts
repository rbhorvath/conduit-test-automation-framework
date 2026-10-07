import { APIRequestContext, APIResponse } from '@playwright/test';

export interface ApiUser {
  username: string;
  email: string;
  password: string;
  token: string;
}

export interface ArticleInput {
  title: string;
  description: string;
  body: string;
  tagList?: string[];
}

type Body = Record<string, unknown> | undefined;

/** Thin wrapper over the RealWorld REST API. Paths are relative to `.../api/`. */
export class ApiClient {
  token?: string;

  constructor(readonly request: APIRequestContext) {}

  private headers(auth: boolean): Record<string, string> {
    return auth && this.token ? { Authorization: `Token ${this.token}` } : {};
  }

  private send(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    data?: Body,
    auth = true,
  ): Promise<APIResponse> {
    return this.request[method](path, { data, headers: this.headers(auth) });
  }

  get = (path: string, auth = true) => this.send('get', path, undefined, auth);
  post = (path: string, data?: Body, auth = true) => this.send('post', path, data, auth);
  put = (path: string, data?: Body, auth = true) => this.send('put', path, data, auth);
  delete = (path: string, auth = true) => this.send('delete', path, undefined, auth);

  async register(user: Omit<ApiUser, 'token'>): Promise<APIResponse> {
    const res = await this.post('users', { user }, false);
    if (res.ok()) this.token = (await res.json()).user.token;
    return res;
  }

  async login(email: string, password: string): Promise<APIResponse> {
    const res = await this.post('users/login', { user: { email, password } }, false);
    if (res.ok()) this.token = (await res.json()).user.token;
    return res;
  }

  createArticle(article: ArticleInput): Promise<APIResponse> {
    return this.post('articles', { article });
  }
}
