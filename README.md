# Devable Frontend

Web frontend for the Devable platform. Built with Next.js 16, TypeScript, and Clerk authentication.

## Features

- Next.js 16 with App Router
- TypeScript support
- Mobile-first responsive design
- Left sidebar navigation
- Clerk authentication with protected routes
- Plain CSS with modern nesting syntax
- Radix UI primitives

## Getting Started

### Installation

```bash
npm install
```

### Lefthook

Run the following command in the repo to set up git hooks:

```bash
lefthook install
```

### Env

Copy the example env file and fill in the values (or ask another developer for a working `.env`):

```bash
cp .env.example .env
```

You'll need Clerk keys from the Clerk dashboard and the backend API URL.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Run tests

Unit/component tests (Vitest):

```bash
npm run test
```

End-to-end tests (Playwright, requires dev server running):

```bash
npm run test:e2e
```

## Authentication

The application uses [Clerk](https://clerk.com) for authentication with JWT bearer tokens.

### How It Works

- **Public routes**: Landing page (`/`) is public and shows a sign-in CTA
- **Protected routes**: All `/dashboard/*` routes require authentication
- **Proxy**: Route protection is handled by Clerk proxy in `src/proxy.ts` (Next.js 16+)
- **Bearer tokens**: All API routes require and forward JWT bearer tokens to the backend API
- **User interface**: UserButton component in the header for account management and sign-out

If a user tries to access a protected route without being signed in, they are automatically redirected to Clerk's sign-in page.

## Project Structure

```text
src/
├── app/
│   ├── api/                       # API routes (proxy to backend, require bearer tokens)
│   │   └── announcements/route.ts
│   ├── dashboard/                 # Protected routes
│   │   ├── layout.tsx             # Dashboard layout with sidebar
│   │   └── page.tsx               # Dashboard home
│   ├── layout.tsx                 # Root layout with ClerkProvider
│   ├── page.tsx                   # Public landing page
│   └── globals.css                # Theme variables and global styles
├── components/
│   ├── pages/                     # Page components
│   │   ├── DashboardPage/
│   │   └── HomePage/
│   ├── DashboardLayoutWrapper/
│   ├── Header/
│   ├── Navbar/                    # Left sidebar navigation
│   └── ui/                        # Shared UI components
│       └── button/
├── lib/
│   ├── api-client.ts              # Typed API client
│   ├── auth.ts                    # Bearer token validation
│   └── env.ts                     # Environment variables
├── types/api.ts                   # API types
└── proxy.ts                       # Clerk authentication proxy
```

## Styling

The project uses **plain CSS with modern nesting syntax** for all styling:

- **Global styles**: `src/app/globals.css` (includes CSS variables for theming)
- **Component styles**: Each component has its own CSS file in its folder
- **Mobile-first**: All styles are written mobile-first with desktop enhancements
- **CSS Nesting**: Uses native CSS nesting for better organization
- **Class toggling**: Uses `clsx` for conditional classes

Component organization:

```text
src/components/ComponentName/
  ComponentName.tsx
  ComponentName.css
```

**Always use CSS custom properties from `globals.css`** instead of hardcoded color, spacing, font, radius, shadow, or transition values.

Wrap hover styles in `@media (hover: hover)` to prevent sticky hover states on touch devices.

Write base styles for mobile first. Add desktop styles in separate `@media (min-width: 768px)` blocks. Never nest media queries inside selectors.
