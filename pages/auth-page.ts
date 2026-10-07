import { Locator, Page } from '@playwright/test';

export class RegisterPage {
  readonly username: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly errors: Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByRole('textbox', { name: 'Username' });
    this.email = page.getByRole('textbox', { name: 'Email' });
    this.password = page.getByRole('textbox', { name: 'Password' });
    this.submit = page.getByRole('button', { name: 'Sign up' });
    this.errors = page.locator('.error-messages li');
  }

  async goto() {
    await this.page.goto('/register');
  }

  async register(username: string, email: string, password: string) {
    await this.username.fill(username);
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}

export class LoginPage {
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly errors: Locator;

  constructor(private readonly page: Page) {
    this.email = page.getByRole('textbox', { name: 'Email' });
    this.password = page.getByRole('textbox', { name: 'Password' });
    this.submit = page.getByRole('button', { name: 'Sign in' });
    this.errors = page.locator('.error-messages li');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
