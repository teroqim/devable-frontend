import type { ApiAnnouncement } from '@/types/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T = unknown>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    getToken?: () => Promise<string | null>;
  } = {},
): Promise<T> {
  const { method = 'GET', body, getToken } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (getToken) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new ApiError(
      `API request failed: ${response.statusText}`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

export async function fetchAnnouncements(
  getToken: () => Promise<string | null>,
): Promise<ApiAnnouncement[]> {
  return apiRequest<ApiAnnouncement[]>('/api/announcements', { getToken });
}

export { ApiError };
