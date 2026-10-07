import js from '@eslint/js';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules/', 'playwright-report/', 'test-results/', '.playwright-mcp/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { ...playwright.configs['flat/recommended'], files: ['tests/**/*.ts'] },
  {
    files: ['tests/**/*.ts'],
    rules: {
      // Specs request fixtures such as `authedUser` only for their side effects.
      '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
      // Some tests assert on counts of elements after the page settles.
      'playwright/no-conditional-in-test': 'off',
      // Cross-checking the page for injected script side effects needs a brief wait.
      'playwright/no-wait-for-timeout': 'off',
      // False positive: page-object fixtures are named like `homePage`.
      'playwright/prefer-locator': 'off',
    },
  },
  {
    files: ['fixtures/**/*.ts'],
    rules: {
      // Playwright fixtures must destructure their dependencies, even when empty.
      'no-empty-pattern': 'off',
      'playwright/no-conditional-in-test': 'off',
    },
  },
  prettier,
);
