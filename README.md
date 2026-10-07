# Conduit Test Automation Framework

[![Tests](https://github.com/rbhorvath/conduit-test-automation-framework/actions/workflows/tests.yml/badge.svg)](https://github.com/rbhorvath/conduit-test-automation-framework/actions/workflows/tests.yml)

[Playwright](https://playwright.dev) UI and API tests for the [RealWorld](https://github.com/realworld-apps/realworld) (Conduit) demo app.

| Target   | Default URL                     |
| -------- | ------------------------------- |
| Frontend | https://demo.realworld.show     |
| API      | https://api.realworld.show/api/ |

## Setup

Requires Node 20.12+.

```bash
npm install
npx playwright install        # chromium, firefox and webkit
cp .env.example .env          # optional: override URLs / workers
```

## Running tests

| Command                      | What it runs                                              |
| ---------------------------- | --------------------------------------------------------- |
| `npm test`                   | UI (Chromium) and API tests                               |
| `npm run test:ui`            | UI tests in desktop Chromium                              |
| `npm run test:api`           | API tests, including the OpenAPI contract checks          |
| `npm run test:smoke`         | Only tests tagged `@smoke`, UI and API                    |
| `npm run test:cross-browser` | UI tests in Firefox, WebKit and a Pixel 7 mobile viewport |
| `npm run test:all`           | Every project                                             |
| `npm run test:headed`        | UI tests with a visible browser                           |
| `npm run report`             | Open the last HTML report                                 |

Run a single file or test with the usual Playwright options, e.g. `npx playwright test --project=ui tests/ui/auth.spec.ts -g "log out"`.

### Configuration

| Variable   | Default                           | Purpose                                  |
| ---------- | --------------------------------- | ---------------------------------------- |
| `BASE_URL` | `https://demo.realworld.show`     | Frontend under test                      |
| `API_URL`  | `https://api.realworld.show/api/` | API under test (keep the trailing slash) |
| `WORKERS`  | `1`                               | Parallel workers                         |

Pointing `BASE_URL` and `API_URL` at your own RealWorld implementation also works, but see the notes below: some tests assume demo-backend behaviour.

## Code quality

```bash
npm run typecheck
npm run lint
npm run format:check   # or: npm run format
```

## Project layout

```
fixtures/   Playwright fixtures, API client, test data, OpenAPI contract validator
pages/      Page objects (header, auth, home, editor, article, settings, profile)
specs/      openapi.yml, copied from realworld-apps/realworld (specs/api)
tests/ui/   Browser tests
tests/api/  REST API tests
```

- `authedUser` (UI) registers a unique user through the API and injects the token into `localStorage`, so tests start signed in without using the sign-up form. Use `registerPage` when the sign-up flow itself is under test.
- `authedApi` (API) is a client authenticated as a freshly registered user. `userApi` is the same for UI tests that need to seed data.
- `fixtures/contract.ts` validates API responses against `specs/openapi.yml`.

## Demo backend behaviour

The shared demo backend differs from the spec in ways that shape these tests:

- **Data is isolated per client.** Parallel workers interfere with each other, hence `WORKERS=1` by default.
- **One user per session.** Users registered from the same client share a token, so tests that need two distinct users (for example "user B cannot edit user A's article") are not possible.
- **Anonymous reads of session data return 404.** API tests always send the token.
- **Logging in issues a new token**, and `ApiClient` switches to it.
- **No uniqueness or strength validation.** Duplicate usernames/emails, malformed emails and short passwords are accepted, although the spec documents `409` for conflicts.
- **Sessions expire after a few minutes.**

## Continuous integration

[.github/workflows/tests.yml](.github/workflows/tests.yml) runs on pushes to `main`, pull requests, manual dispatch and daily (06:00 UTC):

- `quality`: typecheck, lint and format check.
- `api` and `ui`: the API and Chromium UI suites, after `quality` passes.
- `cross-browser`: Firefox, WebKit and the mobile viewport, only on the daily scheduled run or manual dispatch.

Each job uploads its HTML report as an artifact (14 days). CI retries failed tests twice. Each job runs on its own runner, so the per-client isolation of the demo backend keeps them apart.

## Tagging

Tests tagged `@smoke` form a fast sanity subset. Add `{ tag: '@smoke' }` as the second argument of `test(...)`.
