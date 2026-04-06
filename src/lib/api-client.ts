import type {
  ApiAnnouncement,
  ApiChatMessage,
  ApiChatSession,
  ApiImageAttachment,
  ApiProject,
  ApiResult,
  ChatStreamEvent,
  CreateProjectBody,
  UpdateProjectBody,
} from '@/types/api';

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

// Chat API - calls backend directly (not via Next.js proxy)
// Uses result objects instead of throwing errors.

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

interface BackendRequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  getToken: () => Promise<string | null>;
}

async function backendRequestAsync<T = unknown>(
  path: string,
  options: BackendRequestOptions & { stream?: false },
): Promise<ApiResult<T>>;
async function backendRequestAsync(
  path: string,
  options: BackendRequestOptions & { stream: true },
): Promise<ApiResult<ReadableStreamDefaultReader<Uint8Array>>>;
async function backendRequestAsync<T = unknown>(
  path: string,
  options: BackendRequestOptions & { stream?: boolean },
): Promise<ApiResult<T | ReadableStreamDefaultReader<Uint8Array>>> {
  const { method = 'GET', body, getToken, stream = false } = options;
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Network error: ${message}`, statusCode: 0 };
  }

  if (!response.ok) {
    return { success: false, error: response.statusText, statusCode: response.status };
  }

  if (stream) {
    return { success: true, data: response.body!.getReader(), statusCode: response.status };
  }

  if (response.status === 204) {
    return { success: true, data: undefined as T, statusCode: 204 };
  }

  let data: T;
  try {
    data = await response.json() as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to parse response: ${message}`, statusCode: response.status };
  }

  return { success: true, data, statusCode: response.status };
}

export async function fetchChatSessionsAsync(
  getToken: () => Promise<string | null>,
  projectId: string,
): Promise<ApiResult<ApiChatSession[]>> {
  return backendRequestAsync<ApiChatSession[]>(
    `/v1/projects/${projectId}/chat/sessions`,
    { getToken },
  );
}

export async function createChatSessionAsync(
  getToken: () => Promise<string | null>,
  projectId: string,
  name?: string,
): Promise<ApiResult<ApiChatSession>> {
  return backendRequestAsync<ApiChatSession>(
    `/v1/projects/${projectId}/chat/sessions`,
    { method: 'POST', body: { name }, getToken },
  );
}

export async function deleteChatSessionAsync(
  getToken: () => Promise<string | null>,
  projectId: string,
  sessionId: string,
): Promise<ApiResult<void>> {
  return backendRequestAsync<void>(
    `/v1/projects/${projectId}/chat/sessions/${sessionId}`,
    { method: 'DELETE', getToken },
  );
}

export async function fetchChatMessagesAsync(
  getToken: () => Promise<string | null>,
  projectId: string,
  sessionId: string,
): Promise<ApiResult<ApiChatMessage[]>> {
  return backendRequestAsync<ApiChatMessage[]>(
    `/v1/projects/${projectId}/chat/sessions/${sessionId}/messages`,
    { getToken },
  );
}

export async function sendChatMessageAsync(
  getToken: () => Promise<string | null>,
  projectId: string,
  sessionId: string,
  message: string,
  images: ApiImageAttachment[] | undefined,
  onEvent: (event: ChatStreamEvent) => void,
): Promise<ApiResult<void>> {
  const result = await backendRequestAsync(
    `/v1/projects/${projectId}/chat/sessions/${sessionId}/messages`,
    { method: 'POST', body: { message, images }, getToken, stream: true },
  );

  if (!result.success) {
    return result;
  }

  const reader = result.data;
  const decoder = new TextDecoder();
  let buffer = '';

  let readResult = await reader.read();
  while (!readResult.done) {
    buffer += decoder.decode(readResult.value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop()!;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('data: ')) {
        try {
          const event = JSON.parse(line.slice(6)) as ChatStreamEvent;
          onEvent(event);
        } catch (error) {
          console.warn('Failed to parse SSE event:', line, error);
        }
      }
    }

    readResult = await reader.read();
  }

  return { success: true, data: undefined, statusCode: result.statusCode };
}

export async function cancelChatMessageAsync(
  getToken: () => Promise<string | null>,
  projectId: string,
  sessionId: string,
): Promise<ApiResult<void>> {
  return backendRequestAsync<void>(
    `/v1/projects/${projectId}/chat/sessions/${sessionId}/cancel`,
    { method: 'POST', getToken },
  );
}

export { ApiError };
