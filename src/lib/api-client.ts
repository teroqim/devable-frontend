import type { ApiAnnouncement, ApiProject, CreateProjectBody, UpdateProjectBody } from '@/types/api';

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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function fetchAnnouncements(
  getToken: () => Promise<string | null>,
): Promise<ApiAnnouncement[]> {
  return apiRequest<ApiAnnouncement[]>('/api/announcements', { getToken });
}

export async function fetchProjects(
  getToken: () => Promise<string | null>,
): Promise<ApiProject[]> {
  return apiRequest<ApiProject[]>('/api/projects', { getToken });
}

export async function fetchProject(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<ApiProject> {
  return apiRequest<ApiProject>(`/api/projects/${id}`, { getToken });
}

export async function createProject(
  body: CreateProjectBody,
  getToken: () => Promise<string | null>,
): Promise<ApiProject> {
  return apiRequest<ApiProject>('/api/projects', { method: 'POST', body, getToken });
}

export async function updateProject(
  id: string,
  body: UpdateProjectBody,
  getToken: () => Promise<string | null>,
): Promise<ApiProject> {
  return apiRequest<ApiProject>(`/api/projects/${id}`, { method: 'PUT', body, getToken });
}

export async function deleteProject(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<void> {
  await apiRequest(`/api/projects/${id}`, { method: 'DELETE', getToken });
}

export async function startProject(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<void> {
  await apiRequest(`/api/projects/${id}/start`, { method: 'POST', getToken });
}

export async function stopProject(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<void> {
  await apiRequest(`/api/projects/${id}/stop`, { method: 'POST', getToken });
}

export async function restartProject(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<void> {
  await apiRequest(`/api/projects/${id}/restart`, { method: 'POST', getToken });
}

export { ApiError };
