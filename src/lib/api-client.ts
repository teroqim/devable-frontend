import type {
  ApiAnnouncement,
  ApiChatMessage,
  ApiChatSession,
  ApiImageAttachment,
  ApiProject,
  ApiResult,
  ChatStreamEvent,
  CreateProjectBody,
  FileContentResponse,
  FileCreateBody,
  FileTreeResponse,
  FileWriteResponse,
  LogsResponse,
  LogStreamEvent,
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

export async function startProjectAsync(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(`/api/projects/${id}/start`, { method: 'POST', getToken });
}

export async function stopProjectAsync(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(`/api/projects/${id}/stop`, { method: 'POST', getToken });
}

export async function restartProjectAsync(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(`/api/projects/${id}/restart`, { method: 'POST', getToken });
}

// Chat API - calls backend directly (not via Next.js proxy)
// Uses result objects instead of throwing errors.

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

interface BackendRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  getToken: () => Promise<string | null>;
  /** AbortSignal to cancel in-flight requests (e.g., SSE streams on unmount). */
  signal?: AbortSignal;
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
  const { method = 'GET', body, getToken, stream = false, signal } = options;
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
      signal,
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

// File browsing API - calls backend directly

export async function fetchFileTreeAsync(
  getToken: () => Promise<string | null>,
  projectId: string,
  depth?: number,
  subPath?: string,
): Promise<ApiResult<FileTreeResponse>> {
  const params = new URLSearchParams();
  if (depth !== undefined) {
    params.set('depth', String(depth));
  }
  if (subPath) {
    params.set('path', subPath);
  }
  const query = params.toString();
  const suffix = query ? `?${query}` : '';
  return backendRequestAsync<FileTreeResponse>(
    `/v1/projects/${projectId}/files${suffix}`,
    { getToken },
  );
}

export async function fetchFileContentAsync(
  getToken: () => Promise<string | null>,
  projectId: string,
  filePath: string,
): Promise<ApiResult<FileContentResponse>> {
  return backendRequestAsync<FileContentResponse>(
    `/v1/projects/${projectId}/files/${filePath}`,
    { getToken },
  );
}

export async function writeFileContentAsync(
  getToken: () => Promise<string | null>,
  projectId: string,
  filePath: string,
  content: string,
): Promise<ApiResult<FileWriteResponse>> {
  return backendRequestAsync<FileWriteResponse>(
    `/v1/projects/${projectId}/files/${filePath}`,
    { method: 'PUT', body: { content }, getToken },
  );
}

export async function createFileAsync(
  getToken: () => Promise<string | null>,
  projectId: string,
  body: FileCreateBody,
): Promise<ApiResult<{ path: string }>> {
  return backendRequestAsync<{ path: string }>(
    `/v1/projects/${projectId}/files`,
    { method: 'POST', body, getToken },
  );
}

export async function deleteFileAsync(
  getToken: () => Promise<string | null>,
  projectId: string,
  filePath: string,
): Promise<ApiResult<void>> {
  return backendRequestAsync<void>(
    `/v1/projects/${projectId}/files/${filePath}`,
    { method: 'DELETE', getToken },
  );
}

export async function renameFileAsync(
  getToken: () => Promise<string | null>,
  projectId: string,
  filePath: string,
  newPath: string,
): Promise<ApiResult<{ newPath: string }>> {
  return backendRequestAsync<{ newPath: string }>(
    `/v1/projects/${projectId}/files/${filePath}`,
    { method: 'PATCH', body: { newPath }, getToken },
  );
}

// Logs API

export async function fetchLogsAsync(
  getToken: () => Promise<string | null>,
  projectId: string,
  service?: string,
  lines?: number,
): Promise<ApiResult<LogsResponse>> {
  const params = new URLSearchParams();
  if (service) {
    params.set('service', service);
  }
  if (lines !== undefined) {
    params.set('lines', String(lines));
  }
  const query = params.toString();
  const suffix = query ? `?${query}` : '';
  return backendRequestAsync<LogsResponse>(
    `/v1/projects/${projectId}/logs${suffix}`,
    { getToken },
  );
}

export async function streamLogsAsync(
  getToken: () => Promise<string | null>,
  projectId: string,
  onEvent: (event: LogStreamEvent) => void,
  options?: { service?: string; lines?: number; signal?: AbortSignal },
): Promise<ApiResult<void>> {
  const params = new URLSearchParams({ follow: 'true' });
  if (options?.service) {
    params.set('service', options.service);
  }
  if (options?.lines !== undefined) {
    params.set('lines', String(options.lines));
  }

  const result = await backendRequestAsync(
    `/v1/projects/${projectId}/logs/stream?${params.toString()}`,
    { getToken, stream: true, signal: options?.signal },
  );

  if (!result.success) {
    return result;
  }

  const reader = result.data;
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    let readResult = await reader.read();
    while (!readResult.done) {
      buffer += decoder.decode(readResult.value, { stream: true });
      const bufferLines = buffer.split('\n');
      buffer = bufferLines.pop()!;

      for (let i = 0; i < bufferLines.length; i++) {
        const bufferLine = bufferLines[i];
        if (bufferLine.startsWith('data: ')) {
          try {
            const event = JSON.parse(bufferLine.slice(6)) as LogStreamEvent;
            onEvent(event);
          } catch (error) {
            console.warn('Failed to parse log SSE event:', bufferLine, error);
          }
        }
      }

      readResult = await reader.read();
    }
  } catch (error) {
    // AbortError is expected when the caller cancels the stream
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { success: true, data: undefined, statusCode: result.statusCode };
    }
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Stream error: ${message}`, statusCode: 0 };
  }

  return { success: true, data: undefined, statusCode: result.statusCode };
}

// Rebuild API

export async function rebuildProjectAsync(
  getToken: () => Promise<string | null>,
  projectId: string,
): Promise<ApiResult<{ status: string }>> {
  return backendRequestAsync<{ status: string }>(
    `/v1/projects/${projectId}/rebuild`,
    { method: 'POST', getToken },
  );
}

export { ApiError };
