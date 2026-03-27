import { NextResponse } from 'next/server';
import { validateBearerToken } from '@/lib/auth';
import { env } from '@/lib/env';

export async function GET(request: Request) {
  const authResult = validateBearerToken(request);
  if (authResult.error) {
    return authResult.error;
  }

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/v1/announcements`, {
    headers: {
      Authorization: authResult.authHeader,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  return NextResponse.json(data);
}
