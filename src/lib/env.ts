function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  NEXT_PUBLIC_API_URL: requireEnv('NEXT_PUBLIC_API_URL'),
  NEXT_PUBLIC_BASE_URL: requireEnv('NEXT_PUBLIC_BASE_URL'),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: requireEnv(
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  ),
  CLERK_SECRET_KEY:
    typeof window === 'undefined' ? requireEnv('CLERK_SECRET_KEY') : '',
};
