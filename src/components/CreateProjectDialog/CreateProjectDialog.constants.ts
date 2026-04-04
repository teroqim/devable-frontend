export const TEMPLATES = [
  { value: 'nextjs-ts', label: 'Next.js + TypeScript', description: 'Modern React web app with hot reload' },
  { value: 'bun-elysia-api', label: 'Elysia API', description: 'Fast TypeScript API with Prisma + PostgreSQL' },
  { value: 'fullstack', label: 'Full-stack', description: 'Next.js frontend + Elysia backend + PostgreSQL' },
] as const;

export const THEMES = [
  { value: 'clean', label: 'Clean', preview: '/theme-previews/clean.svg' },
  { value: 'bold', label: 'Bold', preview: '/theme-previews/bold.svg' },
  { value: 'soft', label: 'Soft', preview: '/theme-previews/soft.svg' },
] as const;

/** Templates that do not support design themes (no frontend) */
export const TEMPLATES_WITHOUT_THEMES = new Set(['bun-elysia-api']);
