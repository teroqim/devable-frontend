# CLAUDE.md

## Project Overview

Devable Frontend - Next.js 16 web app with Clerk authentication. Communicates with devable-backend API through a proxy layer.

## Common Commands

```bash
npm run dev          # Dev server on http://localhost:3000
npm run build        # Production build
npm run type-check   # TypeScript check (tsc --noEmit)
npm run lint         # Lint entire project
npm run test         # Run Vitest unit tests
npm run test:e2e     # Run Playwright e2e tests
```

### Lint specific files (default)

```bash
npx eslint "path/to/file.tsx"
npx eslint --fix "path/to/file.tsx"
```

## Architecture

```text
src/
├── app/
│   ├── api/announcements/route.ts   # Proxy to backend API
│   ├── dashboard/                   # Dashboard layout + page
│   ├── layout.tsx                   # Root layout (ClerkProvider)
│   ├── page.tsx                     # Landing page
│   └── globals.css                  # Theme variables
├── components/
│   ├── pages/                       # Page components
│   ├── DashboardLayoutWrapper/
│   ├── Header/
│   ├── Navbar/
│   └── ui/button/                   # Shared UI components
├── lib/
│   ├── api-client.ts                # Typed API client
│   ├── auth.ts                      # Bearer token validation
│   └── env.ts                       # Environment variables
├── types/api.ts                     # API types
└── proxy.ts                         # Clerk middleware
```

### Path Aliases

`@/*` resolves to `src/*`

### API Proxy Pattern

Frontend uses Next.js API routes as a proxy to the backend:
1. Client calls `/api/announcements` with Clerk bearer token
2. API route validates token via `validateBearerToken()`
3. Forwards request to `NEXT_PUBLIC_API_URL/v1/announcements`

## Testing

- **Vitest + jsdom**: Unit/component tests (`*.test.ts` files alongside source)
- **Playwright**: E2e tests in `e2e/` directory

Always run both test suites when verifying changes:

```bash
npm run test         # Vitest unit/component tests
npm run test:e2e     # Playwright e2e tests (requires dev server running)
```

## Git Workflow

Do not handle git workflows. A human must handle git operations.

## Dos and Don'ts

### Dos

- Default to small, focused components
- Always lint changed files after edits
- Check `.claude/rules/` for code style and CSS rules

### Don'ts

- Don't introduce new dependencies without approval
- Don't read .env file contents
