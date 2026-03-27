import { NextResponse } from 'next/server';

export function validateBearerToken(
  request: Request,
):
  | { authHeader: string; error?: never }
  | { error: NextResponse; authHeader?: never } {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Bearer token required' },
        { status: 401 },
      ),
    };
  }

  return { authHeader };
}
