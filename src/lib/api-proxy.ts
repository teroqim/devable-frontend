import { NextResponse } from 'next/server';
import { validateBearerToken } from '@/lib/auth';
import { env } from '@/lib/env';

/** Proxy a request to the backend API, forwarding auth and body. */
export async function proxyToBackend(
  request: Request,
  backendPath: string,
  options: { method?: string } = {},
): Promise<NextResponse> {
  const authResult = validateBearerToken(request);
  if (authResult.error) {
    return authResult.error;
  }

  const method = options.method ?? request.method;
  const headers: Record<string, string> = {
    Authorization: authResult.authHeader,
    'Content-Type': 'application/json',
  };

  const hasBody = method === 'POST' || method === 'PUT' || method === 'PATCH';
  let body: string | undefined;
  if (hasBody) {
    try {
      body = await request.text();
    } catch (error) {
      console.error('Failed to read request body:', error);
      return NextResponse.json({ error: 'Failed to read request body' }, { status: 400 });
    }
  }

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${backendPath}`, {
    method,
    headers,
    body,
  });

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
