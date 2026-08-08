# Testing Patterns

**Analysis Date:** 2026-08-08

## Project State

Only `apps/server` (NestJS) currently has a testing setup, inherited unchanged from the Nest CLI generator. `apps/web`, `apps/docs`, `apps/admin-panel`, and `packages/ui` have no test framework configured yet.

## Test Framework

**Runner:**
- Jest ^30 with `ts-jest` (`apps/server/package.json`)
- Config: inline `jest` key in `apps/server/package.json` for unit tests; `apps/server/test/jest-e2e.json` for e2e tests

**Assertion Library:**
- Jest's built-in `expect`

**HTTP testing:**
- `supertest` ^7 for e2e HTTP assertions (`apps/server/test/app.e2e-spec.ts`)

**Run Commands:**
```bash
pnpm --filter server test          # unit tests (jest)
pnpm --filter server test:watch    # watch mode
pnpm --filter server test:cov      # coverage
pnpm --filter server test:e2e      # e2e (jest --config ./test/jest-e2e.json)
pnpm --filter server test:debug    # debug with --inspect-brk
```

## Test File Organization

**Unit tests:**
- Co-located with source: `<name>.<type>.spec.ts` next to `<name>.<type>.ts`
- Example: `apps/server/src/app.controller.spec.ts` next to `apps/server/src/app.controller.ts`
- Jest `rootDir` is set to `src`, `testRegex: ".*\\.spec\\.ts$"`

**E2E tests:**
- Separate directory: `apps/server/test/`
- Naming: `<name>.e2e-spec.ts` (e.g. `apps/server/test/app.e2e-spec.ts`)
- Own Jest config: `apps/server/test/jest-e2e.json`

## Test Structure

**Unit test pattern** (`apps/server/src/app.controller.spec.ts`):
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
```
- Uses Nest's `Test.createTestingModule` to build an isolated DI container per test, resolved fresh in `beforeEach`
- Real providers are wired in (no mocking observed yet) — service is used as-is, not stubbed
- Nested `describe` blocks group by method/behavior (`describe('root', ...)`)

**E2E test pattern** (`apps/server/test/app.e2e-spec.ts`):
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
```
- Boots the full `AppModule` per test via `beforeEach`
- Uses `supertest` against `app.getHttpServer()`, chained `.expect(status).expect(body)`
- Test descriptions suffix `(e2e)` to distinguish from unit specs

## Mocking

No mocking framework or explicit mock patterns are established yet — current specs exercise real Nest providers directly. When adding tests with dependencies (e.g. external APIs, databases), use Nest's `overrideProvider()` on `Test.createTestingModule` or Jest's built-in `jest.fn()`/`jest.mock()`.

## Fixtures and Factories

None established yet.

## Coverage

**Requirements:** None enforced (no coverage threshold configured)

**Config:** `apps/server/package.json` jest key: `collectCoverageFrom: ["**/*.(t|j)s"]`, `coverageDirectory: "../coverage"`

**View Coverage:**
```bash
pnpm --filter server test:cov
```

## Test Types

**Unit Tests:**
- Scope: individual controller/service classes via Nest's DI test module, in `apps/server/src`

**Integration Tests:**
- Not distinguished from e2e in this codebase; NestJS "e2e" tests here are effectively HTTP-level integration tests using an in-memory Nest app (no external network/browser)

**E2E Tests (browser):**
- Not used — no Playwright/Cypress configured for `apps/web`, `apps/docs`, or `apps/admin-panel`

## Common Patterns

**Async Testing:**
```typescript
beforeEach(async () => {
  const app: TestingModule = await Test.createTestingModule({ ... }).compile();
  appController = app.get<AppController>(AppController);
});
```
Standard `async/await` inside Jest hooks for Nest module compilation.

**HTTP Assertion Chaining:**
```typescript
return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
```
Return the supertest promise chain directly from the `it()` callback (no explicit `await`/`done`).

## Gaps

- No frontend test setup (`apps/web`, `apps/docs`, `apps/admin-panel`) — no Jest/Vitest/RTL/Playwright configured
- No tests for `packages/ui` component library
- No coverage thresholds enforced anywhere
- No CI pipeline detected that runs `test`/`test:e2e` automatically (check `.github/` if added later)

---

*Testing analysis: 2026-08-08*
