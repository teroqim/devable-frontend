export interface ApiAnnouncement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}

export interface ApiProjectContainer {
  id: string;
  name: string;
  type: string;
  status: string;
  port: number | null;
}

export interface ApiProject {
  id: string;
  name: string;
  slug: string;
  userId: string;
  status: 'created' | 'starting' | 'running' | 'stopped' | 'error' | 'rebuilding';
  previewUrl: string;
  createdAt: string;
  updatedAt: string;
  containers?: ApiProjectContainer[];
}

export interface CreateProjectBody {
  name: string;
  template?: string;
  designTheme?: string;
}

export interface UpdateProjectBody {
  name?: string;
}

export type ApiResult<T> =
  | { success: true; data: T; statusCode: number }
  | { success: false; error: string; statusCode: number };

// Chat types

export interface ApiChatSession {
  id: string;
  projectId: string;
  sessionName: string;
  status: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface ApiChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: unknown;
  toolUses?: unknown;
  usage?: ApiTokenUsage;
  cost?: number | null;
  createdAt: string;
}

export interface ApiTokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
  cacheCreationTokens?: number;
}

export interface ApiImageAttachment {
  mediaType: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp';
  base64: string;
}

// File browsing types

export interface FileTreeEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modifiedAt?: string;
  children?: FileTreeEntry[];
  /** True if directory was too large for eager loading. Frontend must fetch on demand. */
  lazy?: boolean;
}

export interface FileTreeResponse {
  tree: FileTreeEntry[];
}

export interface FileContentResponse {
  content: string;
  modifiedAt: string;
}

export interface FileWriteResponse {
  modifiedAt: string;
}

export interface FileCreateBody {
  path: string;
  type: 'file' | 'directory';
  content?: string;
}

export interface FileRenameBody {
  newPath: string;
}

// Log types

export interface LogsResponse {
  logs: string;
}

export type LogStreamEvent =
  | { type: 'log'; line: string }
  | { type: 'keepalive' }
  | { type: 'error'; error: string };

export type ChatStreamEvent =
  | { type: 'text_delta'; text: string }
  | { type: 'tool_use_start'; tool: string; id: string; input: unknown }
  | { type: 'tool_use_end'; tool: string; id: string; output?: string }
  | { type: 'thinking'; text: string }
  | { type: 'error'; message: string; category?: string }
  | { type: 'result'; sessionId: string; usage?: ApiTokenUsage; cost?: number }
  | { type: 'system'; subtype: string; sessionId?: string };
