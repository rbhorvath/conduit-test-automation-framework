export interface User {
  username: string;
  email: string;
  password: string;
}

export function uniqueSuffix(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function newUser(): User {
  const id = uniqueSuffix();
  return { username: `pw${id}`, email: `pw${id}@example.com`, password: 'Passw0rd!123' };
}

export function newArticleData(prefix = 'PW Article') {
  const id = uniqueSuffix();
  return {
    title: `${prefix} ${id}`,
    description: `Description ${id}`,
    body: 'Hello **bold** world',
    tagList: ['playwright', `tag${id}`],
  };
}
